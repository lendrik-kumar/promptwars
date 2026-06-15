const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Link current anonymous session if it exists
    if (req.sessionId) {
      await prisma.userSession.update({
        where: { sessionId: req.sessionId },
        data: { userId: user.id },
      });
    }

    // Create new JWT with userId
    const token = jwt.sign({ sessionId: req.sessionId, userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Link current session to user
    if (req.sessionId) {
      await prisma.userSession.update({
        where: { sessionId: req.sessionId },
        data: { userId: user.id },
      });
    }

    // Create new JWT with userId
    const token = jwt.sign({ sessionId: req.sessionId, userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, user: null });
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.json({ success: true, user: null });
    }
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

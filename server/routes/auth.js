const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * POST /api/auth/register
 * 
 * Registers a new user with an email and password.
 * Will securely hash the password using bcrypt.
 * 
 * @name Register Route
 * @route {POST} /api/auth/register
 * @bodyparam {string} email - The user's email address
 * @bodyparam {string} password - The user's raw password
 * @bodyparam {string} [name] - The user's full name
 */
// POST /api/auth/register
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

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
      await prisma.userSession.updateMany({
        where: { sessionId: req.sessionId },
        data: { userId: user.id },
      });
    }

    // Create new JWT with userId (15 minute access token)
    const token = jwt.sign({ sessionId: req.sessionId, userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * 
 * Authenticates a user and establishes a secure JWT session cookie.
 * Links any existing anonymous session data to the authenticated user.
 * 
 * @name Login Route
 * @route {POST} /api/auth/login
 * @bodyparam {string} email - The user's email address
 * @bodyparam {string} password - The user's raw password
 */
// POST /api/auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

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
      await prisma.userSession.updateMany({
        where: { sessionId: req.sessionId },
        data: { userId: user.id },
      });
    }

    // Create new JWT with userId (15 minute access token)
    const token = jwt.sign({ sessionId: req.sessionId, userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
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

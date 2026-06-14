'use strict';

const express = require('express');
const { body, header } = require('express-validator');
const { validate } = require('../middleware/validateInput');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MILESTONES = [
  { threshold: 500,   name: 'Green Starter',  reward: '10% off at Organic Tattva',          badge: '🌱' },
  { threshold: 2000,  name: 'Eco Champion',    reward: 'Free Yulu e-bike ride (3 km)',        badge: '🌿' },
  { threshold: 5000,  name: 'Carbon Warrior',  reward: '₹200 off Bounce EV rental',          badge: '🌲' },
  { threshold: 10000, name: 'Planet Guardian', reward: '1 tree planted in your name (Grow-Trees)', badge: '🌳' },
  { threshold: 25000, name: 'Net Zero Hero',   reward: 'Free solar panel consultation',      badge: '☀️' },
];

/**
 * Get or initialise a wallet for a session from the DB.
 * @param {string} sessionId
 */
async function getWallet(sessionId) {
  let session = await prisma.userSession.findUnique({
    where: { sessionId },
    include: { swapHistory: { orderBy: { completedAt: 'desc' }, take: 50 } },
  });

  if (!session) {
    session = await prisma.userSession.create({
      data: { sessionId },
      include: { swapHistory: true },
    });
  }

  // Format the history to match the frontend expectations
  const swapHistory = session.swapHistory.map(swap => ({
    swapId: swap.swapId,
    label: swap.label,
    carbonSavedKg: swap.carbonSavedKg,
    moneySavedINR: swap.moneySavedINR,
    completedAt: swap.completedAt.toISOString(),
  }));

  return {
    sessionId: session.sessionId,
    totalCO2SavedKg: session.totalCO2SavedKg,
    totalMoneySavedINR: session.totalMoneySavedINR,
    swapsCompleted: session.swapsCompleted,
    swapHistory,
    createdAt: session.createdAt.toISOString(),
  };
}

/**
 * Compute milestone info for a wallet.
 * @param {object} wallet
 * @returns {{ current: object|null, next: object|null }}
 */
function getMilestoneInfo(wallet) {
  const amount = wallet.totalMoneySavedINR;
  let current  = null;
  let next     = null;

  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (amount >= MILESTONES[i].threshold) {
      current = MILESTONES[i];
      next    = MILESTONES[i + 1] ?? null;
      break;
    }
  }
  if (!current) next = MILESTONES[0];

  return {
    current,
    next: next ? { ...next, amountToGo: Math.max(0, next.threshold - amount) } : null,
  };
}

/**
 * GET /api/wallet
 * Retrieve the wallet for a session.
 * Header: X-Session-Id required.
 */
router.get(
  '/',
  async (req, res, next) => {
    try {
      const wallet = await getWallet(req.sessionId);
      res.json({ success: true, data: { ...wallet, milestone: getMilestoneInfo(wallet) } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/wallet/action
 * Record a completed swap action.
 * Header: X-Session-Id
 * Body: { carbonSavedKg, moneySavedINR, swapId, label }
 */
router.post(
  '/action',
  [
    body('carbonSavedKg').isFloat({ min: 0, max: 100 }).withMessage('carbonSavedKg must be 0–100'),
    body('moneySavedINR').isFloat({ min: 0, max: 10000 }).withMessage('moneySavedINR must be 0–10000'),
    body('swapId').isString().trim().notEmpty().isLength({ max: 100 }),
    body('label').optional().isString().trim().isLength({ max: 200 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const sessionId = req.sessionId;
      const { carbonSavedKg, moneySavedINR, swapId, label } = req.body;

      // Update the user session stats and create the new swap action in a transaction
      await prisma.$transaction([
        prisma.userSession.update({
          where: { sessionId },
          data: {
            totalCO2SavedKg: { increment: Number(carbonSavedKg) },
            totalMoneySavedINR: { increment: Number(moneySavedINR) },
            swapsCompleted: { increment: 1 },
          },
        }),
        prisma.swapAction.create({
          data: {
            sessionId,
            swapId,
            label,
            carbonSavedKg: Number(carbonSavedKg),
            moneySavedINR: Number(moneySavedINR),
          },
        }),
      ]);

      // Fetch the updated wallet to return
      const wallet = await getWallet(sessionId);
      res.json({ success: true, data: { ...wallet, milestone: getMilestoneInfo(wallet) } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

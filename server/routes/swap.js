'use strict';

const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validateInput');
const { getDailySwap, getAllScoredSwaps } = require('../services/swapEngine');

const router = express.Router();

/**
 * GET /api/swap/daily
 * Return the best daily swap card.
 * Optional query param: category (food|transport|electricity|grocery)
 */
router.get(
  '/daily',
  [
    query('category')
      .optional()
      .isIn(['food', 'transport', 'electricity', 'grocery'])
      .withMessage('category must be one of: food, transport, electricity, grocery'),
  ],
  validate,
  (req, res) => {
    const swap = getDailySwap({ category: req.query.category });
    res.json({ success: true, data: swap });
  }
);

/**
 * GET /api/swap/all
 * Return all swaps ranked by score (useful for admin / debugging).
 */
router.get('/all', (_req, res) => {
  const swaps = getAllScoredSwaps();
  res.json({ success: true, data: swaps });
});

module.exports = router;

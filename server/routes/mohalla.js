'use strict';

const express = require('express');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validateInput');
const { getMohallaStats } = require('../services/mohallaService');

const router = express.Router();

/**
 * GET /api/mohalla/:pincode
 * Return neighbourhood carbon stats for a given pin code.
 * Optional: ?userCO2=8.4  (user's estimated daily CO₂ in kg)
 */
router.get(
  '/:pincode',
  [
    param('pincode')
      .isLength({ min: 6, max: 6 }).withMessage('pincode must be exactly 6 digits')
      .matches(/^\d{6}$/).withMessage('pincode must contain only digits'),
    query('userCO2')
      .optional()
      .isFloat({ min: 1, max: 50 }).withMessage('userCO2 must be between 1 and 50'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const userCO2 = req.query.userCO2 ? parseFloat(req.query.userCO2) : 8.4;
      const stats   = await getMohallaStats(req.params.pincode, userCO2);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

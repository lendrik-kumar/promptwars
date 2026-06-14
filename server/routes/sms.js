'use strict';

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validateInput');
const { parseSMS } = require('../services/smsParser');

const router = express.Router();

/**
 * POST /api/sms/parse
 * Parse a raw bank/UPI/merchant SMS and return a carbon analysis.
 *
 * Body: { sms: string }
 */
router.post(
  '/parse',
  [
    body('sms')
      .isString().withMessage('sms must be a string')
      .trim()
      .notEmpty().withMessage('sms cannot be empty')
      .isLength({ max: 500 }).withMessage('sms too long (max 500 chars)'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await parseSMS(req.body.sms);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/sms/samples
 * Return a list of sample SMS messages for the demo.
 */
router.get('/samples', (_req, res) => {
  res.json({
    success: true,
    data: [
      'HDFC Bank: UPI txn of Rs.340 to SWIGGY on 12-06. Avl Bal Rs.12,450',
      'Dear SBI Customer, Rs.220.00 debited from A/c XX1234 to VPA ola@okaxis on 12-06-26',
      'ICICI Bank: Rs 156.50 debited for UPI txn at ZOMATO. Ref 2406123456',
      'Rs.2,800 paid to INDIANOIL on 13-06. UPI Ref: 240613789012',
      'HDFC Bank: UPI txn of Rs.1,240 to BIGBASKET on 11-06. Avl Bal Rs.8,200',
      'Axis Bank: INR 450.00 has been debited from your account to VPA msedcl@axisbank',
    ],
  });
});

module.exports = router;

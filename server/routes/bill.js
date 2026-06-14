'use strict';

const express = require('express');
const multer  = require('multer');
const { body } = require('express-validator');
const { validate } = require('../middleware/validateInput');
const groq = require('../services/groq');
const { calcElectricity } = require('../services/carbonEngine');
const gridFactors = require('../data/gridFactors.json');

const router  = express.Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype) ? true : new Error('Only images or PDF accepted'));
  },
});

const BILL_IMAGE_PROMPT = `You are an electricity bill analyser for Indian consumers.
Extract data from this electricity bill image and return ONLY this JSON:
{
  "units": <total kWh consumed this billing period>,
  "billingDays": <number of days in billing period, default 30>,
  "amount": <total bill amount in INR>,
  "state": "<Indian state name, or null if unclear>"
}
If you cannot read the bill clearly, estimate reasonable values.`;

const BILL_ANALYSIS_PROMPT = (units, state, gridFactor, dailyUnits, dailyCO2) => `
You are an Indian electricity bill analyser. A household consumed ${units} kWh in a billing period.
State: ${state}. Grid factor: ${gridFactor} kg CO2/kWh.
Daily usage: ${dailyUnits} kWh. Daily CO2: ${dailyCO2} kg.

Based on typical Indian household appliance patterns, generate a JSON appliance breakdown:
{
  "breakdown": [
    { "appliance": "<appliance name>", "percentage": <integer>, "estimatedUnits": <float>, "kgCO2": <float> },
    ... (4-5 appliances)
  ],
  "topAction": "<one specific action in plain language that saves the most energy, with ₹ savings estimate>",
  "heatingPct": <percentage of bill from water heating>,
  "coolingPct": <percentage of bill from cooling/AC>
}
Use BEE star ratings context. AC should be largest consumer in summer.`;

/**
 * POST /api/bill/analyze-image
 * Upload an electricity bill image/PDF for analysis.
 */
router.post('/analyze-image', upload.single('bill'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No bill file uploaded. Use field name "bill".' });
  }
  try {
    // Only vision models can handle images; PDFs fall through to text flow
    if (req.file.mimetype === 'application/pdf') {
      return res.status(415).json({
        success: false,
        error:   'PDF upload not yet supported in demo. Please use the text input form.',
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const raw    = await groq.analyzeImage(base64, req.file.mimetype, BILL_IMAGE_PROMPT, { json: true });
    const parsed = groq.parseJSON(raw);

    // Pipe into text analysis
    req.body = {
      units:       parsed.units,
      state:       parsed.state || 'Maharashtra',
      billingDays: parsed.billingDays || 30,
      amount:      parsed.amount,
    };

    return analyzeText(req, res, next);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bill/analyze
 * Text-based bill analysis (units + state).
 * Body: { units, state, billingDays?, amount? }
 */
const validateBillBody = [
  body('units').isFloat({ min: 1, max: 10000 }).withMessage('units must be between 1 and 10,000'),
  body('state').isString().trim().notEmpty().isLength({ max: 50 }),
  body('billingDays').optional().isInt({ min: 1, max: 90 }),
  body('amount').optional().isFloat({ min: 0 }),
];

router.post('/analyze', validateBillBody, validate, analyzeText);

async function analyzeText(req, res, next) {
  try {
    const units       = Number(req.body.units);
    const state       = String(req.body.state).trim();
    const billingDays = Number(req.body.billingDays) || 30;

    const { kgCO2, factor } = calcElectricity(units, state);
    const dailyUnits  = parseFloat((units / billingDays).toFixed(2));
    const dailyCO2    = parseFloat((kgCO2 / billingDays).toFixed(2));

    const raw         = await groq.complete(
      [{ role: 'user', content: BILL_ANALYSIS_PROMPT(units, state, factor, dailyUnits, dailyCO2) }],
      { json: true, temperature: 0.3, maxTokens: 768 }
    );
    const ai = groq.parseJSON(raw);

    res.json({
      success: true,
      data: {
        units,
        billingDays,
        state,
        gridFactor:   factor,
        totalCO2Kg:   kgCO2,
        dailyUnits,
        dailyCO2Kg:   dailyCO2,
        breakdown:    ai.breakdown ?? [],
        topAction:    ai.topAction ?? 'Reduce AC runtime by 2 hours per day',
        heatingPct:   ai.heatingPct ?? 20,
        coolingPct:   ai.coolingPct ?? 55,
        equivalents: {
          treeDays:   parseFloat((kgCO2 / 0.022).toFixed(0)),  // avg tree absorbs 22g/day
          kmsNotDriven: parseFloat((kgCO2 / 0.185).toFixed(0)), // 185g/km petrol car
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = router;

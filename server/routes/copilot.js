'use strict';

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validateInput');
const groq = require('../services/groq');

const router = express.Router();

const COPILOT_SYSTEM = `You are CarbonIQ Copilot — an AI carbon advisor specialised for India.
Your expertise:
- Indian emission factors (state-wise grid, Indian transport modes, Indian food supply chains)
- Rupee-denominated financial trade-offs
- Indian product availability and pricing
- IPCC AR6 data localised for India
- BEE (Bureau of Energy Efficiency) ratings and programs
- CEA (Central Electricity Authority) grid data
- Indian transport: CNG autos, e-rickshaws, petrol scooters, IRCTC, metro systems

Response style:
- Always lead with the rupee saving first, then the carbon saving
- Give specific numbers (not ranges) where possible
- Keep responses concise — 3–5 sentences max
- End with one concrete next step the user can take today
- Be encouraging, not guilt-inducing
- Format numbers: ₹1,200/month; 2.3 kg CO₂/day
- Never recommend apps or products not available in India`;

/**
 * POST /api/copilot/chat
 * Chat with Carbon Copilot using conversation history.
 * Body: { messages: [{role: 'user'|'assistant', content: string}], context?: { state, city } }
 */
router.post(
  '/chat',
  [
    body('messages')
      .isArray({ min: 1 }).withMessage('messages must be a non-empty array'),
    body('messages.*.role')
      .isIn(['user', 'assistant']).withMessage('each message role must be user or assistant'),
    body('messages.*.content')
      .isString().trim().notEmpty().withMessage('each message must have non-empty content')
      .isLength({ max: 2000 }).withMessage('message content too long (max 2000 chars)'),
    body('context.state').optional().isString().trim().isLength({ max: 50 }),
    body('context.city').optional().isString().trim().isLength({ max: 50 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { messages, context = {} } = req.body;

      // Build system prompt with optional location context
      let systemContent = COPILOT_SYSTEM;
      if (context.state) systemContent += `\n\nUser location: ${context.city || ''}, ${context.state}. Use this state's grid factor for electricity questions.`;

      // Limit conversation history to last 10 turns for token efficiency
      const history = messages.slice(-10);

      const raw = await groq.complete(
        [{ role: 'system', content: systemContent }, ...history],
        { json: false, temperature: 0.6, maxTokens: 512, cache: false }
      );

      res.json({ success: true, data: { reply: raw.trim(), role: 'assistant' } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/copilot/starters
 * Return suggested conversation starters.
 */
router.get('/starters', (_req, res) => {
  res.json({
    success: true,
    data: [
      'Should I buy an electric scooter or keep my petrol bike?',
      'How bad is flying to Goa vs taking the train?',
      'Is a washing machine or laundromat more eco-friendly?',
      'What\'s the carbon cost of running my 1.5-ton AC all day in Delhi?',
      'Which Indian foods should I eat more of to lower my footprint?',
      'How much CO₂ does my daily Swiggy order actually produce?',
    ],
  });
});

module.exports = router;

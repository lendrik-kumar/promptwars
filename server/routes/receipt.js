'use strict';

const express = require('express');
const multer  = require('multer');
const groq    = require('../services/groq');
const foodDb  = require('../data/foodCarbon.json');

const router = express.Router();

// Multer: store in memory, validate type, limit size to 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images are accepted'));
    }
  },
});

/** Build the Groq vision prompt for receipt analysis */
const RECEIPT_PROMPT = `You are an expert carbon footprint analyst specialising in Indian grocery receipts.
Analyse this receipt image and return a JSON object with this EXACT structure:
{
  "storeName": "<store name or Unknown>",
  "items": [
    {
      "name": "<item name from receipt>",
      "quantity": <numeric quantity>,
      "unit": "<kg|g|litre|piece|pack>",
      "priceINR": <price in INR>,
      "carbonKg": <estimated kg CO2>,
      "category": "<grain|vegetable|fruit|dairy|meat|seafood|snack|beverage|processed|other>",
      "flag": "<low|moderate|high>",
      "note": "<brief 1-line India-specific insight or empty string>"
    }
  ],
  "totalCarbon": <sum of all item carbonKg, 2 decimal places>,
  "highestImpactItem": "<name of the item with highest carbonKg>",
  "swap": {
    "fromItem": "<highest impact item name>",
    "toItem": "<lower-carbon Indian alternative>",
    "moneySavedINR": <estimated savings per week>,
    "carbonSavedKg": <carbon saving per week>
  }
}
Use Indian-specific emission factors. Flag imported produce as 'high'. Flag local seasonal produce as 'low'.`;

/**
 * POST /api/receipt/analyze
 * Accepts a receipt image and returns line-item carbon scores.
 */
router.post('/analyze', upload.single('receipt'), async (req, res, next) => {
  // Validate file presence
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No receipt image uploaded. Use field name "receipt".' });
  }

  try {
    const base64 = req.file.buffer.toString('base64');
    const mime   = req.file.mimetype;

    const raw    = await groq.analyzeImage(base64, mime, RECEIPT_PROMPT, { json: true, maxTokens: 2048 });
    const parsed = groq.parseJSON(raw);

    // Enrich items with local DB data where possible
    parsed.items = parsed.items.map((item) => {
      const dbKey = Object.keys(foodDb.items).find(
        (k) => k.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
      );
      if (dbKey) {
        const dbItem = foodDb.items[dbKey];
        return { ...item, flag: dbItem.flag, _dbMatch: dbKey };
      }
      return item;
    });

    res.json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/receipt/text
 * Accept a text description of items (fallback if no image).
 * Body: { items: [{ name, priceINR, quantityKg }] }
 */
router.post('/text', async (req, res, next) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }

  try {
    const scored = items.map((item) => {
      const name  = String(item.name || '');
      const price = Number(item.priceINR) || 0;
      const qty   = Number(item.quantityKg) || 0.5;

      const dbKey = Object.keys(foodDb.items).find(
        (k) => k.toLowerCase().includes(name.toLowerCase()) ||
               name.toLowerCase().includes(k.toLowerCase().split(' ')[0])
      );

      if (dbKey) {
        const dbItem = foodDb.items[dbKey];
        return {
          name,
          priceINR:  price,
          quantityKg: qty,
          carbonKg:  parseFloat((qty * dbItem.kgCO2PerKg).toFixed(3)),
          category:  dbItem.category,
          flag:      dbItem.flag,
        };
      }

      return {
        name,
        priceINR:  price,
        quantityKg: qty,
        carbonKg:  parseFloat((qty * foodDb.categoryDefaults.default).toFixed(3)),
        category:  'other',
        flag:      'unknown',
      };
    });

    const totalCarbon = parseFloat(scored.reduce((s, i) => s + i.carbonKg, 0).toFixed(3));
    res.json({ success: true, data: { items: scored, totalCarbon } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

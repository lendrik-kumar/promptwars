'use strict';

/**
 * SMS Parser Service
 * Parses Indian bank / UPI / merchant SMS messages into structured carbon data.
 * Strategy: regex extraction for known patterns → Groq for classification.
 */

const groq = require('./groq');
const engine = require('./carbonEngine');

// ─── Regex patterns for known Indian SMS formats ──────────────────────────────

const PATTERNS = [
  // HDFC UPI
  {
    re: /(?:HDFC\s*Bank[:\s]+)?UPI\s+txn\s+of\s+Rs?\.?\s*([\d,]+(?:\.\d+)?)\s+to\s+([A-Z0-9@.\-_ ]+?)(?:\s+on|\s+Avl|$)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
  // SBI debited
  {
    re: /(?:Dear\s+SBI\s+Customer[,\s]+)?Rs\.?\s*([\d,]+(?:\.\d+)?)\s+debited\s+from\s+A\/c\s+\S+\s+to\s+VPA\s+([A-Z0-9@.\-_]+)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
  // ICICI debited at
  {
    re: /ICICI\s*Bank[:\s]+Rs\.?\s*([\d,]+(?:\.\d+)?)\s+debited\s+(?:for\s+UPI\s+txn\s+at|from\s+A\/c[^t]+to)\s+([A-Z0-9@.\-_ ]+?)(?:\s+on|\.|$)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
  // Generic "Rs. X paid to MERCHANT"
  {
    re: /Rs\.?\s*([\d,]+(?:\.\d+)?)\s+(?:paid|debited|transferred|sent)\s+to\s+([A-Z0-9@.\-_ ]+?)(?:\s+on|\s+Avl|\s+Ref|$)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
  // Axis Bank UPI
  {
    re: /Axis\s*Bank[:\s]+INR\s+([\d,]+(?:\.\d+)?)\s+has been debited.*VPA\s+([A-Z0-9@.\-_]+)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
  // Kotak / Yes Bank
  {
    re: /(?:Kotak|Yes)\s*Bank[:\s]+(?:INR|Rs)\.?\s*([\d,]+(?:\.\d+)?)\s+debited.*?(?:to|VPA)\s+([A-Z0-9@.\-_ ]+?)(?:\s+on|\.|$)/i,
    parse: (m) => ({ amount: parseFloat(m[1].replace(/,/g, '')), merchant: m[2].trim() }),
  },
];

// ─── Merchant → category mapping ──────────────────────────────────────────────

const MERCHANT_MAP = {
  // Food delivery
  swiggy:        'food_delivery',
  zomato:        'food_delivery',
  dunzo:         'food_delivery',
  magicpin:      'food_delivery',
  // Transport
  ola:           'transport_cab',
  uber:          'transport_cab',
  rapido:        'transport_cab',
  blablacar:     'transport_cab',
  irctc:         'transport_train',
  ixigo:         'transport_train',
  makemytrip:    'transport_flight',
  indigo:        'transport_flight',
  spicejet:      'transport_flight',
  airindia:      'transport_flight',
  // Grocery
  bigbasket:     'grocery',
  blinkit:       'grocery',
  zepto:         'grocery',
  jiomart:       'grocery',
  dmart:         'grocery',
  reliance:      'grocery',
  // Fuel
  indianoil:     'fuel',
  hpcl:          'fuel',
  bpcl:          'fuel',
  shell:         'fuel',
  nayara:        'fuel',
  essar:         'fuel',
  // Utility
  bescom:        'utility',
  msedcl:        'utility',
  bses:          'utility',
  tatapower:     'utility',
  adani:         'utility',
  // Shopping
  amazon:        'shopping',
  flipkart:      'shopping',
  myntra:        'shopping',
  meesho:        'shopping',
  ajio:          'shopping',
  // Entertainment
  netflix:       'entertainment',
  hotstar:       'entertainment',
  primevideo:    'entertainment',
  bookmyshow:    'entertainment',
  pvr:           'entertainment',
  // Health
  pharmaeasy:    'health',
  '1mg':         'health',
  apollo:        'health',
  netmeds:       'health',
  // Default
  paytm:         'default',
  phonepe:       'default',
  gpay:          'default',
};

/**
 * Map merchant string to spending category.
 * @param {string} merchant
 * @returns {string} category key
 */
function merchantToCategory(merchant) {
  const lower = merchant.toLowerCase().replace(/[@.\s_-]/g, '');
  for (const [key, cat] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) return cat;
  }
  return 'default';
}

// ─── Core SMS parse function ──────────────────────────────────────────────────

/**
 * Extract amount and merchant from an SMS string using regex patterns.
 * @param {string} smsText
 * @returns {{ amount: number, merchant: string } | null}
 */
function extractFromSMS(smsText) {
  for (const { re, parse } of PATTERNS) {
    const m = smsText.match(re);
    if (m) return parse(m);
  }
  return null;
}

/**
 * Build swap suggestion based on category.
 * @param {string} category
 * @param {number} amount
 * @param {number} carbonKg
 * @returns {{ description: string, moneySaved: number, carbonSaved: number, unit: string }}
 */
function buildSwapSuggestion(category, amount, carbonKg) {
  const swaps = {
    food_delivery: {
      description: 'Order from a restaurant 1 km closer',
      moneySaved:  Math.round(amount * 0.08),
      carbonSaved: parseFloat((carbonKg * 0.22).toFixed(2)),
      unit: 'per order',
    },
    transport_cab: {
      description: 'Take metro + 5-min walk instead',
      moneySaved:  Math.round(amount * 0.85),
      carbonSaved: parseFloat((carbonKg * 0.71).toFixed(2)),
      unit: 'this trip',
    },
    transport_train: {
      description: 'Great choice! Train is already low-carbon.',
      moneySaved:  0,
      carbonSaved: 0,
      unit: 'per trip',
    },
    grocery: {
      description: 'Buy local seasonal produce instead of packaged / imported',
      moneySaved:  Math.round(amount * 0.12),
      carbonSaved: parseFloat((carbonKg * 0.35).toFixed(2)),
      unit: 'per shop',
    },
    fuel: {
      description: 'Consider an EV or CNG vehicle for your next fill-up',
      moneySaved:  Math.round(amount * 0.30),
      carbonSaved: parseFloat((carbonKg * 0.60).toFixed(2)),
      unit: 'per refuel',
    },
    utility: {
      description: 'Reduce AC runtime by 2 hrs or install a smart plug timer',
      moneySaved:  Math.round(amount * 0.15),
      carbonSaved: parseFloat((carbonKg * 0.20).toFixed(2)),
      unit: 'per month',
    },
    default: {
      description: 'Track this category to find your highest-impact swap',
      moneySaved:  0,
      carbonSaved: parseFloat((carbonKg * 0.10).toFixed(2)),
      unit: 'per month',
    },
  };
  return swaps[category] ?? swaps.default;
}

// ─── Groq-powered classification fallback ─────────────────────────────────────

const GROQ_SYSTEM_PROMPT = `You are an Indian financial SMS parser. Extract structured data from bank/UPI/merchant SMS messages.
Return ONLY a JSON object with this exact structure:
{
  "amount": <number in INR>,
  "merchant": "<merchant name>",
  "category": "<one of: food_delivery|transport_cab|transport_train|transport_flight|grocery|fuel|utility|shopping|entertainment|health|default>",
  "confidence": <0.0-1.0>
}
If the SMS is not a financial transaction, return { "amount": 0, "merchant": "unknown", "category": "default", "confidence": 0 }.`;

/**
 * Parse an SMS using Groq when regex fails.
 * @param {string} smsText
 * @returns {Promise<{ amount: number, merchant: string, category: string, confidence: number }>}
 */
async function groqParseSMS(smsText) {
  const raw = await groq.complete(
    [
      { role: 'system', content: GROQ_SYSTEM_PROMPT },
      { role: 'user',   content: `SMS: "${smsText}"` },
    ],
    { json: true, temperature: 0.1, maxTokens: 256 }
  );
  return groq.parseJSON(raw);
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Parse a raw SMS and return a full carbon analysis.
 * @param {string} smsText  Raw SMS message
 * @returns {Promise<{
 *   raw: string,
 *   merchant: string,
 *   category: string,
 *   amount: number,
 *   carbonScore: number,
 *   breakdown: object,
 *   swap: object,
 *   parsedBy: 'regex'|'groq'|'mock'
 * }>}
 */
async function parseSMS(smsText) {
  let parsed = null;
  let parsedBy = 'regex';

  // 1. Try regex extraction
  const regexResult = extractFromSMS(smsText);
  if (regexResult && regexResult.amount > 0) {
    parsed = {
      ...regexResult,
      category: merchantToCategory(regexResult.merchant),
      confidence: 0.95,
    };
  }

  // 2. Fallback to Groq
  if (!parsed) {
    try {
      parsed   = await groqParseSMS(smsText);
      parsedBy = 'groq';
    } catch {
      // 3. Last resort mock
      parsed   = { amount: 0, merchant: 'Unknown', category: 'default', confidence: 0 };
      parsedBy = 'mock';
    }
  }

  const { amount, merchant, category } = parsed;

  // Calculate carbon
  let carbonScore = 0;
  let breakdown   = {};

  if (category === 'food_delivery') {
    const result  = engine.calcFoodDelivery(amount, 3);
    carbonScore   = result.total;
    breakdown     = result;
  } else if (category === 'transport_cab') {
    const distKm  = engine.estimateDistanceFromFare(amount, 'solo_cab');
    const result  = engine.calcTransport('solo_cab', distKm);
    carbonScore   = result.kgCO2;
    breakdown     = { vehicleEmission: result.kgCO2, distanceKm: distKm };
  } else if (category === 'fuel') {
    const litres  = amount / 100;                    // ≈ Rs.100/L petrol
    carbonScore   = parseFloat((litres * 2.31).toFixed(3));
    breakdown     = { litres, kgCO2PerLitre: 2.31 };
  } else {
    const result  = engine.calcSpend(category, amount);
    carbonScore   = result.kgCO2;
    breakdown     = { spendIntensity: result.intensity };
  }

  const swap = buildSwapSuggestion(category, amount, carbonScore);

  return {
    raw:         smsText,
    merchant:    merchant || 'Unknown',
    category,
    amount,
    carbonScore: parseFloat(carbonScore.toFixed(2)),
    breakdown,
    swap,
    parsedBy,
    confidence:  parsed.confidence,
  };
}

module.exports = { parseSMS, extractFromSMS, merchantToCategory };

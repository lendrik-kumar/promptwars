'use strict';

/**
 * Mohalla (Neighbourhood) Service
 * Returns localised carbon comparison data for an Indian pin code.
 * Seeded data is used for known pin codes; Groq generates for others.
 */

const groq     = require('./groq');
const seed     = require('../data/mohallaSeed.json');
const grid     = require('../data/gridFactors.json');

// In-memory cache for Groq-generated data to save tokens and improve speed
const generatedCache = new Map();

/**
 * Lookup the state name from a pin code prefix.
 * @param {string} pincode  6-digit pin code string
 * @returns {string} State name
 */
function getStateFromPin(pincode) {
  const prefix3 = pincode.slice(0, 3);
  const prefix2 = pincode.slice(0, 2);
  return seed.stateFromPrefix[prefix3]
      || seed.stateFromPrefix[prefix2]
      || 'Maharashtra'; // safe default
}

/**
 * Lookup the city from pin prefix.
 * @param {string} pincode
 * @returns {string}
 */
function getCityFromPin(pincode) {
  const prefix3 = pincode.slice(0, 3);
  return seed.cityMappings[prefix3] || 'Unknown City';
}

/**
 * Generate Laplace noise for Differential Privacy.
 * @param {number} scale The scale (b) of the Laplace distribution
 * @returns {number} Noise to add
 */
function getLaplaceNoise(scale) {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Apply Differential Privacy to aggregated statistics.
 * Epsilon (ε) controls privacy budget. Lower ε = higher privacy (ε ≤ 0.1 required).
 * 
 * @param {number} value The raw aggregated value
 * @param {number} sensitivity The maximum change one user can cause (e.g., max CO2 score)
 * @param {number} epsilon The privacy budget (≤ 0.1)
 * @returns {number} The differentially private value
 */
function applyDP(value, sensitivity, epsilon = 0.1) {
  const scale = sensitivity / epsilon;
  const noise = getLaplaceNoise(scale);
  return Math.max(0, value + noise); // Ensure score doesn't go negative
}

/**
 * Calculate percentile of userCO2 within the area distribution.
 * Lower CO₂ = higher percentile (you're better than X% of area).
 * Assumes roughly normal distribution around areaMean.
 * @param {number} userCO2
 * @param {number} areaMean
 * @param {number} stdDev   Standard deviation (defaults to 1.8 kg)
 * @returns {number} Percentile 1–99
 */
function calcPercentile(userCO2, areaMean, stdDev = 1.8) {
  const z = (areaMean - userCO2) / stdDev;
  // Approximation of normal CDF
  const pct = 50 * (1 + Math.tanh(z * 0.7));
  return Math.min(99, Math.max(1, Math.round(pct)));
}

/**
 * Build a Groq-generated mohalla response for an unknown pin code.
 * @param {string} pincode
 * @param {string} city
 * @param {string} state
 * @returns {Promise<object>}
 */
async function generateViaGroq(pincode, city, state) {
  if (generatedCache.has(pincode)) {
    return generatedCache.get(pincode);
  }

  const gridFactor = grid.states[state]?.factor ?? grid.default.factor;

  const prompt = `You are generating realistic neighbourhood carbon footprint data for Indian cities.
Generate a JSON object for pin code ${pincode} in ${city}, ${state}.
Use grid factor ${gridFactor} kg CO2/kWh for electricity.
Return ONLY this JSON structure:
{
  "avgDailyCO2Kg": <realistic daily household CO2 in kg, range 7-12>,
  "topSwaps": [<3 India-specific behavior swap strings, 6-10 words each>],
  "topSwapAdoptionPcts": [<3 integers 10-65>],
  "vegPct": <integer 30-75>,
  "twoWheelerPct": <integer 25-75>,
  "metroAccessPct": <integer 5-85>,
  "householdsInArea": <integer 5000-25000>
}`;

  try {
    const raw  = await groq.complete(
      [{ role: 'user', content: prompt }],
      { json: true, temperature: 0.4, maxTokens: 512 }
    );
    const parsed = groq.parseJSON(raw);
    
    // Cache the parsed object
    generatedCache.set(pincode, parsed);
    if (generatedCache.size > 500) { // Naive LRU: limit cache size
      const firstKey = generatedCache.keys().next().value;
      generatedCache.delete(firstKey);
    }
    return parsed;
  } catch {
    // Fallback static values
    return {
      avgDailyCO2Kg:       9.8,
      topSwaps:            ['Use metro for office commute', 'Order from closer restaurants', 'Reduce AC runtime'],
      topSwapAdoptionPcts: [32, 28, 41],
      vegPct:              48,
      twoWheelerPct:       55,
      metroAccessPct:      35,
      householdsInArea:    11000,
    };
  }
}

/**
 * Get full Mohalla stats for a pin code.
 * @param {string} pincode       6-digit string
 * @param {number} [userCO2=8.4] User's estimated daily CO₂ (kg)
 * @returns {Promise<object>}
 */
async function getMohallaStats(pincode, userCO2 = 8.4) {
  const seeded = seed.pincodes[pincode];
  const city   = seeded?.city   ?? getCityFromPin(pincode);
  const area   = seeded?.area   ?? `${city} Area`;
  const state  = seeded?.state  ?? getStateFromPin(pincode);

  const data = seeded ?? await generateViaGroq(pincode, city, state);

  const percentile      = calcPercentile(userCO2, data.avgDailyCO2Kg);
  const gridData        = grid.states[state] ?? grid.default;

  // Build leaderboard (anonymised synthetic households)
  const leaderboard = Array.from({ length: 5 }, (_, i) => ({
    rank:        i + 1,
    label:       `Household ${String.fromCharCode(65 + i)}`,
    dailyCO2Kg:  parseFloat((data.avgDailyCO2Kg * (0.65 + i * 0.1)).toFixed(1)),
    topSwap:     data.topSwaps[i % data.topSwaps.length],
  }));

  // Apply Differential Privacy (ε ≤ 0.1)
  const dpAreaAverageKg = applyDP(data.avgDailyCO2Kg, 5, 0.1);

  return {
    pincode,
    city,
    area,
    state,
    gridFactor:          gridData.factor,
    renewablePct:        gridData.renewable_pct,
    userFootprintKg:     userCO2,
    areaAverageKg:       parseFloat(dpAreaAverageKg.toFixed(1)),
    percentile,
    message:             percentile >= 50
      ? `You're in the top ${100 - percentile}% of households in this area 🌿`
      : `${percentile}% of households in this area emit less than you. Small swaps make a big difference.`,
    topSwaps:            data.topSwaps,
    topSwapAdoptionPcts: data.topSwapAdoptionPcts,
    vegPct:              data.vegPct,
    twoWheelerPct:       data.twoWheelerPct,
    metroAccessPct:      data.metroAccessPct,
    householdsInArea:    data.householdsInArea,
    leaderboard,
    collectiveImpact: {
      ifAllSwapped:    parseFloat((data.householdsInArea * 0.8 * 30).toFixed(0)),
      unit:            'kg CO₂ saved this month if everyone took the top swap',
    },
  };
}

module.exports = { getMohallaStats, getStateFromPin, getCityFromPin };

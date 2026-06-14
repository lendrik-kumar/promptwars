'use strict';

/**
 * One Swap Engine
 * Selects and scores the single best carbon swap for a user each day.
 * Score = (carbonImpact × 0.35) + (financialImpact × 0.40) + (friction × 0.25)
 */

const { scoreSwap } = require('./carbonEngine');

/**
 * Seeded swap pool — curated for Indian urban contexts.
 * Each swap has raw impact values (not yet normalized).
 * @type {Array<SwapCandidate>}
 */
const SWAP_POOL = [
  {
    id:              'transport_metro_001',
    category:        'transport',
    emoji:           '🚇',
    triggerBehavior: 'Ola/Uber to office',
    suggestion:      'Metro + 5-min walk',
    descTemplate:    'Your {trigger} costs ₹{fromCost}. Metro costs ₹{toCost}.',
    fromMode:        'solo_cab',
    toMode:          'metro',
    carbonSavedKg:   2.3,
    moneySavedINR:   188,
    frictionBase:    7,   // medium-low friction (metro is widely available)
  },
  {
    id:              'transport_share_001',
    category:        'transport',
    emoji:           '🚗',
    triggerBehavior: 'Solo Ola/Uber',
    suggestion:      'Book Ola Share instead',
    descTemplate:    'Switch to Ola Share for your daily commute.',
    fromMode:        'solo_cab',
    toMode:          'shared_cab',
    carbonSavedKg:   0.9,
    moneySavedINR:   80,
    frictionBase:    8,
  },
  {
    id:              'transport_cng_001',
    category:        'transport',
    emoji:           '🛺',
    triggerBehavior: 'Petrol auto for short trips',
    suggestion:      'Prefer CNG auto for trips < 5 km',
    descTemplate:    'Choose CNG auto over petrol for your local runs.',
    fromMode:        'petrol_auto',
    toMode:          'cng_auto',
    carbonSavedKg:   0.6,
    moneySavedINR:   25,
    frictionBase:    8,
  },
  {
    id:              'food_closer_001',
    category:        'food',
    emoji:           '🍱',
    triggerBehavior: 'Swiggy/Zomato order',
    suggestion:      'Order from a restaurant 1 km closer',
    descTemplate:    'Your last order came from 3+ km away. Try the restaurant just around the corner.',
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   0.3,
    moneySavedINR:   35,
    frictionBase:    8,
  },
  {
    id:              'food_cook_001',
    category:        'food',
    emoji:           '🥘',
    triggerBehavior: 'Daily food delivery',
    suggestion:      'Cook one meal at home this week',
    descTemplate:    "You've ordered food delivery 4 days in a row. One home meal saves big.",
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   1.1,
    moneySavedINR:   220,
    frictionBase:    5,   // higher friction — requires cooking
  },
  {
    id:              'electricity_ac_001',
    category:        'electricity',
    emoji:           '❄️',
    triggerBehavior: 'High electricity bill',
    suggestion:      'Reduce AC runtime from 8 → 6 hours',
    descTemplate:    'Your AC likely drives 55–60% of your electricity bill.',
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   1.8,
    moneySavedINR:   340,
    frictionBase:    7,
  },
  {
    id:              'electricity_temp_001',
    category:        'electricity',
    emoji:           '🌡️',
    triggerBehavior: 'AC usage',
    suggestion:      'Set AC to 24°C instead of 20°C',
    descTemplate:    "Each degree warmer saves ~6% electricity. 24°C is BEE's recommended setting.",
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   0.7,
    moneySavedINR:   120,
    frictionBase:    9,   // very low friction — just a settings change
  },
  {
    id:              'grocery_local_001',
    category:        'grocery',
    emoji:           '🥦',
    triggerBehavior: 'Grocery purchase with imported produce',
    suggestion:      'Swap imported apples for local seasonal guava or chikoo',
    descTemplate:    'Imported apples travel 8,000+ km. Local guava is fresher and ₹60 cheaper per kg.',
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   1.1,
    moneySavedINR:   60,
    frictionBase:    8,
  },
  {
    id:              'grocery_veg_001',
    category:        'grocery',
    emoji:           '🌿',
    triggerBehavior: 'Meat purchase',
    suggestion:      'Try a dal-based meal instead of mutton once this week',
    descTemplate:    'One mutton meal generates 26× more CO₂ than a dal meal for the same protein.',
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   2.1,
    moneySavedINR:   180,
    frictionBase:    6,
  },
  {
    id:              'water_heater_001',
    category:        'electricity',
    emoji:           '🚿',
    triggerBehavior: 'Morning geyser usage',
    suggestion:      'Set geyser timer to 15 min instead of leaving it on',
    descTemplate:    'A geyser left on uses 3–4× more energy than one on a 15-min timer.',
    fromMode:        null,
    toMode:          null,
    carbonSavedKg:   0.5,
    moneySavedINR:   90,
    frictionBase:    8,
  },
  {
    id:              'transport_walk_001',
    category:        'transport',
    emoji:           '🚶',
    triggerBehavior: 'Short cab ride (< 2 km)',
    suggestion:      'Walk this one — it\'s under 15 minutes',
    descTemplate:    'Your last Ola was just {distKm} km. Walking saves ₹{moneySaved} and gets you 1,500 steps.',
    fromMode:        'solo_cab',
    toMode:          'walking',
    carbonSavedKg:   0.4,
    moneySavedINR:   120,
    frictionBase:    7,
  },
];

/**
 * Get the best daily swap from the pool.
 * In a production app, this would be personalised from user behavior history.
 * For the demo, it rotates through pool by day-of-year for consistency.
 * @param {object} [context]         Optional context to bias selection
 * @param {string} [context.category]  Preferred category based on recent transactions
 * @returns {object} A fully scored swap candidate
 */
function getDailySwap(context = {}) {
  let pool = [...SWAP_POOL];

  // Bias toward category if provided
  if (context.category) {
    const biased = pool.filter((s) => s.category === context.category);
    if (biased.length > 0) pool = biased;
  }

  // Score all swaps
  const scored = pool.map((swap) => {
    // Normalize to 0–10 scale (rough based on pool min/max)
    const carbonImpact   = Math.min(10, (swap.carbonSavedKg / 2.5) * 10);
    const financialImpact= Math.min(10, (swap.moneySavedINR / 350) * 10);
    const friction       = swap.frictionBase; // already 0–10

    return {
      ...swap,
      scores: { carbonImpact, financialImpact, friction },
      totalScore: scoreSwap({ carbonImpact, financialImpact, friction }),
    };
  });

  // Pick highest scoring swap
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Rotate daily for demo variety
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const index = dayOfYear % scored.length;

  const best = context.category ? scored[0] : scored[index];

  // Build neighbour count (seeded for demo)
  const neighborCount = 8 + Math.floor(Math.random() * 20);

  return {
    id:              best.id,
    category:        best.category,
    emoji:           best.emoji,
    triggerBehavior: best.triggerBehavior,
    suggestion:      best.suggestion,
    description:     best.descTemplate,
    carbonSavedKg:   best.carbonSavedKg,
    moneySavedINR:   best.moneySavedINR,
    neighborCount,
    scores:          best.scores,
    totalScore:      best.totalScore,
    generatedAt:     new Date().toISOString(),
  };
}

/**
 * Get all swaps scored for a given context (used for analytics / debug).
 * @returns {Array}
 */
function getAllScoredSwaps() {
  return SWAP_POOL.map((swap) => {
    const carbonImpact   = Math.min(10, (swap.carbonSavedKg / 2.5) * 10);
    const financialImpact= Math.min(10, (swap.moneySavedINR / 350) * 10);
    const friction       = swap.frictionBase;
    return {
      ...swap,
      totalScore: scoreSwap({ carbonImpact, financialImpact, friction }),
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

module.exports = { getDailySwap, getAllScoredSwaps, SWAP_POOL };

'use strict';

/**
 * Carbon Calculation Engine
 * Pure functions — no I/O, no side effects.
 * All inputs are validated before use; invalid inputs return 0.
 */

const gridFactors     = require('../data/gridFactors.json');
const transportFactors= require('../data/transportFactors.json');
const foodCarbon      = require('../data/foodCarbon.json');

// ─── Electricity ────────────────────────────────────────────────────────────

/**
 * Calculate CO₂ from electricity consumption.
 * @param {number} units  kWh consumed
 * @param {string} state  Indian state name
 * @returns {{ kgCO2: number, factor: number, renewable_pct: number }}
 */
function calcElectricity(units, state) {
  const safeUnits = Math.max(0, Number(units) || 0);
  const stateData = gridFactors.states[state] ?? gridFactors.default;
  return {
    kgCO2:         parseFloat((safeUnits * stateData.factor).toFixed(3)),
    factor:        stateData.factor,
    renewable_pct: stateData.renewable_pct,
  };
}

// ─── Transport ───────────────────────────────────────────────────────────────

/**
 * Calculate CO₂ from a journey.
 * @param {string} mode     Transport mode key (e.g. 'solo_cab')
 * @param {number} distKm   Journey distance in km
 * @returns {{ kgCO2: number, mode: string, label: string, gCO2PerKm: number }}
 */
function calcTransport(mode, distKm) {
  const safeDist = Math.max(0, Number(distKm) || 0);
  const modeData = transportFactors.modes[mode] ?? transportFactors.modes['solo_cab'];
  return {
    kgCO2:      parseFloat(((safeDist * modeData.gCO2PerKm) / 1000).toFixed(3)),
    mode,
    label:      modeData.label,
    gCO2PerKm:  modeData.gCO2PerKm,
  };
}

/**
 * Estimate distance (km) from a cab fare amount (INR).
 * Uses average per-km rates defined in transportFactors.json.
 * @param {number} amount  Fare in INR
 * @param {string} mode    'solo_cab' | 'shared_cab' | 'cng_auto'
 * @returns {number}
 */
function estimateDistanceFromFare(amount, mode = 'solo_cab') {
  const ratePerKm = transportFactors.ratePerKm[mode] ?? 15;
  return parseFloat((Math.max(0, amount) / ratePerKm).toFixed(1));
}

// ─── Food ────────────────────────────────────────────────────────────────────

/**
 * Look up carbon for a known food item.
 * Falls back to category default, then overall default.
 * @param {string} itemName   e.g. "Amul Butter"
 * @param {number} weightKg   Weight in kg
 * @returns {{ kgCO2: number, flag: string, matched: boolean }}
 */
function calcFoodItem(itemName, weightKg) {
  const safeKg = Math.max(0, Number(weightKg) || 0);
  const key = Object.keys(foodCarbon.items).find(
    (k) => k.toLowerCase().includes(itemName.toLowerCase()) ||
           itemName.toLowerCase().includes(k.toLowerCase())
  );
  if (key) {
    const item = foodCarbon.items[key];
    return {
      kgCO2:   parseFloat((safeKg * item.kgCO2PerKg).toFixed(3)),
      flag:    item.flag,
      matched: true,
      key,
    };
  }
  // Use category default if no match
  const fallback = foodCarbon.categoryDefaults['default'];
  return {
    kgCO2:   parseFloat((safeKg * fallback).toFixed(3)),
    flag:    'unknown',
    matched: false,
    key:     null,
  };
}

/**
 * Calculate CO₂ for a food delivery order.
 * Estimates: food prep from order amount + delivery vehicle.
 * @param {number} amount         Order value in INR
 * @param {number} deliveryDistKm Estimated delivery distance in km
 * @returns {{ total: number, foodPrep: number, delivery: number, packaging: number }}
 */
function calcFoodDelivery(amount, deliveryDistKm = 3) {
  // Empirical: Rs.100 of food ≈ 0.26 kg CO₂ (Indian avg meal prep)
  const foodPrep  = parseFloat(((amount / 100) * 0.26).toFixed(3));
  // Delivery on a petrol scooter: ~90 g CO₂/km
  const delivery  = parseFloat(((deliveryDistKm * 90) / 1000).toFixed(3));
  // Packaging (single-use plastic/foam): flat 0.25 kg per order
  const packaging = 0.25;
  return {
    total:      parseFloat((foodPrep + delivery + packaging).toFixed(3)),
    foodPrep,
    delivery,
    packaging,
  };
}

// ─── Spend category → carbon estimate ────────────────────────────────────────

/**
 * Emission intensity by spending category (kg CO₂ per INR 100 spent).
 * Used when transaction SMS provides amount but no detailed breakdown.
 */
const SPEND_INTENSITY = {
  food_delivery: 0.41,  // includes food prep + delivery
  grocery:       0.05,
  transport_cab: 0.14,  // kg CO₂ per INR (estimated via fare→distance→emission)
  fuel:          2.31,  // kg CO₂ per litre petrol; 1 litre ≈ Rs.100
  shopping:      0.03,
  utility:       0.10,
  entertainment: 0.01,
  health:        0.02,
  default:       0.04,
};

/**
 * Estimate CO₂ from a spending transaction.
 * @param {string} category  One of SPEND_INTENSITY keys
 * @param {number} amount    Transaction amount in INR
 * @returns {{ kgCO2: number, intensity: number }}
 */
function calcSpend(category, amount) {
  const safeAmt = Math.max(0, Number(amount) || 0);
  const intensity = SPEND_INTENSITY[category] ?? SPEND_INTENSITY.default;
  return {
    kgCO2:     parseFloat(((safeAmt / 100) * intensity).toFixed(3)),
    intensity,
  };
}

// ─── Swap scoring ─────────────────────────────────────────────────────────────

/**
 * Score a potential swap using CarbonIQ's formula:
 *   Score = (carbonImpact × 0.35) + (financialImpact × 0.40) + (friction × 0.25)
 * All inputs are 0–10 normalised scores.
 * @param {{ carbonImpact: number, financialImpact: number, friction: number }} swap
 * @returns {number} Score between 0 and 10
 */
function scoreSwap({ carbonImpact, financialImpact, friction }) {
  return parseFloat(
    (carbonImpact * 0.35 + financialImpact * 0.40 + friction * 0.25).toFixed(3)
  );
}

// ─── Normalisation helpers ────────────────────────────────────────────────────

/**
 * Normalise a raw value to a 0–10 scale.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function normalise(value, min, max) {
  if (max === min) return 5;
  return parseFloat((((value - min) / (max - min)) * 10).toFixed(2));
}

module.exports = {
  calcElectricity,
  calcTransport,
  calcFoodItem,
  calcFoodDelivery,
  calcSpend,
  estimateDistanceFromFare,
  scoreSwap,
  normalise,
  SPEND_INTENSITY,
};

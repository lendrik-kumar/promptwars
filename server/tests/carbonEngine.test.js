'use strict';

const {
  calcElectricity,
  calcTransport,
  calcFoodDelivery,
  calcFoodItem,
  calcSpend,
  scoreSwap,
  estimateDistanceFromFare,
} = require('../services/carbonEngine');

describe('calcElectricity', () => {
  test('Delhi 186 units returns correct CO2', () => {
    const { kgCO2, factor } = calcElectricity(186, 'Delhi');
    expect(factor).toBe(0.82);
    expect(kgCO2).toBeCloseTo(186 * 0.82, 1);
  });

  test('Karnataka renewable-heavy grid has lower factor', () => {
    const delhi = calcElectricity(100, 'Delhi');
    const kara  = calcElectricity(100, 'Karnataka');
    expect(kara.kgCO2).toBeLessThan(delhi.kgCO2);
  });

  test('Unknown state falls back to national average', () => {
    const { factor } = calcElectricity(100, 'InvalidState');
    expect(factor).toBe(0.79); // national default
  });

  test('Zero units returns zero CO2', () => {
    expect(calcElectricity(0, 'Maharashtra').kgCO2).toBe(0);
  });

  test('Negative units clamped to 0', () => {
    expect(calcElectricity(-10, 'Maharashtra').kgCO2).toBe(0);
  });
});

describe('calcTransport', () => {
  test('Solo cab 10km returns correct CO2', () => {
    const { kgCO2 } = calcTransport('solo_cab', 10);
    expect(kgCO2).toBeCloseTo(10 * 0.21, 2);
  });

  test('Metro emits less than solo cab for same distance', () => {
    const cab   = calcTransport('solo_cab', 15);
    const metro = calcTransport('metro', 15);
    expect(metro.kgCO2).toBeLessThan(cab.kgCO2);
  });

  test('Walking returns 0 CO2', () => {
    expect(calcTransport('walking', 5).kgCO2).toBe(0);
  });

  test('Electric scooter is lower than petrol scooter', () => {
    const ev  = calcTransport('electric_scooter', 10);
    const pet = calcTransport('petrol_scooter', 10);
    expect(ev.kgCO2).toBeLessThan(pet.kgCO2);
  });

  test('Zero distance returns zero CO2', () => {
    expect(calcTransport('solo_cab', 0).kgCO2).toBe(0);
  });
});

describe('calcFoodDelivery', () => {
  test('Swiggy Rs.340 returns ~1.4 kg CO2', () => {
    const { total } = calcFoodDelivery(340, 3);
    expect(total).toBeGreaterThan(1.0);
    expect(total).toBeLessThan(2.0);
  });

  test('Closer restaurant (1km) emits less than distant (5km)', () => {
    const near = calcFoodDelivery(300, 1);
    const far  = calcFoodDelivery(300, 5);
    expect(near.total).toBeLessThan(far.total);
  });

  test('Breakdown sums to total', () => {
    const { total, foodPrep, delivery, packaging } = calcFoodDelivery(400, 4);
    expect(total).toBeCloseTo(foodPrep + delivery + packaging, 2);
  });
});

describe('calcFoodItem', () => {
  test('Amul Butter has high flag', () => {
    const { flag } = calcFoodItem('Amul Butter', 0.5);
    expect(flag).toBe('high');
  });

  test('Guava has low flag', () => {
    const { flag } = calcFoodItem('Guava', 1);
    expect(flag).toBe('low');
  });

  test('Mutton emits more than lentils for same weight', () => {
    const mutton  = calcFoodItem('Mutton', 1);
    const lentils = calcFoodItem('Dal', 1);
    expect(mutton.kgCO2).toBeGreaterThan(lentils.kgCO2);
  });
});

describe('scoreSwap', () => {
  test('All-10 scores return 10', () => {
    const score = scoreSwap({ carbonImpact: 10, financialImpact: 10, friction: 10 });
    expect(score).toBeCloseTo(10, 1);
  });

  test('Financial weight is highest (0.40)', () => {
    const highFinance = scoreSwap({ carbonImpact: 5, financialImpact: 10, friction: 5 });
    const highCarbon  = scoreSwap({ carbonImpact: 10, financialImpact: 5, friction: 5 });
    expect(highFinance).toBeGreaterThan(highCarbon);
  });

  test('Returns value between 0 and 10', () => {
    const score = scoreSwap({ carbonImpact: 6, financialImpact: 7, friction: 8 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});

describe('estimateDistanceFromFare', () => {
  test('Rs.220 solo cab estimates ~14.7 km', () => {
    const km = estimateDistanceFromFare(220, 'solo_cab');
    expect(km).toBeCloseTo(14.7, 0);
  });

  test('Zero fare returns 0 km', () => {
    expect(estimateDistanceFromFare(0)).toBe(0);
  });
});

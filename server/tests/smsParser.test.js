'use strict';

const { extractFromSMS, merchantToCategory } = require('../services/smsParser');

describe('extractFromSMS — HDFC UPI format', () => {
  test('Parses Swiggy order amount correctly', () => {
    const sms = 'HDFC Bank: UPI txn of Rs.340 to SWIGGY on 12-06. Avl Bal Rs.12,450';
    const r = extractFromSMS(sms);
    expect(r).not.toBeNull();
    expect(r.amount).toBe(340);
    expect(r.merchant.toLowerCase()).toContain('swiggy');
  });

  test('Parses comma-formatted large amounts', () => {
    const sms = 'HDFC Bank: UPI txn of Rs.1,240 to BIGBASKET on 11-06. Avl Bal Rs.8,200';
    const r = extractFromSMS(sms);
    expect(r.amount).toBe(1240);
  });
});

describe('extractFromSMS — Generic format', () => {
  test('Parses generic Rs. paid pattern', () => {
    const sms = 'Rs.2,800 paid to INDIANOIL on 13-06. UPI Ref: 240613789012';
    const r = extractFromSMS(sms);
    expect(r.amount).toBe(2800);
  });
});

describe('extractFromSMS — Non-financial SMS', () => {
  test('Returns null for OTP SMS', () => {
    expect(extractFromSMS('Your OTP is 123456. Do not share with anyone.')).toBeNull();
  });
  test('Returns null for promotional SMS', () => {
    expect(extractFromSMS('Get 50% off on Swiggy this weekend!')).toBeNull();
  });
});

describe('merchantToCategory', () => {
  const cases = [
    ['SWIGGY', 'food_delivery'], ['zomato', 'food_delivery'],
    ['OLA', 'transport_cab'],    ['uber', 'transport_cab'],
    ['IRCTC', 'transport_train'],
    ['BIGBASKET', 'grocery'],    ['blinkit', 'grocery'],
    ['INDIANOIL', 'fuel'],       ['BPCL', 'fuel'],
    ['BESCOM', 'utility'],
    ['NETFLIX', 'entertainment'],
    ['amazon', 'shopping'],
    ['pharmaeasy', 'health'],
    ['unknownbrand123', 'default'],
  ];
  test.each(cases)('"%s" maps to "%s"', (merchant, expected) => {
    expect(merchantToCategory(merchant)).toBe(expected);
  });
});

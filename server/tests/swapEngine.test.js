const { getDailySwap, getAllScoredSwaps } = require('../services/swapEngine');

describe('Swap Engine Service', () => {
  it('should return a daily swap', () => {
    const swap = getDailySwap();
    expect(swap).toBeDefined();
    expect(swap.suggestion).toBeDefined();
    expect(swap.carbonSavedKg).toBeDefined();
    expect(swap.moneySavedINR).toBeDefined();
  });

  it('should bias daily swap towards a category when provided', () => {
    const swap = getDailySwap({ category: 'transport' });
    expect(swap).toBeDefined();
    expect(swap.category).toBe('transport');
  });

  it('should score all swaps', () => {
    const scored = getAllScoredSwaps();
    expect(scored).toBeInstanceOf(Array);
    expect(scored.length).toBeGreaterThan(0);
    expect(scored[0].totalScore).toBeDefined();
    expect(scored[0].totalScore).toBeGreaterThanOrEqual(scored[scored.length - 1].totalScore);
  });
});

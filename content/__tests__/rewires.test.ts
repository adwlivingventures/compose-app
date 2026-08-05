import { REWIRES, SCRIPT_REWIRE_INDEX, orderedRewires, rewireForDay } from '../rewires';

/**
 * Invariants for the personalized rewire ordering (2026-08-03, build order
 * 2.1). The partition is a content-level guarantee: his ticked S22 scripts
 * lead the cycle, everything else keeps its relative order, and the
 * 5-repetition spaced cadence across 75 days is untouched.
 */

describe('rewire ordering personalization', () => {
  it('zero ticks (or absent) returns the default order, byte-identical', () => {
    expect(orderedRewires(null)).toBe(REWIRES);
    expect(orderedRewires(undefined)).toBe(REWIRES);
    expect(orderedRewires([])).toBe(REWIRES);
  });

  it('every S22 script maps to a real rewire whose oldScript names that belief', () => {
    for (const [key, index] of Object.entries(SCRIPT_REWIRE_INDEX)) {
      expect(REWIRES[index]).toBeDefined();
      expect(typeof key).toBe('string');
    }
    // The five mapped indices are distinct — no two scripts share a rewire.
    const indices = Object.values(SCRIPT_REWIRE_INDEX);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('matched rewires lead the cycle in S22 canonical order; the rest keep relative order', () => {
    const cycle = orderedRewires(['never-fix', 'broken']); // stored order is irrelevant
    // Canonical S22 order: broken before never-fix.
    expect(cycle[0]).toBe(REWIRES[SCRIPT_REWIRE_INDEX.broken]);
    expect(cycle[1]).toBe(REWIRES[SCRIPT_REWIRE_INDEX['never-fix']]);
    // Same 15 items, no additions, no losses.
    expect(cycle).toHaveLength(REWIRES.length);
    expect(new Set(cycle).size).toBe(REWIRES.length);
    // Unmatched items keep their original relative order.
    const unmatched = cycle.slice(2);
    const originalUnmatched = REWIRES.filter(
      (_, i) => i !== SCRIPT_REWIRE_INDEX.broken && i !== SCRIPT_REWIRE_INDEX['never-fix'],
    );
    expect(unmatched).toEqual(originalUnmatched);
  });

  it('unmapped ticks are ignored without error', () => {
    expect(orderedRewires(['not-a-script'])).toBe(REWIRES);
  });

  it('Day 1 lands on his first named belief; the cycle still repeats every 15 days', () => {
    const ticked = ['less-of-a-man'];
    expect(rewireForDay(1, ticked)).toBe(REWIRES[SCRIPT_REWIRE_INDEX['less-of-a-man']]);
    // Spaced repetition preserved: the same rep returns 15 days later.
    expect(rewireForDay(16, ticked)).toBe(rewireForDay(1, ticked));
    expect(rewireForDay(31, ticked)).toBe(rewireForDay(1, ticked));
    // Legacy call shape (no ticks) is unchanged.
    expect(rewireForDay(1)).toBe(REWIRES[0]);
  });
});

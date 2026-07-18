import {
  DAILY_QUOTES,
  DAY_TRIAD_IDS,
  IAM_STATEMENTS,
  TRIADS,
  quoteForDay,
  statementsForDay,
} from '../rewireDaily';

/**
 * Invariants for the Re-Wire daily layer. These mirror the checks the
 * content was generated under; they exist so a future hand-edit (swapping a
 * quote, retuning a triad) cannot silently break the rotation math or
 * reintroduce off-domain vocabulary.
 */

describe('rewireDaily content invariants', () => {
  it('has exactly 75 quotes, one per day, in day order, all unique', () => {
    expect(DAILY_QUOTES).toHaveLength(75);
    DAILY_QUOTES.forEach((q, i) => expect(q.day).toBe(i + 1));
    expect(new Set(DAILY_QUOTES.map((q) => q.text)).size).toBe(75);
  });

  it('every quote is attributed to the public-domain 1937 edition', () => {
    for (const q of DAILY_QUOTES) {
      expect(q.source).toContain('1937');
    }
  });

  it('keeps money-domain vocabulary out of quote text', () => {
    const banned = ['riches', 'money', 'poverty', 'wealth', 'cash', 'bank'];
    for (const q of DAILY_QUOTES) {
      for (const word of banned) {
        expect(q.text.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('has 75 statements with positional ids 1..75, all unique', () => {
    expect(IAM_STATEMENTS).toHaveLength(75);
    IAM_STATEMENTS.forEach((s, i) => expect(s.id).toBe(i + 1));
    expect(new Set(IAM_STATEMENTS.map((s) => s.text)).size).toBe(75);
  });

  it('has 25 triads that cleanly partition all 75 statements', () => {
    expect(TRIADS).toHaveLength(25);
    TRIADS.forEach((t, i) => expect(t.id).toBe(i + 1));
    const used = TRIADS.flatMap((t) => t.statementIds);
    expect(used).toHaveLength(75);
    expect(new Set(used).size).toBe(75);
  });

  it('uses each triad exactly once per 25-day phase', () => {
    expect(DAY_TRIAD_IDS).toHaveLength(75);
    for (const start of [0, 25, 50]) {
      const phase = DAY_TRIAD_IDS.slice(start, start + 25);
      expect([...phase].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 25 }, (_, i) => i + 1),
      );
    }
  });

  it('quoteForDay returns the day and clamps out-of-range days', () => {
    expect(quoteForDay(1).day).toBe(1);
    expect(quoteForDay(40).day).toBe(40);
    expect(quoteForDay(75).day).toBe(75);
    // Act II/III surfaces may pass day > 75; pre-hydration edge may pass 0.
    expect(quoteForDay(0).day).toBe(1);
    expect(quoteForDay(120).day).toBe(75);
  });

  it('statementsForDay returns the 3 statements of the day triad, in order', () => {
    for (const day of [1, 26, 51, 75]) {
      const triad = TRIADS[DAY_TRIAD_IDS[day - 1] - 1];
      const statements = statementsForDay(day);
      expect(statements.map((s) => s.id)).toEqual(triad.statementIds);
    }
    expect(statementsForDay(999)).toHaveLength(3);
  });

  it('re-encounters every statement exactly three times, once per phase', () => {
    for (const start of [0, 25, 50]) {
      const seen = DAY_TRIAD_IDS.slice(start, start + 25)
        .flatMap((tid) => TRIADS[tid - 1].statementIds)
        .sort((a, b) => a - b);
      expect(seen).toEqual(Array.from({ length: 75 }, (_, i) => i + 1));
    }
  });
});

// Composure Score — the step-5 suite (BUILD_PROMPT §4.5: pure, unit-tested,
// weights in one config object). Also enforces the honesty rules: every bar
// traces to an answer, no invented data, the score never reaches the calm
// zone pre-program.

import { COMPOSURE_WEIGHTS, computeComposure } from '../composure';
import { SCREENS } from '../screens';
import type { Answers } from '../logic';

describe('weights config ↔ screen config integrity', () => {
  test('every deduction key is a real option value of its question', () => {
    const optionValues = new Map<string, Set<string>>();
    for (const s of SCREENS) {
      if ('answerKey' in s && 'options' in s && Array.isArray((s as any).options)) {
        optionValues.set(
          (s as any).answerKey,
          new Set((s as any).options.map((o: { value: string }) => o.value)),
        );
      }
      if (s.archetype === 'interactive-check') {
        // Numeric 1–10 ratings are handled outside the deduction table; the
        // only string value left is the skip sentinel.
        optionValues.set(s.answerKey, new Set(['skipped']));
      }
    }
    for (const [answerKey, table] of Object.entries(COMPOSURE_WEIGHTS.deductions)) {
      const values = optionValues.get(answerKey);
      expect(values).toBeDefined();
      for (const key of Object.keys(table)) {
        expect(values!.has(key)).toBe(true);
      }
    }
  });
});

// A moderately-struggling Day-0 profile (B-26 example: breath-holding,
// spectatoring most sessions, partial release, push-through adrenaline,
// moderate traits). Module-scoped so the gate suite below can reuse it.
const REFERENCE_PERSONA: Answers = {
  adrenalineSpike: 'push-through',
  breathEdge: 'shallow-hold',
  spectatoring: 'almost-every-time',
  pelvicCheck: 5, // 1–10 release rating (partial band)
  avoidance: 'sometimes',
  aftermath: 'lingers',
  spillover: 'sometimes',
  contentFrequency: '3-5',
  escalation: 'somewhat',
  morningArousal: 'sometimes',
  scripts: ['broken', 'never-fix'],
  duration: 'always',
  age: 29,
};

describe('score behavior', () => {
  test('reference persona lands mid-low with a clear gap to the calm zone', () => {
    // v2 weights: this moderately-struggling Day-0 profile scores ~33.
    const { score } = computeComposure(REFERENCE_PERSONA);
    expect(score).toBeGreaterThanOrEqual(28);
    expect(score).toBeLessThanOrEqual(40);
  });

  test('is monotonic: any single worse answer never raises the score', () => {
    const base = computeComposure(REFERENCE_PERSONA).score;
    const worse: Partial<Answers>[] = [
      { adrenalineSpike: 'panic' },
      { spectatoring: 'almost-every-time' },
      { pelvicCheck: 2 },
      { avoidance: 'stopped' },
      { spillover: 'everything' },
      { contentFrequency: 'daily' },
      { escalation: 'yes' },
    ];
    for (const patch of worse) {
      expect(computeComposure({ ...REFERENCE_PERSONA, ...patch }).score).toBeLessThanOrEqual(
        base,
      );
    }
  });

  test('full severity floors at 12', () => {
    const worst = computeComposure({
      adrenalineSpike: 'panic',
      breathEdge: 'shallow-hold',
      spectatoring: 'almost-every-time',
      pelvicCheck: 1,
      avoidance: 'stopped',
      aftermath: 'spirals',
      spillover: 'everything',
      contentFrequency: 'daily',
      escalation: 'yes',
      morningArousal: 'rarely',
      scripts: ['broken', 'disappointed', 'never-fix', 'less-of-a-man'],
    });
    expect(worst.score).toBe(12);
  });

  test('unanswered questions deduct nothing', () => {
    expect(computeComposure({}).score).toBe(100);
  });
});

// The founder's guarantees (2026-07-15): trained calm (80+) is reachable but
// only when the trait cluster is genuinely resolved — which realistically means
// Day 40/75 — and a compliant man's early physiological gains lift his score
// well above baseline by Day 14 without letting him into the calm zone yet.
describe('calm-zone gate + honest early progress', () => {
  // A single struggling man, measured three times with the SAME instrument.
  const DAY0 = REFERENCE_PERSONA; // ~33

  // Day 14: early-movers resolved (real autonomic gains), traits unchanged.
  const DAY14: Answers = {
    ...REFERENCE_PERSONA,
    adrenalineSpike: 'calm',
    breathEdge: 'slow-deep',
    spectatoring: 'never',
    pelvicCheck: 9,
    morningArousal: 'most',
  };

  // Day 40/75: the trait cluster has also resolved.
  const DAY75: Answers = {
    ...DAY14,
    avoidance: 'rarely',
    aftermath: 'recover-fast',
    spillover: 'bedroom-only',
    contentFrequency: 'rarely',
    escalation: 'no',
    scripts: [],
  };

  test('Day 14 beats the Day 0 baseline (early-mover gains register)', () => {
    expect(computeComposure(DAY14).score).toBeGreaterThan(computeComposure(DAY0).score);
  });

  test('Day 14 stays below the calm zone while any trait is still active', () => {
    expect(computeComposure(DAY14).score).toBeLessThan(80);
  });

  test('the calm zone opens only when the trait cluster is resolved', () => {
    expect(computeComposure(DAY75).score).toBeGreaterThanOrEqual(80);
  });

  test('a single lingering trait (one script) holds an otherwise-perfect read at 79', () => {
    const oneScript = computeComposure({ ...DAY75, scripts: ['broken'] });
    expect(oneScript.score).toBe(79);
  });
});

describe('severity bars trace to answers', () => {
  test('each bar appears only when its source question was answered', () => {
    const none = computeComposure({});
    // Cognitive scripts always renders (zero selections is itself signal: "Quiet").
    expect(none.bars.map((b) => b.label)).toEqual(['Cognitive scripts']);
  });

  test('grade vocabularies match the spec examples', () => {
    const result = computeComposure({
      adrenalineSpike: 'push-through',
      spectatoring: 'almost-every-time',
      pelvicCheck: 5,
      avoidance: 'frequently',
      scripts: ['broken', 'never-fix'],
      escalation: 'somewhat',
    });
    expect(result.bars.map(({ label, grade, tone }) => ({ label, grade, tone }))).toEqual([
      { label: 'Sympathetic override', grade: 'Moderate', tone: 'amber' },
      { label: 'Spectatoring loop', grade: 'High', tone: 'red' },
      { label: 'Pelvic release capacity', grade: 'Partial', tone: 'amber' },
      { label: 'Avoidance pattern', grade: 'Elevated', tone: 'amber' },
      { label: 'Cognitive scripts', grade: 'Active', tone: 'amber' },
      { label: 'Conditioning drift', grade: 'Present', tone: 'amber' },
    ]);
    // Every bar carries its plain-English detail line (founder review
    // 2026-07-10: no reading may need decoding).
    for (const bar of result.bars) {
      expect(bar.detail.length).toBeGreaterThan(20);
    }
  });

  test('healthy reads go neutral — a good result must not look like a warning', () => {
    const result = computeComposure({
      adrenalineSpike: 'calm',
      spectatoring: 'never',
      pelvicCheck: 9,
      avoidance: 'rarely',
      scripts: [],
    });
    for (const bar of result.bars) {
      expect(bar.tone).toBe('neutral');
    }
  });

  test('skipped pelvic check reads Unmeasured — never invented', () => {
    const result = computeComposure({ pelvicCheck: 'skipped' });
    expect(result.bars.find((b) => b.label === 'Pelvic release capacity')?.grade).toBe(
      'Unmeasured',
    );
  });

  test('red is reserved for High', () => {
    const result = computeComposure({
      adrenalineSpike: 'panic',
      spectatoring: 'rarely',
      avoidance: 'stopped',
    });
    for (const bar of result.bars) {
      expect(bar.tone === 'red').toBe(bar.grade === 'High');
    }
  });
});

describe('mirror sentence', () => {
  test('three markers form the triad, conditioned over age-derived years', () => {
    const { mirror } = computeComposure({
      breathEdge: 'shallow-hold',
      spectatoring: 'almost-every-time',
      pelvicCheck: 5,
      duration: 'always',
      age: 29,
    });
    expect(mirror).toBe(
      'Breath-holding at the edge, spectatoring most sessions, partial pelvic release — that triad is the adrenaline trap, and yours has been conditioned over roughly 11 years.',
    );
  });

  test('two markers form a pattern, not a triad', () => {
    const { mirror } = computeComposure({
      breathEdge: 'shallow-hold',
      spectatoring: 'sometimes',
      duration: '2-5y',
    });
    expect(mirror).toContain('that pattern is the adrenaline trap');
    expect(mirror).toContain('over roughly three years');
  });

  test('fewer than two markers falls back without fabricating any', () => {
    const { mirror } = computeComposure({ duration: '6m-2y' });
    expect(mirror).toBe(
      'This is a conditioned adrenaline response — trained into your nervous system over the last couple of years.',
    );
  });
});

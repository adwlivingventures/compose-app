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
        optionValues.set(
          s.answerKey,
          new Set([...s.resultOptions.map((o) => o.value), 'skipped']),
        );
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

describe('score behavior', () => {
  const REFERENCE_PERSONA: Answers = {
    // The B-26 example: breath-holding, spectatoring most sessions, partial
    // release, push-through adrenaline, moderate everything else → ref "41".
    adrenalineSpike: 'push-through',
    breathEdge: 'shallow-hold',
    spectatoring: 'almost-every-time',
    pelvicCheck: 'partial',
    avoidance: 'sometimes',
    aftermath: 'fear-next',
    spillover: 'sometimes',
    contentFrequency: '3-5',
    escalation: 'somewhat',
    morningArousal: 'sometimes',
    scripts: ['broken', 'never-fix'],
    duration: 'always',
    age: 29,
  };

  test('anchors near the reference persona (41 ± 8)', () => {
    const { score } = computeComposure(REFERENCE_PERSONA);
    expect(score).toBeGreaterThanOrEqual(33);
    expect(score).toBeLessThanOrEqual(49);
  });

  test('is monotonic: any single worse answer never raises the score', () => {
    const base = computeComposure(REFERENCE_PERSONA).score;
    const worse: Partial<Answers>[] = [
      { adrenalineSpike: 'panic' },
      { spectatoring: 'almost-every-time' },
      { pelvicCheck: 'difficulty' },
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

  test('clamps: full severity floors at 12; all-calm stays below the calm zone', () => {
    const worst = computeComposure({
      adrenalineSpike: 'panic',
      breathEdge: 'shallow-hold',
      spectatoring: 'almost-every-time',
      pelvicCheck: 'difficulty',
      avoidance: 'stopped',
      aftermath: 'fear-next',
      spillover: 'everything',
      contentFrequency: 'daily',
      escalation: 'yes',
      morningArousal: 'rarely',
      scripts: ['broken', 'disappointed', 'never-fix', 'less-of-a-man'],
    });
    expect(worst.score).toBe(12);
    const calm = computeComposure({
      adrenalineSpike: 'calm',
      breathEdge: 'slow-deep',
      spectatoring: 'never',
      pelvicCheck: 'complete',
      avoidance: 'rarely',
      spillover: 'bedroom-only',
      contentFrequency: 'rarely',
      morningArousal: 'most',
      scripts: [],
    });
    expect(calm.score).toBeLessThan(80); // never inside the calm zone
    expect(calm.score).toBeGreaterThan(60); // and not insultingly low
  });

  test('unanswered questions deduct nothing', () => {
    expect(computeComposure({}).score).toBe(76); // base clamped to ceiling
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
      pelvicCheck: 'partial',
      avoidance: 'frequently',
      scripts: ['broken', 'never-fix'],
      escalation: 'somewhat',
    });
    expect(result.bars).toEqual([
      { label: 'Sympathetic override', grade: 'Moderate', tone: 'amber' },
      { label: 'Spectatoring loop', grade: 'High', tone: 'red' },
      { label: 'Pelvic release capacity', grade: 'Partial', tone: 'amber' },
      { label: 'Avoidance pattern', grade: 'Elevated', tone: 'amber' },
      { label: 'Cognitive scripts', grade: 'Active', tone: 'amber' },
      { label: 'Conditioning drift', grade: 'Present', tone: 'amber' },
    ]);
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
      pelvicCheck: 'partial',
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

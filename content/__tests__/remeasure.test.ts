// Re-measurement content invariants. The product claim "measured, not
// promised" depends on the instrument staying identical between Day 0 and
// every re-measurement — these tests break the build if the onboarding
// question set and the re-measurement set drift apart.

import { COMPOSURE_WEIGHTS } from '../onboarding/composure';
import {
  getRemeasureCopy,
  NO_BASELINE_RESULT,
  REMEASURE_SCREENS,
  resolveResultCopy,
} from '../remeasure';

describe('REMEASURE_SCREENS — instrument parity with the Day-0 baseline', () => {
  const answerKeys = REMEASURE_SCREENS.map((s) =>
    'answerKey' in s ? (s.answerKey as string) : null,
  );

  test('every scored deduction key is asked again', () => {
    for (const key of Object.keys(COMPOSURE_WEIGHTS.deductions)) {
      expect(answerKeys).toContain(key);
    }
  });

  test('the cognitive-scripts multi-select is asked again', () => {
    expect(answerKeys).toContain('scripts');
  });

  test('only archetypes the re-measurement runner renders', () => {
    for (const screen of REMEASURE_SCREENS) {
      expect(['single-select', 'multi-select', 'interactive-check']).toContain(screen.archetype);
    }
  });

  test('escalation keeps its skip logic (never asked after "rarely")', () => {
    const escalation = REMEASURE_SCREENS.find(
      (s) => 'answerKey' in s && s.answerKey === 'escalation',
    );
    expect(escalation?.displayLogic?.skipIf).toEqual({
      key: 'contentFrequency',
      equals: 'rarely',
    });
  });
});

describe('getRemeasureCopy — register per milestone', () => {
  test('exact milestones resolve to their own copy', () => {
    expect(getRemeasureCopy(14).eyebrow).toContain('DAY 14');
    expect(getRemeasureCopy(40).eyebrow).toContain('DAY 40');
    expect(getRemeasureCopy(75).eyebrow).toContain('DAY 75');
  });

  test('off-schedule days fall to the nearest register (Act III quarterly reuse)', () => {
    expect(getRemeasureCopy(10).eyebrow).toContain('DAY 14');
    expect(getRemeasureCopy(30).eyebrow).toContain('DAY 40');
    expect(getRemeasureCopy(200).eyebrow).toContain('DAY 75');
  });
});

describe('resolveResultCopy — votes, not verdicts', () => {
  const copy = getRemeasureCopy(14);

  test('a ≥2-point rise reads as improvement, tokens resolved', () => {
    const line = resolveResultCopy(copy, 47, 41);
    expect(line).toBe(copy.result.improved.replace('{baseline}', '41').replace('{score}', '47'));
    expect(line).not.toContain('{');
  });

  test('±1 point sits inside the noise floor and reads as steady', () => {
    expect(resolveResultCopy(copy, 42, 41)).toContain('42');
    expect(resolveResultCopy(copy, 42, 41)).toBe(
      copy.result.steady.replace('{baseline}', '41').replace('{score}', '42'),
    );
    expect(resolveResultCopy(copy, 40, 41)).toBe(
      copy.result.steady.replace('{baseline}', '41').replace('{score}', '40'),
    );
  });

  test('a dip is normalized, never graded', () => {
    const line = resolveResultCopy(copy, 37, 41);
    expect(line).toBe(copy.result.dip.replace('{baseline}', '41').replace('{score}', '37'));
    // Doctrine spot-check: the dip line must not shame or grade the man.
    expect(line.toLowerCase()).not.toMatch(/fail|worse|behind|lost/);
  });

  test('missing baseline falls back to the standalone reading', () => {
    expect(resolveResultCopy(copy, 44, null)).toBe(NO_BASELINE_RESULT.replace('{score}', '44'));
  });
});

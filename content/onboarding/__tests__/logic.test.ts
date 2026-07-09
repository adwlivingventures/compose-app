// Acceptance (BUILD_PROMPT §8): escalation skip, triage condition, and the
// partner branch are unit-tested. Plus progress-header numbering policy.

import { buildFlow } from '../buildFlow';
import {
  Answers,
  evalCondition,
  isScreenVisible,
  nextVisibleIndex,
  progressMeta,
  resolveBranch,
  withName,
} from '../logic';
import { SCREENS } from '../screens';
import { computeComposure } from '../composure';

const flowB = buildFlow('B');
const flowA = buildFlow('A');
const at = (flow: typeof flowB, id: string) => flow.findIndex((s) => s.id === id);

describe('escalation skip (B-18/A-20)', () => {
  test('skipped when adult-content frequency is "Rarely or never"', () => {
    const answers: Answers = { contentFrequency: 'rarely' };
    const next = nextVisibleIndex(flowB, at(flowB, 'content-frequency'), answers);
    expect(flowB[next].id).toBe('spectatoring');
  });

  test('shown for any other frequency', () => {
    for (const contentFrequency of ['1-2', '3-5', 'daily']) {
      const next = nextVisibleIndex(flowB, at(flowB, 'content-frequency'), {
        contentFrequency,
      });
      expect(flowB[next].id).toBe('escalation');
    }
  });

  test('variant A: skipping escalation still lands on the inline Novelty Loop card', () => {
    const next = nextVisibleIndex(flowA, at(flowA, 'content-frequency'), {
      contentFrequency: 'rarely',
    });
    expect(flowA[next].id).toBe('card-novelty-loop');
  });
});

describe('physician triage condition (B-12/A-13)', () => {
  const note = SCREENS.find((s) => s.id === 'physician-note')!;

  test('shows ONLY when morning arousal = rarely AND libido ≤ 3', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 3 })).toBe(true);
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 1 })).toBe(true);
  });

  test('hidden when either half of the condition fails', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 4 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'sometimes', libido: 2 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'most', libido: 10 })).toBe(false);
    expect(isScreenVisible(note, {})).toBe(false);
  });

  test('flow advance from libido lands past the note when hidden', () => {
    const next = nextVisibleIndex(flowB, at(flowB, 'libido'), {
      morningArousal: 'most',
      libido: 8,
    });
    expect(flowB[next].id).toBe('adrenaline-spike');
  });
});

describe('partner impact branch (B-20/A-23)', () => {
  const branchOn = { key: 'relationship' as const, oneOf: ['committed', 'married'] };

  test('P for committed/married', () => {
    expect(resolveBranch(branchOn, { relationship: 'committed' })).toBe('P');
    expect(resolveBranch(branchOn, { relationship: 'married' })).toBe('P');
  });

  test('S for single, casual, recently out — and when unanswered', () => {
    expect(resolveBranch(branchOn, { relationship: 'single' })).toBe('S');
    expect(resolveBranch(branchOn, { relationship: 'casual' })).toBe('S');
    expect(resolveBranch(branchOn, { relationship: 'recently-out' })).toBe('S');
    expect(resolveBranch(branchOn, {})).toBe('S');
  });
});

describe('testimonial gate + paywall-dismiss are never sequential', () => {
  test('testimonial slot skipped while the flag is off', () => {
    const next = nextVisibleIndex(flowB, at(flowB, 'pelvic-check'), {});
    expect(flowB[next].id).not.toBe('testimonial-somatic');
  });

  test('advancing from paywall never lands on paywall-dismiss', () => {
    const next = nextVisibleIndex(flowB, at(flowB, 'paywall'), {});
    expect(flowB[next].id).toBe('day-zero');
  });
});

describe('progress header (MAPPING · X OF Y, layout truth: 3a B-10 = "10 OF 24")', () => {
  test('B: morning arousal is 10 of 24', () => {
    const meta = progressMeta(flowB, at(flowB, 'morning-arousal'));
    expect(meta).toMatchObject({ step: 10, total: 24 });
  });

  test('A: denominator includes the inline cards (spillover = 28)', () => {
    const meta = progressMeta(flowA, at(flowA, 'morning-arousal'));
    expect(meta).toMatchObject({ step: 11, total: 28 });
  });

  test('no header on welcomes, cards, map, paywall', () => {
    for (const id of ['welcome-opening', 'card-adrenaline-trap', 'map', 'paywall']) {
      expect(progressMeta(flowB, at(flowB, id))).toBeNull();
    }
  });
});

describe('composure score stays out of the calm zone', () => {
  test('worst-case and best-case answers clamp to [12, 76]', () => {
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
    expect(worst.score).toBeGreaterThanOrEqual(12);
    const best = computeComposure({ adrenalineSpike: 'calm', spectatoring: 'never' });
    expect(best.score).toBeLessThanOrEqual(76);
  });

  test('conditioning-drift bar appears only with escalation yes/somewhat', () => {
    const withDrift = computeComposure({ escalation: 'somewhat' });
    const without = computeComposure({ escalation: 'no' });
    expect(withDrift.bars.some((b) => b.label === 'Conditioning drift')).toBe(true);
    expect(without.bars.some((b) => b.label === 'Conditioning drift')).toBe(false);
  });
});

describe('withName', () => {
  test('substitutes the name and survives a missing one', () => {
    expect(withName('{name}, here is what your answers show.', { name: 'Marcus' })).toBe(
      'Marcus, here is what your answers show.',
    );
    expect(withName('{name}, here is what your answers show.', {})).toBe(
      'Here is what your answers show.',
    );
  });
});

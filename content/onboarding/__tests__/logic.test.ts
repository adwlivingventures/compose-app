// Acceptance (BUILD_PROMPT §8): escalation skip, triage condition, and the
// partner branch are unit-tested. Plus progress-header numbering policy.

import { buildFlow } from '../buildFlow';
import {
  Answers,
  evalCondition,
  isScreenVisible,
  nextVisibleIndex,
  progressMeta,
  withName,
} from '../logic';
import { SCREENS } from '../screens';
import { computeComposure } from '../composure';

const flow = buildFlow();
const at = (id: string) => flow.findIndex((s) => s.id === id);

describe('escalation skip (screen 18)', () => {
  test('skipped when adult-content frequency is "Rarely or never"', () => {
    const answers: Answers = { contentFrequency: 'rarely' };
    const next = nextVisibleIndex(flow, at('content-frequency'), answers);
    expect(flow[next].id).toBe('spectatoring');
  });

  test('shown for any other frequency', () => {
    for (const contentFrequency of ['1-2', '3-5', 'daily']) {
      const next = nextVisibleIndex(flow, at('content-frequency'), {
        contentFrequency,
      });
      expect(flow[next].id).toBe('escalation');
    }
  });
});

describe('physician triage condition (screen 12)', () => {
  const note = SCREENS.find((s) => s.id === 'physician-note')!;

  // Founder ruling 2026-07-10: threshold tightened to libido ≤ 2.
  test('shows ONLY when morning arousal = rarely AND libido ≤ 2', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 2 })).toBe(true);
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 1 })).toBe(true);
  });

  test('hidden when either half of the condition fails', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 3 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'sometimes', libido: 2 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'most', libido: 10 })).toBe(false);
    expect(isScreenVisible(note, {})).toBe(false);
  });

  test('flow advance from libido lands past the note when hidden', () => {
    const next = nextVisibleIndex(flow, at('libido'), {
      morningArousal: 'most',
      libido: 8,
    });
    expect(flow[next].id).toBe('adrenaline-spike');
  });
});

describe('partner impact (screen 20) — one question for everyone', () => {
  // Founder ruling 2026-07-10: the single/casual branch is retired; the
  // partnered phrasing runs unconditionally.
  test('is a plain single-select with no display logic', () => {
    const partner = SCREENS.find((s) => s.id === 'partner-impact')!;
    expect(partner.archetype).toBe('single-select');
    expect(partner.displayLogic).toBeUndefined();
  });
});

describe('testimonial gate + paywall-dismiss are never sequential', () => {
  test('testimonial slot skipped while the flag is off', () => {
    const next = nextVisibleIndex(flow, at('pelvic-check'), {});
    expect(flow[next].id).not.toBe('testimonial-somatic');
  });

  test('advancing from paywall never lands on paywall-dismiss', () => {
    const next = nextVisibleIndex(flow, at('paywall'), {});
    expect(flow[next].id).toBe('day-zero');
  });
});

describe('progress header (MAPPING · X OF Y, layout truth: 3a frame 10 = "10 OF 24")', () => {
  test('morning arousal is 10 of 24', () => {
    const meta = progressMeta(flow, at('morning-arousal'));
    expect(meta).toMatchObject({ step: 10, total: 24 });
  });

  test('no header on welcomes, cards, map, paywall', () => {
    for (const id of ['welcome-opening', 'card-adrenaline-trap', 'map', 'paywall']) {
      expect(progressMeta(flow, at(id))).toBeNull();
    }
  });
});

describe('composure score stays out of the calm zone', () => {
  test('worst-case and best-case answers clamp to [12, 76]', () => {
    const worst = computeComposure({
      adrenalineSpike: 'panic',
      breathEdge: 'shallow-hold',
      spectatoring: 'almost-every-time',
      pelvicCheck: 1, // 1–10 release rating (limited)
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

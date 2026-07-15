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

  // Founder ruling 2026-07-14: threshold tightened to the extreme corner —
  // "Rarely or never" morning arousal AND libido at the floor (1/10).
  test('shows ONLY when morning arousal = rarely AND libido = 1', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 1 })).toBe(true);
  });

  test('hidden when either half of the condition fails', () => {
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 2 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'rarely', libido: 3 })).toBe(false);
    expect(isScreenVisible(note, { morningArousal: 'sometimes', libido: 1 })).toBe(false);
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

describe('reveal cards (founder ruling 2026-07-14, second pass)', () => {
  const crutch = SCREENS.find((s) => s.id === 'card-bandaids')!;
  const spectator = SCREENS.find((s) => s.id === 'card-spectatoring')!;
  const alwaysOn = ['card-adrenaline-trap', 'card-novelty-loop', 'card-dmn'];

  test('the three always-on cards carry no display logic', () => {
    for (const id of alwaysOn) {
      expect(SCREENS.find((s) => s.id === id)!.displayLogic).toBeUndefined();
    }
  });

  test('Crutch and Spectator are complementary on bandaidHistory', () => {
    // Used a substance → Crutch, not Spectator.
    expect(isScreenVisible(crutch, { bandaidHistory: ['pills'] })).toBe(true);
    expect(isScreenVisible(spectator, { bandaidHistory: ['pills'] })).toBe(false);
    expect(isScreenVisible(crutch, { bandaidHistory: ['supplements', 'none'] })).toBe(true);
    // Never used → Spectator, not Crutch.
    expect(isScreenVisible(crutch, { bandaidHistory: ['none'] })).toBe(false);
    expect(isScreenVisible(spectator, { bandaidHistory: ['none'] })).toBe(true);
    // Unanswered → still exactly one (Spectator).
    expect(isScreenVisible(crutch, {})).toBe(false);
    expect(isScreenVisible(spectator, {})).toBe(true);
  });

  test('every user sees exactly four reveal cards', () => {
    const visibleCards = (answers: Answers) =>
      buildFlow().filter((s) => s.archetype === 'clinical-card' && isScreenVisible(s, answers));
    expect(visibleCards({ bandaidHistory: ['pills'] }).map((s) => s.id)).toEqual([
      'card-adrenaline-trap',
      'card-novelty-loop',
      'card-dmn',
      'card-bandaids',
    ]);
    expect(visibleCards({ bandaidHistory: ['none'] }).map((s) => s.id)).toEqual([
      'card-adrenaline-trap',
      'card-novelty-loop',
      'card-dmn',
      'card-spectatoring',
    ]);
    // No porn + no substances → still four (the digital-novelty card is always on).
    expect(visibleCards({ contentFrequency: 'rarely' }).length).toBe(4);
  });

  test('includesAny is false for non-array / absent answers', () => {
    expect(evalCondition({ key: 'bandaidHistory', includesAny: ['pills'] }, {})).toBe(false);
    expect(
      evalCondition({ key: 'bandaidHistory', includesAny: ['pills'] }, { bandaidHistory: 'pills' as never }),
    ).toBe(false);
  });
});

describe('partner impact (screen 20) — one question for everyone', () => {
  // Founder ruling 2026-07-10: the single/casual branch is retired; the
  // partnered phrasing runs unconditionally. 2026-07-13: converted to
  // multi-select (the relational and inward facets co-occur) with an inward
  // option added — still one unconditional question for everyone.
  test('is a multi-select for everyone, with no display logic', () => {
    const partner = SCREENS.find((s) => s.id === 'partner-impact')!;
    expect(partner.archetype).toBe('multi-select');
    expect(partner.displayLogic).toBeUndefined();
  });

  test('offers the inward option alongside the outward ones', () => {
    const partner = SCREENS.find((s) => s.id === 'partner-impact')!;
    expect(partner.archetype).toBe('multi-select');
    if (partner.archetype === 'multi-select') {
      expect(partner.options.map((o) => o.value)).toContain('i-get-distant');
    }
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

describe('progress header (section name eyebrow; step/total feed the fill bar only)', () => {
  test('morning arousal is 10 of 24 under a "Your Body" label', () => {
    const meta = progressMeta(flow, at('morning-arousal'));
    expect(meta).toMatchObject({ step: 10, total: 24, sectionLabel: 'Your Body' });
  });

  test('each part carries its section label, never a page count', () => {
    expect(progressMeta(flow, at('relationship'))?.sectionLabel).toBe('Your Situation');
    expect(progressMeta(flow, at('physician-note'))?.sectionLabel).toBe('Your Body');
    expect(progressMeta(flow, at('spillover'))?.sectionLabel).toBe('Your Mind');
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

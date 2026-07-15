// Acceptance (BUILD_PROMPT §8, as amended by the founder rulings of
// 2026-07-10 and 2026-07-14): single flow — the interleaved variant and the
// onboarding A/B test are retired. Symptoms follows the Map (the reveal widens
// into the whole-life cost inventory); FIVE reveal cards are batched after
// Symptoms (3 always-on + a complementary Crutch/Spectator pair — every user
// sees exactly four at runtime); the turn runs recovery → compose-welcome →
// five arc beats (blueprint/foundations retired 2026-07-14, consent moved to
// the post-purchase /consent route); two paywall lead-ins follow the
// building-plan beat — 45 numbered screens.

import { buildFlow } from '../buildFlow';
import { CONSENT_SCREEN, SCREENS } from '../screens';

// Numbered screen order (batched handoff pdf + 2026-07-10 amendments).
const ORDER = [
  'welcome-opening', // 01
  'welcome-roadmap', // 02
  'relationship', // 03
  'reasons', // 04
  'duration', // 05
  'attribution', // 06
  'name', // 07
  'age', // 08
  'bandaid-history', // 09
  'morning-arousal', // 10
  'libido', // 11
  'physician-note', // 12
  'adrenaline-spike', // 13
  'breath-edge', // 14
  'pelvic-check', // 15
  'testimonial-somatic', // 16
  'content-frequency', // 17
  'escalation', // 18
  'spectatoring', // 19
  'partner-impact', // 20
  'aftermath', // 21
  'avoidance', // 22
  'scripts', // 23
  'spillover', // 24
  'generating', // 25
  'map', // 26
  'symptoms', // 27 (moved after the Map, 2026-07-14)
  'card-adrenaline-trap', // 28 (always · enemy)
  'card-novelty-loop', // 29 (always · enemy · "The Dopamine Loop")
  'card-dmn', // 30 (always · you · restored 2026-07-14)
  'card-bandaids', // 31 (4th-card option A: shown after pill/cream/supplement use)
  'card-spectatoring', // 32 (4th-card option B: shown only when no such use — complement of 31)
  'turn-welcome', // 33 ("Recovery is possible" — methods, not Compose)
  'compose-welcome', // 34 (brand moment, inserted 2026-07-14)
  'hopeful-arc', // 35 (five 1–2 sentence beats; blueprint + foundations folded in/retired)
  'diverging-graph', // 36
  'goals', // 37
  'commit', // 38
  'building-plan', // 39
  'plan-promise', // 40 (paywall lead-in, inserted 2026-07-14)
  'your-plan', // 41 (value stack A, inserted 2026-07-15)
  'all-included', // 42 (value stack B, inserted 2026-07-15)
  'invest-yourself', // 43 (paywall lead-in, inserted 2026-07-14)
  'paywall', // 44
  'paywall-dismiss', // 45
  'day-zero', // 46
  'discretion-setup', // 47
];

const numbered = () => buildFlow().filter((s) => s.specId !== null);

describe('buildFlow', () => {
  test('resolves to the amended order, 47 numbered screens', () => {
    const ids = numbered().map((s) => s.id);
    expect(ids).toEqual(ORDER);
    expect(ids).toHaveLength(47);
  });

  test('spec ids match the amended numbering', () => {
    const flow = numbered();
    expect(flow[11]).toMatchObject({ id: 'physician-note', specId: '12' });
    expect(flow[27]).toMatchObject({ id: 'card-adrenaline-trap', specId: '28' });
    expect(flow[43]).toMatchObject({ id: 'paywall', specId: '44' });
  });

  test('section transitions are present but unnumbered', () => {
    const flow = buildFlow();
    const transitions = flow.filter((s) => s.archetype === 'section-transition');
    expect(transitions.map((s) => s.id)).toEqual([
      'transition-part1',
      'transition-part2',
      'transition-part3',
    ]);
    expect(transitions.every((s) => s.specId === null)).toBe(true);
    // Transitions sit directly before relationship / bandaid-history / content-frequency.
    const ids = flow.map((s) => s.id);
    expect(ids[ids.indexOf('transition-part1') + 1]).toBe('relationship');
    expect(ids[ids.indexOf('transition-part2') + 1]).toBe('bandaid-history');
    expect(ids[ids.indexOf('transition-part3') + 1]).toBe('content-frequency');
  });

  test('telemetry consent (§7 exception) is OUT of the flow — it is the post-purchase route', () => {
    // Founder ruling 2026-07-14: consent is asked once after payment (the
    // /consent route between Day Zero and Discreet Mode), never mid-funnel.
    const flow = buildFlow();
    expect(flow.find((s) => s.id === 'telemetry-consent')).toBeUndefined();
    expect(CONSENT_SCREEN).toMatchObject({ id: 'telemetry-consent', archetype: 'consent' });
  });

  test('the five reveal cards are batched directly after Symptoms, in spec order, with no hope-tease lines', () => {
    const flow = numbered();
    const ids = flow.map((s) => s.id);
    expect(ids.slice(ids.indexOf('symptoms') + 1, ids.indexOf('symptoms') + 6)).toEqual([
      'card-adrenaline-trap',
      'card-novelty-loop',
      'card-dmn',
      'card-bandaids',
      'card-spectatoring',
    ]);
    // The batched arc holds tension across the cards and resolves at the
    // turn-welcome pivot — no per-card resolution copy exists in the config.
    const cards = flow.filter((s) => s.archetype === 'clinical-card');
    expect(cards.every((c) => !('tease' in c) && !('resolvedTease' in c))).toBe(true);
    // Spectator is the last card in the static flow (the complementary pair's
    // second half); turn-welcome follows it.
    expect(ids[ids.indexOf('card-spectatoring') + 1]).toBe('turn-welcome');
  });

  test('clinicalIndex follows static encounter order (runtime display recomputes to N OF 4)', () => {
    const seq = numbered()
      .filter((s) => s.archetype === 'clinical-card')
      .map((s) => [s.id, s.clinicalIndex]);
    expect(seq).toEqual([
      ['card-adrenaline-trap', 1],
      ['card-novelty-loop', 2],
      ['card-dmn', 3],
      ['card-bandaids', 4],
      ['card-spectatoring', 5],
    ]);
  });

  test('no purchasable price is hardcoded anywhere in the config', () => {
    const json = JSON.stringify(SCREENS);
    // "$1,800+" is the therapy comparator, not our price. Our own price
    // strings must be {price}/{pricePerDay} tokens resolved from RevenueCat —
    // the RC Experiment ($99.99 vs $79.99 annual) swaps products server-side.
    expect(json).not.toMatch(/\$\s?49\.99|\$\s?59\.99|\$\s?69\.99|\$\s?79\.99|\$\s?99\.99|\$\s?17\.99|\$0\.67/);
    expect(json).toContain('{price}');
    expect(json).toContain('{pricePerDay}');
  });

  test('display logic is declared for the three spec conditions', () => {
    const byId = new Map(SCREENS.map((s) => [s.id, s]));
    expect(byId.get('escalation')?.displayLogic?.skipIf).toEqual({
      key: 'contentFrequency',
      equals: 'rarely',
    });
    // Founder ruling 2026-07-14: triage fires only at the extreme corner.
    expect(byId.get('physician-note')?.displayLogic?.showIf).toEqual({
      all: [
        { key: 'morningArousal', equals: 'rarely' },
        { key: 'libido', lte: 1 },
      ],
    });
    const partner = byId.get('partner-impact');
    expect(partner?.archetype).toBe('multi-select');
  });
});

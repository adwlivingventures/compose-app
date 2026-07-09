// Acceptance (BUILD_PROMPT §8): dev-toggling A/B changes card placement,
// teases, and card button labels — nothing else. Both resolved orders must
// match the specs: 42 numbered screens each, cards inline in A / batched
// after Symptoms in B, tease lines under A only.

import { buildFlow } from '../buildFlow';
import { SCREENS } from '../screens';

// Numbered screen order per COMPOSE_Onboarding_-_Version_B (pdf), B-01 → B-42.
const B_ORDER = [
  'welcome-opening', // B-01
  'welcome-roadmap', // B-02
  'relationship', // B-03
  'reasons', // B-04
  'duration', // B-05
  'attribution', // B-06
  'name', // B-07
  'age', // B-08
  'bandaid-history', // B-09
  'morning-arousal', // B-10
  'libido', // B-11
  'physician-note', // B-12
  'adrenaline-spike', // B-13
  'breath-edge', // B-14
  'pelvic-check', // B-15
  'testimonial-somatic', // B-16
  'content-frequency', // B-17
  'escalation', // B-18
  'spectatoring', // B-19
  'partner-impact', // B-20
  'aftermath', // B-21
  'avoidance', // B-22
  'scripts', // B-23
  'spillover', // B-24
  'generating', // B-25
  'map', // B-26
  'symptoms', // B-27
  'card-adrenaline-trap', // B-28
  'card-dmn', // B-29
  'card-novelty-loop', // B-30
  'card-bandaids', // B-31
  'blueprint', // B-32
  'hopeful-arc', // B-33
  'foundations', // B-34
  'diverging-graph', // B-35
  'goals', // B-36
  'commit', // B-37
  'building-plan', // B-38
  'paywall', // B-39
  'paywall-dismiss', // B-40
  'day-zero', // B-41
  'discretion-setup', // B-42
];

// Numbered screen order per COMPOSE_Onboarding_-_Version_A (docx), A-01 → A-42.
const A_ORDER = [
  'welcome-opening', // A-01
  'welcome-roadmap', // A-02
  'relationship', // A-03
  'reasons', // A-04
  'duration', // A-05
  'attribution', // A-06
  'name', // A-07
  'age', // A-08
  'bandaid-history', // A-09
  'card-bandaids', // A-10 (inline)
  'morning-arousal', // A-11
  'libido', // A-12
  'physician-note', // A-13
  'adrenaline-spike', // A-14
  'breath-edge', // A-15
  'card-adrenaline-trap', // A-16 (inline)
  'pelvic-check', // A-17
  'testimonial-somatic', // A-18
  'content-frequency', // A-19
  'escalation', // A-20
  'card-novelty-loop', // A-21 (inline)
  'spectatoring', // A-22
  'partner-impact', // A-23
  'aftermath', // A-24
  'avoidance', // A-25
  'scripts', // A-26
  'card-dmn', // A-27 (inline)
  'spillover', // A-28
  'generating', // A-29
  'map', // A-30
  'symptoms', // A-31
  'blueprint', // A-32
  'hopeful-arc', // A-33
  'foundations', // A-34
  'diverging-graph', // A-35
  'goals', // A-36
  'commit', // A-37
  'building-plan', // A-38
  'paywall', // A-39
  'paywall-dismiss', // A-40
  'day-zero', // A-41
  'discretion-setup', // A-42
];

const numbered = (variant: 'A' | 'B') =>
  buildFlow(variant).filter((s) => s.specId !== null);

describe('buildFlow', () => {
  test('variant B resolves to the spec order, 42 numbered screens', () => {
    const ids = numbered('B').map((s) => s.id);
    expect(ids).toEqual(B_ORDER);
    expect(ids).toHaveLength(42);
  });

  test('variant A resolves to the spec order, 42 numbered screens', () => {
    const ids = numbered('A').map((s) => s.id);
    expect(ids).toEqual(A_ORDER);
    expect(ids).toHaveLength(42);
  });

  test('spec ids match the specs’ numbering', () => {
    const b = numbered('B');
    expect(b[11]).toMatchObject({ id: 'physician-note', specId: 'B-12' });
    expect(b[38]).toMatchObject({ id: 'paywall', specId: 'B-39' });
    const a = numbered('A');
    expect(a[9]).toMatchObject({ id: 'card-bandaids', specId: 'A-10' });
    expect(a[12]).toMatchObject({ id: 'physician-note', specId: 'A-13' });
  });

  test('section transitions are present but unnumbered, in both variants', () => {
    for (const variant of ['A', 'B'] as const) {
      const flow = buildFlow(variant);
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
    }
  });

  test('telemetry consent (§7 exception) sits after the hopeful arc, unnumbered, in both variants', () => {
    for (const variant of ['A', 'B'] as const) {
      const flow = buildFlow(variant);
      const consent = flow.find((s) => s.id === 'telemetry-consent');
      // Unnumbered like the transitions: a Model V2 insertion that must not
      // renumber the design handoff's 42 screens.
      expect(consent).toMatchObject({ archetype: 'consent', specId: null });
      const ids = flow.map((s) => s.id);
      // After the "Private by architecture" trust proof, before the paywall
      // (acceptance: quiz → composure → consent → paywall).
      expect(ids.indexOf('telemetry-consent')).toBe(ids.indexOf('hopeful-arc') + 1);
      expect(ids.indexOf('telemetry-consent')).toBeGreaterThan(ids.indexOf('map'));
      expect(ids.indexOf('telemetry-consent')).toBeLessThan(ids.indexOf('paywall'));
    }
  });

  test('teases resolve under A only; card buttons resolve per variant', () => {
    const cardsA = numbered('A').filter((s) => s.archetype === 'clinical-card');
    const cardsB = numbered('B').filter((s) => s.archetype === 'clinical-card');
    expect(cardsA.every((c) => typeof c.resolvedTease === 'string' && c.resolvedTease.length > 0)).toBe(true);
    expect(cardsB.every((c) => c.resolvedTease === null)).toBe(true);
    const bandaidsA = cardsA.find((c) => c.id === 'card-bandaids');
    const bandaidsB = cardsB.find((c) => c.id === 'card-bandaids');
    expect(bandaidsA?.resolvedButton).toBe('Show me how');
    expect(bandaidsB?.resolvedButton).toBe('I understand');
  });

  test('clinicalIndex follows each variant’s encounter order (CLINICAL CONTEXT · N OF 4)', () => {
    const seq = (variant: 'A' | 'B') =>
      numbered(variant)
        .filter((s) => s.archetype === 'clinical-card')
        .map((s) => [s.id, s.clinicalIndex]);
    expect(seq('B')).toEqual([
      ['card-adrenaline-trap', 1],
      ['card-dmn', 2],
      ['card-novelty-loop', 3],
      ['card-bandaids', 4],
    ]);
    expect(seq('A')).toEqual([
      ['card-bandaids', 1],
      ['card-adrenaline-trap', 2],
      ['card-novelty-loop', 3],
      ['card-dmn', 4],
    ]);
  });

  test('variants differ ONLY in card placement and card strings', () => {
    const a = numbered('A');
    const b = numbered('B');
    // Same multiset of screens…
    expect([...a.map((s) => s.id)].sort()).toEqual([...b.map((s) => s.id)].sort());
    // …identical relative order once cards are removed…
    const spineA = a.filter((s) => s.archetype !== 'clinical-card').map((s) => s.id);
    const spineB = b.filter((s) => s.archetype !== 'clinical-card').map((s) => s.id);
    expect(spineA).toEqual(spineB);
    // …and identical content on every non-card screen.
    const byId = new Map(b.map((s) => [s.id, s]));
    for (const screen of a) {
      if (screen.archetype === 'clinical-card') continue;
      const { specId: _a, ...restA } = screen;
      const { specId: _b, ...restB } = byId.get(screen.id)!;
      expect(restA).toEqual(restB);
    }
  });

  test('no purchasable price is hardcoded anywhere in the config', () => {
    const json = JSON.stringify(SCREENS);
    // "$1,800+" is the therapy comparator, not our price. Our own price
    // strings must be {price}/{pricePerDay} tokens resolved from RevenueCat —
    // the RC Experiment ($99.99 vs $69.99 annual) swaps products server-side.
    expect(json).not.toMatch(/\$\s?49\.99|\$\s?59\.99|\$\s?69\.99|\$\s?99\.99|\$\s?17\.99|\$0\.67/);
    expect(json).toContain('{price}');
    expect(json).toContain('{pricePerDay}');
  });

  test('display logic is declared for the three spec conditions', () => {
    const byId = new Map(SCREENS.map((s) => [s.id, s]));
    expect(byId.get('escalation')?.displayLogic?.skipIf).toEqual({
      key: 'contentFrequency',
      equals: 'rarely',
    });
    expect(byId.get('physician-note')?.displayLogic?.showIf).toEqual({
      all: [
        { key: 'morningArousal', equals: 'rarely' },
        { key: 'libido', lte: 3 },
      ],
    });
    const partner = byId.get('partner-impact');
    expect(partner?.archetype).toBe('branched-select');
  });
});

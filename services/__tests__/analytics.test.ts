// CLAUDE.md §7 telemetry exception, enforced:
//  - every event and payload field must match the whitelist schema exactly —
//    any string payload outside the closed sets/slug rule is rejected
//  - decline path sends ZERO events (including ones buffered pre-decision)
//  - accept path emits whitelisted events only

jest.mock('../storage', () => {
  const memory = new Map<string, unknown>();
  return {
    LocalStore: {
      getItem: jest.fn(async (key: string) => memory.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: unknown) => {
        memory.set(key, value);
      }),
      __memory: memory,
    },
  };
});

import {
  EVENT_SCHEMA,
  isWhitelisted,
  track,
  flushTelemetry,
  setTelemetryConsent,
  getTelemetryConsent,
  setTelemetrySegment,
  setTelemetryTransport,
  TELEMETRY_SEGMENTS,
  __resetTelemetryForTests,
  type TelemetryEvent,
} from '../analytics';
import { LocalStore } from '../storage';
import { DISTORTION_ORDER } from '../../content/restructure';
import { SEGMENT_SLUGS, deriveSegment } from '../../content/onboarding/segment';

const memory: Map<string, unknown> = (LocalStore as any).__memory;

/** One valid example payload per whitelisted event. */
const VALID_EXAMPLES: Record<string, Record<string, string | number>> = {
  onboarding_started: {},
  onboarding_screen: { screen_id: 'paywall', action: 'advance', elapsed_ms: 4200 },
  composure_measured: { score: 41, day: 0 },
  paywall_viewed: {},
  purchase: { term: 'annual' },
  day_completed: { day: 40 },
  control_score: { value: 4, day: 40 },
  sos_opened: {},
  restructurer_used: { distortion: 'catastrophizing' },
  graduated: {},
  export_used: {},
};

describe('event schema whitelist', () => {
  test('restructurer_used distortion set matches the content taxonomy exactly', () => {
    // A distortion added to content/restructure.ts but not here would make
    // every restructurer_used event for it drop silently; an extra slug here
    // would widen the whitelist past the authored taxonomy. Exact match only.
    const whitelisted = EVENT_SCHEMA.restructurer_used.distortion;
    expect([...(whitelisted as readonly string[])].sort()).toEqual(
      [...DISTORTION_ORDER].sort(),
    );
  });

  test('every declared event accepts its canonical payload', () => {
    for (const event of Object.keys(EVENT_SCHEMA)) {
      expect(VALID_EXAMPLES[event]).toBeDefined(); // examples stay in sync
      expect(isWhitelisted(event, VALID_EXAMPLES[event])).toBe(true);
    }
  });

  test('unknown event ids are rejected', () => {
    expect(isWhitelisted('journal_saved', {})).toBe(false);
    expect(isWhitelisted('', {})).toBe(false);
  });

  test('payload keys outside the schema are rejected', () => {
    expect(isWhitelisted('day_completed', { day: 3, note: 'felt calm today' })).toBe(false);
    expect(isWhitelisted('sos_opened', { reason: 'spike' })).toBe(false);
  });

  test('missing declared fields are rejected', () => {
    expect(isWhitelisted('control_score', { value: 4 })).toBe(false);
    expect(isWhitelisted('purchase', {})).toBe(false);
  });

  test('string values outside the closed sets are rejected (no free text, ever)', () => {
    expect(isWhitelisted('purchase', { term: 'lifetime' })).toBe(false);
    expect(
      isWhitelisted('restructurer_used', { distortion: 'she thinks less of me now' }),
    ).toBe(false);
    expect(isWhitelisted('paywall_viewed', { variant: 'B' })).toBe(false);
    // slug fields reject anything sentence-shaped
    expect(
      isWhitelisted('onboarding_screen', {
        screen_id: 'I was thinking about tonight',
        action: 'advance',
        elapsed_ms: 100,
      }),
    ).toBe(false);
  });

  test('numeric fields reject non-numbers', () => {
    expect(isWhitelisted('day_completed', { day: 'forty' })).toBe(false);
    expect(isWhitelisted('composure_measured', { score: NaN, day: 0 })).toBe(false);
  });
});

describe('presentation segment (founder-approved 2026-07-12)', () => {
  test('segment taxonomy matches the content layer exactly', () => {
    // Same guard as the distortion sync test: a slug added on one side but
    // not the other would silently drop or silently widen. Exact match only.
    expect([...TELEMETRY_SEGMENTS].sort()).toEqual([...SEGMENT_SLUGS].sort());
  });

  test('segment rides only the four lifecycle events', () => {
    const carrying = Object.keys(EVENT_SCHEMA).filter((e) => 'segment' in EVENT_SCHEMA[e]);
    expect(carrying.sort()).toEqual(
      ['composure_measured', 'day_completed', 'graduated', 'purchase'].sort(),
    );
  });

  test('valid segment values are accepted; invalid ones are rejected', () => {
    for (const slug of SEGMENT_SLUGS) {
      expect(isWhitelisted('day_completed', { day: 3, segment: slug })).toBe(true);
    }
    expect(isWhitelisted('day_completed', { day: 3, segment: 'pe-severe' })).toBe(false);
    expect(
      isWhitelisted('graduated', { segment: 'finishes fast when anxious' }),
    ).toBe(false);
  });

  test('segment is optional — an untagged lifecycle event still counts', () => {
    expect(isWhitelisted('day_completed', { day: 3 })).toBe(true);
    expect(isWhitelisted('graduated', {})).toBe(true);
  });

  test('non-lifecycle events reject a segment field', () => {
    expect(isWhitelisted('sos_opened', { segment: 'mixed' })).toBe(false);
    expect(isWhitelisted('onboarding_started', { segment: 'mixed' })).toBe(false);
  });

  test('derivation is deterministic over the presentation axes', () => {
    expect(deriveSegment({ reasons: ['finish-quickly'] })).toBe('pe-dominant');
    expect(deriveSegment({ reasons: ['maintain', 'avoiding'] })).toBe('ed-dominant');
    expect(deriveSegment({ reasons: ['finish-quickly', 'maintain'] })).toBe('mixed');
    expect(deriveSegment({ reasons: ['in-my-head'] })).toBe('anxiety-primary');
    expect(deriveSegment({})).toBe('anxiety-primary');
  });
});

describe('consent gate', () => {
  let sent: TelemetryEvent[][];

  beforeEach(() => {
    __resetTelemetryForTests();
    memory.clear();
    sent = [];
    setTelemetryTransport(async (batch) => {
      sent.push(batch);
    });
  });

  afterEach(() => {
    __resetTelemetryForTests();
  });

  test('decline path sends zero events — including ones buffered before the decision', async () => {
    track('onboarding_started');
    track('composure_measured', { score: 38, day: 0 });
    await getTelemetryConsent(); // settle hydration ('unset' — still buffered)

    await setTelemetryConsent(false);
    track('day_completed', { day: 1 });
    await flushTelemetry();

    expect(sent).toEqual([]);
  });

  test('decline persists across a restart (rehydrated as declined)', async () => {
    await setTelemetryConsent(false);
    __resetTelemetryForTests(); // simulate app relaunch — storage survives

    track('sos_opened');
    await getTelemetryConsent();
    await flushTelemetry();

    expect(await getTelemetryConsent()).toBe('declined');
    expect(sent).toEqual([]);
  });

  test('accept path flushes the pre-consent buffer and emits whitelisted events only', async () => {
    track('onboarding_started');
    await getTelemetryConsent(); // settle hydration

    await setTelemetryConsent(true);
    track('paywall_viewed');
    // Non-whitelisted attempts are dropped, not sent:
    track('paywall_viewed' as any, { userText: 'my goal is calm' });
    track('journal_saved' as any, {});
    await flushTelemetry();

    const events = sent.flat().map((e) => e.event);
    expect(events).toEqual(['onboarding_started', 'paywall_viewed']);
    // No payload field anywhere outside the schema:
    for (const e of sent.flat()) {
      const allowed = new Set([...Object.keys(EVENT_SCHEMA[e.event]), 'event', 'ts']);
      for (const key of Object.keys(e)) expect(allowed.has(key)).toBe(true);
    }
  });

  test('lifecycle events auto-carry the segment once set; other events never do', async () => {
    await setTelemetryConsent(true);
    setTelemetrySegment('pe-dominant');
    track('day_completed', { day: 12 });
    track('sos_opened');
    await flushTelemetry();

    const byName = Object.fromEntries(sent.flat().map((e) => [e.event, e]));
    expect(byName.day_completed.segment).toBe('pe-dominant');
    expect('segment' in byName.sos_opened).toBe(false);
  });

  test('a segment persisted by onboarding is rehydrated after relaunch', async () => {
    await setTelemetryConsent(true);
    memory.set('@presentation_segment', 'mixed');
    __resetTelemetryForTests(); // simulate app relaunch — storage survives

    await getTelemetryConsent(); // settle hydration (as a real launch would)
    track('day_completed', { day: 30 });
    await flushTelemetry();

    const event = sent.flat().find((e) => e.event === 'day_completed');
    expect(event?.segment).toBe('mixed');
  });

  test('an invalid stored segment is ignored, never sent', async () => {
    await setTelemetryConsent(true);
    setTelemetrySegment('pe-severe-detailed-profile');
    track('day_completed', { day: 5 });
    await flushTelemetry();

    const event = sent.flat().find((e) => e.event === 'day_completed');
    expect(event).toBeDefined();
    expect('segment' in event!).toBe(false);
  });

  test('transport failure requeues silently — nothing throws, nothing is lost', async () => {
    await setTelemetryConsent(true);
    setTelemetryTransport(async () => {
      throw new Error('offline');
    });
    track('day_completed', { day: 2 });
    await expect(flushTelemetry()).resolves.toBeUndefined();

    setTelemetryTransport(async (batch) => {
      sent.push(batch);
    });
    await flushTelemetry();
    expect(sent.flat().map((e) => e.event)).toEqual(['day_completed']);
  });
});

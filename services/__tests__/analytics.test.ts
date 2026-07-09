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
  setTelemetryTransport,
  __resetTelemetryForTests,
  type TelemetryEvent,
} from '../analytics';
import { LocalStore } from '../storage';

const memory: Map<string, unknown> = (LocalStore as any).__memory;

/** One valid example payload per whitelisted event. */
const VALID_EXAMPLES: Record<string, Record<string, string | number>> = {
  onboarding_started: {},
  onboarding_screen: { screen_id: 'paywall', variant: 'A', action: 'advance', elapsed_ms: 4200 },
  composure_measured: { score: 41, day: 0 },
  paywall_viewed: { variant: 'B' },
  purchase: { term: 'annual' },
  day_completed: { day: 40 },
  control_score: { value: 4, day: 40 },
  sos_opened: {},
  restructurer_used: { distortion: 'catastrophizing' },
  graduated: {},
  export_used: {},
};

describe('event schema whitelist', () => {
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
    expect(isWhitelisted('paywall_viewed', { variant: 'C' })).toBe(false);
    // slug fields reject anything sentence-shaped
    expect(
      isWhitelisted('onboarding_screen', {
        screen_id: 'I was thinking about tonight',
        variant: 'A',
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
    track('paywall_viewed', { variant: 'A' });
    // Non-whitelisted attempts are dropped, not sent:
    track('paywall_viewed' as any, { variant: 'A', userText: 'my goal is calm' });
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

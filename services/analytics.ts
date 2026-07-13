// Anonymous cohort telemetry — the single deliberate exception to
// local-only privacy (CLAUDE.md §7, founder ruling 2026-07-08).
//
// HARD RULES, enforced by a schema whitelist and by tests that grep this
// file: events are milestone COUNTS only. No identity, no free text, no
// journal or restructurer content, ever. Consent is asked once, plainly,
// during onboarding; declining leaves the app fully functional and sends
// exactly zero events. Purpose: aggregate cohort retention and outcome
// curves — the acquisition-diligence asset that cannot be reconstructed
// retroactively.
//
// Delivery is fire-and-forget and batched, with silent failure offline.
// No provider SDK ships yet BY DESIGN — the transport below is the swap
// point; the whitelist and consent gate do not change when one is adopted.

import { LocalStore } from './storage';

// ─── Consent ────────────────────────────────────────────────────────────────

export type TelemetryConsent = 'granted' | 'declined' | 'unset';

const CONSENT_KEY = '@telemetry_consent';
// Written by content/onboarding/segment.ts (the derivation side); read here
// so a relaunch re-attaches the tag without the content layer's involvement.
const SEGMENT_KEY = '@presentation_segment';

/** The hydrated segment slug, or null before onboarding derives one. */
let segment: TelemetrySegment | null = null;

/** Content layer hands the derived slug over; invalid input is dropped —
 *  this module trusts the closed list, not the caller. */
export function setTelemetrySegment(slug: string): void {
  if ((SEGMENTS as readonly string[]).includes(slug)) {
    segment = slug as TelemetrySegment;
  }
}

// ─── Event whitelist ────────────────────────────────────────────────────────
// A field is either 'int' (finite number, rounded), 'slug' (a short
// kebab-case identifier — screen ids only, never sentences), or a closed
// list of allowed string values. Anything else is rejected: an event that
// COULD carry written content is a spec violation (§7).

const TERMS = ['annual', 'monthly'] as const;
// Coarse presentation segment (founder-approved 2026-07-12) — exactly one
// field, exactly four broad values; anything finer is a re-identification
// surface. The derivation lives in content/onboarding/segment.ts (this
// module never sees the inputs); a sync test keeps the two lists in
// lockstep. Lifecycle events self-carry the tag because signals have no
// per-user join key — segment-cut retention curves need it on every event.
const SEGMENTS = ['pe-dominant', 'ed-dominant', 'mixed', 'anxiety-primary'] as const;
export type TelemetrySegment = (typeof SEGMENTS)[number];
export const TELEMETRY_SEGMENTS: readonly string[] = SEGMENTS;
// Mirrors the Distortion union in content/restructure.ts (superset of the
// Fallacy union in hooks/useDefusionLog.ts) — the tag, never the text.
const DISTORTIONS = [
  'mind_reading',
  'catastrophizing',
  'all_or_nothing',
  'fortune_telling',
  'overgeneralization',
  'spectatoring',
] as const;
const SCREEN_ACTIONS = [
  'advance',
  'back',
  'skip',
  'dismiss-shown',
  'dismiss-keep-going',
  'dismiss-exit',
  'purchase-attempt',
  'purchase-success',
  'restore',
] as const;

export type ScreenAction = (typeof SCREEN_ACTIONS)[number];

type FieldSpec =
  | 'int'
  | 'slug'
  | readonly string[]
  | { oneOf: readonly string[]; optional: true };

// The segment rides only on the four lifecycle events that draw the cohort
// curves. Optional by design: an event that fires before the slug hydrates
// (or on a pre-segment install) still counts — it just lands untagged.
const SEGMENT_FIELD: FieldSpec = { oneOf: SEGMENTS, optional: true };

export const EVENT_SCHEMA: Record<string, Record<string, FieldSpec>> = {
  onboarding_started: {},
  onboarding_screen: {
    screen_id: 'slug',
    action: SCREEN_ACTIONS,
    elapsed_ms: 'int',
  },
  composure_measured: { score: 'int', day: 'int', segment: SEGMENT_FIELD },
  paywall_viewed: {},
  purchase: { term: TERMS, segment: SEGMENT_FIELD },
  day_completed: { day: 'int', segment: SEGMENT_FIELD },
  control_score: { value: 'int', day: 'int' },
  sos_opened: {},
  restructurer_used: { distortion: DISTORTIONS },
  graduated: { segment: SEGMENT_FIELD },
  export_used: {},
};

export type EventName = keyof typeof EVENT_SCHEMA;

export interface TelemetryEvent {
  event: string;
  /** Client timestamp (ms). Anonymous — batches carry no ids of any kind. */
  ts: number;
  [field: string]: string | number;
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

// TS can't narrow readonly arrays through Array.isArray — explicit guard.
function isOptionalSpec(
  spec: FieldSpec,
): spec is { oneOf: readonly string[]; optional: true } {
  return typeof spec === 'object' && !Array.isArray(spec);
}

/** Exact-shape check: every required field present and valid, no extras;
 *  optional fields, when present, must match their closed list. */
export function isWhitelisted(
  event: string,
  payload: Record<string, unknown>,
): boolean {
  const schema = EVENT_SCHEMA[event];
  if (!schema) return false;
  const schemaKeys = Object.keys(schema);
  for (const key of Object.keys(payload)) {
    if (!schemaKeys.includes(key)) return false;
  }
  for (const key of schemaKeys) {
    const spec = schema[key];
    const value = payload[key];
    if (isOptionalSpec(spec)) {
      if (value === undefined) continue; // optional field absent — fine
      if (typeof value !== 'string' || !spec.oneOf.includes(value)) return false;
    } else if (value === undefined) {
      return false; // required field missing
    } else if (spec === 'int') {
      if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    } else if (spec === 'slug') {
      if (typeof value !== 'string' || !SLUG_PATTERN.test(value)) return false;
    } else {
      if (typeof value !== 'string' || !spec.includes(value)) return false;
    }
  }
  return true;
}

// ─── Transport (swap point) ─────────────────────────────────────────────────

export type TelemetryTransport = (batch: TelemetryEvent[]) => Promise<void>;

// TelemetryDeck (founder pick, 2026-07-09) — privacy-first signal counting.
// The app ID is public by design (it only ADDRESSES signals; it can't read
// them back). clientUser is a CONSTANT for every install: we count events,
// not people — the privacy policy promises "never an account or device
// identifier," so no per-install id ever ships. Retention curves come from
// the day-numbered events themselves (day_completed {day}), not from user
// linkage. isTestMode keeps dev/sandbox signals out of the launch dataset.
const TELEMETRYDECK_APP_ID = 'D8612264-041A-4426-8D3F-EECBAE5C51B8';
const TELEMETRYDECK_URL = 'https://nom.telemetrydeck.com/v2/';

const telemetryDeckTransport: TelemetryTransport = async (batch) => {
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[telemetry] batch ×${batch.length}`, batch.map((e) => e.event).join(', '));
  }
  const signals = batch.map(({ event, ts, ...fields }) => ({
    appID: TELEMETRYDECK_APP_ID,
    clientUser: 'anonymous',
    type: event,
    isTestMode: isDev,
    payload: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, String(value)]),
    ),
  }));
  const response = await fetch(TELEMETRYDECK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signals),
  });
  // Non-2xx throws so the queue requeues silently (offline-safe by contract).
  if (!response.ok) throw new Error(`telemetry endpoint ${response.status}`);
};

let transport: TelemetryTransport = telemetryDeckTransport;

export function setTelemetryTransport(next: TelemetryTransport): void {
  transport = next;
}

// ─── Queue + consent gate ───────────────────────────────────────────────────

const FLUSH_AFTER_MS = 10_000;
const FLUSH_AT_SIZE = 20;
const PENDING_CAP = 100;

let consent: TelemetryConsent | null = null; // null = not hydrated yet
let hydrating: Promise<void> | null = null;
/** Events recorded before the consent decision is known. Flushed on grant, discarded on decline. */
let pending: TelemetryEvent[] = [];
let queue: TelemetryEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function hydrateConsent(): Promise<void> {
  if (!hydrating) {
    hydrating = Promise.all([
      LocalStore.getItem<TelemetryConsent>(CONSENT_KEY),
      LocalStore.getItem<string>(SEGMENT_KEY),
    ]).then(([stored, storedSegment]) => {
      // A decision made in a previous session wins; otherwise stay unset and
      // keep buffering until the onboarding consent step resolves it.
      if (consent === null) consent = stored ?? 'unset';
      if (segment === null && typeof storedSegment === 'string') {
        setTelemetrySegment(storedSegment);
      }
      if (consent === 'granted') {
        queue.push(...pending);
        pending = [];
        scheduleFlush();
      } else if (consent === 'declined') {
        pending = [];
      }
    });
  }
  return hydrating;
}

function scheduleFlush(): void {
  if (queue.length >= FLUSH_AT_SIZE) {
    void flushTelemetry();
    return;
  }
  if (flushTimer === null && queue.length > 0) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flushTelemetry();
    }, FLUSH_AFTER_MS);
  }
}

/** Send everything queued. Silent on failure — events requeue for the next attempt. */
export async function flushTelemetry(): Promise<void> {
  if (consent !== 'granted' || queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    await transport(batch);
  } catch {
    // Offline or endpoint down: quiet requeue, capped so an extended outage
    // never grows unbounded memory.
    queue = [...batch, ...queue].slice(0, 200);
  }
}

/**
 * Record a milestone. Fire-and-forget: never awaited by UI code, never
 * throws, never surfaces an error. Anything outside the whitelist is
 * dropped (and loudly flagged in dev — a dropped event is a coding error).
 */
export function track(
  event: EventName,
  payload: Record<string, string | number> = {},
): void {
  if (consent === 'declined') return;
  // Lifecycle events self-carry the segment tag when it's known. Callsites
  // never pass it — one attach point means one place the closed list is
  // enforced, and an event that fires before hydration simply goes untagged.
  if (segment !== null && 'segment' in (EVENT_SCHEMA[event] ?? {}) && payload.segment === undefined) {
    payload = { ...payload, segment };
  }
  if (!isWhitelisted(event, payload)) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[telemetry] dropped non-whitelisted event: ${String(event)}`);
    }
    return;
  }
  const record: TelemetryEvent = { ...payload, event, ts: Date.now() };
  // Ints arrive rounded — fractional values carry no extra meaning here.
  for (const key of Object.keys(EVENT_SCHEMA[event])) {
    if (EVENT_SCHEMA[event][key] === 'int') {
      record[key] = Math.round(record[key] as number);
    }
  }
  if (consent === 'granted') {
    queue.push(record);
    scheduleFlush();
    return;
  }
  // Consent unknown (pre-decision or not hydrated): hold locally.
  if (pending.length < PENDING_CAP) pending.push(record);
  void hydrateConsent();
}

/** The onboarding consent step resolves here. Decline = drop everything, forever zero events. */
export async function setTelemetryConsent(granted: boolean): Promise<void> {
  consent = granted ? 'granted' : 'declined';
  await LocalStore.setItem(CONSENT_KEY, consent);
  if (granted) {
    queue.push(...pending);
    pending = [];
    scheduleFlush();
  } else {
    pending = [];
    queue = [];
  }
}

export async function getTelemetryConsent(): Promise<TelemetryConsent> {
  await hydrateConsent();
  return consent ?? 'unset';
}

/** Test seam — clears module state between test cases. */
export function __resetTelemetryForTests(): void {
  consent = null;
  hydrating = null;
  segment = null;
  pending = [];
  queue = [];
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

// ─── Onboarding screen events (compat wrapper) ─────────────────────────────
// One anonymous event per screen leave: screen id, elapsed time, action
// taken — NEVER what was chosen or typed (§7).

export function trackScreen(
  screen_id: string,
  elapsed_ms: number,
  action: ScreenAction,
): void {
  track('onboarding_screen', {
    screen_id,
    action,
    elapsed_ms: Math.max(0, Math.round(elapsed_ms)),
  });
}

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
import type { Variant } from '../content/onboarding/types';

// ─── Consent ────────────────────────────────────────────────────────────────

export type TelemetryConsent = 'granted' | 'declined' | 'unset';

const CONSENT_KEY = '@telemetry_consent';

// ─── Event whitelist ────────────────────────────────────────────────────────
// A field is either 'int' (finite number, rounded), 'slug' (a short
// kebab-case identifier — screen ids only, never sentences), or a closed
// list of allowed string values. Anything else is rejected: an event that
// COULD carry written content is a spec violation (§7).

const VARIANTS = ['A', 'B'] as const;
const TERMS = ['annual', 'monthly'] as const;
// Mirrors the Fallacy union in hooks/useDefusionLog.ts — the tag, never the text.
const DISTORTIONS = ['mind_reading', 'catastrophizing', 'all_or_nothing'] as const;
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

type FieldSpec = 'int' | 'slug' | readonly string[];

export const EVENT_SCHEMA: Record<string, Record<string, FieldSpec>> = {
  onboarding_started: {},
  onboarding_screen: {
    screen_id: 'slug',
    variant: VARIANTS,
    action: SCREEN_ACTIONS,
    elapsed_ms: 'int',
  },
  composure_measured: { score: 'int', day: 'int' },
  paywall_viewed: { variant: VARIANTS },
  purchase: { term: TERMS },
  day_completed: { day: 'int' },
  control_score: { value: 'int', day: 'int' },
  sos_opened: {},
  restructurer_used: { distortion: DISTORTIONS },
  graduated: {},
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

/** Exact-shape check: every declared field present and valid, no extras. */
export function isWhitelisted(
  event: string,
  payload: Record<string, unknown>,
): boolean {
  const schema = EVENT_SCHEMA[event];
  if (!schema) return false;
  const schemaKeys = Object.keys(schema);
  const payloadKeys = Object.keys(payload);
  if (payloadKeys.length !== schemaKeys.length) return false;
  for (const key of schemaKeys) {
    const spec = schema[key];
    const value = payload[key];
    if (spec === 'int') {
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

const devTransport: TelemetryTransport = async (batch) => {
  // eslint-disable-next-line no-console
  console.log(`[telemetry] batch ×${batch.length}`, batch.map((e) => e.event).join(', '));
};

// Release default: void until a provider endpoint exists. Swapping this for
// a real transport changes delivery only — never what may be collected.
const voidTransport: TelemetryTransport = async () => {};

let transport: TelemetryTransport =
  typeof __DEV__ !== 'undefined' && __DEV__ ? devTransport : voidTransport;

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
    hydrating = LocalStore.getItem<TelemetryConsent>(CONSENT_KEY).then((stored) => {
      // A decision made in a previous session wins; otherwise stay unset and
      // keep buffering until the onboarding consent step resolves it.
      if (consent === null) consent = stored ?? 'unset';
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
  pending = [];
  queue = [];
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

// ─── Onboarding screen events (compat wrapper) ─────────────────────────────
// One anonymous event per screen leave: screen id, variant, elapsed time,
// action taken — NEVER what was chosen or typed (§7).

export function trackScreen(
  screen_id: string,
  variant: Variant,
  elapsed_ms: number,
  action: ScreenAction,
): void {
  track('onboarding_screen', {
    screen_id,
    variant,
    action,
    elapsed_ms: Math.max(0, Math.round(elapsed_ms)),
  });
}

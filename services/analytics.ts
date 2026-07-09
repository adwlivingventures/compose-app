// Onboarding analytics — thin abstraction, one anonymous event per screen
// (BUILD_PROMPT §4.3). No SDK exists in this repo yet, BY DESIGN: events go
// to a local sink (console in dev, void in release) until the founder picks
// a provider. Swap the sink; nothing else changes.
//
// PRIVACY (CLAUDE.md §7 — non-negotiable, enforced by a test that greps this
// file): event payloads carry screen id, variant, elapsed time, and the
// action taken — NEVER what was answered, never free text, never the user's
// identity fields. Answers persist to AsyncStorage/expo-secure-store only.

import type { Variant } from '../content/onboarding/types';

export type ScreenAction =
  | 'advance'
  | 'back'
  | 'skip'
  | 'dismiss-shown'
  | 'dismiss-keep-going'
  | 'dismiss-exit'
  | 'purchase-attempt'
  | 'purchase-success'
  | 'restore';

export interface ScreenEvent {
  type: 'onboarding_screen';
  screen_id: string;
  variant: Variant;
  elapsed_ms: number;
  action: ScreenAction;
}

export interface AnalyticsSink {
  track(event: ScreenEvent): void;
}

const voidSink: AnalyticsSink = { track: () => {} };

const devSink: AnalyticsSink = {
  track: (event) => {
    // eslint-disable-next-line no-console
    console.log(
      `[analytics] ${event.screen_id} · ${event.variant} · ${event.action} · ${event.elapsed_ms}ms`,
    );
  },
};

let sink: AnalyticsSink = __DEV__ ? devSink : voidSink;

/** Provider swap point — call once at startup when an SDK is adopted. */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function trackScreen(
  screen_id: string,
  variant: Variant,
  elapsed_ms: number,
  action: ScreenAction,
): void {
  sink.track({
    type: 'onboarding_screen',
    screen_id,
    variant,
    elapsed_ms: Math.max(0, Math.round(elapsed_ms)),
    action,
  });
}

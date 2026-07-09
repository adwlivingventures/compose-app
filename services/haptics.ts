// The haptic vocabulary — Craft Layer Addendum §4. EXACTLY three patterns
// exist; there is deliberately no warn/error pattern and none may ever be
// added: this app never buzzes at the user (a buzz is sympathetic
// activation — the opposite of the mechanism).
//
// Guarded require: expo-haptics is a native module; on builds that predate
// it every pattern is a silent no-op.

let Haptics: typeof import('expo-haptics') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

/** ACKNOWLEDGE — single light tap: selection made, checklist tick. */
export function acknowledge(): void {
  Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/**
 * BREATHE — the swell-and-release synced to inhale/exhale (Ember, SOS, the
 * pelvic ring). expo-haptics exposes discrete impacts only, so the swell is
 * approximated as a soft onset tap; a true continuous Core Haptics swell is
 * a post-launch native refinement, and an approximated *rhythm* of taps is
 * worse than one clean cue (rhythmic buzzing reads as notification — the
 * anti-goal).
 */
export function breatheOnset(): void {
  Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** BREATHE's release half — the clean let-go cue (pelvic ring RELEASE). */
export function breatheRelease(): void {
  Haptics?.selectionAsync().catch(() => {});
}

/** SEAL — one medium, slightly long pulse: signature, purchase, phase completion. */
export function seal(): void {
  if (!Haptics) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  // The "slightly long" tail: a soft echo 90ms behind the strike.
  setTimeout(() => {
    Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, 90);
}

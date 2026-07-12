// Composure re-measurement content — deterministic, authored, versioned (§7).
//
// The measurement itself is the onboarding composure module re-run: the same
// eleven scored questions, the same computeComposure weights, so every
// re-measurement is comparable point-for-point with the Day-0 baseline.
// That comparability IS the product claim — "measured, not promised" only
// holds if the instrument never changes between readings.
//
// Register discipline (canon §7): Day 14 speaks capability, Day 40 evidence,
// Day 75 identity. Flat/dip readings are normalized, never graded — the
// score measures the conditioned loop, not the man (votes, not verdicts).

import { SCREENS } from './onboarding/screens';
import type { Screen } from './onboarding/types';

/**
 * Onboarding screen ids for every answer key that feeds COMPOSURE_WEIGHTS,
 * in onboarding order (body → mind). `escalation` keeps its skipIf logic:
 * a man who rarely uses visual content is never asked about tolerance drift.
 */
const SCORED_QUESTION_IDS = [
  'morning-arousal',
  'adrenaline-spike',
  'breath-edge',
  'pelvic-check',
  'content-frequency',
  'escalation',
  'spectatoring',
  'aftermath',
  'avoidance',
  'scripts',
  'spillover',
] as const;

export const REMEASURE_SCREENS: Screen[] = SCORED_QUESTION_IDS.map((id) => {
  const screen = SCREENS.find((s) => s.id === id);
  // Loud failure at module load: renaming an onboarding screen must break
  // the re-measurement build, not silently shrink the instrument.
  if (!screen) throw new Error(`Re-measurement question missing from onboarding config: ${id}`);
  return screen;
});

export interface RemeasureCopy {
  eyebrow: string;
  headline: string;
  body: string;
  button: string;
  /** Resolved against the delta vs baseline; {baseline} and {score} tokens. */
  result: { improved: string; steady: string; dip: string };
}

const COPY: Record<14 | 40 | 75, RemeasureCopy> = {
  14: {
    eyebrow: 'DAY 14 · RE-MEASUREMENT',
    headline: 'Two weeks in. Measure it.',
    body:
      'This is the stretch where the work runs quietest — the nervous system recalibrates below the level of feeling, so the days can read as still. Compose doesn’t ask you to take that on faith. Same questions as Day 0, scored the same way. Answer for the last two weeks, not for your best day.',
    button: 'Begin the measurement',
    result: {
      improved:
        'Your composure score moved from {baseline} to {score} in fourteen days. That’s not a promise or a pep talk — it’s your own answers, measured against your own answers. The loop is loosening before it feels like it.',
      steady:
        'From {baseline} to {score} — close to where you started, and at fourteen days that is a normal reading. Automaticity builds on a sixty-six-day curve, and the early climb happens under the surface. Every session you’ve completed is already counted.',
      dip:
        'From {baseline} to {score}. Scores breathe — a hard week, short sleep, and load all lean on them. This number reads the conditioned loop on one day; it is not a verdict on you. The sessions are the votes, and yours are on the record.',
    },
  },
  40: {
    eyebrow: 'DAY 40 · RE-MEASUREMENT',
    headline: 'Past the midpoint. Measure again.',
    body:
      'Forty days of daily down-regulation is real training load. Time to put a number against the baseline — same questions, same scale, your last few weeks as the answer.',
    button: 'Begin the measurement',
    result: {
      improved:
        'From {baseline} at Day 0 to {score} now. That distance is conditioning, not luck — an autonomic pattern retrained one session at a time.',
      steady:
        'From {baseline} to {score}. A steady reading at Day 40 usually means the loudest symptoms settled first while the deeper pattern is still consolidating. The back half of the protocol is built for exactly that.',
      dip:
        'From {baseline} to {score}. One reading taken under load doesn’t undo forty days of training. The loop gets measured; you don’t. Keep the cadence.',
    },
  },
  75: {
    eyebrow: 'DAY 75 · FINAL MEASUREMENT',
    headline: 'Seventy-five days. Measure it start to finish.',
    body:
      'You measured this on Day 0, before any of the work. Measure it once more with the full protocol behind you — same questions, same scale. Nothing about the instrument moved. You did.',
    button: 'Begin the measurement',
    result: {
      improved:
        'Day 0: {baseline}. Day 75: {score}. The distance between those numbers is seventy-five days of deliberate training — measured at the start, measured at the end, promised at no point in between.',
      steady:
        'Day 0: {baseline}. Day 75: {score}. Numbers plateau; training doesn’t vanish. What you built shows up in the room before it shows up on a scale — and the maintenance cadence ahead keeps building it.',
      dip:
        'Day 0: {baseline}. Day 75: {score}. A single reading can sit under a hard season. Seventy-five days of practice lives in the body regardless — the score reads the loop’s weather, never the man.',
    },
  },
};

/** Milestone copy, tolerant of off-schedule days (quarterly Act III reuse). */
export function getRemeasureCopy(day: number): RemeasureCopy {
  if (day <= 14) return COPY[14];
  if (day <= 40) return COPY[40];
  return COPY[75];
}

/** Shown when no Day-0 baseline exists (defensive; onboarding records one). */
export const NO_BASELINE_RESULT =
  'Your composure score today: {score}. It’s recorded — every future measurement now has a fixed point to stand against.';

/** Constant footer under every result: the votes-not-verdicts + privacy frame. */
export const RESULT_FOOTER =
  'The score measures the conditioned loop — never you. Trained calm sits at 80–100, and everything here stays on this device.';

/**
 * Resolve which result line a reading earns. ±1 point is inside the
 * instrument's noise floor, so it reads as steady rather than implying
 * movement either way.
 */
export function resolveResultCopy(
  copy: RemeasureCopy,
  score: number,
  baseline: number | null,
): string {
  if (baseline === null) return NO_BASELINE_RESULT.replace('{score}', String(score));
  const delta = score - baseline;
  const line =
    delta >= 2 ? copy.result.improved : delta <= -2 ? copy.result.dip : copy.result.steady;
  return line.replace('{baseline}', String(baseline)).replace('{score}', String(score));
}

// Composure measurement history — the spine of "measured, not promised"
// (CLAUDE.md §2; canon §8). Day 0 is the onboarding baseline; Days 14, 40,
// and 75 are the scheduled re-measurements. Local-only (§7): the history
// never leaves the device. The whitelisted `composure_measured` telemetry
// event is emitted by the flows that take a measurement, not by this module.

import { LocalStore } from './storage';

export interface ComposureMeasurement {
  /** Protocol day the measurement belongs to; 0 = onboarding baseline. */
  day: number;
  score: number;
  /** ISO timestamp, for local display only — never telemetered. */
  measuredAt: string;
}

const HISTORY_KEY = '@composure_history';

/**
 * Scheduled re-measurement days. Day 14 sits on the "nothing's happening"
 * doubt window (canon §8) — evidence is manufactured exactly where churn
 * concentrates. Day 40 is the mid-protocol read; Day 75 closes the arc.
 */
export const COMPOSURE_MILESTONES: readonly number[] = [14, 40, 75];

export async function getComposureHistory(): Promise<ComposureMeasurement[]> {
  const saved = await LocalStore.getItem<ComposureMeasurement[]>(HISTORY_KEY);
  if (!Array.isArray(saved)) return [];
  return [...saved].sort((a, b) => a.day - b.day);
}

/**
 * Record a measurement. One entry per protocol day: re-running a measurement
 * replaces that day's entry rather than stacking duplicates, so an
 * interrupted or repeated flow stays idempotent.
 */
export async function recordComposure(
  day: number,
  score: number,
): Promise<ComposureMeasurement[]> {
  const history = await getComposureHistory();
  const next = [
    ...history.filter((m) => m.day !== day),
    { day, score: Math.round(score), measuredAt: new Date().toISOString() },
  ].sort((a, b) => a.day - b.day);
  await LocalStore.setItem(HISTORY_KEY, next);
  return next;
}

/** The Day-0 onboarding baseline, if one was recorded. */
export function getBaseline(history: ComposureMeasurement[]): ComposureMeasurement | null {
  return history.find((m) => m.day === 0) ?? null;
}

/**
 * The re-measurement currently owed, or null. Only the LATEST reached
 * milestone is offered: a Day-14 measurement taken on Day 45 would be stale
 * evidence, so an overshot milestone quietly lapses instead of queueing.
 * No backlog, no owed-work guilt — votes, not verdicts.
 */
export function getDueMilestone(
  activeDay: number,
  history: ComposureMeasurement[],
): number | null {
  const latestReached = [...COMPOSURE_MILESTONES].reverse().find((m) => activeDay >= m);
  if (latestReached === undefined) return null;
  return history.some((m) => m.day === latestReached) ? null : latestReached;
}

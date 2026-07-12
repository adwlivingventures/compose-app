import { LocalStore } from './storage';

/**
 * Composure measurement history — local-only (§7). The onboarding diagnostic
 * writes the baseline (day 0); Day-14/40/75 re-measurements append.
 *
 * Why this exists: the Composure Score is the product's "measured, not
 * promised" risk-reversal artifact and the raw material of the month-11
 * renewal-evidence screen — yet until 2026-07-12 it was computed, shown
 * once, telemetered, and never persisted. The Baseline tab now reads from
 * this record.
 */

export interface ComposureMeasurement {
  /** Protocol day of measurement: 0 = onboarding baseline. */
  day: number;
  score: number;
  /** ISO timestamp. */
  date: string;
}

const KEY = '@composure_history';

export async function getComposureHistory(): Promise<ComposureMeasurement[]> {
  return (await LocalStore.getItem<ComposureMeasurement[]>(KEY)) ?? [];
}

export async function recordComposure(day: number, score: number): Promise<void> {
  const history = await getComposureHistory();
  // One measurement per protocol day — a re-run replaces, never duplicates.
  const filtered = history.filter((m) => m.day !== day);
  filtered.push({ day, score, date: new Date().toISOString() });
  filtered.sort((a, b) => a.day - b.day);
  await LocalStore.setItem(KEY, filtered);
}

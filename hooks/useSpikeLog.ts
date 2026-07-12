import { useCallback, useEffect, useState } from 'react';
import { LocalStore } from '../services/storage';
import type { Distortion } from '../content/restructure';

/**
 * Spike log — entries from the Rewire tab's tag-first restructure flow
 * (founder review 2026-07-12). Local-only (§7): entries never leave the
 * device; the optional note is free text and therefore never telemetered —
 * only the distortion TAG rides the whitelisted `restructurer_used` event.
 *
 * Kept separate from @defusion_log_entries (Triage Center) because the
 * shapes differ, but the Evidence Locker merges both into one history and
 * one distortion-frequency count — the user experiences a single record.
 */

export interface SpikeEntry {
  id: string;
  /** ISO timestamp — local record only. */
  date: string;
  distortion: Distortion;
  /** Optional one-line capture, written AFTER down-regulation. */
  note?: string;
}

const STORAGE_KEY = '@spike_log_entries';

export function useSpikeLog() {
  const [entries, setEntries] = useState<SpikeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await LocalStore.getItem<SpikeEntry[]>(STORAGE_KEY);
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addEntry = useCallback(
    async (entry: Omit<SpikeEntry, 'id' | 'date'>): Promise<SpikeEntry> => {
      const full: SpikeEntry = {
        ...entry,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      setEntries((prev) => {
        const updated = [full, ...prev];
        LocalStore.setItem(STORAGE_KEY, updated);
        return updated;
      });
      return full;
    },
    [],
  );

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      LocalStore.setItem(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  return { entries, loading, addEntry, deleteEntry, reload };
}

/** Whole days since the most recent timestamp across spike/defusion entries. */
export function daysSince(isoDates: string[]): number | null {
  if (isoDates.length === 0) return null;
  const latest = Math.max(...isoDates.map((d) => new Date(d).getTime()));
  return Math.floor((Date.now() - latest) / 86_400_000);
}

/** Spike counts bucketed by trailing week (index 0 = oldest shown week). */
export function weeklyCounts(isoDates: string[], weeks = 5): number[] {
  const now = Date.now();
  const buckets = new Array(weeks).fill(0);
  for (const d of isoDates) {
    const age = now - new Date(d).getTime();
    const weekIdx = Math.floor(age / (7 * 86_400_000));
    if (weekIdx < weeks) buckets[weeks - 1 - weekIdx] += 1;
  }
  return buckets;
}

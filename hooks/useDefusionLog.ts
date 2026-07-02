import { useCallback, useEffect, useState } from 'react';
import { LocalStore } from '../services/storage';

/**
 * Spectator Disassembly log — local-only persistence (CLAUDE.md §7).
 *
 * Entries never leave the device. Stored via AsyncStorage (LocalStore) rather
 * than SecureStore: keychain items have small per-item size limits and this
 * log grows unbounded; the threat model here is network exfiltration (none —
 * no sync) and shoulder-surfing (handled at the UI layer), not on-device
 * forensics.
 */

export type Fallacy = 'mind_reading' | 'catastrophizing' | 'all_or_nothing';

export interface FallacyMeta {
  label: string;
  /** Pre-written, versioned reframe (§5/§7 — deterministic, never generated). */
  reframe: string;
}

export const FALLACY_META: Record<Fallacy, FallacyMeta> = {
  mind_reading: {
    label: 'Mind-Reading',
    reframe:
      'The Spectator claims to know what your partner is thinking. It doesn’t — it only knows your fear, played in someone else’s voice. The only real information you have is what was actually said and done. Everything else is a story, and you don’t have to finish it.',
  },
  catastrophizing: {
    label: 'Catastrophizing',
    reframe:
      'One moment has become a forecast of every future moment. That is the Spectator’s signature move — turning a data point into a destiny. Bodies fluctuate day to day; that is physiology, not identity. The forecast is not evidence. Tonight is one night.',
  },
  all_or_nothing: {
    label: 'All-or-Nothing',
    reframe:
      'The Spectator scores intimacy as pass/fail. Connection doesn’t work that way — presence, warmth, and attention all counted tonight, whatever your body did. Grey exists. The moments you were actually there were real, and they remain real.',
  },
};

export interface DefusionEntry {
  id: string;
  /** ISO timestamp — local record only. */
  date: string;
  /** Step 1 — Somatic Reality: what physically happened. */
  somaticReality: string;
  /** Step 2 — what the Spectator is saying. */
  spectatorClaim: string;
  /** Step 3 — the identified fallacy. */
  fallacy: Fallacy;
}

const STORAGE_KEY = '@defusion_log_entries';

export function useDefusionLog() {
  const [entries, setEntries] = useState<DefusionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Reloadable: hook instances don't share memory state, and entries are
  // written from the Triage Center while the CBST tab stays mounted —
  // consumers re-call this on focus to pick up new entries.
  const reload = useCallback(async () => {
    const data = await LocalStore.getItem<DefusionEntry[]>(STORAGE_KEY);
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addEntry = useCallback(
    async (entry: Omit<DefusionEntry, 'id' | 'date'>): Promise<DefusionEntry> => {
      const full: DefusionEntry = {
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

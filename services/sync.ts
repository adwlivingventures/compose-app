import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackend } from './backend';

/**
 * Sync engine — mirrors protocol progress to the user's account row so a
 * deleted app, a lost phone, or a new device restores everything on sign-in.
 * (Founder directive 2026-08-06: data durability outranks data minimalism.)
 *
 * Design:
 *  - One row per user in `user_state` (user_id PK, state jsonb, progress
 *    markers, updated_at). Whole-snapshot upsert — field-level merge is
 *    deliberately out of scope for v1; the resolution rule below makes
 *    whole-snapshot safe.
 *  - SYNCED_KEYS is a whitelist. Device-specific configuration (discretion
 *    toggles, notification times, tab hints, dismissed cards) stays local:
 *    restoring those onto a different device would be wrong, not helpful.
 *  - Resolution on sign-in: the snapshot with the deeper protocol progress
 *    wins wholesale. A fresh install (Day 1, nothing completed) pulling a
 *    Day-41 account restores instantly; a device that is ahead of the
 *    server pushes. Ties prefer the server (it survived; the device may be
 *    mid-restore).
 *  - Writes are pushed via a debounced scheduleSync() hooked into
 *    LocalStore.setItem, so every protocol write anywhere in the app
 *    schedules a push with zero changes at call sites.
 */

/** Keys that follow the account. Order is irrelevant; presence is the contract. */
export const SYNCED_KEYS: readonly string[] = [
  '@user_protocol_state',
  '@completed_days_data_v2',
  '@composure_history',
  '@cbst_log_entries',
  '@defusion_log_entries',
  '@spike_log_entries',
  '@pelvic_recheck_log',
  '@user_first_name',
  '@user_why',
  '@user_scripts',
  '@chosen_cues',
  '@signature_data',
  '@graduation_choice',
  '@daily_rewire_done',
  '@somatic_primer_done',
  '@phase_transition_2',
  '@phase_transition_3',
  '@release_pose_swap',
  '@onboarding_flow_v1',
] as const;

/** Local-only by design — never synced. Kept as an explicit list so a code
 *  review can see the decision, not infer it. */
export const LOCAL_ONLY_KEYS: readonly string[] = [
  '@discreet_blur',
  '@discreet_faceid',
  '@discreet_notifications',
  '@discretion_level',
  '@notification_time',
  '@notification_times',
  '@telemetry_consent',
  '@tab_hint_seen_baseline',
  '@tab_hint_seen_protocol',
  '@tab_hint_seen_steady',
  '@tab_hint_seen_you',
  '@day_one_orientation_seen',
  '@vitality_full_stack_notice_seen',
  '@reminder_backstop_dismissed',
  '@attribution_dismissed',
  '@attribution_source',
  '@paywall_dismissed',
  '@membership_term',
  '@presentation_segment',
  '@rating_state',
  '@sandbox_config',
] as const;

export interface Snapshot {
  /** Bump when snapshot semantics change; pull-side handles older versions. */
  schemaVersion: 1;
  /** Raw JSON strings exactly as AsyncStorage holds them (null = unset). */
  values: Record<string, string | null>;
}

export interface ProgressMarker {
  activeDay: number;
  completedCount: number;
}

/** Extract comparable progress from a snapshot. Absent state = Day 1, 0 done. */
export function progressOf(snap: Snapshot | null): ProgressMarker {
  if (!snap) return { activeDay: 1, completedCount: 0 };
  let activeDay = 1;
  let completedCount = 0;
  try {
    const proto = snap.values['@user_protocol_state'];
    if (proto) activeDay = Math.max(1, Number(JSON.parse(proto)?.activeDay) || 1);
  } catch {}
  try {
    const days = snap.values['@completed_days_data_v2'];
    if (days) {
      const parsed = JSON.parse(days) as Record<string, { completed?: boolean }>;
      completedCount = Object.values(parsed ?? {}).filter((d) => d?.completed).length;
    }
  } catch {}
  return { activeDay, completedCount };
}

/**
 * Which snapshot should the device end up with?
 * Returns 'remote' | 'local'. Ties → 'remote' (see module doc).
 */
export function resolveWinner(local: Snapshot | null, remote: Snapshot | null): 'local' | 'remote' {
  if (!remote) return 'local';
  if (!local) return 'remote';
  const l = progressOf(local);
  const r = progressOf(remote);
  if (l.completedCount !== r.completedCount) {
    return l.completedCount > r.completedCount ? 'local' : 'remote';
  }
  if (l.activeDay !== r.activeDay) {
    return l.activeDay > r.activeDay ? 'local' : 'remote';
  }
  return 'remote';
}

/** Read every synced key from AsyncStorage into a snapshot. */
export async function collectLocalSnapshot(): Promise<Snapshot> {
  const pairs = await AsyncStorage.multiGet([...SYNCED_KEYS]);
  const values: Record<string, string | null> = {};
  for (const [key, value] of pairs) values[key] = value;
  return { schemaVersion: 1, values };
}

/** Write a snapshot's values into AsyncStorage (used when remote wins). */
export async function applySnapshot(snap: Snapshot): Promise<void> {
  const sets: [string, string][] = [];
  const removes: string[] = [];
  for (const key of SYNCED_KEYS) {
    const v = snap.values[key];
    if (v === null || v === undefined) removes.push(key);
    else sets.push([key, v]);
  }
  if (sets.length) await AsyncStorage.multiSet(sets);
  if (removes.length) await AsyncStorage.multiRemove(removes);
}

/** Push the current local snapshot to the signed-in user's row. */
export async function pushSnapshot(): Promise<boolean> {
  const backend = getBackend();
  if (!backend) return false;
  const { data: auth } = await backend.auth.getUser();
  const user = auth?.user;
  if (!user) return false;
  const snap = await collectLocalSnapshot();
  const marker = progressOf(snap);
  const { error } = await backend.from('user_state').upsert(
    {
      user_id: user.id,
      state: snap,
      active_day: marker.activeDay,
      completed_count: marker.completedCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  return !error;
}

/** Fetch the signed-in user's server snapshot (null when none exists). */
export async function pullSnapshot(): Promise<Snapshot | null> {
  const backend = getBackend();
  if (!backend) return null;
  const { data: auth } = await backend.auth.getUser();
  const user = auth?.user;
  if (!user) return null;
  const { data, error } = await backend
    .from('user_state')
    .select('state')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !data?.state) return null;
  const snap = data.state as Snapshot;
  return snap && snap.schemaVersion ? snap : null;
}

/**
 * Full reconciliation — run right after sign-in/sign-up and on app start
 * for signed-in users. Applies the resolution rule, then pushes so the
 * server always ends current.
 *
 * Returns what happened, so the caller can tell the user the truth
 * ("Day 41 restored") instead of a spinner lie.
 */
export async function syncNow(): Promise<'restored' | 'pushed' | 'offline' | 'signed-out'> {
  const backend = getBackend();
  if (!backend) return 'offline';
  const { data: auth } = await backend.auth.getUser();
  if (!auth?.user) return 'signed-out';
  try {
    const [local, remote] = [await collectLocalSnapshot(), await pullSnapshot()];
    if (resolveWinner(local, remote) === 'remote' && remote) {
      await applySnapshot(remote);
      await pushSnapshot();
      return 'restored';
    }
    await pushSnapshot();
    return 'pushed';
  } catch {
    // Offline or transient server failure: the local cache stays the
    // working copy; the next scheduled push heals the server.
    return 'offline';
  }
}

// ---------------------------------------------------------------------------
// Debounced background push — LocalStore.setItem calls scheduleSync(key) on
// every write; only whitelisted keys arm the timer.

let timer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 4000;

export function scheduleSync(key: string): void {
  if (!SYNCED_KEYS.includes(key)) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    // Fire-and-forget: failures are healed by the next write or next syncNow.
    pushSnapshot().catch(() => {});
  }, DEBOUNCE_MS);
}

/** Test seam. */
export function __cancelScheduledSyncForTests(): void {
  if (timer) clearTimeout(timer);
  timer = null;
}

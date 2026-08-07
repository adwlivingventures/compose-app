jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SYNCED_KEYS,
  LOCAL_ONLY_KEYS,
  Snapshot,
  progressOf,
  resolveWinner,
  collectLocalSnapshot,
  applySnapshot,
  __cancelScheduledSyncForTests,
} from '../sync';

// AsyncStorage's official jest mock (above) provides an in-memory store.

function snap(values: Record<string, string | null>): Snapshot {
  return { schemaVersion: 1, values };
}

const dayState = (activeDay: number) =>
  JSON.stringify({ activeDay, streak: 3, lastCompletedDate: '2026-08-01' });

const daysData = (completed: number) => {
  const out: Record<number, { completed: boolean; pelvicRating: number }> = {};
  for (let i = 1; i <= completed; i++) out[i] = { completed: true, pelvicRating: 4 };
  return JSON.stringify(out);
};

afterEach(async () => {
  __cancelScheduledSyncForTests();
  await AsyncStorage.clear();
});

describe('key partition', () => {
  it('no key is both synced and local-only', () => {
    const overlap = SYNCED_KEYS.filter((k) => LOCAL_ONLY_KEYS.includes(k));
    expect(overlap).toEqual([]);
  });

  it('device-specific discretion keys never sync', () => {
    for (const key of ['@discreet_faceid', '@discretion_level', '@telemetry_consent']) {
      expect(LOCAL_ONLY_KEYS).toContain(key);
      expect(SYNCED_KEYS).not.toContain(key);
    }
  });

  it('the protocol record does sync', () => {
    for (const key of [
      '@user_protocol_state',
      '@completed_days_data_v2',
      '@composure_history',
      '@user_first_name',
    ]) {
      expect(SYNCED_KEYS).toContain(key);
    }
  });
});

describe('progressOf', () => {
  it('reads day and completion depth', () => {
    const s = snap({
      '@user_protocol_state': dayState(41),
      '@completed_days_data_v2': daysData(40),
    });
    expect(progressOf(s)).toEqual({ activeDay: 41, completedCount: 40 });
  });

  it('treats null/corrupt state as Day 1', () => {
    expect(progressOf(null)).toEqual({ activeDay: 1, completedCount: 0 });
    expect(progressOf(snap({ '@user_protocol_state': '{not json' }))).toEqual({
      activeDay: 1,
      completedCount: 0,
    });
  });
});

describe('resolveWinner — the restore-safety core', () => {
  const day41 = snap({
    '@user_protocol_state': dayState(41),
    '@completed_days_data_v2': daysData(40),
  });
  const day1 = snap({ '@user_protocol_state': dayState(1) });

  it('fresh install signing in restores the server record', () => {
    expect(resolveWinner(day1, day41)).toBe('remote');
  });

  it('device ahead of server pushes local', () => {
    expect(resolveWinner(day41, day1)).toBe('local');
  });

  it('no server record keeps local', () => {
    expect(resolveWinner(day41, null)).toBe('local');
  });

  it('no local state adopts remote', () => {
    expect(resolveWinner(null, day41)).toBe('remote');
  });

  it('exact tie prefers the server', () => {
    expect(resolveWinner(day41, day41)).toBe('remote');
  });

  it('equal days, deeper completion wins', () => {
    const moreDone = snap({
      '@user_protocol_state': dayState(41),
      '@completed_days_data_v2': daysData(41),
    });
    expect(resolveWinner(moreDone, day41)).toBe('local');
    expect(resolveWinner(day41, moreDone)).toBe('remote');
  });
});

describe('snapshot round-trip', () => {
  it('collect → apply restores every synced key and skips local-only keys', async () => {
    await AsyncStorage.setItem('@user_protocol_state', dayState(12));
    await AsyncStorage.setItem('@user_first_name', JSON.stringify('Andrew'));
    await AsyncStorage.setItem('@discreet_faceid', JSON.stringify(true));

    const collected = await collectLocalSnapshot();
    expect(collected.values['@user_protocol_state']).toBe(dayState(12));
    // Local-only keys are absent from the snapshot entirely.
    expect(Object.keys(collected.values)).not.toContain('@discreet_faceid');

    await AsyncStorage.clear();
    await applySnapshot(collected);
    expect(await AsyncStorage.getItem('@user_protocol_state')).toBe(dayState(12));
    expect(await AsyncStorage.getItem('@user_first_name')).toBe(JSON.stringify('Andrew'));
    expect(await AsyncStorage.getItem('@discreet_faceid')).toBeNull();
  });

  it('applySnapshot clears synced keys the snapshot lacks (true restore)', async () => {
    await AsyncStorage.setItem('@graduation_choice', JSON.stringify('export'));
    await applySnapshot(snap({ '@user_protocol_state': dayState(5) }));
    expect(await AsyncStorage.getItem('@graduation_choice')).toBeNull();
    expect(await AsyncStorage.getItem('@user_protocol_state')).toBe(dayState(5));
  });
});

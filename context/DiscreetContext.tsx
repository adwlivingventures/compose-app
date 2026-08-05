import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocalStore } from '../services/storage';

/**
 * Discreet Mode settings (E18) — the live surfaces.
 *
 * All persist locally only (§7). `notifications` governs whether the daily
 * reminder is SCHEDULED at all — its neutrality is not stored because
 * CLAUDE.md §6 makes neutral copy a binding product rule, not a preference:
 * there is no state in which a non-neutral notification can exist. The
 * scheduling itself happens at the call sites (Day-1 ask, E18 toggle) via
 * services/notifications.ts; this context only holds the flag.
 */

const KEY_FACE_ID = '@discreet_faceid';
const KEY_HIDE_SWITCHER = '@discreet_blur';
const KEY_NOTIFICATIONS = '@discreet_notifications';
// The discretion level (2026-08-03, build order 1.3 — CLAUDE.md §6 rewrite).
// null = never chosen; every consumer MUST treat null as Shielded (the
// pre-2026-07-25 behavior, byte-identical) — the level upgrades surfaces
// only after an explicit choice, never by silent default.
export const KEY_DISCRETION_LEVEL = '@discretion_level';

export type DiscretionLevel = 'personal' | 'shielded';

interface DiscreetSettings {
  /** Settings hydrated from disk — gate any content flash on this. */
  loaded: boolean;
  faceId: boolean;
  hideSwitcher: boolean;
  notifications: boolean;
  /** null until the user chooses on the Discretion screen — treat as Shielded. */
  level: DiscretionLevel | null;
  setFaceId: (on: boolean) => void;
  setHideSwitcher: (on: boolean) => void;
  setNotifications: (on: boolean) => void;
  /** Persists before resolving, so callers can reschedule notifications
   *  immediately after and the service reads the new level from disk. */
  setLevel: (level: DiscretionLevel) => Promise<void>;
}

const DiscreetContext = createContext<DiscreetSettings>({
  loaded: false,
  faceId: false,
  hideSwitcher: false,
  notifications: false,
  level: null,
  setFaceId: () => {},
  setHideSwitcher: () => {},
  setNotifications: () => {},
  setLevel: async () => {},
});

export function DiscreetProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [faceId, setFaceIdState] = useState(false);
  const [hideSwitcher, setHideSwitcherState] = useState(false);
  const [notifications, setNotificationsState] = useState(false);
  const [level, setLevelState] = useState<DiscretionLevel | null>(null);

  useEffect(() => {
    Promise.all([
      LocalStore.getItem<boolean>(KEY_FACE_ID),
      LocalStore.getItem<boolean>(KEY_HIDE_SWITCHER),
      LocalStore.getItem<boolean>(KEY_NOTIFICATIONS),
      LocalStore.getItem<DiscretionLevel>(KEY_DISCRETION_LEVEL),
    ]).then(([storedFaceId, storedHide, storedNotifications, storedLevel]) => {
      setFaceIdState(storedFaceId === true);
      setHideSwitcherState(storedHide === true);
      setNotificationsState(storedNotifications === true);
      setLevelState(storedLevel === 'personal' || storedLevel === 'shielded' ? storedLevel : null);
      setLoaded(true);
    });
  }, []);

  const setFaceId = (on: boolean) => {
    setFaceIdState(on);
    LocalStore.setItem(KEY_FACE_ID, on);
  };

  const setHideSwitcher = (on: boolean) => {
    setHideSwitcherState(on);
    LocalStore.setItem(KEY_HIDE_SWITCHER, on);
  };

  const setNotifications = (on: boolean) => {
    setNotificationsState(on);
    LocalStore.setItem(KEY_NOTIFICATIONS, on);
  };

  const setLevel = async (next: DiscretionLevel) => {
    setLevelState(next);
    // Await the write: notifications.ts reads the level from disk when it
    // (re)schedules, so the persist must land before any reschedule call.
    await LocalStore.setItem(KEY_DISCRETION_LEVEL, next);
  };

  return (
    <DiscreetContext.Provider
      value={{
        loaded,
        faceId,
        hideSwitcher,
        notifications,
        level,
        setFaceId,
        setHideSwitcher,
        setNotifications,
        setLevel,
      }}
    >
      {children}
    </DiscreetContext.Provider>
  );
}

export function useDiscreet() {
  return useContext(DiscreetContext);
}

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

interface DiscreetSettings {
  /** Settings hydrated from disk — gate any content flash on this. */
  loaded: boolean;
  faceId: boolean;
  hideSwitcher: boolean;
  notifications: boolean;
  setFaceId: (on: boolean) => void;
  setHideSwitcher: (on: boolean) => void;
  setNotifications: (on: boolean) => void;
}

const DiscreetContext = createContext<DiscreetSettings>({
  loaded: false,
  faceId: false,
  hideSwitcher: false,
  notifications: false,
  setFaceId: () => {},
  setHideSwitcher: () => {},
  setNotifications: () => {},
});

export function DiscreetProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [faceId, setFaceIdState] = useState(false);
  const [hideSwitcher, setHideSwitcherState] = useState(false);
  const [notifications, setNotificationsState] = useState(false);

  useEffect(() => {
    Promise.all([
      LocalStore.getItem<boolean>(KEY_FACE_ID),
      LocalStore.getItem<boolean>(KEY_HIDE_SWITCHER),
      LocalStore.getItem<boolean>(KEY_NOTIFICATIONS),
    ]).then(([storedFaceId, storedHide, storedNotifications]) => {
      setFaceIdState(storedFaceId === true);
      setHideSwitcherState(storedHide === true);
      setNotificationsState(storedNotifications === true);
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

  return (
    <DiscreetContext.Provider
      value={{
        loaded,
        faceId,
        hideSwitcher,
        notifications,
        setFaceId,
        setHideSwitcher,
        setNotifications,
      }}
    >
      {children}
    </DiscreetContext.Provider>
  );
}

export function useDiscreet() {
  return useContext(DiscreetContext);
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocalStore } from '../services/storage';

/**
 * Discreet Mode settings (E18) — the two live surfaces.
 *
 * Both persist locally only (§7). Neutral notifications are NOT here by
 * design: CLAUDE.md §6 makes notification neutrality a binding product rule,
 * not a user preference — there is no state in which a non-neutral
 * notification is allowed to exist, so there is nothing to store.
 */

const KEY_FACE_ID = '@discreet_faceid';
const KEY_HIDE_SWITCHER = '@discreet_blur';

interface DiscreetSettings {
  /** Settings hydrated from disk — gate any content flash on this. */
  loaded: boolean;
  faceId: boolean;
  hideSwitcher: boolean;
  setFaceId: (on: boolean) => void;
  setHideSwitcher: (on: boolean) => void;
}

const DiscreetContext = createContext<DiscreetSettings>({
  loaded: false,
  faceId: false,
  hideSwitcher: false,
  setFaceId: () => {},
  setHideSwitcher: () => {},
});

export function DiscreetProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [faceId, setFaceIdState] = useState(false);
  const [hideSwitcher, setHideSwitcherState] = useState(false);

  useEffect(() => {
    Promise.all([
      LocalStore.getItem<boolean>(KEY_FACE_ID),
      LocalStore.getItem<boolean>(KEY_HIDE_SWITCHER),
    ]).then(([storedFaceId, storedHide]) => {
      setFaceIdState(storedFaceId === true);
      setHideSwitcherState(storedHide === true);
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

  return (
    <DiscreetContext.Provider value={{ loaded, faceId, hideSwitcher, setFaceId, setHideSwitcher }}>
      {children}
    </DiscreetContext.Provider>
  );
}

export function useDiscreet() {
  return useContext(DiscreetContext);
}

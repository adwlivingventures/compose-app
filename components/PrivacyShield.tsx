import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Text, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useDiscreet } from '../context/DiscreetContext';

/**
 * PrivacyShield — the two live Discreet Mode surfaces (E18), rendered above
 * the whole app from the root layout.
 *
 * 1. App-switcher cover: when the app leaves the foreground with "Hide from
 *    app switcher" on, an opaque ground-colored card with only the wordmark
 *    replaces the content before iOS takes its snapshot. Opaque beats blur:
 *    a blur still leaks layout and color, and needs another native module.
 *
 * 2. Face ID gate: with "Face ID to open" on, content is covered on cold
 *    start and re-locked when the app is backgrounded. Everything on the
 *    lock surface passes the stranger test — wordmark, no domain vocabulary.
 *
 * Fail-open by design: if biometrics are unavailable at unlock time (e.g. a
 * dev build that predates the native module), the gate releases rather than
 * bricking the app — the passcode fallback inside authenticateAsync covers
 * the legitimate "Face ID won't read" case.
 */

async function biometricsAvailable(): Promise<boolean> {
  try {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export default function PrivacyShield() {
  const { loaded, faceId, hideSwitcher } = useDiscreet();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [locked, setLocked] = useState(false);
  const authInFlight = useRef(false);
  // The gate arms exactly once per launch, after settings hydrate — faceId
  // isn't known synchronously, so locking can't happen in useState's init.
  const armedRef = useRef(false);

  const faceIdRef = useRef(faceId);
  faceIdRef.current = faceId;

  useEffect(() => {
    if (loaded && !armedRef.current) {
      armedRef.current = true;
      if (faceId) setLocked(true);
    }
  }, [loaded, faceId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setAppState(next);
      // Re-lock on true backgrounding only — 'inactive' also fires for the
      // Face ID prompt itself and Control Center pulls.
      if (next === 'background' && faceIdRef.current) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  // Prompt automatically whenever the app is frontmost and locked.
  useEffect(() => {
    if (locked && appState === 'active') attemptUnlock();
  }, [locked, appState]);

  const attemptUnlock = async () => {
    if (authInFlight.current) return;
    authInFlight.current = true;
    try {
      if (!(await biometricsAvailable())) {
        setLocked(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Compose',
      });
      if (result.success) setLocked(false);
    } catch {
      setLocked(false);
    } finally {
      authInFlight.current = false;
    }
  };

  // Hold an opaque cover until settings hydrate so a locked user never sees
  // a frame of content on cold start. Sub-100ms; invisible to everyone else.
  const showHydrationCover = !loaded;
  // Hide the switcher cover while the biometric prompt has the foreground —
  // the prompt flips appState to 'inactive' and would flash the cover.
  const showSwitcherCover = hideSwitcher && appState !== 'active' && !authInFlight.current;

  if (!showHydrationCover && !showSwitcherCover && !locked) return null;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
      className="bg-ground items-center justify-center"
    >
      <Text className="text-muted text-xs font-semibold uppercase tracking-[0.32em]">
        Compose
      </Text>
      {locked && !showSwitcherCover && !showHydrationCover && (
        <TouchableOpacity
          onPress={attemptUnlock}
          activeOpacity={0.85}
          className="bg-surface border border-line rounded-2xl py-3.5 px-10 mt-8"
        >
          <Text className="text-body font-semibold text-sm">Unlock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

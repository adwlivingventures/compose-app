import type * as LocalAuthenticationTypes from 'expo-local-authentication';

/**
 * Guarded loader for expo-local-authentication.
 *
 * The module calls requireNativeModule at import time, which THROWS when the
 * client binary predates the native module (older dev client, Expo Go, web).
 * A top-level `import` therefore crashes the entire bundle before any
 * runtime guard can run — so the require lives here, inside a try/catch,
 * and every consumer goes through these fail-soft wrappers instead of
 * importing the module directly. Fail-open is the Discreet Mode contract:
 * a missing module must never brick the app (components/PrivacyShield.tsx).
 */

type BiometricsModule = typeof LocalAuthenticationTypes;

let biometrics: BiometricsModule | null = null;
try {
  biometrics = require('expo-local-authentication');
} catch {
  biometrics = null;
}

/** False when the client binary was built without the native module. */
export const biometricsPresent = biometrics !== null;

/** Device has biometric hardware with at least one enrollment. */
export async function biometricsEnrolled(): Promise<boolean> {
  if (!biometrics) return false;
  try {
    const [hasHardware, enrolled] = await Promise.all([
      biometrics.hasHardwareAsync(),
      biometrics.isEnrolledAsync(),
    ]);
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

/**
 * Run the system biometric prompt. 'failed' means the user was prompted and
 * didn't pass (cancel/mismatch) — callers keep their gate closed; anything
 * that prevents prompting at all is 'unavailable' — callers fail open.
 */
export async function authenticate(
  promptMessage: string,
): Promise<'success' | 'failed' | 'unavailable'> {
  if (!biometrics) return 'unavailable';
  try {
    const result = await biometrics.authenticateAsync({ promptMessage });
    return result.success ? 'success' : 'failed';
  } catch {
    return 'unavailable';
  }
}

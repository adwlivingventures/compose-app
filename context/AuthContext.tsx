import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { backendConfigured, getBackend } from '../services/backend';
import { syncNow, pushSnapshot } from '../services/sync';
import { LocalStore } from '../services/storage';

/**
 * AuthContext — account state for the whole app (founder directive
 * 2026-08-06: standard accounts; progress follows the account, not the
 * device).
 *
 * Graceful degradation is a hard requirement: with no backend configured
 * (tests, CI, keys not yet provisioned) every method resolves with a
 * clear error string and the app behaves exactly as the local-only build
 * did. Nothing may crash or block on the backend's absence.
 */

export type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthContextType {
  /** Null until the stored session (if any) has been read. */
  initializing: boolean;
  user: User | null;
  session: Session | null;
  /** True when backend keys exist — the account UI hides itself otherwise. */
  available: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Permanent server-side account + data deletion (App Store 5.1.1(v)). */
  deleteAccount: () => Promise<AuthResult>;
  /** Result of the most recent full sync — drives quiet status copy. */
  lastSync: 'restored' | 'pushed' | 'offline' | 'signed-out' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NOT_CONFIGURED = 'Account service is not configured yet.';

/** Human copy for the errors users actually hit — never raw API strings. */
function friendly(message: string | undefined): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match.';
  if (m.includes('already registered')) return 'An account with that email already exists. Sign in instead.';
  if (m.includes('at least 6 characters')) return 'Password needs at least 6 characters.';
  if (m.includes('valid email')) return 'That doesn’t look like a valid email address.';
  if (m.includes('network')) return 'No connection. Your progress is safe on this device — try again when you’re back online.';
  return message || 'Something went wrong. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const available = backendConfigured();
  const [initializing, setInitializing] = useState<boolean>(available);
  const [session, setSession] = useState<Session | null>(null);
  const [lastSync, setLastSync] = useState<AuthContextType['lastSync']>(null);

  // Hydrate the persisted session and subscribe to changes.
  useEffect(() => {
    const backend = getBackend();
    if (!backend) return;
    let mounted = true;
    backend.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setInitializing(false);
      if (data.session) syncNow().then((r) => mounted && setLastSync(r));
    });
    const { data: sub } = backend.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Push on backgrounding — the cheapest moment to guarantee the server is
  // current before anything can happen to the device.
  useEffect(() => {
    if (!available) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && session) pushSnapshot().catch(() => {});
    });
    return () => sub.remove();
  }, [available, session]);

  const afterAuth = useCallback(async (): Promise<void> => {
    const result = await syncNow();
    setLastSync(result);
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const backend = getBackend();
      if (!backend) return { ok: false, message: NOT_CONFIGURED };
      const { error } = await backend.auth.signUp({ email: email.trim(), password });
      if (error) return { ok: false, message: friendly(error.message) };
      await afterAuth();
      return { ok: true };
    },
    [afterAuth],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const backend = getBackend();
      if (!backend) return { ok: false, message: NOT_CONFIGURED };
      const { error } = await backend.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, message: friendly(error.message) };
      await afterAuth();
      return { ok: true };
    },
    [afterAuth],
  );

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    const backend = getBackend();
    if (!backend) return { ok: false, message: NOT_CONFIGURED };
    try {
      // Nonce round-trip: Apple signs the hash, Supabase verifies the raw —
      // the standard replay protection for identity-token sign-in.
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) {
        return { ok: false, message: 'Apple didn’t return a sign-in token. Please try again.' };
      }
      const { error } = await backend.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (error) return { ok: false, message: friendly(error.message) };
      // Apple provides the name exactly once, on first authorization —
      // capture it if onboarding hasn't already.
      const first = credential.fullName?.givenName;
      if (first) {
        const existing = await LocalStore.getItem<string>('@user_first_name');
        if (!existing) await LocalStore.setItem('@user_first_name', first);
      }
      await afterAuth();
      return { ok: true };
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        return { ok: false, message: '' }; // user closed the sheet — not an error
      }
      return { ok: false, message: 'Apple sign-in isn’t available right now.' };
    }
  }, [afterAuth]);

  const signOut = useCallback(async (): Promise<void> => {
    const backend = getBackend();
    if (!backend) return;
    // Final push so the account row is current before the device forgets it.
    await pushSnapshot().catch(() => {});
    await backend.auth.signOut();
    setLastSync(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    const backend = getBackend();
    if (!backend) return { ok: false, message: NOT_CONFIGURED };
    // SECURITY DEFINER function on the server removes the auth user and
    // every owned row (see docs/backend/schema.sql). Clients cannot delete
    // auth users directly — by design.
    const { error } = await backend.rpc('delete_account');
    if (error) return { ok: false, message: friendly(error.message) };
    await backend.auth.signOut();
    setLastSync(null);
    return { ok: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        initializing,
        user: session?.user ?? null,
        session,
        available,
        signUpWithEmail,
        signInWithEmail,
        signInWithApple,
        signOut,
        deleteAccount,
        lastSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

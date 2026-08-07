import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Backend client — Supabase (founder directive 2026-08-06, Standing
 * Directive §2: accounts + server-side persistence are the top functional
 * priority; the local-only architecture is retired).
 *
 * The server is the SYSTEM OF RECORD for protocol progress; AsyncStorage
 * remains the offline cache so sessions run perfectly with no signal.
 *
 * Config comes from app.json → expo.extra.supabase { url, anonKey }.
 * When unconfigured (CI, tests, a checkout without keys) every consumer
 * degrades gracefully to local-only behavior — the app must never crash
 * or block on the backend's absence. The anon key is a PUBLIC client key
 * by design (Supabase RLS is the security boundary, not key secrecy).
 */

interface SupabaseExtra {
  url?: string;
  anonKey?: string;
}

function readConfig(): SupabaseExtra {
  const extra = (Constants.expoConfig?.extra ?? {}) as { supabase?: SupabaseExtra };
  return extra.supabase ?? {};
}

let client: SupabaseClient | null = null;
let initialized = false;

/** True when real backend keys are present in app config. */
export function backendConfigured(): boolean {
  const { url, anonKey } = readConfig();
  return Boolean(url && anonKey && url.startsWith('https://'));
}

/**
 * Lazy singleton. Returns null when unconfigured — callers must treat a
 * null client as "operate local-only", never as an error state.
 */
export function getBackend(): SupabaseClient | null {
  if (initialized) return client;
  initialized = true;
  if (!backendConfigured()) return null;
  const { url, anonKey } = readConfig();
  client = createClient(url as string, anonKey as string, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // No web-style URL fragment sessions in a native app.
      detectSessionInUrl: false,
    },
  });
  return client;
}

/** Test seam: reset the singleton (jest only). */
export function __resetBackendForTests(): void {
  client = null;
  initialized = false;
}

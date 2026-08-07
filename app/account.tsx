import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { LocalStore } from '../services/storage';

/**
 * Account — create or sign in (founder directive 2026-08-06).
 *
 * Placement: pushed immediately after a successful purchase (before the
 * oath) and reachable any time from You → Settings. Post-purchase is the
 * zero-friction moment: he has just committed; the account is framed as
 * securing what he now owns (endowment, not paperwork). Conversion is
 * untouched because payment already happened.
 *
 * Deepwater ROLE: one screen, one action. The aqua CTA is the single
 * current; Apple's white button is a platform-mandated exception (Apple HIG
 * requires their button styles for Sign in with Apple).
 *
 * "Not now" is quiet but present: a man mid-arousal-of-commitment must
 * never feel trapped by a form — trapped is sympathetic activation. The
 * ask returns later via the You tab; it does not nag.
 */

type Mode = 'create' | 'signin';

export default function AccountScreen() {
  const router = useRouter();
  const { intro } = useLocalSearchParams<{ intro?: string }>();
  const isIntro = intro === '1';
  const {
    available,
    user,
    signUpWithEmail,
    signInWithEmail,
    signInWithApple,
    lastSync,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && email.includes('@') && password.length >= 6 && !busy,
    [email, password, busy],
  );

  const finish = async () => {
    if (isIntro) {
      const signature = await LocalStore.getItem<{ name?: string }>('@signature_data');
      router.replace(signature?.name ? '/(tabs)' : '/oath');
    } else {
      router.back();
    }
  };

  const submitEmail = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const result =
      mode === 'create'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
    setBusy(false);
    if (!result.ok) {
      if (result.message) setError(result.message);
      return;
    }
    setDone(true);
  };

  const submitApple = async () => {
    setBusy(true);
    setError(null);
    const result = await signInWithApple();
    setBusy(false);
    if (!result.ok) {
      if (result.message) setError(result.message);
      return;
    }
    setDone(true);
  };

  // Backend not provisioned (dev checkout without keys): don't render a
  // dead form — route on silently. The intro flow continues unharmed.
  // eslint-disable-next-line react-hooks/rules-of-hooks -- `available` is
  // constant for the app's lifetime, so hook order never actually changes;
  // the effect lives above the early return regardless.
  useEffect(() => {
    if (!available) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);
  if (!available) {
    return <View className="flex-1 bg-ground" />;
  }

  // Success state — say what actually happened, then move on. "Restored"
  // is the one moment this feature earns visible trust; don't waste it.
  if (done || user) {
    return (
      <View className="flex-1 bg-ground items-center justify-center px-8">
        <ShieldCheck color="#5FD4C1" size={28} />
        <Text className="text-ink text-2xl font-serif mt-4 text-center">
          {lastSync === 'restored' ? 'Your record is back.' : 'Your record is secured.'}
        </Text>
        <Text className="text-body text-sm mt-3 text-center leading-6">
          {lastSync === 'restored'
            ? 'Everything you built — your day, your history, your words — is on this phone again.'
            : 'From now on your progress follows you — a new phone, a reinstall, nothing is lost.'}
        </Text>
        <TouchableOpacity
          onPress={finish}
          activeOpacity={0.85}
          className="bg-accent rounded-2xl px-10 py-4 mt-8"
        >
          <Text className="text-on-accent text-base font-bold">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-ground"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 84, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          Your account
        </Text>
        <Text className="text-ink text-3xl font-serif-light mt-2">
          {mode === 'create' ? 'Keep what you build.' : 'Welcome back.'}
        </Text>
        <Text className="text-body text-sm mt-3 leading-6">
          {mode === 'create'
            ? 'The next 75 days produce a record — your progress, your scores, your own words. An account means a lost phone or a deleted app can never take it. Seen by no one but you.'
            : 'Sign in and this phone picks up exactly where your record left off.'}
        </Text>

        {/* Sign in with Apple — the one-tap default on iOS. */}
        {Platform.OS === 'ios' && (
          <View className="mt-8">
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                mode === 'create'
                  ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                  : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={16}
              style={{ width: '100%', height: 52 }}
              onPress={submitApple}
            />
          </View>
        )}

        <View className="flex-row items-center gap-3 mt-6 mb-6">
          <View className="flex-1 h-px bg-line" />
          <Text className="text-faint text-xs">or with email</Text>
          <View className="flex-1 h-px bg-line" />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#53626E"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          className="bg-surface border border-line rounded-2xl px-4 py-4 text-ink text-base"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={mode === 'create' ? 'Password (6+ characters)' : 'Password'}
          placeholderTextColor="#53626E"
          secureTextEntry
          autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
          className="bg-surface border border-line rounded-2xl px-4 py-4 text-ink text-base mt-3"
        />

        {error ? (
          <Text className="text-severity-red text-sm mt-4 leading-5">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={submitEmail}
          disabled={!canSubmit}
          activeOpacity={0.85}
          className={`rounded-2xl py-4 items-center mt-6 ${
            canSubmit ? 'bg-accent' : 'bg-surface border border-line'
          }`}
        >
          {busy ? (
            <ActivityIndicator color={canSubmit ? '#06232A' : '#5FD4C1'} />
          ) : (
            <Text className={`text-base font-bold ${canSubmit ? 'text-on-accent' : 'text-muted'}`}>
              {mode === 'create' ? 'Create account' : 'Sign in'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMode(mode === 'create' ? 'signin' : 'create');
            setError(null);
          }}
          activeOpacity={0.7}
          className="mt-5 items-center"
        >
          <Text className="text-body text-sm">
            {mode === 'create' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Text>
        </TouchableOpacity>

        {isIntro && (
          <TouchableOpacity onPress={finish} activeOpacity={0.7} className="mt-8 items-center">
            <Text className="text-faint text-sm">Not now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

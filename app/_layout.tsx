import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { ProtocolProvider } from '../context/ProtocolContext';

const IS_DEV = __DEV__;

// Public API Keys from the RevenueCat Dashboard
const RC_API_KEYS = {
  // Production iOS key (appl_) — used in release builds
  apple: 'appl_inVtRurJrWlBgxMgfyVRWJvobdU',
  // Sandbox/test key — used during development (__DEV__ = true)
  applTest: 'test_efhcrrXUNZFdzjqjQsSjHeoPYkB',
  // Add your Google key here when targeting Android
  google: 'goog_your_google_api_key_here',
};

export default function RootLayout() {
  useEffect(() => {
    // Verbose logging in dev, silent in production
    Purchases.setLogLevel(IS_DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

    if (Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: IS_DEV ? RC_API_KEYS.applTest : RC_API_KEYS.apple,
      });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: RC_API_KEYS.google });
    }
  }, []);

  return (
    <ProtocolProvider>
      <StatusBar style="light" />
      {/* contentStyle keeps the scene background slate-950 during transition
          animations — without it, iOS flashes the default white card behind
          screens mid-push (§6: nothing in this app may flash bright). */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </ProtocolProvider>
  );
}

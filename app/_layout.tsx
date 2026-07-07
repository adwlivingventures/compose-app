import '../global.css';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  useFonts,
  SourceSerif4_300Light,
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { ProtocolProvider } from '../context/ProtocolContext';
import { DiscreetProvider } from '../context/DiscreetContext';
import PrivacyShield from '../components/PrivacyShield';

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
  const [fontsLoaded] = useFonts({
    SourceSerif4_300Light,
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    SourceSerif4_600SemiBold,
  });

  useEffect(() => {
    // Verbose logging in dev, silent in production
    Purchases.setLogLevel(IS_DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

    if (Platform.OS === 'ios') {
      // One key for dev and prod: RevenueCat auto-detects sandbox vs
      // production receipts from the build environment. The test_ key
      // targets RC's separate Test Store, which has no products configured —
      // it left the dev paywall with an empty offering.
      Purchases.configure({ apiKey: RC_API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: RC_API_KEYS.google });
    }
  }, []);

  // Hold on a plain ground-colored view until the serif faces are ready —
  // a flash of fallback type undermines the composed first impression.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0C0B09' }} />;
  }

  return (
    <ProtocolProvider>
      <DiscreetProvider>
        <StatusBar style="light" />
        {/* contentStyle keeps the scene background on Ember ground during transition
            animations — without it, iOS flashes the default white card behind
            screens mid-push (§6: nothing in this app may flash bright). */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0C0B09' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session" options={{ presentation: 'fullScreenModal' }} />
          {/* No swipe-back: the oath is a threshold, not a form (arm A signs
              here post-purchase; see app/oath.tsx). */}
          <Stack.Screen name="oath" options={{ gestureEnabled: false }} />
          <Stack.Screen name="discretion" />
          <Stack.Screen name="vitality" />
          <Stack.Screen name="technique" />
          <Stack.Screen name="mastery" />
          <Stack.Screen name="autonomic-sync" />
          <Stack.Screen name="copilot" />
          <Stack.Screen name="sensate-mastery" />
          <Stack.Screen name="success-vault" />
        </Stack>
        {/* Above everything: the app-switcher cover and Face ID gate (E18). */}
        <PrivacyShield />
      </DiscreetProvider>
    </ProtocolProvider>
  );
}

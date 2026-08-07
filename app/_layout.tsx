import '../global.css';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  useFonts,
  Newsreader_300Light,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
} from '@expo-google-fonts/newsreader';
import { ProtocolProvider } from '../context/ProtocolContext';
import { DiscreetProvider } from '../context/DiscreetContext';
import { AuthProvider } from '../context/AuthContext';
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

// Configure at MODULE scope, not in a RootLayout effect. React runs child
// effects before parent effects, so useRevenueCat's mount effect (getOfferings,
// getCustomerInfo, addCustomerInfoUpdateListener) fires BEFORE a configure
// placed in this layout's own useEffect. The native iOS SDK tolerates that
// race (and the silent offerings retry heals it); the web SDK throws an
// uncaught UninitializedPurchasesError. Module scope guarantees configure runs
// before any screen renders, on every platform.
function configurePurchases() {
  try {
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
    // Web is a DEV PREVIEW surface only (product ships iOS-first) and gets
    // NO configure call: purchases-js validates the key prefix and rejects
    // the appl_ key outright ("Use your Web Billing API key"), logging its
    // own console.error that Expo's dev overlay pins over the bottom CTA on
    // every screen. Every Purchases call site is guarded (isConfigured
    // checks / awaited try-catch), so the preview degrades to no-billing:
    // every screen renders and navigates, the paywall just omits live prices.
  } catch {
    // Never let SDK init take down the tree (e.g. non-browser bundling pass).
    // The offerings retry loop in useRevenueCat degrades gracefully without it.
  }
}
configurePurchases();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Newsreader_300Light,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
  });

  // Hold on a plain ground-colored view until the serif faces are ready —
  // a flash of fallback type undermines the composed first impression.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0A0F16' }} />;
  }

  return (
    <AuthProvider>
    <ProtocolProvider>
      <DiscreetProvider>
        <StatusBar style="light" />
        {/* contentStyle keeps the scene background on Ember ground during transition
            animations — without it, iOS flashes the default white card behind
            screens mid-push (§6: nothing in this app may flash bright). */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0F16' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session" options={{ presentation: 'fullScreenModal' }} />
          {/* Composure re-measurement (Days 14/40/75) — modal like session:
              a measurement is a sitting, not a browsable page. */}
          <Stack.Screen name="remeasure" options={{ presentation: 'fullScreenModal' }} />
          {/* No swipe-back: the oath is a threshold, not a form (arm A signs
              here post-purchase; see app/oath.tsx). */}
          <Stack.Screen name="oath" options={{ gestureEnabled: false }} />
          {/* Account create/sign-in — post-purchase intro step + reachable
              from You → Settings (founder directive 2026-08-06). */}
          <Stack.Screen name="account" />
          <Stack.Screen name="discretion" />
          <Stack.Screen name="vitality" />
          <Stack.Screen name="sandbox" />
          <Stack.Screen name="technique" />
          <Stack.Screen name="mastery" />
          <Stack.Screen name="copilot" />
          <Stack.Screen name="lesson/[id]" />
          <Stack.Screen name="success-vault" />
          {/* Dev-only Ember showcase (Addendum §8 demo mode); redirects out in prod. */}
          <Stack.Screen name="ember-demo" />
        </Stack>
        {/* Above everything: the app-switcher cover and Face ID gate (E18). */}
        <PrivacyShield />
      </DiscreetProvider>
    </ProtocolProvider>
    </AuthProvider>
  );
}

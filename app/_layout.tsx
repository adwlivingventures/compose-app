import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { ProtocolProvider } from '../context/ProtocolContext';

// Replace with your actual Public API Keys from the RevenueCat Dashboard
const RC_API_KEYS = {
  apple: 'appl_your_apple_api_key_here',
  google: 'goog_your_google_api_key_here',
};

export default function RootLayout() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: RC_API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: RC_API_KEYS.google });
    }
  }, []);

  return (
    <ProtocolProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ProtocolProvider>
  );
}

import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProtocolProvider } from '../context/ProtocolContext';

export default function RootLayout() {
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

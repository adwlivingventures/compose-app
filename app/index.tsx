import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useProtocol } from '../context/ProtocolContext';
import { StatusBar } from 'expo-status-bar';

/**
 * Entry Point Traffic Controller (app/index.tsx)
 * * Securely reads the decrypted purchase receipts on boot.
 * If the session is checking Keychain levels, it shows a premium, slow-pulse spinner.
 * Otherwise, it declaratively redirects to Onboarding or the Main Dashboard Tabs.
 */
export default function Index() {
  const { hasPurchased, loading } = useProtocol();

  // Show premium dark-mode placeholder while local keys are decrypting
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#C89B6D" />
      </View>
    );
  }

  // Non-paid or new users are immediately routed to the diagnostic onboarding flow
  if (!hasPurchased) {
    return <Redirect href="/onboarding" />;
  }

  // Active premium members automatically boot straight into their daily dashboard
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0B09', // Ember ground
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { Settings, RefreshCw } from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat } from '../../hooks/useRevenueCat';

export default function DashboardScreen() {
  const { activeDay, streak, hasPurchased, loading } = useProtocol();
  const { customerInfo, hasProAccess, refreshCustomerInfo } = useRevenueCat();

  // Refresh subscription status when app returns to foreground
  useEffect(() => {
    refreshCustomerInfo();
  }, []);

  const openCustomerCenter = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, go to iPhone Settings → Apple ID → Subscriptions.',
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-slate-400 text-sm">Loading protocol...</Text>
      </View>
    );
  }

  const expiryDate = customerInfo?.entitlements.active['Compose Pro']?.expirationDate;
  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            75-Day Protocol
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">Day {activeDay}</Text>
        </View>
        {hasProAccess && (
          <TouchableOpacity
            onPress={openCustomerCenter}
            activeOpacity={0.8}
            className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mt-1"
          >
            <Settings color="#64748b" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats row */}
      <View className="flex-row mt-6 gap-3">
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <Text className="text-emerald-400 text-2xl font-bold">{streak}</Text>
          <Text className="text-slate-500 text-xs mt-1">Day Streak</Text>
        </View>
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <Text className={`text-2xl font-bold ${hasProAccess ? 'text-emerald-400' : 'text-slate-500'}`}>
            {hasProAccess ? 'Active' : 'Locked'}
          </Text>
          <Text className="text-slate-500 text-xs mt-1">Protocol Status</Text>
        </View>
      </View>

      {/* Subscription info */}
      {hasProAccess && (
        <View className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Compose Pro Active
          </Text>
          {formattedExpiry ? (
            <Text className="text-slate-400 text-xs mt-1">Renews {formattedExpiry}</Text>
          ) : (
            <Text className="text-slate-400 text-xs mt-1">Lifetime access</Text>
          )}
          <TouchableOpacity
            onPress={openCustomerCenter}
            activeOpacity={0.8}
            className="flex-row items-center gap-2 mt-3"
          >
            <Settings color="#64748b" size={14} />
            <Text className="text-slate-500 text-xs">Manage Subscription</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Refresh subscription status */}
      <TouchableOpacity
        onPress={refreshCustomerInfo}
        activeOpacity={0.7}
        className="flex-row items-center justify-center gap-2 mt-6"
      >
        <RefreshCw color="#334155" size={13} />
        <Text className="text-slate-700 text-xs">Refresh subscription status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

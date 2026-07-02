import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { Settings, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat, RC_PRODUCTS, RC_MAINTENANCE_ENTITLEMENT_ID } from '../../hooks/useRevenueCat';
import MainDashboard from '../../components/MainDashboard';

export default function DashboardScreen() {
  const router = useRouter();
  const { completedDays, loading } = useProtocol();
  const {
    hasMaintenanceAccess,
    currentOffering,
    getPackageByProduct,
    purchasePackage,
    isProcessing,
    refreshCustomerInfo,
  } = useRevenueCat();

  // Refresh subscription status when the dashboard mounts
  useEffect(() => {
    refreshCustomerInfo();
  }, []);

  const protocolComplete = completedDays[75]?.completed === true;

  const handleContinuationPurchase = async () => {
    const pack =
      getPackageByProduct(RC_PRODUCTS.continuation) ??
      currentOffering?.availablePackages.find((p) => p.packageType === 'MONTHLY');

    if (!pack) {
      Alert.alert('Offer Unavailable', 'Please check your connection and try again.');
      return;
    }
    await purchasePackage(pack, RC_MAINTENANCE_ENTITLEMENT_ID);
  };

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
        <ActivityIndicator color="#34d399" />
      </View>
    );
  }

  // Post-program state: the protocol is finished — this is the one moment a
  // continuation decision belongs on screen.
  if (protocolComplete) {
    return (
      <ScrollView
        className="flex-1 bg-slate-950"
        contentContainerStyle={{ padding: 24, paddingTop: 96, paddingBottom: 48 }}
      >
        <View className="items-center mb-8">
          <CheckCircle2 color="#34d399" size={48} />
          <Text className="text-white text-2xl font-bold mt-4 text-center">
            75 Days. Complete.
          </Text>
          <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
            The protocol is finished. What you built is yours — it doesn’t expire.
          </Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          {hasMaintenanceAccess ? (
            <>
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Maintenance Toolkit Active
              </Text>
              <Text className="text-slate-400 text-xs mt-1 leading-4">
                Streaks, interactive logs, and maintenance content stay unlocked.
              </Text>
              <TouchableOpacity
                onPress={openCustomerCenter}
                activeOpacity={0.8}
                className="flex-row items-center gap-2 mt-4"
              >
                <Settings color="#64748b" size={14} />
                <Text className="text-slate-500 text-xs">Manage Subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-2">
                <Sparkles color="#94a3b8" size={14} />
                <Text className="text-slate-300 text-sm font-bold">Keep Your Progress Going</Text>
              </View>
              <Text className="text-slate-500 text-xs mt-1 leading-4">
                Continue for $4.99/mo to keep streaks, the Somatic Maintenance Toolkit, and
                interactive logs active.
              </Text>
              <TouchableOpacity
                onPress={handleContinuationPurchase}
                disabled={isProcessing}
                activeOpacity={0.85}
                className="bg-emerald-500 rounded-xl py-3 items-center mt-4"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text className="text-slate-950 font-bold text-sm">Continue — $4.99/mo</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  // During-program state: single-path daily loop, one primary action.
  return <MainDashboard onStartSession={() => router.push('/session')} />;
}

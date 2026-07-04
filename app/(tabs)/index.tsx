import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { Settings, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat, RC_PRODUCTS, RC_MAINTENANCE_ENTITLEMENT_ID } from '../../hooks/useRevenueCat';
import { LocalStore } from '../../services/storage';
import MainDashboard from '../../components/MainDashboard';
import GraduationScreen from '../../components/GraduationScreen';

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

  // Graduation (E19) shows once: after Day 75 completes, until a
  // continuation choice is recorded. 'loading' avoids a one-frame flash of
  // the post-program screen before the stored choice hydrates.
  const [graduationChoice, setGraduationChoice] = useState<string | null | 'loading'>('loading');
  useEffect(() => {
    LocalStore.getItem<string>('@graduation_choice').then((choice) =>
      setGraduationChoice(choice),
    );
  }, []);

  // Refresh subscription status when the dashboard mounts
  useEffect(() => {
    refreshCustomerInfo();
  }, []);

  const protocolComplete = completedDays[75]?.completed === true;

  const handleContinuationPurchase = async (): Promise<boolean> => {
    const pack =
      getPackageByProduct(RC_PRODUCTS.continuation) ??
      currentOffering?.availablePackages.find((p) => p.packageType === 'MONTHLY');

    if (!pack) {
      Alert.alert('Offer Unavailable', 'Please check your connection and try again.');
      return false;
    }
    return purchasePackage(pack, RC_MAINTENANCE_ENTITLEMENT_ID);
  };

  const recordGraduationChoice = async (choice: 'toolkit' | 'export') => {
    await LocalStore.setItem('@graduation_choice', choice);
    setGraduationChoice(choice);
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
      <View className="flex-1 bg-ground items-center justify-center">
        <ActivityIndicator color="#C89B6D" />
      </View>
    );
  }

  // Graduation gate: Day 75 done, no choice recorded yet → E19.
  if (protocolComplete && graduationChoice === 'loading') {
    return <View className="flex-1 bg-ground" />;
  }
  if (protocolComplete && graduationChoice === null) {
    return (
      <GraduationScreen
        isProcessing={isProcessing}
        onKeepToolkit={async () => {
          const granted = await handleContinuationPurchase();
          if (granted) await recordGraduationChoice('toolkit');
          return granted;
        }}
        onExported={() => recordGraduationChoice('export')}
      />
    );
  }

  // Post-program state: the protocol is finished — this is the one moment a
  // continuation decision belongs on screen.
  if (protocolComplete) {
    return (
      <ScrollView
        className="flex-1 bg-ground"
        contentContainerStyle={{ padding: 24, paddingTop: 96, paddingBottom: 48 }}
      >
        <View className="items-center mb-8">
          <CheckCircle2 color="#C89B6D" size={48} />
          <Text className="text-ink text-2xl font-serif-regular mt-4 text-center">
            75 Days. Complete.
          </Text>
          <Text className="text-muted text-sm text-center mt-2 leading-5">
            The protocol is finished. What you built is yours — it doesn’t expire.
          </Text>
        </View>

        <View className="bg-surface border border-line rounded-2xl p-5">
          {hasMaintenanceAccess ? (
            <>
              <Text className="text-accent text-xs font-bold uppercase tracking-widest">
                Maintenance Toolkit Active
              </Text>
              <Text className="text-body text-xs mt-1 leading-4">
                Streaks, interactive logs, and maintenance content stay unlocked.
              </Text>
              {/* First concrete deliverable of the maintenance tier */}
              <TouchableOpacity
                onPress={() => router.push('/copilot')}
                activeOpacity={0.85}
                className="bg-surface-deep border border-line rounded-xl px-4 py-3.5 mt-4 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-ink text-sm font-bold">Somatic Copilot</Text>
                  <Text className="text-muted text-xs mt-0.5 leading-4">
                    Deterministic reframes for intimacy roadblocks, on demand.
                  </Text>
                </View>
                <ChevronRight color="#8A8378" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCustomerCenter}
                activeOpacity={0.8}
                className="flex-row items-center gap-2 mt-4"
              >
                <Settings color="#8A8378" size={14} />
                <Text className="text-muted text-xs">Manage Subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-2">
                <Sparkles color="#B9B2A6" size={14} />
                <Text className="text-body text-sm font-bold">Keep Your Progress Going</Text>
              </View>
              <Text className="text-muted text-xs mt-1 leading-4">
                Continue for $4.99/mo to keep streaks, the Somatic Maintenance Toolkit, and
                interactive logs active.
              </Text>
              <TouchableOpacity
                onPress={handleContinuationPurchase}
                disabled={isProcessing}
                activeOpacity={0.85}
                className="bg-accent rounded-xl py-3 items-center mt-4"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#171310" />
                ) : (
                  <Text className="text-on-accent font-bold text-sm">Continue — $4.99/mo</Text>
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

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { Settings, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { LocalStore } from '../../services/storage';
import { track } from '../../services/analytics';
import MainDashboard from '../../components/MainDashboard';
import GraduationScreen from '../../components/GraduationScreen';
import PhaseTransition, { SignatureData } from '../../components/PhaseTransition';

export default function DashboardScreen() {
  const router = useRouter();
  const { activeDay, completedDays, loading } = useProtocol();
  const {
    hasMembership,
    getAnnualPackage,
    getMonthlyPackage,
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

  // Phase-transition interstitials: fire once on arrival at Day 26/51
  // (re-evaluated when activeDay advances mid-mount — completing Day 25
  // lands here). Arrival at 51 with the Day-26 screen never shown retires
  // it: a stale milestone read late is worse than none.
  const [phaseGate, setPhaseGate] = useState<'loading' | 'none' | 2 | 3>('loading');
  const [signature, setSignature] = useState<SignatureData | null>(null);
  useEffect(() => {
    if (activeDay < 26) {
      setPhaseGate('none');
      return;
    }
    Promise.all([
      LocalStore.getItem<boolean>('@phase_transition_2'),
      LocalStore.getItem<boolean>('@phase_transition_3'),
      LocalStore.getItem<SignatureData>('@signature_data'),
    ]).then(([seen2, seen3, sig]) => {
      setSignature(sig);
      if (activeDay >= 51) setPhaseGate(seen3 ? 'none' : 3);
      else setPhaseGate(seen2 ? 'none' : 2);
    });
  }, [activeDay]);

  const dismissPhaseGate = async (phase: 2 | 3) => {
    await LocalStore.setItem('@phase_transition_2', true);
    if (phase === 3) await LocalStore.setItem('@phase_transition_3', true);
    setPhaseGate('none');
  };

  // Model V2: graduation is an unlock ceremony, not a sales moment — a
  // graduating user already holds the membership that includes Act II. This
  // purchase path exists only for the edge where a lapsed/refunded user
  // reaches this screen; the full graduation UX rewire is deliberately
  // deferred (BUSINESS-MODEL-V2 §4 runway — nobody reaches Day 75 for 75
  // days). Packages resolve from the current Offering (membership terms).
  const continuationPackage = (term: 'annual' | 'monthly') =>
    term === 'annual' ? getAnnualPackage() : getMonthlyPackage();

  const handleContinuationPurchase = async (term: 'annual' | 'monthly'): Promise<boolean> => {
    const pack = continuationPackage(term);
    if (!pack) {
      Alert.alert('Offer Unavailable', 'Please check your connection and try again.');
      return false;
    }
    return purchasePackage(pack);
  };

  // Localized continuation prices from the offering — never hardcoded.
  const annualPriceStr = continuationPackage('annual')?.product.priceString ?? null;
  const monthlyPriceStr = continuationPackage('monthly')?.product.priceString ?? null;

  const recordGraduationChoice = async (choice: 'membership' | 'export') => {
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
        <ActivityIndicator color="#5FD4C1" />
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
        annualPrice={continuationPackage('annual')?.product.priceString ?? null}
        monthlyPrice={continuationPackage('monthly')?.product.priceString ?? null}
        onKeepMembership={async (term) => {
          const granted = await handleContinuationPurchase(term);
          if (granted) await recordGraduationChoice('membership');
          return granted;
        }}
        onExported={() => {
          // §7: the fact of the export, never the record's content.
          track('export_used');
          return recordGraduationChoice('export');
        }}
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
          <CheckCircle2 color="#5FD4C1" size={48} />
          <Text className="text-ink text-2xl font-serif-regular mt-4 text-center">
            75 Days. Complete.
          </Text>
          <Text className="text-muted text-sm text-center mt-2 leading-5">
            The protocol is finished. What you built is yours — it doesn’t expire.
          </Text>
        </View>

        <View className="bg-surface border border-line rounded-2xl p-5">
          {hasMembership ? (
            <>
              <Text className="text-accent text-xs font-bold uppercase tracking-widest">
                Mastery Suite Unlocked
              </Text>
              <Text className="text-body text-xs mt-1 leading-4">
                Included in your membership — streaks, interactive logs, and the
                full suite stay open.
              </Text>
              {/* First concrete deliverable of Act II */}
              <TouchableOpacity
                onPress={() => router.push('/copilot')}
                activeOpacity={0.85}
                className="bg-surface-deep border border-line rounded-xl px-4 py-3.5 mt-4 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-ink text-sm font-bold">Somatic Copilot</Text>
                  <Text className="text-muted text-xs mt-0.5 leading-4">
                    Scenario-matched reframes for intimacy roadblocks, on demand.
                  </Text>
                </View>
                <ChevronRight color="#6B7280" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCustomerCenter}
                activeOpacity={0.8}
                className="flex-row items-center gap-2 mt-4"
              >
                <Settings color="#6B7280" size={14} />
                <Text className="text-muted text-xs">Manage Subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-2">
                <Sparkles color="#9CA3AF" size={14} />
                <Text className="text-body text-sm font-bold">Keep Your Progress Going</Text>
              </View>
              <Text className="text-muted text-xs mt-1 leading-4">
                Renew your membership{annualPriceStr ? ` for ${annualPriceStr} a year` : ''} to
                keep streaks, the Mastery Suite, and interactive logs active.
              </Text>
              <TouchableOpacity
                onPress={() => handleContinuationPurchase('annual')}
                disabled={isProcessing}
                activeOpacity={0.85}
                className="bg-accent rounded-xl py-3 items-center mt-4"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#06232A" />
                ) : (
                  <Text className="text-on-accent font-bold text-sm">
                    {annualPriceStr ? `Continue — ${annualPriceStr}/yr` : 'Keep access'}
                  </Text>
                )}
              </TouchableOpacity>
              {monthlyPriceStr && (
                <TouchableOpacity
                  onPress={() => handleContinuationPurchase('monthly')}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                  className="items-center mt-3"
                >
                  <Text className="text-faint text-xs">or {monthlyPriceStr}/month instead</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  // Phase-transition gate (Days 26/51) — held on ground during the flag
  // read so the interstitial never flashes in over the dashboard.
  if (phaseGate === 'loading') {
    return <View className="flex-1 bg-ground" />;
  }
  if (phaseGate === 2 || phaseGate === 3) {
    const phase = phaseGate;
    return (
      <PhaseTransition
        phase={phase}
        signature={signature}
        onContinue={() => dismissPhaseGate(phase)}
      />
    );
  }

  // During-program state: single-path daily loop, one primary action.
  return <MainDashboard onStartSession={() => router.push('/session')} />;
}

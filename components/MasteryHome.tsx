import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, TrendingUp } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import {
  isMasteryModuleLocked,
  MASTERY_MODULES,
  type MasteryModule,
} from '../content/masteryModules';

/**
 * Post-75 Today-tab home for active members (Act II / III retention
 * architecture). The protocol is complete; this surface is maintenance +
 * the included Mastery Suite — not a sales moment.
 */

function ModuleRow({
  module,
  locked,
  onPress,
}: {
  module: MasteryModule;
  locked: boolean;
  onPress?: () => void;
}) {
  const body = (
    <>
      <View className="flex-row items-center gap-2">
        <Text className="text-ink text-[16px] font-serif-regular flex-1">{module.title}</Text>
        {!locked && <ChevronRight color="#6E8090" size={16} />}
      </View>
      <Text className="text-muted text-[12.5px] leading-5 mt-1.5">{module.description}</Text>
    </>
  );

  if (locked) {
    return (
      <View style={{ opacity: 0.55 }} className="bg-surface border border-line rounded-2xl p-4">
        <View className="self-start bg-surface-deep border border-line-soft rounded-full px-2.5 py-0.5 mb-2">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.14em]">
            Opens Day {module.unlockDay}
          </Text>
        </View>
        {body}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={module.title}
      className="bg-surface border border-line rounded-2xl p-4"
    >
      {body}
    </TouchableOpacity>
  );
}

export default function MasteryHome() {
  const router = useRouter();
  const { hasPurchased, streak } = useProtocol();
  const member = hasPurchased || __DEV__;

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 76, paddingBottom: 48 }}
    >
      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Compose
      </Text>
      <Text className="text-ink text-[28px] font-serif-regular mt-2">Maintenance mode</Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        The 75-day protocol is complete. What you built is yours — these tools keep it alive.
      </Text>

      <View className="bg-surface border border-line rounded-2xl p-5 mt-6">
        <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
          Weekly rhythm
        </Text>
        <Text className="text-ink text-[15px] font-serif-regular mt-1.5">
          Two sessions a week is enough to hold the baseline.
        </Text>
        <Text className="text-muted text-xs leading-4 mt-1.5">
          Revisit any day from the Protocol tab, run a Steady practice when anxiety spikes, and
          check Baseline once a month — the evidence screen is your renewal anchor.
        </Text>
        {streak > 0 && (
          <Text className="text-faint text-xs mt-2">{streak} days of consecutive work logged.</Text>
        )}
      </View>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em] mt-7 mb-3">
        Mastery Suite
      </Text>
      <Text className="text-body text-[13px] leading-5 -mt-1 mb-3">
        Included in your membership — open now.
      </Text>

      <View className="gap-3">
        {MASTERY_MODULES.map((module) => {
          const locked = isMasteryModuleLocked(module, 75, true, member);
          return (
            <ModuleRow
              key={module.title}
              module={module}
              locked={locked}
              onPress={
                locked ? undefined : () => router.push(module.route as never)
              }
            />
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/progress')}
        activeOpacity={0.8}
        accessibilityRole="button"
        className="bg-surface border border-line rounded-2xl px-4 py-4 mt-6 flex-row items-center gap-3"
      >
        <TrendingUp color="#6E8090" size={18} />
        <View className="flex-1">
          <Text className="text-ink text-sm font-bold">Open Baseline</Text>
          <Text className="text-muted text-xs mt-0.5 leading-4">
            Your composure curve, control trend, and the record you built.
          </Text>
        </View>
        <ChevronRight color="#6E8090" size={16} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/mastery')}
        activeOpacity={0.7}
        className="items-center py-4 mt-2"
      >
        <Text className="text-muted text-[13px] font-semibold">View full Mastery Suite →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

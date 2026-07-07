import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useRevenueCat } from '../hooks/useRevenueCat';

/**
 * Mastery Suite — the strategic teaser for the Day-76 continuation
 * ($4.99/mo Somatic Maintenance Toolkit, CLAUDE.md §2).
 *
 * The mechanism is future-pacing: the locked cards let the user rehearse a
 * post-Day-75 identity ("what I graduate into") months before the
 * continuation ask, so the Day-76 offer lands as the next chapter of a
 * story he's already in — not a surprise upsell at the moment of goodbye.
 * One module is visibly previewable to make the tier concrete rather than
 * hypothetical; the rest stay quiet. Locked cards are deliberately inert
 * (no toast, no modal): a locked thing that begs for taps reads as a sales
 * surface, and this screen must stay inside the sanctuary register.
 */

interface MasteryModule {
  title: string;
  description: string;
  route: string;
  /** 'always' = free preview; 'maintenance' = Day 76 + active toolkit. */
  unlock: 'always' | 'maintenance';
  badge?: string;
}

const MODULES: MasteryModule[] = [
  {
    title: 'The Autonomic Sync',
    description:
      'Learn the 3-Second Vagus Sync for partner co-regulation, and test the deterministic ' +
      'Somatic Copilot.',
    route: '/autonomic-sync',
    unlock: 'always',
    badge: 'Unlocked Preview',
  },
  {
    title: 'Sensate Mastery',
    description:
      'Ride the arousal waveform — co-regulation, the dip, and the somatic checkpoint.',
    route: '/lesson/sensate-mastery',
    unlock: 'maintenance',
  },
  {
    title: 'The Refractory Window Guide',
    description: 'The neuro-mechanics of the recovery window — and what quietly holds it open.',
    route: '/lesson/refractory-window',
    unlock: 'maintenance',
  },
  {
    title: 'The Anxious Partner De-escalator',
    description:
      "Scripts to verbally down-regulate your partner's nervous system when intimacy stalls.",
    route: '/lesson/partner-deescalator',
    unlock: 'maintenance',
  },
];
// (Somatic Sandbox moved out of this suite: strategy ruling is a Day-26
// unlock inside the $49.99 tier — it lives in the You-tab Library and
// app/sandbox.tsx, not behind the Day-76 continuation.)

function MasteryModuleCard({
  module,
  locked,
  onPress,
}: {
  module: MasteryModule;
  locked: boolean;
  onPress?: () => void;
}) {
  const { title, description, badge } = module;

  const body = (
    <>
      <View className="flex-row items-center gap-2.5">
        {locked && <Lock color="#6E675D" size={14} />}
        <Text className="text-ink text-[17px] font-serif-regular flex-1">{title}</Text>
        {!locked && <ChevronRight color="#C89B6D" size={16} />}
      </View>
      <Text className="text-muted text-[13px] leading-5 mt-2">{description}</Text>
    </>
  );

  if (locked) {
    // Inert by design — no tap handler, no fake affordance.
    return (
      <View
        style={{ opacity: 0.55 }}
        className="bg-surface border border-line rounded-[18px] p-5"
      >
        {body}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-surface border border-accent/40 rounded-[18px] p-5"
    >
      {badge && (
        <View className="self-start bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1 mb-3">
          <Text className="text-accent text-[10px] font-bold uppercase tracking-[0.14em]">
            {badge}
          </Text>
        </View>
      )}
      {body}
    </TouchableOpacity>
  );
}

export default function MasterySuiteScreen() {
  const router = useRouter();
  const { completedDays } = useProtocol();
  const { hasMaintenanceAccess } = useRevenueCat();
  // Same completion derivation as the Today tab's post-program state.
  const protocolComplete = completedDays[75]?.completed === true;
  const maintenanceUnlocked = protocolComplete && hasMaintenanceAccess;

  const isLocked = (module: MasteryModule) =>
    module.unlock === 'maintenance' && !maintenanceUnlocked;

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 56, paddingBottom: 48 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 mb-5 self-start"
      >
        <ChevronLeft size={16} color="#8A8378" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Phase IV
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">Mastery Suite</Text>

      <View className="bg-surface-deep border border-line-soft rounded-[14px] px-4 py-3 mt-4">
        <Text className="text-muted text-xs">Full Suite unlocks on Day 76.</Text>
      </View>

      <View className="gap-3 mt-5">
        {MODULES.map((module) => {
          const locked = isLocked(module);
          return (
            <MasteryModuleCard
              key={module.title}
              module={module}
              locked={locked}
              onPress={
                locked || !module.route ? undefined : () => router.push(module.route as never)
              }
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

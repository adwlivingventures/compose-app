import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useRevenueCat } from '../hooks/useRevenueCat';

/**
 * Mastery Suite — Act II future-pacing of included membership content
 * (Model V2, CLAUDE.md §2). Everything here is already paid for; it
 * unlocks at graduation, Day 76.
 *
 * The mechanism is future-pacing: the locked cards let the user rehearse a
 * post-Day-75 identity ("what I graduate into") months before he arrives,
 * so graduation lands as the next chapter of a story he's already in —
 * an earned unlock, never a sales moment. One module is visibly
 * previewable to make Act II concrete rather than hypothetical; the rest
 * stay quiet. Locked cards are deliberately inert (no toast, no modal): a
 * locked thing that begs for taps reads as a sales surface, and this
 * screen must stay inside the sanctuary register.
 */

interface MasteryModule {
  title: string;
  description: string;
  route: string;
  /** 'always' = preview; 'maintenance' = Day 76 + active membership (Act II unlock). */
  unlock: 'always' | 'maintenance';
  badge?: string;
}

// Founder review 2026-07-10: the suite lists its real categories, each locked
// until graduation — the Somatic Copilot is one of them (previously it was
// only implied by the preview card, so the suite looked smaller than it is),
// and the partner-technique category was missing entirely. Plain words
// everywhere: he must know exactly what he's getting.
const MODULES: MasteryModule[] = [
  {
    title: 'The Somatic Copilot',
    description:
      'Step-by-step help matched to the real moment — before, during, or after — so you ' +
      'always know your next move.',
    route: '/copilot',
    unlock: 'maintenance',
  },
  {
    title: 'Sensate Mastery',
    description:
      'Stay calm and in control as excitement climbs — instead of rushing or pulling back.',
    route: '/lesson/sensate-mastery',
    unlock: 'maintenance',
  },
  {
    title: 'The Attunement Advantage',
    description:
      'Become the partner she remembers: pacing, touch, and reading her responses in the ' +
      'moment.',
    route: '/lesson/partner-attunement',
    unlock: 'maintenance',
  },
  {
    title: 'The Refractory Window Guide',
    description:
      'What happens in your body after you finish — and how to make round two possible.',
    route: '/lesson/refractory-window',
    unlock: 'maintenance',
  },
  {
    title: 'The Anxious Partner De-escalator',
    description: 'The exact words that calm your partner when a moment stalls.',
    route: '/lesson/partner-deescalator',
    unlock: 'maintenance',
  },
  {
    title: 'The Autonomic Sync',
    // "Open now" — plan-neutral (founder note 2026-07-10: "free" reads wrong
    // to an annual member who already paid for all of this).
    description:
      'A first taste of the Copilot: a 3-second breath trick that settles you and your ' +
      'partner at the same time.',
    route: '/autonomic-sync',
    unlock: 'always',
    badge: 'Open now',
  },
];
// (Somatic Sandbox moved out of this suite: strategy ruling is a Day-26
// unlock inside Act I — it lives in the You-tab Library and
// app/sandbox.tsx, not behind the Day-76 graduation unlock.)

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
        {locked && <Lock color="#4B5563" size={14} />}
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
  const { hasMembership } = useRevenueCat();
  // Same completion derivation as the Today tab's post-program state.
  // Model V2 gate: Day 75 complete + active membership — the Mastery Suite
  // is included membership content that unlocks at graduation, not a tier.
  const protocolComplete = completedDays[75]?.completed === true;
  const maintenanceUnlocked = protocolComplete && hasMembership;

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
        <ChevronLeft size={16} color="#6B7280" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Phase IV
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">Mastery Suite</Text>

      <View className="bg-surface-deep border border-line-soft rounded-[14px] px-4 py-3 mt-4">
        <Text className="text-muted text-xs">
          Included in your membership — unlocks at graduation.
        </Text>
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

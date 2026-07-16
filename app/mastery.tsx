import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';

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
  /** Protocol day the module opens on (founder ruling 2026-07-15: the suite
   *  unlocks in stages across the 75 days, not all at Day 76 — each stage is
   *  a milestone the man climbs toward). */
  unlockDay: number;
}

// Founder ruling 2026-07-15: staggered unlock schedule. The suite is listed
// in the order it opens, so a man mid-protocol sees exactly what he's earned
// and what's still ahead. Descriptions are plain and benefit-first — the man
// should want to reach these; the clinical depth waits inside each feature.
const MODULES: MasteryModule[] = [
  {
    title: 'The Refractory Window Guide',
    description:
      'What’s really happening in your body after you finish — and how to make round two ' +
      'possible.',
    route: '/lesson/refractory-window',
    unlockDay: 1,
  },
  {
    title: 'The Anxious Partner De-escalator',
    description:
      'The right words to steady the moment when things stall — so one hitch never spirals ' +
      'into a bad night.',
    route: '/lesson/partner-deescalator',
    unlockDay: 1,
  },
  {
    title: 'Sensate Mastery',
    description:
      'A step-by-step touch practice with your partner that takes performance off the table — ' +
      'and pulls you closer.',
    route: '/lesson/sensate-mastery',
    unlockDay: 25,
  },
  {
    title: 'The Attunement Advantage',
    description:
      'Read your partner’s signals and own the pace — so you’re the one they can’t stop ' +
      'thinking about.',
    route: '/lesson/partner-attunement',
    unlockDay: 50,
  },
  {
    title: 'The Somatic Copilot',
    description:
      'Your in-the-moment coach. Tell it what’s happening and get your exact next move — ' +
      'before, during, or after.',
    route: '/copilot',
    unlockDay: 75,
  },
];
// (Somatic Sandbox moved out of this suite: strategy ruling is a Day-26
// unlock inside Act I — it lives in the You-tab Library and
// app/sandbox.tsx, not behind this suite.)

function MasteryModuleCard({
  module,
  locked,
  onPress,
}: {
  module: MasteryModule;
  locked: boolean;
  onPress?: () => void;
}) {
  const { title, description, unlockDay } = module;

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
    // Inert by design — no tap handler, no fake affordance. The unlock day
    // is shown as the milestone to climb toward (founder ruling 2026-07-15:
    // he should want to reach it), never as a countdown or loss frame.
    return (
      <View
        style={{ opacity: 0.55 }}
        className="bg-surface border border-line rounded-[18px] p-5"
      >
        <View className="self-start bg-surface-deep border border-line-soft rounded-full px-2.5 py-1 mb-3">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.14em]">
            Unlocks Day {unlockDay}
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
      className="bg-surface border border-accent/40 rounded-[18px] p-5"
    >
      {body}
    </TouchableOpacity>
  );
}

export default function MasterySuiteScreen() {
  const router = useRouter();
  const { activeDay, hasPurchased } = useProtocol();
  // Model V2 gate: included membership content, opened in stages by the
  // protocol day reached (founder ruling 2026-07-15). Membership is checked
  // via the app's own keychain-cached purchase flag (ProtocolContext), NOT
  // the live RevenueCat entitlement — the cached flag is the same signal
  // that unlocks the protocol itself, so it's true for any member on the
  // ring (and, unlike a live RC call, it holds offline). __DEV__ builds
  // bypass the membership check so the suite is testable without a sandbox
  // purchase; the day gate still applies so staggering stays visible.
  const member = hasPurchased || __DEV__;
  const isLocked = (module: MasteryModule) =>
    !member || activeDay < module.unlockDay;

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
        The Mastery Suite
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">What you’re building toward</Text>

      <View className="bg-surface-deep border border-line-soft rounded-[14px] px-4 py-3 mt-4">
        <Text className="text-muted text-xs leading-5">
          Included in your membership. New tools open as you move through the 75 days.
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

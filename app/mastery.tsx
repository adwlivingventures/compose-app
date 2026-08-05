import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import {
  isMasteryModuleLocked,
  MASTERY_MODULES,
  type MasteryModule,
} from '../content/masteryModules';

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
 * stay quiet. Locked cards are deliberately inert (no toast, no modal).
 * Module definitions: content/masteryModules.ts
 */

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
        <Text className="text-ink text-[17px] font-serif-regular flex-1">{title}</Text>
        {/* Deepwater role ruling: the open-card chevron absorbs (muted) — post
            Day 75 all five cards are open, and five aqua marks would break the
            ≤4 accent scarcity rule. No padlock glyph anywhere: gating speaks
            only in "Opens Day N" vocabulary. */}
        {!locked && <ChevronRight color="#6E8090" size={16} />}
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
            Opens Day {unlockDay}
          </Text>
        </View>
        {body}
      </View>
    );
  }

  // Deepwater role ruling: open cards absorb (bg-surface / border-line) —
  // availability is shown by full opacity + chevron, not by an accent border.
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="bg-surface border border-line rounded-[18px] p-5"
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
    isMasteryModuleLocked(module, activeDay, false, member);

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
        <ChevronLeft size={16} color="#6E8090" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        The Mastery Suite
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">What you’re building toward</Text>

      <View className="bg-surface-deep border border-line-soft rounded-[14px] px-4 py-3 mt-4">
        <Text className="text-muted text-xs leading-5">
          Included in your membership. New tools open as you move through the 75 days.
        </Text>
      </View>

      <View className="gap-3 mt-5">
        {MASTERY_MODULES.map((module) => {
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

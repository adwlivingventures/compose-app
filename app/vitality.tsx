import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { LEDGER_ITEMS } from '../content/ledger';
import { TRAINING_ITEMS } from '../content/training';

/**
 * The Vitality Research page — the target of the single "Why are these
 * helpful?" link on the Daily Check-In (founder ruling 2026-07-15: one
 * link, not per-item (i) buttons). Every daily item, in-app and vitality,
 * appears here with its ≤35-word mechanism — sourced from the clinical
 * research notes, rewritten into the wellness lane (no cure/treatment
 * claims, CLAUDE.md §1/§9).
 *
 * Single source of truth: rationales live on the items themselves
 * (content/training.ts, content/ledger.ts) — this page renders them, so
 * check-in copy and research copy can never drift apart.
 */
export default function VitalityScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48 }}
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
        The research
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">
        Why each of these is asked of you
      </Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        Nothing on the Daily Check-In is filler. Each line trains one system your body uses
        for calm, blood flow, or presence.
      </Text>

      <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-7 mb-3">
        Today's Training
      </Text>
      <View className="bg-surface border border-line rounded-2xl px-5 py-1">
        {TRAINING_ITEMS.map((item, i) => (
          <View
            key={item.key}
            className={`py-4 ${i === TRAINING_ITEMS.length - 1 ? '' : 'border-b border-line-soft'}`}
          >
            <Text className="text-ink text-sm font-bold">{item.title}</Text>
            <Text className="text-body text-[13px] leading-5 mt-1.5">{item.rationale}</Text>
          </View>
        ))}
      </View>

      <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-7 mb-3">
        Vitality Check-In
      </Text>
      <View className="bg-surface border border-line rounded-2xl px-5 py-1">
        {LEDGER_ITEMS.map((item, i) => (
          <View
            key={item.key}
            className={`py-4 ${i === LEDGER_ITEMS.length - 1 ? '' : 'border-b border-line-soft'}`}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-ink text-sm font-bold">{item.title}</Text>
              {item.optional && (
                <Text className="text-dim text-[9px] font-bold uppercase tracking-[0.12em] border border-line rounded-full px-2 py-[2px]">
                  Optional
                </Text>
              )}
            </View>
            <Text className="text-faint text-[11.5px] leading-4 mt-1">{item.evaluate}</Text>
            <Text className="text-body text-[13px] leading-5 mt-1.5">{item.rationale}</Text>
          </View>
        ))}
      </View>

      <Text className="text-faint text-xs leading-[17px] mt-4">
        Compose is a wellness and conditioning program, not medical care. Supplements and
        health changes are worth discussing with your physician.
      </Text>
    </ScrollView>
  );
}

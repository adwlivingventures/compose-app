import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Info } from 'lucide-react-native';
import { useProtocol, localDateString, getPhaseForDay } from '../context/ProtocolContext';
import {
  LedgerItem,
  LedgerState,
  ledgerItemsForDay,
  ledgerVotes,
} from '../content/ledger';
import { ChosenCues, CHOSEN_CUES_KEY, cueTextForItem } from '../content/cues';
import { LocalStore } from '../services/storage';

/**
 * The Vitality Ledger — check-anytime surface (founder review 2026-07-12).
 *
 * Why this screen exists: a 9pm retrospective checklist is a memory test
 * that trains "yeah sure" tapping. Items get checked here WHEN THEY HAPPEN —
 * morning light at 8am, the training slot at noon — and the session's
 * checklist stage becomes reconciliation. Three light touches a day put the
 * cue inside his actual life, which is where identity is built; a man who
 * only meets the app for ten minutes at night goes back to the old identity
 * for the other twenty-three hours and fifty minutes.
 *
 * The ledger stays open until midnight — evening items (Screen Sunset) are
 * checkable after the session completes.
 *
 * Votes, not verdicts: counts only. No percentages, no bars, no grades.
 */

const TIMING_LABELS: Record<LedgerItem['timing'], string> = {
  morning: 'Morning',
  day: 'Through the day',
  evening: 'Tonight',
};
const TIMING_ORDER: LedgerItem['timing'][] = ['morning', 'day', 'evening'];

/** Register-aware mirror line (capability → evidence → identity). */
function mirrorLine(phase: 1 | 2 | 3, totalVotes: number): string {
  if (totalVotes === 0) return 'Every checked line is a vote. The count starts today.';
  if (phase === 1) return `${totalVotes} votes cast so far. Each one is training the baseline.`;
  if (phase === 2) return `${totalVotes} votes in the record — evidence, gathered one day at a time.`;
  return `${totalVotes} votes for the man who keeps this ledger.`;
}

export default function LedgerScreen() {
  const router = useRouter();
  const { activeDay, completedDays, lastCompletedDate, updateDailyLedger } = useProtocol();

  // After today's completion activeDay has advanced; the ledger still
  // belongs to the day that was just lived.
  const completedToday = lastCompletedDate === localDateString();
  const day = completedToday ? Math.max(activeDay - 1, 1) : activeDay;
  const phase = getPhaseForDay(day).number;

  const items = ledgerItemsForDay(day);
  const ledger = completedDays[day]?.ledger ?? {};
  const todayVotes = items.filter((i) => ledger[i.key]).length;

  // Lifetime vote count — a cumulative, resilient trajectory (canon §4):
  // counts accrue and are never reset, never percentaged.
  const totalVotes = Object.values(completedDays).reduce(
    (sum, d) => sum + ledgerVotes(d.ledger),
    0,
  );

  const toggle = (key: LedgerItem['key']) =>
    updateDailyLedger(day, { [key]: !ledger[key] } as LedgerState);

  // Cues chosen at the Day-26/51 picker (local-only). Until he has chosen,
  // each item shows its authored second-person suggestion instead.
  const [chosenCues, setChosenCues] = useState<ChosenCues>({});
  useEffect(() => {
    LocalStore.getItem<ChosenCues>(CHOSEN_CUES_KEY).then((cues) => {
      if (cues) setChosenCues(cues);
    });
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 48 }}
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
        Day {day} · The Vitality Ledger
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">
        {todayVotes} of {items.length} votes cast
      </Text>
      <Text className="text-muted text-[13px] leading-5 mt-2">
        Check each line when it happens, not from memory tonight. The ledger stays open until
        midnight.
      </Text>

      {TIMING_ORDER.map((timing) => {
        const group = items.filter((i) => i.timing === timing);
        if (group.length === 0) return null;
        return (
          <View key={timing} className="mt-6">
            <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ml-1">
              {TIMING_LABELS[timing]}
            </Text>
            <View className="gap-2.5">
              {group.map((item) => {
                const on = !!ledger[item.key];
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => toggle(item.key)}
                    activeOpacity={0.8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${item.title}. ${item.question}`}
                    className={`rounded-2xl p-4 border ${
                      on ? 'bg-surface-deep border-line' : 'bg-surface border-line'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Checked = settled evidence, and settled things absorb:
                          sand marks the next step only (accent scarcity, §6) —
                          six lit checkmarks would triple the ≤4 budget. */}
                      <View
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          on ? 'bg-line border-line' : 'border-faint'
                        }`}
                      >
                        {on && <Check color="#E5E7EB" size={14} strokeWidth={3} />}
                      </View>
                      <View className="flex-1">
                        <Text className="text-ink text-sm font-bold">{item.title}</Text>
                        <Text className="text-muted text-xs mt-0.5 leading-4">
                          {item.question}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => router.push('/vitality')}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Why ${item.title} matters — open the Vitality Baseline`}
                        className="p-1"
                      >
                        <Info color="#4B5563" size={16} />
                      </TouchableOpacity>
                    </View>
                    {/* The habit-stacking cue — the implementation intention
                        that binds the behavior to an existing daily constant.
                        His own chosen cue (Day-26/51 picker) renders as a
                        first-person goal echo (italic); until then, the
                        authored second-person suggestion. */}
                    {!on &&
                      (() => {
                        const cue = cueTextForItem(item.key, item.cue, chosenCues);
                        return (
                          <Text
                            className={`text-dim text-[11px] leading-4 mt-2.5 ml-9 ${
                              cue.isChosen ? 'font-serif-italic' : ''
                            }`}
                          >
                            {cue.text}
                          </Text>
                        );
                      })()}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      <Text className="text-body text-[13px] font-serif-italic text-center leading-5 mt-8 px-4">
        {mirrorLine(phase, totalVotes)}
      </Text>
      <Text className="text-faint text-xs text-center mt-3">
        The ledger records. It never judges.
      </Text>
    </ScrollView>
  );
}

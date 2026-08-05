import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { CHOSEN_CUES_KEY, type ChosenCues } from '../content/cues';
import { LocalStore } from '../services/storage';
import {
  LedgerItem,
  ledgerItemsForDay,
  CLEAN_FOCUS_FALTER_LINE,
  VITALITY_SECTION_INTRO,
  VITALITY_EARLY_DAYS_LINE,
} from '../content/ledger';
import { TRAINING_ITEMS, trainingComplete, trainingCount } from '../content/training';

/**
 * The Daily Check-In — the unified surface (founder batch 2026-07-15: the
 * session checklist stage and the Vitality Ledger are now one thing).
 * Rendered as the session's final stage AND behind the Today-tab row; both
 * read and write the same ProtocolContext day record, so an item completed
 * in the session is already checked here and vice versa.
 *
 * Two sections:
 *  1. Today's Training — the five in-app steps, auto-marked as their
 *     session stages complete, manually toggleable (trust-based).
 *  2. Vitality Check-In — the daily discipline stack. Votes, not verdicts.
 *
 * One "Why are these helpful?" link replaces the per-item (i) buttons —
 * it opens the Vitality research page (app/vitality.tsx).
 */

const TIMING_LABELS: Record<LedgerItem['timing'], string> = {
  morning: 'Morning',
  day: 'Through the day',
  evening: 'Tonight',
};
const TIMING_ORDER: LedgerItem['timing'][] = ['morning', 'day', 'evening'];

function CheckRow({
  on,
  title,
  main,
  detail,
  cue,
  tag,
  onToggle,
}: {
  on: boolean;
  title: string;
  main: string;
  detail?: string;
  /** His chosen implementation intention (build order 3.1) — rendered as a
   *  quiet third line. An intention he wrote and never re-reads decays back
   *  into willpower; re-reading it at check-in time is the re-encoding rep,
   *  and every option is first-person present-tense — an identity
   *  impression, not an instruction. Plain small text, not serif italic:
   *  nine italic lines on one card would blow the identity-register budget. */
  cue?: string;
  tag?: string;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${title}. ${main}`}
      className={`rounded-2xl p-4 flex-row items-start gap-3 border ${
        on ? 'bg-surface-deep border-line' : 'bg-surface border-line'
      }`}
    >
      {/* Checked = settled evidence, absorbs (accent scarcity, §6). */}
      <View
        className={`w-6 h-6 rounded-lg items-center justify-center border mt-0.5 ${
          on ? 'bg-line border-line' : 'border-faint'
        }`}
      >
        {on && <Check color="#EDF2F5" size={14} strokeWidth={3} />}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-ink text-sm font-bold">{title}</Text>
          {tag && (
            <Text className="text-dim text-[9px] font-bold uppercase tracking-[0.12em] border border-line rounded-full px-2 py-[2px]">
              {tag}
            </Text>
          )}
        </View>
        <Text className="text-muted text-xs mt-0.5 leading-4">{main}</Text>
        {detail ? (
          <Text className="text-faint text-[11px] mt-1 leading-4">{detail}</Text>
        ) : null}
        {cue ? (
          <Text className="text-dim text-[11px] mt-1 leading-4">“{cue}”</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function DailyCheckIn({
  day,
  onCompleteDay,
  finishing,
}: {
  day: number;
  /** When provided and the day is completable, renders the Complete CTA. */
  onCompleteDay?: () => void;
  finishing?: boolean;
}) {
  const router = useRouter();
  const { completedDays, updateDailyLedger, updateDailyTraining } = useProtocol();
  // His chosen cues (Day 26/51 Cue Picker) — previously stored and rendered
  // NOWHERE, which forfeited the picker's entire payoff (build order 3.1).
  // Pre-Day-26 (or an unpicked item) renders exactly as before.
  const [chosenCues, setChosenCues] = useState<ChosenCues>({});
  useEffect(() => {
    LocalStore.getItem<ChosenCues>(CHOSEN_CUES_KEY).then((c) => {
      if (c) setChosenCues(c);
    });
  }, [day]);
  const dayData = completedDays[day];
  const ledger = dayData?.ledger ?? {};
  const training = dayData?.training ?? {};
  const items = ledgerItemsForDay(day);

  const trainingDone = trainingCount(training);
  const allTrainingDone = trainingComplete(training);
  const checkedCount = items.filter((i) => ledger[i.key]).length;
  const showFalterLine = checkedCount >= 2 && !ledger.cleanFocus;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
      {/* ── Section 1: Today's Training ── */}
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ml-1">
        Today’s Training
      </Text>
      <Text className="text-muted text-xs mb-3 ml-1">
        {trainingDone} of {TRAINING_ITEMS.length} complete — the session marks these as you go.
      </Text>
      <View className="gap-2.5 mb-6">
        {TRAINING_ITEMS.map((item) => (
          <CheckRow
            key={item.key}
            on={!!training[item.key]}
            title={item.title}
            main={item.line}
            onToggle={() => updateDailyTraining(day, { [item.key]: !training[item.key] })}
          />
        ))}
      </View>

      {/* ── Section 2: Vitality Check-In ── */}
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ml-1">
        Vitality Check-In
      </Text>
      <Text className="text-muted text-xs mb-3 ml-1 leading-4">{VITALITY_SECTION_INTRO}</Text>
      {/* Days 1–7 only: pre-frames a low count as the normal start, not a
          failing grade (votes, not verdicts). Retires once his own record
          exists (2026-08-03, build order 0.6). */}
      {day <= 7 && (
        <Text className="text-faint text-xs mb-3 ml-1 leading-4">{VITALITY_EARLY_DAYS_LINE}</Text>
      )}

      {TIMING_ORDER.map((timing) => {
        const group = items.filter((i) => i.timing === timing);
        if (group.length === 0) return null;
        return (
          <View key={timing} className="mb-4">
            <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ml-1">
              {TIMING_LABELS[timing]}
            </Text>
            <View className="gap-2.5">
              {group.map((item) => (
                <CheckRow
                  key={item.key}
                  on={!!ledger[item.key]}
                  title={item.title}
                  main={item.question}
                  detail={item.evaluate}
                  cue={chosenCues[item.key]?.text}
                  tag={item.optional ? 'Optional' : undefined}
                  onToggle={() => updateDailyLedger(day, { [item.key]: !ledger[item.key] })}
                />
              ))}
            </View>
          </View>
        );
      })}

      {/* The one research link on the screen (founder ruling: no per-item
          (i) buttons) — opens the Vitality research page. */}
      <TouchableOpacity
        onPress={() => router.push('/vitality')}
        activeOpacity={0.7}
        accessibilityRole="button"
        className="items-center py-2 mb-2"
      >
        <Text className="text-accent text-[13px] font-semibold">Why are these helpful?</Text>
      </TouchableOpacity>

      {showFalterLine && (
        <Text className="text-muted text-xs leading-4 px-2 mb-4">
          {CLEAN_FOCUS_FALTER_LINE}
        </Text>
      )}

      {onCompleteDay && (
        <>
          <TouchableOpacity
            onPress={onCompleteDay}
            disabled={finishing || !allTrainingDone}
            activeOpacity={0.85}
            className={`rounded-2xl py-4 items-center mt-2 ${
              allTrainingDone ? 'bg-accent' : 'bg-line'
            }`}
          >
            {finishing ? (
              <ActivityIndicator color="#06232A" />
            ) : (
              <Text className="text-on-accent font-bold text-base">Complete Day {day}</Text>
            )}
          </TouchableOpacity>
          {!allTrainingDone && (
            <Text className="text-faint text-xs text-center mt-3 leading-4">
              Today’s Training closes the day — finish or check the five items above.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

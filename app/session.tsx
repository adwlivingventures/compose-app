import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check, Info } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useDiscreet } from '../context/DiscreetContext';
import { getAnchorForDay } from '../content/anchors';
import {
  LedgerState,
  LedgerItem,
  ledgerItemsForDay,
  CLEAN_FOCUS_FALTER_LINE,
  LEDGER_INTRO_LINES,
} from '../content/ledger';
import {
  anchorIntroForDay,
  checklistHeaderForDay,
  checklistFooterForDay,
} from '../content/sessionCopy';
import { LocalStore } from '../services/storage';
import { enableDailyReminder, notificationsPresent } from '../services/notifications';
import AudioPlayer from '../components/AudioPlayer';
import ConditioningTrack from '../components/ConditioningTrack';
import TriageCenter from '../components/TriageCenter';
import SomaticPrimer from '../components/SomaticPrimer';

/**
 * Daily Session — the full loop (CLAUDE.md §5), one linear all-or-nothing flow:
 *
 *   1. Auditory Anchor      → audio finishing advances the stage
 *   2. Conditioning Track   → paced breath + pelvic-floor sequence
 *   3. Control Score        → 1–5 self-rating
 *   4. Vitality Checklist   → three binary check-ins
 *
 * The day is marked complete only after all four stages — the ring's advance
 * is dispensed for the whole behavior, not a fraction of it. Each stage shows
 * exactly one task; there is no way to jump ahead.
 */

type Stage = 'anchor' | 'conditioning' | 'score' | 'checklist';

const STAGE_LABELS: Record<Stage, string> = {
  anchor: 'The Anchor',
  conditioning: 'Conditioning',
  score: 'Control',
  checklist: 'Check-In',
};

const STAGE_ORDER: Stage[] = ['anchor', 'conditioning', 'score', 'checklist'];

const SCORE_LABELS = ['Very little', 'Slight', 'Moderate', 'Strong', 'Complete ease'];

// The ledger stage groups items by where the behavior lived in the day —
// reconciliation reads chronologically, which aids honest recall.
const TIMING_LABELS: Record<LedgerItem['timing'], string> = {
  morning: 'Morning',
  day: 'Through the day',
  evening: 'Tonight',
};
const TIMING_ORDER: LedgerItem['timing'][] = ['morning', 'day', 'evening'];

export default function SessionScreen() {
  const router = useRouter();
  const { activeDay, markDayComplete, completedDays } = useProtocol();
  // Pin the day at mount — completion advances activeDay while this screen
  // is still up; the UI shouldn't flicker to tomorrow's number.
  const dayRef = useRef(activeDay);
  const [stage, setStage] = useState<Stage>('anchor');
  const [pelvicRating, setPelvicRating] = useState(0);
  // Seed from any check-anytime writes (the Today-tab ledger row): items
  // checked when they happened arrive here already true — the session
  // stage is reconciliation, not a memory test.
  const [ledger, setLedger] = useState<LedgerState>(
    () => ({ ...completedDays[dayRef.current]?.ledger }),
  );
  const [finishing, setFinishing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [askReminder, setAskReminder] = useState(false);
  const [enablingReminder, setEnablingReminder] = useState(false);
  const { setNotifications } = useDiscreet();

  const day = dayRef.current;
  const anchor = getAnchorForDay(day);
  const stageIndex = STAGE_ORDER.indexOf(stage);

  // Ledger derivations for the reconciliation stage.
  const items = ledgerItemsForDay(day);
  const checkedCount = items.filter((i) => ledger[i.key]).length;
  // A new item's first day: Day 26 introduces training, Day 51 the unclench.
  const introLine =
    day === 26
      ? LEDGER_INTRO_LINES.training
      : day === 51
      ? LEDGER_INTRO_LINES.tensionAudit
      : null;
  const showFalterLine = checkedCount >= 2 && !ledger.cleanFocus;

  // Day 1 gate: the Somatic Primer must be acknowledged before the first
  // session — the conditioning track's "soften" cue presumes the reverse-
  // kegel motor skill it teaches. Completion persists, so it never reshows
  // (leaving via X keeps the gate armed for the next attempt).
  const [primerState, setPrimerState] = useState<'loading' | 'show' | 'done'>(
    day === 1 ? 'loading' : 'done',
  );
  useEffect(() => {
    if (day !== 1) return;
    LocalStore.getItem<boolean>('@somatic_primer_done').then((done) =>
      setPrimerState(done ? 'done' : 'show'),
    );
  }, []);

  const handleComplete = async (finalLedger: LedgerState) => {
    if (finishing) return;
    setFinishing(true);
    await markDayComplete(day, {
      completed: true,
      pelvicRating,
      ledger: finalLedger,
    });
    // Day-1 only: the reminder opt-in rides the completion high (a
    // post-success ask converts far better than a cold-start permission
    // grab, and the hour he just finished at IS the schedule). Gated on the
    // module being present — never show an ask the build can't honor.
    if (day === 1 && notificationsPresent) {
      setAskReminder(true);
      return;
    }
    // Land back on the dashboard so the ring's advance is the closing image.
    router.back();
  };

  const handleEnableReminder = async () => {
    if (enablingReminder) return;
    setEnablingReminder(true);
    const now = new Date();
    const result = await enableDailyReminder({
      hour: now.getHours(),
      minute: now.getMinutes(),
    });
    // A denied system prompt is a decision, not an error — no nagging,
    // the E18 row remains the way back in.
    setNotifications(result === 'scheduled');
    router.back();
  };

  const advance = () => {
    const next = STAGE_ORDER[stageIndex + 1];
    if (next) setStage(next);
  };

  // Hold ground while the primer flag loads (one AsyncStorage read) so a
  // Day 1 user never sees a frame of session before the gate resolves.
  if (primerState === 'loading') return <View className="flex-1 bg-ground" />;

  if (primerState === 'show') {
    return (
      <SomaticPrimer
        onComplete={() => {
          LocalStore.setItem('@somatic_primer_done', true);
          setPrimerState('done');
        }}
        onExit={() => router.back()}
      />
    );
  }

  // Day-1 reminder opt-in (post-success ask). One decision, quiet exit —
  // the notification preview is shown verbatim so consent is informed: he
  // sees exactly what a stranger's glance at his lock screen would see.
  if (askReminder) {
    return (
      <View className="flex-1 bg-ground px-7 justify-center">
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Day one complete
        </Text>
        <Text className="text-ink text-[26px] font-serif-regular leading-9 mt-2.5">
          Same time tomorrow?
        </Text>
        <Text className="text-muted text-[13.5px] leading-5 mt-3">
          One quiet line at this hour each day. This is the whole notification — nothing a
          glance at your lock screen could read into:
        </Text>

        <View className="bg-surface border border-line rounded-[14px] px-4 py-3.5 mt-5">
          <Text className="text-ink text-[13px] font-bold">Compose</Text>
          <Text className="text-body text-[13px] mt-0.5">Today's session is ready.</Text>
        </View>
        <Text className="text-faint text-[11.5px] leading-4 mt-2.5">
          Never a streak warning. Never a word about the work. Turn it off any time under
          Discretion.
        </Text>

        <TouchableOpacity
          onPress={handleEnableReminder}
          disabled={enablingReminder}
          activeOpacity={0.85}
          className="bg-accent rounded-2xl py-[17px] items-center mt-8"
        >
          {enablingReminder ? (
            <ActivityIndicator color="#0C0B09" />
          ) : (
            <Text className="text-on-accent font-bold text-base">Remind me at this hour</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={enablingReminder}
          activeOpacity={0.7}
          className="items-center py-4"
        >
          <Text className="text-muted text-[13px] font-semibold">Not now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ground px-6 pt-16">
      <View className="flex-row items-center justify-between">
        {/* Stage dots — orientation without navigation; they are not tappable */}
        <View className="flex-row items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <View
              key={s}
              className={`h-1.5 rounded-full ${
                i < stageIndex ? 'bg-accent w-4' : i === stageIndex ? 'bg-accent w-8' : 'bg-surface-deep w-4'
              }`}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="bg-surface border border-line rounded-full p-2.5"
        >
          <X color="#6B7280" size={18} />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-4">
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
          Day {day} · {STAGE_LABELS[stage]}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        {stage === 'anchor' && (
          <View>
            {/* Rotating shell copy (content/sessionCopy.ts) — the ritual
                skeleton is invariant; the wording stops being copy-paste. */}
            <Text className="text-muted text-sm text-center leading-5 px-4 mb-8">
              {anchorIntroForDay(day)}
            </Text>
            <AudioPlayer
              title={anchor.title}
              focus={anchor.focus}
              source={anchor.source}
              onComplete={advance}
            />
          </View>
        )}

        {stage === 'conditioning' && <ConditioningTrack day={day} onComplete={advance} />}

        {stage === 'score' && (
          <View className="items-center">
            <Text className="text-ink text-2xl font-serif-regular text-center px-4">
              How much ease did you feel through the sequence?
            </Text>
            <Text className="text-muted text-xs text-center mt-2 leading-4 px-8">
              There is no good or bad answer — this is a signal you're learning to read, not a grade.
            </Text>
            <View className="flex-row gap-3 mt-8">
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => {
                    setPelvicRating(n);
                    advance();
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} of 5 — ${SCORE_LABELS[n - 1]}`}
                  className="w-14 h-14 rounded-2xl bg-surface border border-line items-center justify-center"
                >
                  <Text className="text-ink text-2xl font-serif-light">{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full px-2 mt-3">
              <Text className="text-faint text-xs">{SCORE_LABELS[0]}</Text>
              <Text className="text-faint text-xs">{SCORE_LABELS[4]}</Text>
            </View>
          </View>
        )}

        {stage === 'checklist' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            <Text className="text-ink text-2xl font-serif-regular text-center px-4 mb-1">
              {checklistHeaderForDay(day)}
            </Text>
            <Text className="text-muted text-xs text-center mb-5">
              {checkedCount} of {items.length} votes already cast today
            </Text>

            {/* Phase-entry introduction — shown on the day a new item joins
                the ledger (progression the user can feel; content/ledger.ts). */}
            {introLine && (
              <View className="bg-surface-deep border border-line rounded-2xl px-4 py-3.5 mb-4">
                <Text className="text-accent-soft text-xs leading-5">{introLine}</Text>
              </View>
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
                    {group.map((item) => {
                      const on = !!ledger[item.key];
                      return (
                        <TouchableOpacity
                          key={item.key}
                          onPress={() =>
                            setLedger(
                              (l) => ({ ...l, [item.key]: !l[item.key] } as LedgerState),
                            )
                          }
                          activeOpacity={0.8}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: on }}
                          accessibilityLabel={`${item.title}. ${item.question}`}
                          className={`rounded-2xl p-4 flex-row items-center gap-3 border ${
                            on ? 'bg-surface-deep border-line' : 'bg-surface border-line'
                          }`}
                        >
                          {/* Checked = settled evidence, absorbs (accent
                              scarcity, §6): sand on this screen belongs to
                              the CTA and progress fill, not past votes. */}
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
                          {/* The Vitality Baseline reference, at the moment
                              it's relevant — the (i) must not toggle. */}
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
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Relapse-normalization at the abstinence-violation moment: the
                one slip that catastrophizes into deletion. Shown only once
                he's engaged with the list (≥2 checks) and Clean Focus stays
                unchecked — quiet, inline, next-vote-facing. */}
            {showFalterLine && (
              <Text className="text-muted text-xs leading-4 px-2 mb-4">
                {CLEAN_FOCUS_FALTER_LINE}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => handleComplete(ledger)}
              disabled={finishing}
              activeOpacity={0.85}
              className="bg-accent rounded-2xl py-4 items-center mt-2"
            >
              {finishing ? (
                <ActivityIndicator color="#0C0B09" />
              ) : (
                <Text className="text-on-accent font-bold text-base">Complete Day {day}</Text>
              )}
            </TouchableOpacity>
            <Text className="text-faint text-xs text-center mt-3 leading-4">
              {checklistFooterForDay(day)}
            </Text>
          </ScrollView>
        )}
      </View>

      {/* SOS — reachable mid-session too (§6: one tap from anywhere).
          Unboxed per E09/E10: a quiet presence, not a competing CTA. */}
      <TouchableOpacity
        onPress={() => setSosVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Steady me — open calming support right now"
        className="items-center flex-row justify-center gap-2 py-2.5 mb-6"
      >
        <View className="w-1.5 h-1.5 rounded-full bg-accent" />
        <Text className="text-muted text-[13px] font-semibold">Steady me — right now</Text>
      </TouchableOpacity>

      {__DEV__ && stage !== 'checklist' && (
        <TouchableOpacity onPress={advance} activeOpacity={0.7} className="items-center pb-10">
          <Text className="text-dim text-xs">Skip stage (dev only)</Text>
        </TouchableOpacity>
      )}

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

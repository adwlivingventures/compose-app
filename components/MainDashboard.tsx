import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Check, Play } from 'lucide-react-native';
import { useProtocol, localDateString } from '../context/ProtocolContext';
import { getProtocolDay } from '../content/ProtocolData';
import { getTonightLine } from '../content/tonightLines';
import { fieldNoteForDay } from '../content/fieldNotes';
import { ledgerItemsForDay, VITALITY_ASYNC_LINE, VITALITY_FULL_STACK_LINE } from '../content/ledger';
import { TRAINING_ITEMS, trainingDurationMin } from '../content/training';
import { getComposureHistory, getDueMilestone } from '../services/composureHistory';
import { useDiscreet } from '../context/DiscreetContext';
import { LocalStore } from '../services/storage';
import TriageCenter from './TriageCenter';
import WhyEcho from './WhyEcho';
import DayOneOrientation from './DayOneOrientation';
import ReminderBackstopCard, { useReminderBackstop } from './ReminderBackstopCard';
import AttributionCard, { useAttributionPrompt } from './AttributionCard';

const ORIENTATION_KEY = '@day_one_orientation_seen';
const FULL_STACK_NOTICE_KEY = '@vitality_full_stack_notice_seen';

/**
 * Today dashboard — Deepwater phase 3 rebuild (claude/DEEPWATER-FLOW-MAP.md
 * §4 B1; concept 01). E08 (session pending) and E13 (completed) states.
 *
 * Structure, pending: greeting → last-7-protocol-days strip → day ring →
 * phase/focus → CTA (resume-aware) → training timeline → cards. The timeline
 * is the Headspace-pattern open loop: five steps with states, so the next
 * incomplete step is visible before the CTA is ever pressed (Zeigarnik pull).
 *
 * E13 deliberately offers no next action: the completed state is closure,
 * not a hook — the timeline HIDES after completion (a finished task list is
 * clutter; a visible one at night reads as nagging). The only interactive
 * element after completion is the Steady-me pill, because anxiety doesn't
 * check whether today's session is done.
 *
 * Accent budget (≤4): ring arc, CTA, next-step node, Steady-me stays matte
 * SOS-toned. Accent unification (founder ruling 2026-07-25): aqua is the only
 * accent on this screen — ember survives solely in the sealed-day Check.
 */

const PHASE_NUMERALS = ['I', 'II', 'III'];

/** Time-of-day greeting. Shielded (and never-chosen) level: nameless — the
 *  home screen stays unremarkable over a shoulder (§6). Personal level
 *  (2026-08-03, build order 1.3): his first name joins the three standard
 *  greetings — a daily identity rep for the man who chose it. The 3am line
 *  stays nameless at every level: it is written for a man who does not want
 *  to be addressed, only accompanied. */
function greeting(firstName: string | null): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still here. Good.';
  const base = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return firstName ? `${base}, ${firstName}.` : `${base}.`;
}

// ─── Progress Ring (Deepwater: aqua arc = earned progress) ───────────────────

const RING_SIZE = 236;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ day, completedToday }: { day: number; completedToday: boolean }) {
  // Count today's session in the ring the moment it's done — the visible jump
  // in the arc is the completion reward.
  const daysDone = Math.min(day - 1 + (completedToday ? 1 : 0), 75);
  const progress = daysDone / 75;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#182430"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#5FD4C1"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        {completedToday ? (
          <>
            {/* Sealed day = identity moment → ember (§1). */}
            <Check color="#C89B6D" size={26} style={{ marginBottom: 6 }} />
            <Text className="text-ink text-[54px] font-serif-light leading-[58px]">{day}</Text>
            <Text className="text-faint text-[13px] mt-0.5">
              {day === 1 ? 'day composed' : 'days composed'}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.24em]">
              Day
            </Text>
            <Text className="text-ink text-[62px] font-serif-light leading-[66px]">{day}</Text>
            <Text className="text-faint text-[13px]">of seventy-five</Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Last-7-protocol-days strip ──────────────────────────────────────────────
// Protocol days, not calendar days (ruling R1): a missed calendar day never
// renders as a gap — the strip shows the last seven days OF THE WORK, so
// returning after a pause shows an unbroken line of what he has actually
// done. Evidence, never jeopardy.

function DayStrip({
  activeDay,
  completedToday,
}: {
  activeDay: number;
  completedToday: boolean;
}) {
  const start = Math.max(1, activeDay - 6);
  const days: number[] = [];
  for (let d = start; d <= activeDay; d++) days.push(d);
  return (
    <View className="flex-row justify-center mt-4" style={{ gap: 14 }}>
      {days.map((d) => {
        const done = d < activeDay || (d === activeDay && completedToday);
        const isToday = d === activeDay;
        return (
          <View key={d} className="items-center" style={{ gap: 5 }}>
            <View
              className={`w-[26px] h-[26px] rounded-full items-center justify-center border ${
                done
                  ? 'bg-line border-line'
                  : isToday
                    ? 'border-accent'
                    : 'border-line-soft'
              }`}
            >
              {/* Done days absorb (accent scarcity) — only today carries the current. */}
              {done && <Check color="#93A4B0" size={12} strokeWidth={2.5} />}
            </View>
            <Text className={`text-[9px] tracking-wide ${isToday ? 'text-body' : 'text-faint'}`}>
              {d}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Training timeline (Headspace pattern: sequenced steps with states) ──────

function TrainingTimeline({ done, nextIndex }: { done: boolean[]; nextIndex: number }) {
  const totalMin = trainingDurationMin();
  return (
    <View className="bg-surface border border-line rounded-2xl px-4 py-1.5 mt-3">
      <View className="flex-row items-baseline justify-between py-3 border-b border-line-soft">
        <Text className="text-ink text-[13px] font-semibold">Today&apos;s session</Text>
        <Text className="text-faint text-[11px]">~{totalMin} min · 5 steps</Text>
      </View>
      {TRAINING_ITEMS.map((item, i) => {
        const isDone = done[i];
        const isNext = i === nextIndex;
        const last = i === TRAINING_ITEMS.length - 1;
        return (
          <View
            key={item.key}
            className={`flex-row items-center py-3 ${last ? '' : 'border-b border-line-soft'}`}
            style={{ gap: 12 }}
          >
            <View
              className={`w-[26px] h-[26px] rounded-full items-center justify-center border ${
                isDone
                  ? 'bg-line border-line'
                  : isNext
                    ? 'border-accent'
                    : 'border-line-soft'
              }`}
            >
              {isDone ? (
                <Check color="#93A4B0" size={12} strokeWidth={2.5} />
              ) : (
                <Text className={`text-[11px] ${isNext ? 'text-accent' : 'text-faint'}`}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              className={`flex-1 text-[13.5px] ${
                isDone ? 'text-muted' : isNext ? 'text-ink font-semibold' : 'text-faint'
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-faint text-[10px] w-8 text-right">{item.durationMin}m</Text>
            {isNext && (
              <Text className="text-accent text-[10px] font-bold uppercase tracking-[0.14em] ml-1">
                Up next
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MainDashboard({ onStartSession }: { onStartSession: () => void }) {
  const router = useRouter();
  const { activeDay, streak, lastCompletedDate, completedDays, updateDailyLedger } =
    useProtocol();
  const [sosVisible, setSosVisible] = useState(false);

  // Discretion level → greeting register (build order 1.3). The name joins
  // the greeting ONLY at the user-chosen Personal level; Shielded and the
  // never-chosen null stay nameless, byte-identical to the prior behavior.
  const { level, setNotifications } = useDiscreet();
  const [firstName, setFirstName] = useState<string | null>(null);
  useEffect(() => {
    LocalStore.getItem<string>('@user_first_name').then(setFirstName);
  }, []);
  const greetName = level === 'personal' ? firstName : null;

  // Day 1 orientation — one-time sheet before the first session.
  const [showOrientation, setShowOrientation] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (activeDay !== 1) return;
      let alive = true;
      LocalStore.getItem<boolean>(ORIENTATION_KEY).then((seen) => {
        if (alive && !seen) setShowOrientation(true);
      });
      return () => {
        alive = false;
      };
    }, [activeDay]),
  );
  const dismissOrientation = async (beginSession: boolean) => {
    await LocalStore.setItem(ORIENTATION_KEY, true);
    setShowOrientation(false);
    if (beginSession) onStartSession();
  };

  const { show: showReminderBackstop, dismiss: dismissReminderBackstop } =
    useReminderBackstop(activeDay);
  const { show: showAttribution, dismiss: dismissAttribution } = useAttributionPrompt(activeDay);

  const [showFullStackNotice, setShowFullStackNotice] = useState(false);

  // Composure re-measurement due?
  // clears the moment a reading is taken and appears the day a milestone
  // lands (Days 14/40/75 — canon §8's "measured, not promised" cadence).
  const [dueMilestone, setDueMilestone] = useState<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getComposureHistory().then((history) => {
        if (alive) setDueMilestone(getDueMilestone(activeDay, history));
      });
      return () => {
        alive = false;
      };
    }, [activeDay]),
  );

  const completedToday = lastCompletedDate === localDateString();
  // After today's completion the ring should show the day just finished,
  // not tomorrow's number — activeDay has already advanced.
  const displayDay = completedToday ? Math.max(activeDay - 1, 1) : activeDay;
  const todayMeta = getProtocolDay(displayDay);
  const focusLine = todayMeta.focus.replace(/\.$/, '');

  // Today's Training state — drives the timeline and the resume-aware CTA.
  const training = completedDays[activeDay]?.training ?? {};
  const stepDone = TRAINING_ITEMS.map((item) => Boolean(training[item.key]));
  const stepsDone = stepDone.filter(Boolean).length;
  const nextIndex = stepDone.findIndex((d) => !d);
  const midLoop = !completedToday && stepsDone > 0;

  // The check-anytime ledger card (content/ledger.ts): items get checked when
  // they happen, so the app's cue lives inside the day, not just at night.
  // The card surfaces what is LEFT — checked items absorb out of view.
  const ledgerItems = ledgerItemsForDay(displayDay);
  const ledgerState = completedDays[displayDay]?.ledger ?? {};
  const ledgerCount = ledgerItems.filter((i) => ledgerState[i.key]).length;
  const ledgerRemaining = ledgerItems.filter((i) => !ledgerState[i.key]);
  // Milestone field note — authored arc texture, only on keyed days.
  const fieldNote = completedToday ? fieldNoteForDay(displayDay) : null;

  useEffect(() => {
    if (activeDay !== 8) return;
    LocalStore.getItem<boolean>(FULL_STACK_NOTICE_KEY).then((seen) => {
      if (!seen) setShowFullStackNotice(true);
    });
  }, [activeDay]);
  const dismissFullStackNotice = async () => {
    await LocalStore.setItem(FULL_STACK_NOTICE_KEY, true);
    setShowFullStackNotice(false);
  };

  return (
    <View className="flex-1 bg-ground">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 76, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: wordmark + the Steady-me pill (§6 — SOS one tap away,
            identical in both states). The pill dot is matte SOS clay, not the
            aqua current — SOS never competes for the action accent. */}
        <View className="flex-row items-center justify-between">
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
            Compose
          </Text>
          <TouchableOpacity
            onPress={() => setSosVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Steady me — open calming support right now"
            className="flex-row items-center gap-1.5 bg-surface border border-line rounded-full px-3.5 py-[7px]"
          >
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C96A55' }} />
            <Text className="text-body text-xs font-semibold">Steady me</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting + phase context (greeting register is level-driven —
            see greeting()). The Return (flow map §4 F1): after a ≥2-day gap
            the greeting becomes one line of repair, never arithmetic of what
            was missed — the modal moment of churn is the shame of coming
            back. Under it, HIS OWN reason from Day 0 (build order 2.2): the
            one voice that can meet the "I can't even do this right" script
            at the door is his. Repair surfaces only — never ordinary days. */}
        {(() => {
          const isReturn =
            !completedToday &&
            !!lastCompletedDate &&
            Date.now() - new Date(`${lastCompletedDate}T12:00:00`).getTime() >
              2.2 * 24 * 60 * 60 * 1000;
          return (
            <View className="mt-7">
              <Text className="text-ink text-[15px] font-serif-regular">
                {isReturn ? `Day ${activeDay} is still yours. Nothing was lost.` : greeting(greetName)}
              </Text>
              <Text className="text-muted text-[10.5px] font-bold uppercase tracking-[0.2em] mt-1.5">
                Phase {PHASE_NUMERALS[todayMeta.phase - 1]} · {todayMeta.phaseTitle}
              </Text>
              {isReturn && <WhyEcho compact />}
            </View>
          );
        })()}

        <DayStrip activeDay={displayDay} completedToday={completedToday} />

        <View className="items-center mt-4">
          <ProgressRing day={displayDay} completedToday={completedToday} />

          {completedToday ? (
            <>
              <Text className="text-ink text-xl font-serif-regular mt-5">Today is complete.</Text>
              <Text className="text-muted text-[13.5px] text-center leading-5 mt-2">
                Day {Math.min(displayDay + 1, 75)} unlocks at midnight.{'\n'}Rest is part of the
                work.
              </Text>
            </>
          ) : (
            <>
              <Text className="text-ink text-[21px] font-serif-regular mt-4 text-center">
                {todayMeta.title}
              </Text>
              <Text className="text-muted text-[13px] mt-1.5 text-center leading-5">
                {focusLine}
              </Text>
            </>
          )}
        </View>

        <View className="mt-6">
          {showAttribution && !completedToday && (
            <AttributionCard onDismiss={dismissAttribution} />
          )}

          {showReminderBackstop && !completedToday && (
            <ReminderBackstopCard
              onDismiss={dismissReminderBackstop}
              onScheduled={() => setNotifications(true)}
            />
          )}

          {showFullStackNotice && (
            <View className="bg-surface-deep border border-line rounded-2xl px-[18px] py-4 mb-3">
              <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
                Day eight
              </Text>
              <Text className="text-body text-[13px] leading-5 mt-1.5">
                {VITALITY_FULL_STACK_LINE}
              </Text>
              <TouchableOpacity onPress={dismissFullStackNotice} activeOpacity={0.7} className="mt-2">
                <Text className="text-muted text-xs font-semibold">Got it</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Re-measurement card — deliberately matte (accent budget spent on
              ring arc, CTA, next-step node). Shown in the completed state too:
              a scheduled evidence milestone is delivery on an onboarding
              promise, not an engagement hook. */}
          {dueMilestone !== null && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/remeasure', params: { day: String(dueMilestone) } })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Day ${dueMilestone} composure re-measurement — begin now`}
              className="bg-surface border border-line rounded-2xl px-[18px] py-4 mb-3"
            >
              <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
                Day {dueMilestone} re-measurement
              </Text>
              <Text className="text-ink text-[15px] font-serif-regular mt-1">
                Measure the loop again
              </Text>
              <Text className="text-muted text-xs mt-1 leading-4">
                Same questions as Day 0 · about three minutes · evidence, not a promise
              </Text>
            </TouchableOpacity>
          )}

          {completedToday ? (
            <>
              {/* Milestone field note — the arc made visible at authored
                  thresholds (anti-hedonic-adaptation; content/fieldNotes.ts). */}
              {fieldNote && (
                <View className="bg-surface-deep border border-line rounded-2xl px-[18px] py-4 mb-3">
                  <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
                    Field note · Day {displayDay}
                  </Text>
                  <Text className="text-body text-[13px] leading-5 mt-1.5">{fieldNote}</Text>
                </View>
              )}
              {/* Tonight's line — the day's authored identity line read back as
                  a quote (content/tonightLines.ts), focus string as the
                  fallback. Closure, no next-action pressure. Ink, serif italic
                  (accent unification 2026-07-25). */}
              <View className="bg-surface border border-line rounded-2xl px-[18px] py-4">
                <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
                  Tonight's line
                </Text>
                <Text className="text-ink text-sm leading-[22px] font-serif-italic mt-1.5">
                  "{getTonightLine(displayDay) ?? todayMeta.focus}"
                </Text>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={onStartSession}
                activeOpacity={0.85}
                className="bg-accent rounded-2xl py-[19px] items-center flex-row justify-center gap-2.5"
              >
                <Play color="#06232A" size={16} fill="#06232A" />
                <Text className="text-on-accent font-bold text-base">
                  {midLoop
                    ? 'Continue today’s session'
                    : displayDay === 1
                      ? 'Start Day 1 — about 15 minutes'
                      : 'Begin today’s session'}
                </Text>
              </TouchableOpacity>
              {midLoop && nextIndex >= 0 ? (
                <Text className="text-faint text-xs text-center mt-3">
                  Step {nextIndex + 1} of {TRAINING_ITEMS.length} · {TRAINING_ITEMS[nextIndex].title}
                </Text>
              ) : streak > 1 ? (
                <Text className="text-faint text-xs text-center mt-3">
                  {streak} consecutive days · rest is part of the work
                </Text>
              ) : null}

              {/* The open loop, visible before the button is ever pressed. */}
              <TrainingTimeline done={stepDone} nextIndex={nextIndex} />
            </>
          )}

          {/* Today's Check-In — the daily-habits card (founder 2026-07-25:
              "N votes cast" was too quiet to read as a daily to-do). QUITTR
              checklist pattern, kept calm: the first three UNCHECKED items
              render inline as tappable rows, so what's left today is visible
              without opening /ledger; checked items absorb out of view. No
              accent, no percentages, no grades, no "votes" language — the one
              dominant action stays the session CTA (Hick's Law). Open until
              midnight in both states — evening items happen after most
              sessions do. All done → one quiet closure line, absorbed check. */}
          {ledgerRemaining.length === 0 ? (
            <View
              className="flex-row items-center bg-surface border border-line rounded-2xl px-[18px] py-3.5 mt-3"
              style={{ gap: 10 }}
              accessibilityLabel="Today's check-in is complete."
            >
              <View className="w-[22px] h-[22px] rounded-full bg-line items-center justify-center">
                {/* Absorbed check — settled evidence, never celebratory. */}
                <Check color="#93A4B0" size={12} strokeWidth={2.5} />
              </View>
              <Text className="text-body text-[13px]">Check-In complete.</Text>
            </View>
          ) : (
            <View className="bg-surface border border-line rounded-2xl px-[18px] pt-4 pb-2 mt-3">
              <View className="flex-row items-baseline justify-between">
                <Text className="text-ink text-[14px] font-semibold">Today's Check-In</Text>
                <Text className="text-muted text-xs">
                  {ledgerCount} of {ledgerItems.length} today
                </Text>
              </View>
              <Text className="text-faint text-[11px] mt-0.5 leading-4">
                {VITALITY_ASYNC_LINE}
              </Text>
              <View className="mt-2">
                {ledgerRemaining.slice(0, 3).map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() =>
                      updateDailyLedger(displayDay, { [item.key]: !ledgerState[item.key] })
                    }
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: false }}
                    accessibilityLabel={`${item.title}. Tap to mark it done for today.`}
                    className="flex-row items-center border-t border-line-soft py-3"
                    style={{ gap: 11 }}
                  >
                    <View className="w-[22px] h-[22px] rounded-full border border-faint" />
                    <Text className="text-body text-[13px] flex-1">{item.title}</Text>
                    <Text className="text-faint text-[9px] font-bold uppercase tracking-[0.14em]">
                      {item.timing}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => router.push('/ledger')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`See all ${ledgerItems.length} check-in items`}
                className="border-t border-line-soft py-3"
              >
                <Text className="text-muted text-[13px] font-semibold">
                  See all {ledgerItems.length} →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />

      <DayOneOrientation
        visible={showOrientation}
        onBegin={() => dismissOrientation(true)}
        onDismiss={() => dismissOrientation(false)}
      />
    </View>
  );
}

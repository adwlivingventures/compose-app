import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useDiscreet } from '../context/DiscreetContext';
import { getAnchorForDay } from '../content/anchors';
import { TrainingKey } from '../content/training';
import { ledgerItemsForDay } from '../content/ledger';
import { anchorIntroForDay } from '../content/sessionCopy';
import { LocalStore } from '../services/storage';
import {
  enableDailyReminder,
  notificationsPresent,
  ReminderTime,
} from '../services/notifications';
import { markAsked, shouldAskForDay } from '../services/rating';
import { track } from '../services/analytics';
import RatingAsk from '../components/RatingAsk';
import AudioPlayer from '../components/AudioPlayer';
import ConditioningTrack from '../components/ConditioningTrack';
import SomaticRelease from '../components/SomaticRelease';
import DailyRewire from '../components/DailyRewire';
import DailyCheckIn from '../components/DailyCheckIn';
import TriageCenter from '../components/TriageCenter';
import SomaticPrimer from '../components/SomaticPrimer';
import CuePicker from '../components/CuePicker';
import { ChosenCues, CHOSEN_CUES_KEY, cuePickerDoneKey } from '../content/cues';

/**
 * Daily Session — the full loop (CLAUDE.md §5; founder batch 2026-07-15):
 *
 *   1. Auditory Anchor        → audio finishing marks the step
 *   2. Conditioning Track     → paced breath + pelvic-floor sequence
 *   3. Control Score          → 1–10 self-rating of the release
 *   4. Somatic Release        → 90s pelvic-hip stretch
 *   5. Daily Rewire           → cross out the old script, read the truth
 *   6. Daily Check-In         → Today's Training + Vitality Check-In (unified)
 *
 * Navigation is free (founder ruling 2026-07-15): the man can move back to
 * replay the anchor or jump ahead to the check-in; each stage that
 * completes auto-marks its Today's-Training item via ProtocolContext, and
 * the check-in reflects it live. The day still closes all-or-nothing — the
 * Complete CTA arms only when all five training items are checked (auto or
 * manual; manual is trust-based by design).
 *
 * REPLAY MODE (2026-07-25): route params `day` + `replay=1` re-open any day
 * strictly behind activeDay as a read-only re-run — that day's anchor audio,
 * conditioning ratio, rewire and all. Guards, in order of importance:
 *   - ZERO state writes: no markDayComplete, no updateDailyTraining, no
 *     updateDailyLedger, no gate/rewire persistence (DailyRewire gets
 *     persist={false}) — a replayed day can never corrupt protocol state.
 *   - The final stage is a quiet "Done" that router.back()s; the interactive
 *     check-in (which writes into context) is not rendered.
 *   - Telemetry: finishing a replay fires the SAME day_completed event,
 *     tagged replay:'true' (never suppressed, never a new event name), so
 *     retention curves can filter re-listens from first completions.
 * An invalid or non-past `day` param falls through to the normal active-day
 * session — the replay flag alone can never fast-forward the protocol.
 */

type Stage = 'anchor' | 'conditioning' | 'score' | 'release' | 'rewire' | 'checkin';

const STAGE_LABELS: Record<Stage, string> = {
  anchor: 'The Anchor',
  conditioning: 'Conditioning',
  score: 'Control',
  release: 'Release',
  rewire: 'Rewire',
  checkin: 'Check-In',
};

const STAGE_ORDER: Stage[] = [
  'anchor',
  'conditioning',
  'score',
  'release',
  'rewire',
  'checkin',
];

/** The training item each stage marks when it completes. */
const STAGE_TRAINING_KEY: Partial<Record<Stage, TrainingKey>> = {
  anchor: 'anchor',
  conditioning: 'conditioning',
  score: 'control',
  release: 'release',
  rewire: 'rewire',
};

const SCORE_MIN_LABEL = 'Stayed tight';
const SCORE_MAX_LABEL = 'Released completely';

export default function SessionScreen() {
  // Hydration guard: the body pins the protocol day at mount, so it must
  // never mount before ProtocolContext has loaded saved progress — a
  // pre-hydration mount (deep link, future notification routing) would pin
  // Day 1 regardless of real progress. Same blank-ground holding pattern
  // the primer and cue gates use.
  const { loading } = useProtocol();
  if (loading) return <View className="flex-1 bg-ground" />;
  return <SessionBody />;
}

function SessionBody() {
  const router = useRouter();
  const { activeDay, markDayComplete, completedDays, updateDailyTraining } = useProtocol();
  // Replay params (expo-router): `day` + `replay=1` re-run a past day
  // read-only. The guard is strict — only a valid integer day BEHIND the
  // active one replays; anything else falls through to the normal session.
  const params = useLocalSearchParams<{ day?: string; replay?: string }>();
  const requestedDay = Number(params.day);
  const isReplay =
    params.replay === '1' &&
    Number.isInteger(requestedDay) &&
    requestedDay >= 1 &&
    requestedDay < activeDay;
  // Pin the day at mount — completion advances activeDay while this screen
  // is still up; the UI shouldn't flicker to tomorrow's number. In replay
  // the pin IS the requested past day: every stage below reads `day`, so
  // that day's anchor audio, intro copy, conditioning ratio and rewire all
  // resolve to the replayed day.
  const dayRef = useRef(isReplay ? requestedDay : activeDay);
  const [stage, setStage] = useState<Stage>('anchor');
  const [pelvicRating, setPelvicRating] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [askReminder, setAskReminder] = useState(false);
  const [enablingReminder, setEnablingReminder] = useState(false);
  // Reminder time chips (founder ruling 2026-07-15): he chooses when the
  // line arrives, one time or several. Seeded with the hour he finished
  // at — the completion hour is still the best default cue.
  const [reminderHours, setReminderHours] = useState<number[]>(
    () => [new Date().getHours()],
  );
  const [askRating, setAskRating] = useState(false);
  const { setNotifications } = useDiscreet();

  const day = dayRef.current;
  const anchor = getAnchorForDay(day);
  const stageIndex = STAGE_ORDER.indexOf(stage);

  // Day 1 gate: the Somatic Primer must be acknowledged before the first
  // session — the conditioning track's "soften" cue presumes the reverse-
  // kegel motor skill it teaches. Completion persists, so it never reshows
  // (leaving via X keeps the gate armed for the next attempt).
  // Replay skips the gate outright: a replayed Day 1 was already primed,
  // and gates must never write (or ask for) anything in a read-only re-run.
  const [primerState, setPrimerState] = useState<'loading' | 'show' | 'done'>(
    day === 1 && !isReplay ? 'loading' : 'done',
  );
  useEffect(() => {
    if (day !== 1 || isReplay) return;
    LocalStore.getItem<boolean>('@somatic_primer_done').then((done) =>
      setPrimerState(done ? 'done' : 'show'),
    );
  }, []);

  // Phase-transition gate (Days 26 and 51): before the Phase 2 / Phase 3
  // session plays, the man binds each ledger behavior to a moment of his
  // own choosing (implementation intentions — content/cues.ts explains the
  // mechanism). Keyed on `day >= boundary` rather than equality so a
  // dev-jump past the boundary still gets the picker once. Same exit
  // semantics as the primer: leaving via X keeps the gate armed.
  // Replay never gates: the picker is a forward-looking commitment device,
  // and its completion write has no place in a read-only re-run.
  const cuePhase: 2 | 3 | null = day >= 51 ? 3 : day >= 26 ? 2 : null;
  const [cueState, setCueState] = useState<'loading' | 'show' | 'done'>(
    cuePhase && !isReplay ? 'loading' : 'done',
  );
  const [chosenCues, setChosenCues] = useState<ChosenCues>({});
  useEffect(() => {
    LocalStore.getItem<ChosenCues>(CHOSEN_CUES_KEY).then((cues) => {
      if (cues) setChosenCues(cues);
    });
    if (!cuePhase || isReplay) return;
    LocalStore.getItem<boolean>(cuePickerDoneKey(cuePhase)).then((done) =>
      setCueState(done ? 'done' : 'show'),
    );
  }, []);

  const handleCuesChosen = async (cues: ChosenCues) => {
    // Local-only by design (CLAUDE.md §7) — cue text, including the
    // optional self-written variant, is never telemetered.
    await LocalStore.setItem(CHOSEN_CUES_KEY, cues);
    if (cuePhase) await LocalStore.setItem(cuePickerDoneKey(cuePhase), true);
    setChosenCues(cues);
    setCueState('done');
  };

  const handleComplete = async () => {
    if (finishing) return;
    setFinishing(true);
    // The unified check-in writes ledger + training straight into context;
    // completion seals whatever is there.
    const dayData = completedDays[day];
    await markDayComplete(day, {
      completed: true,
      pelvicRating: pelvicRating || dayData?.pelvicRating || 0,
      ledger: { ...dayData?.ledger },
      training: { ...dayData?.training },
    });
    // Day-1 only: the reminder opt-in rides the completion high (a
    // post-success ask converts far better than a cold-start permission
    // grab, and the hour he just finished at IS the schedule). Gated on the
    // module being present — never show an ask the build can't honor.
    if (day === 1 && notificationsPresent) {
      setAskReminder(true);
      return;
    }
    // Rating asks ride the completion high on the scheduled days only
    // (services/rating.ts: Days 2/14/30/40/75, retired once he engages).
    if (await shouldAskForDay(day)) {
      await markAsked(day);
      setAskRating(true);
      return;
    }
    // Land back on the dashboard so the ring's advance is the closing image.
    router.back();
  };

  const handleEnableReminder = async () => {
    if (enablingReminder || reminderHours.length === 0) return;
    setEnablingReminder(true);
    const times: ReminderTime[] = [...reminderHours]
      .sort((a, b) => a - b)
      .map((hour) => ({ hour, minute: 0 }));
    const result = await enableDailyReminder(times);
    // A denied system prompt is a decision, not an error — no nagging,
    // the E18 row remains the way back in.
    setNotifications(result === 'scheduled');
    router.back();
  };

  const toggleReminderHour = (hour: number) => {
    setReminderHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour],
    );
  };

  // Free navigation (founder ruling 2026-07-15): chevrons + tappable dots.
  // Completing a stage's work auto-marks its training item; walking past a
  // stage without doing the work marks nothing — the check-in shows the gap.
  const goTo = (index: number) => {
    const next = STAGE_ORDER[index];
    if (next) setStage(next);
  };

  /** A stage's work finished: mark its training item, then move forward.
   *  Replay is read-only — the flow advances, nothing is ever marked. */
  const completeStage = (s: Stage) => {
    const key = STAGE_TRAINING_KEY[s];
    if (key && !isReplay) updateDailyTraining(day, { [key]: true });
    goTo(STAGE_ORDER.indexOf(s) + 1);
  };

  /** Replay's closing action: tag the lifecycle event (same name, replay
   *  flag — services/analytics.ts) and leave. No state was written. */
  const replayTracked = useRef(false);
  const finishReplay = () => {
    if (!replayTracked.current) {
      replayTracked.current = true;
      track('day_completed', { day, replay: 'true' });
    }
    router.back();
  };

  // Hold ground while the gate flags load (one AsyncStorage read each) so
  // the user never sees a frame of session before a gate resolves.
  if (primerState === 'loading' || cueState === 'loading') {
    return <View className="flex-1 bg-ground" />;
  }

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

  if (cueState === 'show' && cuePhase) {
    return (
      <CuePicker
        phase={cuePhase}
        items={ledgerItemsForDay(day)}
        initial={chosenCues}
        onComplete={handleCuesChosen}
        onExit={() => router.back()}
      />
    );
  }

  // Rating ask (Days 2/14/30/40/75, post-success) — quiet exit either way.
  if (askRating) {
    return <RatingAsk eyebrow={`Day ${day} complete`} onDone={() => router.back()} />;
  }

  // Day-1 reminder opt-in (post-success ask). One decision, quiet exit —
  // the notification preview is shown verbatim so consent is informed: he
  // sees exactly what a stranger's glance at his lock screen would see.
  // He picks the time(s); the chips are deterministic hours, multi-select,
  // seeded with the hour he just finished at.
  if (askReminder) {
    const chipHours = Array.from(
      new Set([6, 7, 8, 9, 12, 15, 17, 18, 19, 20, 21, 22, ...reminderHours]),
    ).sort((a, b) => a - b);
    const hourLabel = (h: number) =>
      h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    return (
      <ScrollView
        className="flex-1 bg-ground"
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 }}
      >
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Day one complete
        </Text>
        <Text className="text-ink text-[26px] font-serif-regular leading-9 mt-2.5">
          When should tomorrow's line arrive?
        </Text>
        <Text className="text-muted text-[13.5px] leading-5 mt-3">
          One quiet line each day. Pick one time, or several. This is the whole
          notification, nothing a glance at your lock screen could read into:
        </Text>

        <View className="bg-surface border border-line rounded-[14px] px-4 py-3.5 mt-5">
          <Text className="text-ink text-[13px] font-bold">Compose</Text>
          <Text className="text-body text-[13px] mt-0.5">Today's session is ready.</Text>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-6">
          {chipHours.map((h) => {
            const on = reminderHours.includes(h);
            return (
              <TouchableOpacity
                key={h}
                onPress={() => toggleReminderHour(h)}
                activeOpacity={0.8}
                className={`px-4 py-[9px] rounded-full border ${
                  on ? 'bg-accent border-accent' : 'bg-surface border-line'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${on ? 'text-on-accent' : 'text-muted'}`}
                >
                  {hourLabel(h)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text className="text-faint text-[11.5px] leading-4 mt-3">
          Never a streak warning. Never a word about the work. Change or turn off any time
          under Discretion.
        </Text>

        <TouchableOpacity
          onPress={handleEnableReminder}
          disabled={enablingReminder || reminderHours.length === 0}
          activeOpacity={0.85}
          className={`rounded-2xl py-[17px] items-center mt-7 ${
            reminderHours.length === 0 ? 'bg-line' : 'bg-accent'
          }`}
        >
          {enablingReminder ? (
            <ActivityIndicator color="#06232A" />
          ) : (
            <Text className="text-on-accent font-bold text-base">
              {reminderHours.length > 1
                ? `Remind me at ${reminderHours.length} times`
                : 'Remind me'}
            </Text>
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
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-ground px-6 pt-16">
      <View className="flex-row items-center justify-between">
        {/* Stage dots — tappable since the free-navigation ruling
            (2026-07-15): move anywhere; work done is already marked. */}
        <View className="flex-row items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <TouchableOpacity
              key={s}
              onPress={() => goTo(i)}
              hitSlop={{ top: 12, bottom: 12, left: 2, right: 2 }}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${STAGE_LABELS[s]}`}
            >
              <View
                className={`h-1.5 rounded-full ${
                  i < stageIndex ? 'bg-accent w-4' : i === stageIndex ? 'bg-accent w-8' : 'bg-surface-deep w-4'
                }`}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="bg-surface border border-line rounded-full p-2.5"
        >
          <X color="#6E8090" size={18} />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center gap-4 mt-4">
        <TouchableOpacity
          onPress={() => goTo(stageIndex - 1)}
          disabled={stageIndex === 0}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          style={{ opacity: stageIndex === 0 ? 0 : 1 }}
        >
          <ChevronLeft color="#6E8090" size={16} />
        </TouchableOpacity>
        {/* Replay wears its mode quietly in the eyebrow — same register,
            never a banner: the man is revisiting, not redoing homework. */}
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
          {isReplay ? `Replay · Day ${day}` : `Day ${day}`} · {STAGE_LABELS[stage]}
        </Text>
        <TouchableOpacity
          onPress={() => goTo(stageIndex + 1)}
          disabled={stageIndex === STAGE_ORDER.length - 1}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next step"
          style={{ opacity: stageIndex === STAGE_ORDER.length - 1 ? 0 : 1 }}
        >
          <ChevronRight color="#6E8090" size={16} />
        </TouchableOpacity>
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
              onComplete={() => completeStage('anchor')}
            />
          </View>
        )}

        {stage === 'conditioning' && (
          <ConditioningTrack day={day} onComplete={() => completeStage('conditioning')} />
        )}

        {stage === 'score' && (
          <View className="items-center">
            {/* Founder ruling 2026-07-15: the question names exactly what is
                being rated — how fully the pelvic floor let go on the
                release breaths — on a 1–10 scale. */}
            <Text className="text-ink text-2xl font-serif-regular text-center px-4">
              On the release breaths, how fully did your pelvic floor let go?
            </Text>
            <Text className="text-muted text-xs text-center mt-2 leading-4 px-8">
              1 means it stayed tight no matter what. 10 means it dropped completely, with no
              effort. There is no good or bad answer — this is a signal you're learning to
              read, not a grade.
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2.5 mt-8 px-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => {
                    setPelvicRating(n);
                    completeStage('score');
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} of 10`}
                  className="w-[52px] h-[52px] rounded-2xl bg-surface border border-line items-center justify-center"
                >
                  <Text className="text-ink text-xl font-serif-regular">{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full px-4 mt-3">
              <Text className="text-faint text-xs">{SCORE_MIN_LABEL}</Text>
              <Text className="text-faint text-xs">{SCORE_MAX_LABEL}</Text>
            </View>
          </View>
        )}

        {stage === 'release' && <SomaticRelease onComplete={() => completeStage('release')} />}

        {stage === 'rewire' && (
          /* The rewire stage now carries the day's word + the "I am" triad
             (components/DailyRewire.tsx) — on long-quote days the stack can
             exceed the viewport, so this stage alone scrolls; content still
             centers when it fits. */
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <DailyRewire
              day={day}
              persist={!isReplay}
              onComplete={() => completeStage('rewire')}
            />
          </ScrollView>
        )}

        {stage === 'checkin' && !isReplay && (
          <DailyCheckIn day={day} onCompleteDay={handleComplete} finishing={finishing} />
        )}

        {/* Replay's final stage: the interactive check-in writes into
            context, so it never renders here — a quiet close instead. The
            record of the replayed day stands exactly as he left it. */}
        {stage === 'checkin' && isReplay && (
          <View className="items-center px-2">
            <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
              Replay · Day {day}
            </Text>
            <Text className="text-ink text-2xl font-serif-regular text-center mt-3">
              This day is already yours.
            </Text>
            <Text className="text-muted text-[13px] text-center leading-5 mt-2">
              Revisiting changes nothing in your record — Day {day} stays sealed exactly as
              you earned it.
            </Text>
            <TouchableOpacity
              onPress={finishReplay}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Done revisiting Day ${day} — go back`}
              className="bg-accent rounded-2xl py-[17px] items-center self-stretch mt-8"
            >
              <Text className="text-on-accent font-bold text-base">Done</Text>
            </TouchableOpacity>
          </View>
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

      {__DEV__ && stage !== 'checkin' && (
        <TouchableOpacity
          onPress={() => completeStage(stage)}
          activeOpacity={0.7}
          className="items-center pb-10"
        >
          <Text className="text-dim text-xs">Skip stage (dev only)</Text>
        </TouchableOpacity>
      )}

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

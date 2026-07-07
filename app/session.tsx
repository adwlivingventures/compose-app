import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check, Info } from 'lucide-react-native';
import { useProtocol, HabitState } from '../context/ProtocolContext';
import { useDiscreet } from '../context/DiscreetContext';
import { getAnchorForDay } from '../content/anchors';
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

const CHECKLIST_ITEMS: { key: keyof HabitState; title: string; subtitle: string }[] = [
  {
    key: 'presence',
    title: 'Presence Work',
    subtitle: 'Did you spend conscious time in your body today?',
  },
  {
    key: 'focus',
    title: 'Clean Focus',
    subtitle: 'Did you protect your focus from pornographic input today?',
  },
  {
    key: 'vitality',
    title: 'Vitality Habit',
    subtitle: 'Did you protect your physical energy — sleep, light, movement?',
  },
];

export default function SessionScreen() {
  const router = useRouter();
  const { activeDay, markDayComplete } = useProtocol();
  // Pin the day at mount — completion advances activeDay while this screen
  // is still up; the UI shouldn't flicker to tomorrow's number.
  const dayRef = useRef(activeDay);
  const [stage, setStage] = useState<Stage>('anchor');
  const [pelvicRating, setPelvicRating] = useState(0);
  const [habits, setHabits] = useState<HabitState>({ presence: false, focus: false, vitality: false });
  const [finishing, setFinishing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [askReminder, setAskReminder] = useState(false);
  const [enablingReminder, setEnablingReminder] = useState(false);
  const { setNotifications } = useDiscreet();

  const day = dayRef.current;
  const anchor = getAnchorForDay(day);
  const stageIndex = STAGE_ORDER.indexOf(stage);

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

  const handleComplete = async (finalHabits: HabitState) => {
    if (finishing) return;
    setFinishing(true);
    await markDayComplete(day, {
      completed: true,
      pelvicRating,
      habits: finalHabits,
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
            <ActivityIndicator color="#171310" />
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
          <X color="#8A8378" size={18} />
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
            <Text className="text-muted text-sm text-center leading-5 px-4 mb-8">
              Find a quiet place. Sit or lie down. You can lock your screen — the audio will
              continue.
            </Text>
            <AudioPlayer
              title={anchor.title}
              focus={anchor.focus}
              source={anchor.source}
              onComplete={advance}
            />
          </View>
        )}

        {stage === 'conditioning' && <ConditioningTrack onComplete={advance} />}

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
          <View>
            <Text className="text-ink text-2xl font-serif-regular text-center px-4 mb-6">
              Before the day closes
            </Text>
            <View className="gap-3">
              {CHECKLIST_ITEMS.map((item) => {
                const on = habits[item.key];
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setHabits((h) => ({ ...h, [item.key]: !h[item.key] }))}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-4 flex-row items-center gap-3 border ${
                      on ? 'bg-accent/10 border-accent/40' : 'bg-surface border-line'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-lg items-center justify-center border ${
                        on ? 'bg-accent border-accent' : 'border-faint'
                      }`}
                    >
                      {on && <Check color="#171310" size={14} strokeWidth={3} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-ink text-sm font-bold">{item.title}</Text>
                      <Text className="text-muted text-xs mt-0.5 leading-4">{item.subtitle}</Text>
                    </View>
                    {/* The Vitality Baseline reference, at the moment it's
                        relevant — tapping (i) must not toggle the habit. */}
                    {item.key === 'vitality' && (
                      <TouchableOpacity
                        onPress={() => router.push('/vitality')}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="p-1"
                      >
                        <Info color="#6E675D" size={16} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => handleComplete(habits)}
              disabled={finishing}
              activeOpacity={0.85}
              className="bg-accent rounded-2xl py-4 items-center mt-6"
            >
              {finishing ? (
                <ActivityIndicator color="#171310" />
              ) : (
                <Text className="text-on-accent font-bold text-base">Complete Day {day}</Text>
              )}
            </TouchableOpacity>
            <Text className="text-faint text-xs text-center mt-3 leading-4">
              Answer honestly — an unchecked box is information, not failure.
            </Text>
          </View>
        )}
      </View>

      {/* SOS — reachable mid-session too (§6: one tap from anywhere).
          Unboxed per E09/E10: a quiet presence, not a competing CTA. */}
      <TouchableOpacity
        onPress={() => setSosVisible(true)}
        activeOpacity={0.7}
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

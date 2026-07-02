import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { X, LifeBuoy, Check } from 'lucide-react-native';
import { useProtocol, getPhaseForDay, HabitState } from '../context/ProtocolContext';
import { getAnchorForDay } from '../content/anchors';
import AudioPlayer from '../components/AudioPlayer';
import ConditioningTrack from '../components/ConditioningTrack';
import TriageCenter from '../components/TriageCenter';

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
  anchor: 'Auditory Anchor',
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

  const day = dayRef.current;
  const phase = getPhaseForDay(day);
  const anchor = getAnchorForDay(day);
  const stageIndex = STAGE_ORDER.indexOf(stage);

  const handleComplete = async (finalHabits: HabitState) => {
    if (finishing) return;
    setFinishing(true);
    await markDayComplete(day, {
      completed: true,
      pelvicRating,
      habits: finalHabits,
    });
    // Land back on the dashboard so the ring's advance is the closing image.
    router.back();
  };

  const advance = () => {
    const next = STAGE_ORDER[stageIndex + 1];
    if (next) setStage(next);
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <View className="flex-row items-center justify-between">
        {/* Stage dots — orientation without navigation; they are not tappable */}
        <View className="flex-row items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <View
              key={s}
              className={`h-1.5 rounded-full ${
                i < stageIndex ? 'bg-emerald-500 w-4' : i === stageIndex ? 'bg-emerald-500 w-8' : 'bg-slate-800 w-4'
              }`}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="bg-slate-900 border border-slate-800 rounded-full p-2.5"
        >
          <X color="#64748b" size={18} />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-4">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Day {day} · Phase {phase.number} · {STAGE_LABELS[stage]}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        {stage === 'anchor' && (
          <View>
            <Text className="text-slate-500 text-sm text-center leading-5 px-4 mb-8">
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
            <Text className="text-white text-xl font-bold text-center px-4">
              How much control did you feel through the sequence?
            </Text>
            <Text className="text-slate-500 text-xs text-center mt-2 leading-4 px-8">
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
                  className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 items-center justify-center"
                >
                  <Text className="text-white text-lg font-bold">{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full px-2 mt-3">
              <Text className="text-slate-600 text-xs">{SCORE_LABELS[0]}</Text>
              <Text className="text-slate-600 text-xs">{SCORE_LABELS[4]}</Text>
            </View>
          </View>
        )}

        {stage === 'checklist' && (
          <View>
            <Text className="text-white text-xl font-bold text-center px-4 mb-6">
              Today's Check-In
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
                      on ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-lg items-center justify-center border ${
                        on ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                      }`}
                    >
                      {on && <Check color="#020617" size={14} strokeWidth={3} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-bold">{item.title}</Text>
                      <Text className="text-slate-500 text-xs mt-0.5 leading-4">{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => handleComplete(habits)}
              disabled={finishing}
              activeOpacity={0.85}
              className="bg-emerald-500 rounded-2xl py-4 items-center mt-6"
            >
              {finishing ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text className="text-slate-950 font-bold text-base">Complete Day {day}</Text>
              )}
            </TouchableOpacity>
            <Text className="text-slate-600 text-xs text-center mt-3 leading-4">
              Answer honestly — an unchecked box is information, not failure.
            </Text>
          </View>
        )}
      </View>

      {/* SOS — reachable mid-session too (§6: one tap from anywhere) */}
      <TouchableOpacity
        onPress={() => setSosVisible(true)}
        activeOpacity={0.85}
        className="bg-slate-900 border border-slate-700 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 mb-6"
      >
        <LifeBuoy color="#94a3b8" size={16} />
        <Text className="text-slate-300 font-bold text-sm">Steady Me — Right Now</Text>
      </TouchableOpacity>

      {__DEV__ && stage !== 'checklist' && (
        <TouchableOpacity onPress={advance} activeOpacity={0.7} className="items-center pb-10">
          <Text className="text-slate-700 text-xs">Skip stage (dev only)</Text>
        </TouchableOpacity>
      )}

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

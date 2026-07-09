// Demo mode (Addendum §8) — dev-only. Synthetic data unlocks every Ember
// state and coherence level so all six filmable moments can be captured in
// one take each, without a real 75-day account. Never ships: non-dev builds
// redirect straight out.

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Ember, { coherenceFor, type EmberState } from '../components/ember/Ember';
import { BaselineGauge } from '../components/onboarding/MapScreen';

const STATES: EmberState[] = ['idle', 'generating', 'match-it', 'sos', 'assembly', 'day75'];
const COHERENCE_STOPS = [0.25, 0.4, 0.55, 0.7, 0.85, 1.0];
const SCORE_STOPS = [18, 41, 63];

export default function EmberDemo() {
  const router = useRouter();
  const [state, setState] = useState<EmberState>('idle');
  const [coherence, setCoherence] = useState(0.4);
  const [score, setScore] = useState(41);
  const [paused, setPaused] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [runId, setRunId] = useState(0); // remount → replay assembly from the top

  if (!__DEV__) return <Redirect href="/" />;

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 ${active ? 'bg-accent' : 'bg-surface'}`}
    >
      <Text
        className={active ? 'text-on-accent' : 'text-body'}
        style={{ fontSize: 12, fontWeight: active ? '600' : '300' }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingTop: 64, paddingBottom: 48, paddingHorizontal: 24 }}
    >
      <Pressable onPress={() => router.back()} hitSlop={14} className="mb-4">
        <ChevronLeft size={18} color="#6B7280" strokeWidth={1.5} />
      </Pressable>
      <Text className="font-serif-regular text-ink" style={{ fontSize: 24 }}>
        Ember demo
      </Text>
      <Text className="mt-1 text-muted" style={{ fontSize: 12, fontWeight: '300' }}>
        Dev only. All states, all coherence levels — the six filmable moments.
      </Text>

      <View className="mt-6 items-center">
        <Ember
          key={`${state}-${runId}`}
          state={state}
          coherence={coherence}
          size={300}
          paused={paused}
          assemblyScore={score}
          onBreathCycle={setCycles}
        />
        <Text className="mt-2 text-faint" style={{ fontSize: 11, fontWeight: '300' }}>
          breath cycles: {cycles} · coherence {state === 'day75' ? '1.00' : coherence.toFixed(2)}
        </Text>
      </View>

      <Text className="mt-6 text-body" style={{ fontSize: 10, letterSpacing: 2 }}>
        STATE
      </Text>
      <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
        {STATES.map((s) =>
          chip(s, state === s, () => {
            setState(s);
            setCycles(0);
            setRunId((r) => r + 1);
          }),
        )}
      </View>

      <Text className="mt-5 text-body" style={{ fontSize: 10, letterSpacing: 2 }}>
        COHERENCE
      </Text>
      <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
        {COHERENCE_STOPS.map((c) =>
          chip(c.toFixed(2), coherence === c, () => setCoherence(c)),
        )}
      </View>
      <Text className="mt-2 text-faint" style={{ fontSize: 10.5, fontWeight: '300' }}>
        Day 1 fresh install ≈ {coherenceFor(20, 0).toFixed(2)} · Day 75 strong finish ≈{' '}
        {coherenceFor(90, 75).toFixed(2)}
      </Text>

      <Text className="mt-5 text-body" style={{ fontSize: 10, letterSpacing: 2 }}>
        ASSEMBLY SCORE
      </Text>
      <View className="mt-2 flex-row" style={{ gap: 8 }}>
        {SCORE_STOPS.map((s) =>
          chip(String(s), score === s, () => {
            setScore(s);
            if (state === 'assembly') setRunId((r) => r + 1);
          }),
        )}
        {chip(paused ? 'resume' : 'pause (static frame)', paused, () => setPaused((p) => !p))}
      </View>

      <View className="mt-6">
        <BaselineGauge score={score} calmZone={[80, 100]} />
      </View>
    </ScrollView>
  );
}

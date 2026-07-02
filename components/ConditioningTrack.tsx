import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';

/**
 * Physical Conditioning Track (CLAUDE.md §5, item 2).
 *
 * Paced breath + pelvic-floor sequence: soften/release on the inhale, a
 * gentle engagement on the exhale. The expanding/contracting circle carries
 * the pacing so the user's attention stays somatic, not arithmetic.
 *
 * Phase 1 emphasis is reverse-kegel-style release work — hence the inhale cue
 * leads with "soften" and the exhale cue is deliberately worded as *gentle*
 * engagement: over-gripping is the existing pattern we're retraining, not the
 * goal. Copy stays in conditioning/nervous-system language per §1/§4 tone.
 */

const INHALE_MS = 4000;
const EXHALE_MS = 6000;
// 30 breath cycles × 10s = 5 minutes
const TOTAL_REPS = 30;

interface ConditioningTrackProps {
  onComplete: (/* rep count is fixed; completion carries no data */) => void;
}

export default function ConditioningTrack({ onComplete }: ConditioningTrackProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const runningRef = useRef(false);
  const completedRef = useRef(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'exhale'>('idle');
  const [rep, setRep] = useState(0);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    runningRef.current = false;
    onComplete();
  };

  const runRep = (repIndex: number) => {
    if (!runningRef.current) return;
    if (repIndex >= TOTAL_REPS) {
      finish();
      return;
    }
    setRep(repIndex + 1);
    setPhase('inhale');
    Animated.timing(scale, {
      toValue: 1.35,
      duration: INHALE_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || !runningRef.current) return;
      setPhase('exhale');
      Animated.timing(scale, {
        toValue: 1,
        duration: EXHALE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished: f2 }) => {
        if (!f2 || !runningRef.current) return;
        runRep(repIndex + 1);
      });
    });
  };

  const start = () => {
    runningRef.current = true;
    runRep(0);
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      scale.stopAnimation();
    };
  }, []);

  const active = phase !== 'idle';
  const progress = rep / TOTAL_REPS;

  return (
    <View className="items-center w-full">
      <View className="h-56 items-center justify-center">
        <Animated.View
          style={{ transform: [{ scale }] }}
          className="w-40 h-40 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 items-center justify-center"
        >
          {active && (
            <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              {phase === 'inhale' ? 'Soften' : 'Engage'}
            </Text>
          )}
        </Animated.View>
      </View>

      <Text className="text-white text-base font-bold h-6">
        {phase === 'idle'
          ? 'Conditioning Track'
          : phase === 'inhale'
          ? 'Inhale — release, let go'
          : 'Exhale — gentle engagement'}
      </Text>
      <Text className="text-slate-500 text-xs mt-1 h-5">
        {active ? `${rep} of ${TOTAL_REPS}` : 'Five minutes. Follow the circle — nothing forced.'}
      </Text>

      {active ? (
        <View className="w-full mt-6">
          <View className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={start}
          activeOpacity={0.85}
          className="bg-emerald-500 rounded-xl py-3.5 px-10 mt-6"
        >
          <Text className="text-slate-950 font-bold text-sm">Begin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

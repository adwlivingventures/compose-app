import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BreathingOrb, { CONDITIONING_PHASES } from './BreathingOrb';

/**
 * Physical Conditioning Track (CLAUDE.md §5, item 2) — E10 orb variant.
 *
 * Paced breath + pelvic-floor sequence: soften/release on the inhale, a
 * gentle engagement on the exhale. The breathing orb carries the pacing so
 * the user's attention stays somatic, not arithmetic — and it breathes from
 * the moment the screen mounts, so entrainment starts before any tap.
 *
 * The counted sequence begins on the first inhale *after* Begin is pressed:
 * the tap never jerks the animation, and the first counted breath always
 * starts from the top of a cycle rather than mid-exhale.
 *
 * Phase 1 emphasis is reverse-kegel-style release work — hence the inhale cue
 * leads with "soften" and the exhale cue is deliberately worded as *gentle*
 * engagement: over-gripping is the existing pattern we're retraining, not the
 * goal. Copy stays in conditioning/nervous-system language per §1/§4 tone.
 */

// 30 breath cycles × 10s = 5 minutes
const TOTAL_REPS = 30;

interface ConditioningTrackProps {
  onComplete: (/* rep count is fixed; completion carries no data */) => void;
}

export default function ConditioningTrack({ onComplete }: ConditioningTrackProps) {
  const runningRef = useRef(false);
  const completedRef = useRef(false);
  const repRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [rep, setRep] = useState(0);

  const onPhaseStart = (index: number) => {
    setPhaseIndex(index);
    // Counting advances only at the top of an inhale.
    if (index !== 0 || !runningRef.current || completedRef.current) return;
    if (repRef.current >= TOTAL_REPS) {
      completedRef.current = true;
      runningRef.current = false;
      onComplete();
      return;
    }
    repRef.current += 1;
    setRep(repRef.current);
  };

  const begin = () => {
    setStarted(true);
    runningRef.current = true;
  };

  const inhaling = phaseIndex === 0;

  return (
    <View className="items-center w-full">
      <BreathingOrb
        phases={CONDITIONING_PHASES}
        size={280}
        glowSize={260}
        innerSize={180}
        onPhaseStart={onPhaseStart}
        haptics={started}
        announcements={['Inhale — soften', 'Exhale — gentle engagement']}
      >
        <Text className="text-accent-soft text-[13px] font-bold uppercase tracking-[0.22em]">
          {inhaling ? 'Soften' : 'Engage'}
        </Text>
      </BreathingOrb>

      <Text className="text-ink text-[17px] font-semibold mt-4 h-6">
        {!started
          ? 'Conditioning Track'
          : inhaling
          ? 'Inhale — release, let go'
          : 'Exhale — gentle engagement'}
      </Text>
      <Text className="text-muted text-[12.5px] mt-1 h-5">
        {!started
          ? 'Five minutes. Follow the orb — nothing forced.'
          : rep === 0
          ? 'Your count begins on the next inhale.'
          : `breath ${rep} of ${TOTAL_REPS}`}
      </Text>

      {started ? (
        <View className="w-full mt-6">
          <View className="h-[3px] bg-line-soft rounded-full overflow-hidden">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${Math.min((rep / TOTAL_REPS) * 100, 100)}%` }}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={begin}
          activeOpacity={0.85}
          className="bg-accent rounded-xl py-3.5 px-10 mt-6"
        >
          <Text className="text-on-accent font-bold text-sm">Begin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Somatic Pelvic-Hip Release — daily session stage (founder feature batch
 * 2026-07-15). One targeted somatic stretch, held for a cumulative 90
 * seconds, breathing into the pelvic basin.
 *
 * Why it works when done right (and why the form cues are on screen the
 * whole time): a hypertonic floor cannot be stretched open by force —
 * straining IS the pattern. The release happens when the abdominal wall
 * stays soft, the jaw hangs loose (the jaw and pelvic floor are
 * reflexively linked), and the inhale is allowed to descend into the
 * pelvis with zero bracing. Pose choice is his — the invariant is the 90
 * seconds of unforced breath.
 *
 * The timer is pausable (a real pose gets adjusted); the 90 seconds are
 * cumulative, per the spec.
 */

const TARGET_SECONDS = 90;

const POSES = [
  {
    id: 'happy-baby',
    name: 'Happy Baby',
    how: 'On your back, knees drawn wide toward your armpits, hands on shins or feet. Low back stays heavy on the floor.',
  },
  {
    id: 'frog',
    name: 'Frog Stretch',
    how: 'On all fours, knees wide, feet in line with knees, forearms down. Let gravity do the widening — nothing forced.',
  },
  {
    id: 'deep-squat',
    name: 'Deep Squat',
    how: 'Feet flat and wide, sink your hips below your knees. Hold something stable if you need it. Spine long, weight settled.',
  },
] as const;

const FORM_CUES = [
  'Belly soft — the abdominal wall stays completely relaxed.',
  'Jaw loose — let it hang. The jaw and the floor release together.',
  'Breathe into the pelvic basin. No bracing, no straining, ever.',
];

export default function SomaticRelease({ onComplete }: { onComplete: () => void }) {
  const [pose, setPose] = useState<(typeof POSES)[number] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds >= TARGET_SECONDS && !doneRef.current) {
      doneRef.current = true;
      setRunning(false);
      onComplete();
    }
  }, [seconds, onComplete]);

  // Pose selection first — one decision, then the body takes over.
  if (!pose) {
    return (
      <View className="w-full">
        <Text className="text-ink text-2xl font-serif-regular text-center px-4">
          Ninety seconds of release.
        </Text>
        <Text className="text-muted text-xs text-center mt-2 leading-4 px-6">
          Pick tonight’s position. The stretch is the container — the release is in the
          breath.
        </Text>
        <View className="gap-2.5 mt-6">
          {POSES.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPose(p)}
              activeOpacity={0.8}
              className="bg-surface border border-line rounded-2xl p-4"
            >
              <Text className="text-ink text-sm font-bold">{p.name}</Text>
              <Text className="text-muted text-xs mt-1 leading-4">{p.how}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const remaining = Math.max(TARGET_SECONDS - seconds, 0);

  return (
    <View className="items-center w-full">
      <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
        {pose.name}
      </Text>
      <Text className="text-ink font-serif-light" style={{ fontSize: 56, marginTop: 12 }}>
        {remaining}
      </Text>
      <Text className="text-muted text-xs -mt-1">seconds to go</Text>

      <View className="w-full h-[3px] bg-line-soft rounded-full overflow-hidden mt-5">
        <View
          className="h-full bg-accent rounded-full"
          style={{ width: `${Math.min((seconds / TARGET_SECONDS) * 100, 100)}%` }}
        />
      </View>

      <View className="w-full bg-surface border border-line rounded-2xl p-4 mt-6 gap-2">
        {FORM_CUES.map((cue) => (
          <Text key={cue} className="text-body text-[13px] leading-5">
            {cue}
          </Text>
        ))}
      </View>

      {!running && seconds === 0 ? (
        <TouchableOpacity
          onPress={() => setRunning(true)}
          activeOpacity={0.85}
          className="bg-accent rounded-xl py-3.5 px-10 mt-6"
        >
          <Text className="text-on-accent font-bold text-sm">Begin</Text>
        </TouchableOpacity>
      ) : seconds < TARGET_SECONDS ? (
        <TouchableOpacity
          onPress={() => setRunning((r) => !r)}
          activeOpacity={0.7}
          className="py-3.5 px-10 mt-4"
        >
          <Text className="text-muted text-[13px] font-semibold">
            {running ? 'Pause — adjust the position' : 'Resume'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {seconds === 0 && (
        <TouchableOpacity
          onPress={() => setPose(null)}
          activeOpacity={0.7}
          className="items-center py-2"
        >
          <Text className="text-dim text-xs">Choose a different position</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { LocalStore } from '../services/storage';
import { POSE_SWAP_KEY, poseForDay, type ReleasePose } from '../content/releasePoses';
import { useReduceMotion } from '../hooks/useReduceMotion';

/**
 * Somatic Pelvic-Hip Release — daily session stage.
 *
 * Rebuilt 2026-08-05 (founder walkthrough ruling): the pose is now ASSIGNED
 * from a ten-pose, phase-aware rotation (content/releasePoses.ts) instead
 * of chosen from a three-item menu. Variety without a decision: he opens
 * the stage and tonight's position is simply there, with its line-figure
 * diagram. "Different position tonight" advances the rotation — an escape,
 * never a menu.
 *
 * The figure breathes: a slow scale/opacity pulse at the protocol's 4-in /
 * 6-out rhythm, synced by duration to the same cadence the conditioning orb
 * teaches. The diagram isn't decoration — it is the same exhale he has been
 * training, now applied to the stretch. Suppressed under Reduce Motion.
 *
 * Unchanged clinical core: a hypertonic floor cannot be stretched open by
 * force — straining IS the pattern. The release happens when the abdominal
 * wall stays soft, the jaw hangs loose (reflexively linked to the floor),
 * and the inhale descends into the pelvis with zero bracing. The pose is
 * the container; the 90 seconds of unforced breath are the invariant. The
 * timer stays pausable and cumulative.
 */

const TARGET_SECONDS = 90;

const FORM_CUES = [
  'Belly soft — the abdominal wall stays completely relaxed.',
  'Jaw loose — let it hang. The jaw and the floor release together.',
  'Breathe into the pelvic basin. No bracing, no straining, ever.',
];

/** The pose diagram with the 4/6 breathing pulse. */
function BreathingFigure({ pose, active }: { pose: ReleasePose; active: boolean }) {
  const reduceMotion = useReduceMotion();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion || !active) {
      t.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        // 4-second inhale — the figure gently expands…
        Animated.timing(t, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        // …6-second exhale — and settles. The vagal-brake ratio, visible.
        Animated.timing(t, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, active, reduceMotion]);

  return (
    <Animated.Image
      source={pose.image}
      accessibilityIgnoresInvertColors
      style={{
        width: 216,
        height: 216,
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
        transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }],
      }}
      resizeMode="contain"
    />
  );
}

export default function SomaticRelease({
  day,
  onComplete,
}: {
  day: number;
  onComplete: () => void;
}) {
  const [swapOffset, setSwapOffset] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const doneRef = useRef(false);

  // Restore tonight's swap (an interrupted session resumes on the pose he
  // swapped to; yesterday's offset never leaks into today).
  useEffect(() => {
    LocalStore.getItem<{ day: number; offset: number }>(POSE_SWAP_KEY).then((saved) => {
      if (saved && saved.day === day && Number.isFinite(saved.offset)) {
        setSwapOffset(saved.offset);
      }
      setHydrated(true);
    });
  }, [day]);

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

  const swapPose = async () => {
    const next = swapOffset + 1;
    setSwapOffset(next);
    await LocalStore.setItem(POSE_SWAP_KEY, { day, offset: next });
  };

  // One-frame gate: never render a pose the hydration is about to swap.
  if (!hydrated) return <View />;

  const pose = poseForDay(day, swapOffset);
  const remaining = Math.max(TARGET_SECONDS - seconds, 0);

  return (
    <View className="items-center w-full">
      {/* Category named plainly (founder markup 2026-08-05): he should never
          wonder what KIND of thing this is — it is a stretch. */}
      <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
        Tonight’s stretch · {pose.name}
      </Text>

      <View className="items-center mt-3">
        <BreathingFigure pose={pose} active={running} />
      </View>

      <Text className="text-muted text-xs text-center leading-4 px-6 mt-1">{pose.how}</Text>

      {/* Purpose + expectation, one compact line each (founder markup
          2026-08-05). "Feel" is expectation-setting: it prevents both alarm
          ("is this wrong?") and forcing ("should I push harder?"). */}
      <View className="w-full px-6 mt-2.5" style={{ gap: 3 }}>
        <Text className="text-faint text-[11.5px] leading-4">
          <Text className="text-dim font-bold">WHY </Text>
          {pose.why}
        </Text>
        <Text className="text-faint text-[11.5px] leading-4">
          <Text className="text-dim font-bold">FEEL </Text>
          {pose.feel} Never pain — pain means ease off.
        </Text>
      </View>

      <Text className="text-ink font-serif-light" style={{ fontSize: 48, marginTop: 10 }}>
        {remaining}
      </Text>
      <Text className="text-muted text-xs -mt-1">seconds to go</Text>

      <View className="w-full h-[3px] bg-line-soft rounded-full overflow-hidden mt-4">
        <View
          className="h-full bg-accent rounded-full"
          style={{ width: `${Math.min((seconds / TARGET_SECONDS) * 100, 100)}%` }}
        />
      </View>

      <View className="w-full bg-surface border border-line rounded-2xl p-4 mt-5 gap-2">
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
          accessibilityRole="button"
          accessibilityLabel={`Begin ${pose.name}`}
          className="bg-accent rounded-xl py-3.5 px-10 mt-5"
        >
          <Text className="text-on-accent font-bold text-sm">Begin</Text>
        </TouchableOpacity>
      ) : seconds < TARGET_SECONDS ? (
        <TouchableOpacity
          onPress={() => setRunning((r) => !r)}
          activeOpacity={0.7}
          className="py-3.5 px-10 mt-3"
        >
          <Text className="text-muted text-[13px] font-semibold">
            {running ? 'Pause — adjust the position' : 'Resume'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {seconds === 0 && (
        // The escape, not a menu: one tap advances the rotation (persisted
        // for tonight only). For the body that can't do tonight's pose.
        <TouchableOpacity
          onPress={swapPose}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="items-center py-2"
        >
          <Text className="text-dim text-xs">Different position tonight</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

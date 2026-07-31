import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

/**
 * BreathingOrb — the Ember signature mechanic (design/ember-v1, E10/E15).
 *
 * A radial copper glow that expands and contracts on the actual breath-phase
 * durations rather than a symmetric sine: the eyes entrain to the same
 * waveform the lungs are asked to follow, and the longer contraction leg is
 * the extended exhale that engages the vagal brake. The loop starts at mount
 * — the user entrains before tapping anything — and survives re-renders
 * without restarting.
 *
 * Phase timings live here as the single canonical source; both consumers
 * (conditioning session and SOS 4-7-8) import them so glow, words, and
 * counters can never drift apart.
 */

export interface OrbPhase {
  /** Glow scale at the end of this phase (1 = rest, 1.18 = full inhale). */
  toScale: number;
  durationMs: number;
}

// Full-inhale glow scale. The design's 1.18 read as barely moving on real
// hardware (device feedback) — the pacing target has to be unmistakable.
// Exported so consumers that build their own phase arrays (the Sandbox)
// share the same travel.
export const FULL_BREATH = 1.3;

/** Conditioning cycle (E10): 4s soften on the inhale, 6s engage on the exhale. */
export const CONDITIONING_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: 1, durationMs: 6000 },
];

/** SOS cycle (E15): 4-7-8 — the glow holds full through the 7s retention. */
export const SOS_478_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: FULL_BREATH, durationMs: 7000 },
  { toScale: 1, durationMs: 8000 },
];

interface BreathingOrbProps {
  phases: OrbPhase[];
  /** Outer container square: 280 in-session (E10), 230 in the SOS sheet (E15). */
  size: number;
  glowSize: number;
  innerSize: number;
  /**
   * Fires at the start of each phase with the phase index and the number of
   * fully completed cycles. Runs on the JS thread — drive phase words and
   * counters from here so text stays locked to the glow.
   */
  onPhaseStart?: (phaseIndex: number, completedCycles: number) => void;
  /**
   * Soft haptic tick at each phase boundary — lets the user follow the
   * pacing with eyes closed, which is where the extended-exhale work lands
   * best. Consumers toggle it (e.g. off until the counted sequence starts).
   */
  haptics?: boolean;
  /**
   * Spoken phase cues for screen-reader users, one per phase (e.g.
   * ['Inhale, soften', 'Exhale, engage']). Announced at each phase start —
   * a purely visual pacer is unusable with VoiceOver, and the haptic tick
   * alone doesn't say which direction the breath goes. No-op when no
   * screen reader is active.
   */
  announcements?: string[];
  /** Inner circle content: phase word (E10) or countdown numeral (E15). */
  children?: React.ReactNode;
}

// Guarded: on a dev build that predates the expo-haptics native module the
// call throws — skip silently rather than take down the breathing screen.
function softTick() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
  } catch {}
}

export default function BreathingOrb({
  phases,
  size,
  glowSize,
  innerSize,
  onPhaseStart,
  haptics = false,
  announcements,
  children,
}: BreathingOrbProps) {
  const scale = useRef(new Animated.Value(1)).current;
  // Refs keep the loop's effect dependency-free: new callbacks/phases on
  // re-render are picked up without restarting the animation mid-breath.
  const onPhaseStartRef = useRef(onPhaseStart);
  onPhaseStartRef.current = onPhaseStart;
  const phasesRef = useRef(phases);
  phasesRef.current = phases;
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const announcementsRef = useRef(announcements);
  announcementsRef.current = announcements;

  useEffect(() => {
    let alive = true;
    let cycles = 0;
    const runPhase = (index: number) => {
      if (!alive) return;
      if (hapticsRef.current) softTick();
      const announcement = announcementsRef.current?.[index];
      if (announcement) AccessibilityInfo.announceForAccessibility(announcement);
      onPhaseStartRef.current?.(index, cycles);
      const phase = phasesRef.current[index];
      Animated.timing(scale, {
        toValue: phase.toScale,
        duration: phase.durationMs,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !alive) return;
        const next = (index + 1) % phasesRef.current.length;
        if (next === 0) cycles += 1;
        runPhase(next);
      });
    };
    runPhase(0);
    return () => {
      alive = false;
      scale.stopAnimation();
    };
  }, []);

  const glowOpacity = scale.interpolate({
    inputRange: [1, FULL_BREATH],
    outputRange: [0.75, 1],
    extrapolate: 'clamp',
  });
  // The inner circle breathes at a fraction of the glow's travel: the soft
  // glow alone (26% peak opacity) is near-invisible on a real OLED, and an
  // imperceptible pacing target defeats the entrainment mechanic. Derived
  // from the same Animated.Value, so glow and circle can never drift.
  const innerScale = scale.interpolate({
    inputRange: [1, FULL_BREATH],
    outputRange: [1, 1.16],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Animated.View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          transform: [{ scale }],
          opacity: glowOpacity,
        }}
      >
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            <RadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#5FD4C1" stopOpacity={0.26} />
              <Stop offset="55%" stopColor="#5FD4C1" stopOpacity={0.05} />
              <Stop offset="70%" stopColor="#5FD4C1" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill="url(#orbGlow)" />
        </Svg>
      </Animated.View>
      <Animated.View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: 'rgba(95,212,193,0.09)',
          borderWidth: 1.5,
          borderColor: 'rgba(95,212,193,0.5)',
          transform: [{ scale: innerScale }],
        }}
        className="items-center justify-center"
      >
        {children}
      </Animated.View>
    </View>
  );
}

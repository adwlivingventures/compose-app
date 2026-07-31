// The Ember — the app's one living object (Craft Layer Addendum §1).
// A parametric particle field over the dusk ground: scattered at Day 1,
// coherent by Day 75. One master parameter (coherence), one master clock
// (the 4-2-6 idle breath; 4-7-8 under SOS). Everything else in the app is
// calm so this can be alive.
//
// Engineering guardrails (§7):
// - ≤ 800 particles (default 380 — tuned for iPhone 12-class 60fps; raise
//   only after on-device profiling).
// - Pauses to a static frame when the app backgrounds (AppState) or when
//   `paused` is set (90s-idle screens pass it down).
// - iOS Reduce Motion → static gradient orb with opacity breathing only.
// - Skia native module missing (pre-EAS dev build) → same static-orb
//   fallback. The object is never absent, never jerky. A pre-rendered video
//   fallback slot can replace the orb when the asset exists.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated as RNAnimated, AppState, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createField, gaugeTargets } from './particles';

// Guarded require — Skia is a native module; on builds that predate it the
// require throws and the Ember renders its fallback (never crashes, never
// missing).
let SkiaMod: typeof import('@shopify/react-native-skia') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SkiaMod = require('@shopify/react-native-skia');
} catch {
  SkiaMod = null;
}

export type EmberState =
  | 'idle' // dashboard: small, ≤35% opacity, presence not spectacle
  | 'generating' // onboarding Generating: coherence ramps with progress
  | 'match-it' // session start: full size, user matches the breath
  | 'sos' // 4-7-8 pacing, particles slow, bloom widens
  | 'assembly' // particles re-form into the gauge (Generating → Map)
  | 'day75'; // coherence 1.0 — a steady flame-like core

export interface EmberProps {
  state: EmberState;
  /** 0..1 — from Composure Score + protocol day (see coherenceFor). */
  coherence?: number;
  size?: number;
  opacity?: number;
  /** Freeze to a static frame (thermal/idle guardrail). */
  paused?: boolean;
  /** Fires at each completed breath cycle (match-it gating, counters). */
  onBreathCycle?: (cycles: number) => void;
  /** Assembly state only: fires once when the field has formed the gauge. */
  onAssemblyComplete?: () => void;
  /** Assembly state only: the user's score 0–100 for the marker cluster. */
  assemblyScore?: number;
  particleCount?: number;
}

/** Addendum §1: coherence = 0.25 + 0.75 × normalized(score, day). */
export function coherenceFor(score: number, day: number): number {
  const s = Math.min(Math.max(score, 0), 100) / 100;
  const d = Math.min(Math.max(day, 0), 75) / 75;
  return 0.25 + 0.75 * (0.5 * s + 0.5 * d);
}

// Accent unification (founder ruling 2026-07-25): the living object runs the
// aqua current, not the warm ember family — one accent across the funnel.
const COLORS = ['#8CE6D8', '#5FD4C1', '#3E9BD6'];

// Breath cycles (ms): [inhale, hold, exhale]. The 4-2-6 idle rhythm is the
// app's master clock; SOS shifts to 4-7-8.
const CYCLES: Record<EmberState, [number, number, number]> = {
  idle: [4000, 2000, 6000],
  generating: [4000, 2000, 6000],
  'match-it': [4000, 2000, 6000],
  sos: [4000, 7000, 8000],
  assembly: [4000, 2000, 6000],
  day75: [4000, 2000, 6000],
};

// Per-state amplitude (radius swell) and drift-speed factors.
const AMPLITUDE: Record<EmberState, number> = {
  idle: 0.16,
  generating: 0.16,
  'match-it': 0.18,
  sos: 0.2,
  assembly: 0.1,
  day75: 0.07,
};
const SPEED: Record<EmberState, number> = {
  idle: 1,
  generating: 1,
  'match-it': 1,
  sos: 0.45, // particles slow under SOS
  assembly: 0.6,
  day75: 0.5,
};

export default function Ember({
  state,
  coherence = 0.25,
  size = 260,
  opacity = 1,
  paused = false,
  onBreathCycle,
  onAssemblyComplete,
  assemblyScore = 41,
  particleCount = 380,
}: EmberProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduceMotion(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  if (!SkiaMod || reduceMotion) {
    return <EmberFallback state={state} size={size} opacity={opacity} animate={!reduceMotion} />;
  }
  return (
    <EmberSkia
      state={state}
      coherence={coherence}
      size={size}
      opacity={opacity}
      paused={paused}
      onBreathCycle={onBreathCycle}
      onAssemblyComplete={onAssemblyComplete}
      assemblyScore={assemblyScore}
      particleCount={Math.min(particleCount, 800)}
    />
  );
}

// ── Skia renderer ──────────────────────────────────────────────────────────

function EmberSkia({
  state,
  coherence,
  size,
  opacity,
  paused,
  onBreathCycle,
  onAssemblyComplete,
  assemblyScore,
  particleCount,
}: Required<Omit<EmberProps, 'onBreathCycle' | 'onAssemblyComplete'>> &
  Pick<EmberProps, 'onBreathCycle' | 'onAssemblyComplete'>) {
  const { Canvas, Points, BlurMask, Group } = SkiaMod!;

  const field = useMemo(() => createField(particleCount), [particleCount]);
  const targets = useMemo(
    () => gaugeTargets(particleCount, assemblyScore),
    [particleCount, assemblyScore],
  );
  const buckets = useMemo(
    () =>
      [0, 1, 2].map((b) =>
        Array.from({ length: field.count }, (_, i) => i).filter(
          (i) => field.colorBucket[i] === b,
        ),
      ),
    [field],
  );

  // Master clock — advanced only while active, so pausing freezes the frame
  // (and the CPU cost) rather than unmounting the object.
  const t = useSharedValue(0);
  const active = useSharedValue(paused ? 0 : 1);
  useEffect(() => {
    active.value = paused ? 0 : 1;
  }, [paused, active]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      active.value = s === 'active' && !paused ? 1 : 0;
    });
    return () => sub.remove();
  }, [paused, active]);

  useFrameCallback((info) => {
    if (active.value === 1 && info.timeSincePreviousFrame != null) {
      t.value += Math.min(info.timeSincePreviousFrame, 64);
    }
  });

  const coherenceSv = useSharedValue(coherence);
  useEffect(() => {
    coherenceSv.value = withTiming(state === 'day75' ? 1 : coherence, { duration: 900 });
  }, [coherence, state, coherenceSv]);

  // Assembly progress: 0 = free orbit, 1 = formed gauge.
  const assembly = useSharedValue(0);
  const assemblyDone = useRef(false);
  useEffect(() => {
    assembly.value =
      state === 'assembly'
        ? withTiming(1, { duration: 1400, easing: Easing.bezier(0.22, 0.61, 0.36, 1) })
        : withTiming(0, { duration: 400 });
  }, [state, assembly]);

  const cycle = CYCLES[state];
  const cycleTotal = cycle[0] + cycle[1] + cycle[2];
  const amplitude = AMPLITUDE[state];
  const speed = SPEED[state];

  // Breath cycle counter → JS (match-it gating, SOS counters).
  const cycleIndex = useDerivedValue(() => Math.floor(t.value / cycleTotal));
  useAnimatedReaction(
    () => cycleIndex.value,
    (curr, prev) => {
      if (prev !== null && curr > prev && onBreathCycle) runOnJS(onBreathCycle)(curr);
    },
  );
  useAnimatedReaction(
    () => assembly.value,
    (curr, prev) => {
      if (
        onAssemblyComplete &&
        prev !== null &&
        prev < 1 &&
        curr >= 1 &&
        !assemblyDone.current
      ) {
        runOnJS(markAssemblyDone)();
      }
    },
  );
  function markAssemblyDone() {
    if (!assemblyDone.current) {
      assemblyDone.current = true;
      onAssemblyComplete?.();
    }
  }

  // One derived point array per color bucket.
  const half = size / 2;
  const pointArrays = buckets.map((indices) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- buckets.length is constant (3)
    useDerivedValue(() => {
      const time = t.value / 1000;
      const c = coherenceSv.value;
      const a = assembly.value;

      // Breath scale: inhale rise, hold, exhale fall — eased sinusoid halves.
      const phase = t.value % cycleTotal;
      let breath: number;
      if (phase < cycle[0]) {
        breath = 0.5 - 0.5 * Math.cos((phase / cycle[0]) * Math.PI);
      } else if (phase < cycle[0] + cycle[1]) {
        breath = 1;
      } else {
        const e = (phase - cycle[0] - cycle[1]) / cycle[2];
        breath = 0.5 + 0.5 * Math.cos(e * Math.PI);
      }
      const swell = 1 + amplitude * breath;

      const spread = 1 - 0.62 * c; // coherent = tight orbit
      const drift = 1 - 0.75 * c; // coherent = calm drift
      const pts: { x: number; y: number }[] = [];
      for (let k = 0; k < indices.length; k++) {
        const i = indices[k];
        const angle = field.baseAngle[i] + field.angSpeed[i] * speed * time;
        const radius =
          half * (0.14 + 0.82 * field.baseRadius[i] * spread) * swell;
        let x = half + Math.cos(angle) * radius;
        let y = half + Math.sin(angle) * radius;
        x += Math.sin(time * field.noiseF1[i] + field.noiseP1[i]) * field.noiseAmp[i] * size * drift;
        y += Math.cos(time * field.noiseF2[i] + field.noiseP2[i]) * field.noiseAmp[i] * size * drift;
        if (a > 0) {
          // Per-particle stagger so the gauge forms as a sweep, not a snap.
          const offset = (i % 37) / 37 * 0.3;
          const p = Math.min(Math.max((a - offset) / 0.7, 0), 1);
          const eased = p * p * (3 - 2 * p);
          const tx = targets.x[i] * size;
          const ty = targets.y[i] * size;
          x = x + (tx - x) * eased;
          y = y + (ty - y) * eased;
        }
        pts.push({ x, y });
      }
      return pts;
    }),
  );

  const bloomWidth = state === 'sos' ? 9 : 7;

  return (
    <View pointerEvents="none" style={{ width: size, height: size, opacity }}>
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* Bloom layer — light, not paint. */}
          {pointArrays.map((pts, b) => (
            <Points
              key={`bloom-${b}`}
              points={pts}
              mode="points"
              color={COLORS[b]}
              strokeWidth={bloomWidth}
              strokeCap="round"
              opacity={0.16}
            >
              <BlurMask blur={state === 'sos' ? 7 : 5} style="normal" />
            </Points>
          ))}
          {/* Cores. */}
          {pointArrays.map((pts, b) => (
            <Points
              key={`core-${b}`}
              points={pts}
              mode="points"
              color={COLORS[b]}
              strokeWidth={2.1}
              strokeCap="round"
              opacity={b === 0 ? 0.95 : 0.75}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

// ── Fallback: static gradient orb, opacity breathing only ─────────────────
// Serves both Reduce Motion (per Addendum §7) and pre-Skia dev builds.

function EmberFallback({
  state,
  size,
  opacity,
  animate,
}: {
  state: EmberState;
  size: number;
  opacity: number;
  animate: boolean;
}) {
  const breath = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (!animate) return;
    const [inhale, hold, exhale] = CYCLES[state];
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(breath, { toValue: 1, duration: inhale, useNativeDriver: true }),
        RNAnimated.delay(hold),
        RNAnimated.timing(breath, { toValue: 0, duration: exhale, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, state, breath]);

  return (
    <RNAnimated.View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        opacity: animate
          ? breath.interpolate({ inputRange: [0, 1], outputRange: [0.72 * opacity, opacity] })
          : opacity,
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="emberFallback" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#8CE6D8" stopOpacity="0.5" />
            <Stop offset="0.45" stopColor="#5FD4C1" stopOpacity="0.22" />
            <Stop offset="1" stopColor="#5FD4C1" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#emberFallback)" />
      </Svg>
    </RNAnimated.View>
  );
}

// Shared onboarding chrome — Deepwater.
// Layout truth: reference/COMPOSE - Onboarding vB.dc.html (3a set).
// Color truth: the Deepwater brief (aqua current = actions/progress; ember =
// identity; the diagnosis section alone stays ember-rust).

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { DUSK_RADIAL } from '../../theme/emberDusk';
import { useReduceMotion } from '../../hooks/useReduceMotion';

/** 10px, 2px-tracked uppercase micro-type (eyebrows, progress, footers only). */
export function Eyebrow({
  children,
  center = false,
  tint,
}: {
  children: string;
  center?: boolean;
  /** Overrides the muted body colour — used to tint the diagnosis-card
   *  eyebrow in the section's ember accent. */
  tint?: string;
}) {
  return (
    <Text
      className={`${tint ? '' : 'text-body'} ${center ? 'text-center' : ''}`}
      style={{ fontSize: 10, fontWeight: '300', letterSpacing: 2, ...(tint ? { color: tint } : null) }}
    >
      {children}
    </Text>
  );
}

/** COMPOSE wordmark: 10px, 5px tracking, weight 300. */
export function Wordmark() {
  return (
    <Text
      className="text-center text-ink"
      style={{ fontSize: 10, fontWeight: '300', letterSpacing: 5 }}
    >
      COMPOSE
    </Text>
  );
}

/** "ANSWERS STAY ON THIS PHONE. ALWAYS." — every question screen. */
export function PrivacyFooter({ text = 'ANSWERS STAY ON THIS PHONE. ALWAYS.' }: { text?: string }) {
  return (
    <View className="px-6 pb-11">
      <Text
        className="text-center text-faint"
        style={{ fontSize: 10, fontWeight: '300', letterSpacing: 0.5 }}
      >
        {text}
      </Text>
    </View>
  );
}

/** Low-emphasis text link ("Skip for now", "I have doubts", "Exit for now"). */
export function SecondaryLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={12}
      className="items-center py-3"
    >
      <Text className="text-faint" style={{ fontSize: 13, fontWeight: '300' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Cool radial bleeding off the top of chapter/card screens.
 * rgba(95,212,193, 0.10–0.14) → transparent 65%. Deepwater role: ambience
 * follows the aqua current; the diagnosis cards override it ember-rust.
 */
export function DuskRadial({
  intensity = 0.12,
  tint = '#5FD4C1',
}: {
  intensity?: number;
  /** Overrides the aqua glow — the diagnosis cards run it ember-rust. */
  tint?: string;
}) {
  return (
    <View
      pointerEvents="none"
      className="absolute self-center"
      style={{ top: -170, width: 480, height: 480 }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="dusk" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={tint} stopOpacity={intensity} />
            <Stop offset={String(DUSK_RADIAL.fadeStop)} stopColor={tint} stopOpacity="0" />
            <Stop offset="1" stopColor={tint} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dusk)" />
      </Svg>
    </View>
  );
}

/**
 * Progress header — the guidance layer: back chevron · "PART N — <chapter>"
 * eyebrow · "~N MIN", over a thin aqua fill on a line-soft track (Deepwater:
 * progress rides the current — one of the screen's permitted emissions).
 * No "X OF Y" screen counts — see the ruling in logic.ts progressMeta.
 */
export function ProgressHeader({
  step,
  total,
  minutesLeft,
  sectionLabel,
  part,
  onBack,
}: {
  step: number;
  total: number;
  minutesLeft: number;
  sectionLabel: string;
  /** 1-based chapter number ("Part N") when the screen belongs to one. */
  part?: number;
  onBack?: () => void;
}) {
  const fill = useRef(new Animated.Value(step / total)).current;
  useEffect(() => {
    Animated.timing(fill, {
      toValue: step / total,
      duration: 300,
      useNativeDriver: false, // width %
    }).start();
  }, [step, total, fill]);

  // Faint 20s shimmer (±3% luminance) so the fill reads as alive under the
  // glass — emission, not decoration (Addendum §2). Frozen under Reduce Motion.
  const reduceMotion = useReduceMotion();
  const shimmer = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduceMotion) {
      shimmer.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.94, duration: 10000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 1, duration: 10000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, reduceMotion]);

  return (
    <View className="px-6 pt-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={14}
          disabled={!onBack}
          style={{ width: 24, opacity: onBack ? 1 : 0 }}
        >
          <ChevronLeft size={17} color="#6E8090" strokeWidth={1.5} />
        </Pressable>
        <Eyebrow>
          {part
            ? `PART ${part} — ${sectionLabel.toUpperCase()}`
            : sectionLabel.toUpperCase()}
        </Eyebrow>
        <Text
          className="text-muted"
          style={{ fontSize: 10, fontWeight: '300', width: 44, textAlign: 'right' }}
        >
          {`~${minutesLeft} MIN`}
        </Text>
      </View>
      {/* Deepwater: thin aqua fill (accent = earned progress) on a line-soft track. */}
      <View className="mt-4 h-[2px] bg-line-soft">
        <Animated.View
          className="h-full"
          style={{
            width: fill.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        >
          <Animated.View className="h-full w-full bg-accent" style={{ opacity: shimmer }} />
        </Animated.View>
      </View>
    </View>
  );
}

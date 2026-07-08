// Shared onboarding chrome — Ember Dusk v2.
// Layout truth: reference/COMPOSE - Onboarding vB.dc.html (3a set).
// Color truth: the Design Authority Ruling (BUILD_PROMPT §1).

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { DUSK_RADIAL } from '../../theme/emberDusk';

/** 10px, 2px-tracked uppercase micro-type (eyebrows, progress, footers only). */
export function Eyebrow({
  children,
  center = false,
}: {
  children: string;
  center?: boolean;
}) {
  return (
    <Text
      className={`text-body ${center ? 'text-center' : ''}`}
      style={{ fontSize: 10, fontWeight: '300', letterSpacing: 2 }}
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
 * Warm dusk radial bleeding off the top of chapter/card screens.
 * rgba(200,155,109, 0.10–0.14) → transparent 65% per the ruling.
 */
export function DuskRadial({ intensity = 0.12 }: { intensity?: number }) {
  return (
    <View
      pointerEvents="none"
      className="absolute self-center"
      style={{ top: -170, width: 480, height: 480 }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="dusk" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#C89B6D" stopOpacity={intensity} />
            <Stop offset={String(DUSK_RADIAL.fadeStop)} stopColor="#C89B6D" stopOpacity="0" />
            <Stop offset="1" stopColor="#C89B6D" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dusk)" />
      </Svg>
    </View>
  );
}

/**
 * Progress header: back chevron · "MAPPING · X OF Y" · "~N MIN", over a 2px
 * track with sand fill (one of the screen's 4 permitted emissions).
 */
export function ProgressHeader({
  step,
  total,
  minutesLeft,
  onBack,
}: {
  step: number;
  total: number;
  minutesLeft: number;
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
          <ChevronLeft size={17} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
        <Eyebrow>{`MAPPING · ${step} OF ${total}`}</Eyebrow>
        <Text
          className="text-muted"
          style={{ fontSize: 10, fontWeight: '300', width: 44, textAlign: 'right' }}
        >
          {`~${minutesLeft} MIN`}
        </Text>
      </View>
      <View className="mt-4 h-[2px] bg-line">
        <Animated.View
          className="h-full bg-accent"
          style={{
            width: fill.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}

// EmissiveCTA — the primary action pill as an emissive object (Addendum §2):
// radial gradient core (lighter center), 12–16px outer bloom, 1px inner border
// at +15% luminance. On press the bloom expands ~20% and luminance dips, then
// settles — an exhale, not a click. Sentence case ALWAYS (Design Authority
// Ruling CTA-case override).
//
// This is one of the ≤4 sand emissions allowed per screen. Never render two.

import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { CTA, DURATION } from '../../theme/emberDusk';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Reference uses 18–20px vertical padding depending on screen density. */
  paddingVertical?: number;
  accessibilityHint?: string;
}

export default function EmissiveCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  paddingVertical = 19,
  accessibilityHint,
}: Props) {
  const press = useRef(new Animated.Value(0)).current;

  const settle = (to: number, ms: number) =>
    Animated.timing(press, {
      toValue: to,
      duration: ms,
      useNativeDriver: true,
    });

  const dimmed = disabled && !loading;

  return (
    <Animated.View
      style={{
        // Fill the row even under centering parents (chapter CTAs sit in
        // items-center columns — without this the pill collapses to its
        // label width), and round the wrapper so the bloom hugs the pill.
        width: '100%',
        borderRadius: 999,
        opacity: press.interpolate({
          inputRange: [0, 1],
          outputRange: [dimmed ? 0.45 : 1, CTA.pressDimOpacity],
        }),
        // The bloom: emission, not elevation. iOS-first (shadow* props).
        shadowColor: CTA.coreEdge,
        shadowOpacity: dimmed ? 0 : 0.35,
        shadowRadius: CTA.bloomRadius,
        shadowOffset: { width: 0, height: 0 },
        transform: [
          {
            scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] }),
          },
        ],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPressIn={() => settle(1, DURATION.microMin).start()}
        onPressOut={() => settle(0, DURATION.microMax).start()}
        onPress={onPress}
        className="w-full overflow-hidden rounded-full"
        style={{
          paddingVertical,
          borderWidth: 1,
          borderColor: dimmed ? 'transparent' : CTA.innerBorder,
        }}
      >
        {/* Radial core: lighter center → accent edge. */}
        <View className="absolute inset-0">
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="ctaCore" cx="50%" cy="50%" rx="60%" ry="160%">
                <Stop offset="0" stopColor={CTA.coreCenter} />
                <Stop offset="1" stopColor={CTA.coreEdge} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#ctaCore)" />
          </Svg>
        </View>
        {loading ? (
          <ActivityIndicator color="#0C0B09" />
        ) : (
          <Text
            className="text-center text-on-accent"
            style={{ fontSize: 15, fontWeight: '500', letterSpacing: 0.2 }}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

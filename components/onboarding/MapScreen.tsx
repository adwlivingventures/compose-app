// B-26/A-30 — "Your Map". Layout truth: 3a reference. Score + baseline gauge
// (cool calm zone 80–100, WARM marker — the user is the ember moving toward
// cool calm), severity chip rows (amber/red, matte, never glow), dynamic
// mirror sentence, one emissive CTA. The gauge marker is a miniature ember
// (Addendum §2) with a slow shimmer; the bars stagger in continuing the
// assembly the Generating screen just performed.

import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { DURATION, EASING } from '../../theme/emberDusk';
import type { MapScreen as MapDescriptor } from '../../content/onboarding/types';
import type { ComposureResult } from '../../content/onboarding/composure';
import { GAUGE, SEVERITY } from '../../theme/emberDusk';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { DuskRadial, Eyebrow } from './chrome';
import { useReduceMotion } from '../../hooks/useReduceMotion';

/**
 * The gauge marker as a miniature ember (Addendum §2): a warm core with a
 * couple of drifting sparks and a slow shimmer. Pure RN — identical on
 * Skia-less builds and under Reduce Motion (where it holds still).
 */
function EmberMarker({ shimmer: shimmerProp = true }: { shimmer?: boolean }) {
  const reduceMotion = useReduceMotion();
  const shimmer = shimmerProp && !reduceMotion;
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!shimmer) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 3400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, glow]);

  const spark = (top: number, left: number, sz: number, base: number) => (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: sz,
        height: sz,
        borderRadius: sz / 2,
        backgroundColor: '#D9B285',
        opacity: shimmer
          ? glow.interpolate({ inputRange: [0, 1], outputRange: [base, base + 0.3] })
          : base,
      }}
    />
  );

  return (
    <View style={{ width: 10, height: 22, marginLeft: -5 }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 4,
          top: 4,
          width: 2,
          height: 14,
          borderRadius: 2,
          backgroundColor: '#C89B6D',
          shadowColor: '#C89B6D',
          shadowOpacity: shimmer
            ? (glow.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.75] }) as never)
            : 0.6,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
      {spark(0, 1, 3, 0.5)}
      {spark(6, 8, 2, 0.4)}
      {spark(17, 0, 2, 0.35)}
    </View>
  );
}

/** Horizontal baseline gauge — also reused dimmed on the paywall-dismiss screen. */
export function BaselineGauge({
  score,
  calmZone,
  dimmed = false,
}: {
  score: number;
  calmZone: [number, number];
  dimmed?: boolean;
}) {
  return (
    <View style={{ opacity: dimmed ? 0.55 : 1 }}>
      <View className="rounded-md bg-surface" style={{ height: 8 }}>
        <View
          className="absolute rounded-r-md"
          style={{
            left: `${calmZone[0]}%`,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: GAUGE.calmZone,
          }}
        />
        {/* The user's marker: warm light against the cool field. */}
        <View style={{ position: 'absolute', left: `${score}%`, top: -4 }}>
          <EmberMarker shimmer={!dimmed} />
        </View>
      </View>
    </View>
  );
}

/** Bars continue the assembly: staggered rise, breath-out easing. */
function StaggeredRow({ index, children }: { index: number; children: React.ReactNode }) {
  const reduceMotion = useReduceMotion();
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      t.setValue(1);
      return;
    }
    Animated.timing(t, {
      toValue: 1,
      duration: DURATION.transitionMin,
      delay: 200 + index * (DURATION.answerStagger * 2),
      easing: Easing.bezier(...EASING.breathOut),
      useNativeDriver: true,
    }).start();
  }, [t, index, reduceMotion]);
  return (
    <Animated.View
      style={{
        opacity: t,
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function MapScreen({
  screen,
  result,
  headline,
  onAdvance,
}: {
  screen: MapDescriptor;
  result: ComposureResult;
  /** Pre-resolved with the user's name by the flow runner. */
  headline: string;
  onAdvance: () => void;
}) {
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <DuskRadial intensity={0.14} />
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 64, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <Eyebrow>{screen.eyebrow}</Eyebrow>
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 24, lineHeight: 31, marginTop: 10 }}
          >
            {headline}
          </Text>

          <View className="mt-4 flex-row items-baseline" style={{ gap: 4 }}>
            <Text className="font-serif-regular text-ink" style={{ fontSize: 56, lineHeight: 60 }}>
              {result.score}
            </Text>
            <Text className="font-serif-regular text-faint" style={{ fontSize: 24 }}>
              {' '}/ 100
            </Text>
          </View>
          <Text className="text-muted" style={{ fontSize: 11, fontWeight: '300', marginTop: 6 }}>
            {screen.scoreLabel}
          </Text>

          <View className="mt-4">
            <BaselineGauge score={result.score} calmZone={screen.gauge.calmZone} />
            <Text
              className="text-right text-accent-deep"
              style={{ fontSize: 10, fontWeight: '300', marginTop: 6 }}
            >
              {screen.gauge.calmLabel}
            </Text>
            <Text className="text-muted" style={{ fontSize: 11, fontWeight: '300', marginTop: 2 }}>
              {screen.gauge.caption}
            </Text>
          </View>

          <View className="mt-4" style={{ gap: 8 }}>
            {result.bars.map((bar, index) => (
              <StaggeredRow key={bar.label} index={index}>
                <View
                  className="flex-row items-center justify-between rounded-xl bg-surface"
                  style={{ paddingVertical: 11, paddingHorizontal: 14 }}
                >
                  <Text className="text-ink" style={{ fontSize: 13, fontWeight: '300' }}>
                    {bar.label}
                  </Text>
                  <View
                    className="rounded-full"
                    style={{
                      paddingVertical: 3,
                      paddingHorizontal: 9,
                      backgroundColor: bar.tone === 'red' ? SEVERITY.redBg : SEVERITY.amberBg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        letterSpacing: 0.5,
                        color: bar.tone === 'red' ? SEVERITY.red : SEVERITY.amber,
                      }}
                    >
                      {bar.grade.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </StaggeredRow>
            ))}
          </View>

          <Text
            className="mt-4 font-serif-italic text-body"
            style={{ fontSize: 13, lineHeight: 20 }}
          >
            "{result.mirror}"
          </Text>
          <Text
            className="mt-3 text-body"
            style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21 }}
          >
            {screen.body}
          </Text>
        </ScrollView>

        <View className="px-6 pb-11" style={{ paddingTop: 14 }}>
          <EmissiveCTA label={screen.button} onPress={onAdvance} paddingVertical={18} />
          <Text
            className="text-center text-faint"
            style={{ fontSize: 10, fontWeight: '300', letterSpacing: 0.5, marginTop: 12 }}
          >
            {screen.footer.toUpperCase()}
          </Text>
        </View>
      </View>
    </ScreenFade>
  );
}

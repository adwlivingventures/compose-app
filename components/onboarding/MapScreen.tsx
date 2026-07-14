// "Your Results" (founder revamp 2026-07-10) — the unflinching read of his
// problem. Score + one-sentence verdict, self-explanatory gauge (labeled
// axis ends), severity rows that each carry a plain-English detail line
// traced to his answer (amber/red matte; healthy reads neutral, never
// warning-colored). No protocol preview here — the four driver cards follow.

import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { DURATION, EASING } from '../../theme/emberDusk';
import type { MapScreen as MapDescriptor } from '../../content/onboarding/types';
import { type ComposureResult, type SeverityBar } from '../../content/onboarding/composure';
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

/** Severity rank 0–3 per grade — drives both the meter and the most-serious-
 *  first ordering. Palette-free ranking (founder review 2026-07-13): the reader
 *  sees which areas are worse without leaving the amber/red severity language
 *  (Ember Dusk bans a green "good" color; healthy already reads neutral). */
const GRADE_SEVERITY: Record<string, number> = {
  High: 3,
  Elevated: 2,
  Active: 2,
  Moderate: 2,
  Limited: 2,
  Partial: 1,
  Present: 1,
  Low: 0,
  Full: 0,
  Quiet: 0,
  Unmeasured: 0,
};
const severityOf = (grade: string): number => GRADE_SEVERITY[grade] ?? 1;

// Severity colour ramp (founder ruling 2026-07-13): 1 tick = gold, 2 = orange
// (the midpoint blend of gold and red), 3 = red. Orange is the only added hue —
// a blend of the two existing severity colours, not a new green/traffic light.
const SEVERITY_ORANGE = '#DD915B';
function severityColors(severity: number): { fill: string; bg: string; text: string } {
  if (severity >= 3) return { fill: SEVERITY.red, bg: SEVERITY.redBg, text: SEVERITY.red };
  if (severity === 2)
    return { fill: SEVERITY_ORANGE, bg: 'rgba(221,145,91,0.15)', text: SEVERITY_ORANGE };
  if (severity === 1) return { fill: SEVERITY.amber, bg: SEVERITY.amberBg, text: SEVERITY.amber };
  return { fill: '#232D42', bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' };
}

/** Three-segment severity meter: filled segments = rank, coloured by that rank
 *  (gold / orange / red); empties sit on the hairline colour. */
function SeverityMeter({ severity }: { severity: number }) {
  const fill = severityColors(severity).fill;
  return (
    <View className="flex-row" style={{ gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < severity ? fill : '#232D42',
          }}
        />
      ))}
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
  // Most-serious first, so the ranking reads top-down (founder review
  // 2026-07-13). Hermes' sort is stable, so ties keep the clinical order.
  const orderedBars = [...result.bars].sort(
    (a, b) => severityOf(b.grade) - severityOf(a.grade),
  );
  // Guarantee at least one red: if his worst area is a genuine problem
  // (moderate) but nothing hit High naturally, his single worst driver reads
  // red — honest ranking of his real answers, framed as his primary driver
  // (founder ruling 2026-07-13). Guarded to severity 2 so a genuinely mild
  // profile (near-impossible in this funnel) is never given a fabricated red.
  const topRaw = orderedBars.length ? severityOf(orderedBars[0].grade) : 0;
  const promoteTop = topRaw === 2;
  const displayedSeverity = (bar: SeverityBar, i: number) =>
    i === 0 && promoteTop ? 3 : severityOf(bar.grade);
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

          <View className="mt-5">
            <BaselineGauge score={result.score} calmZone={screen.gauge.calmZone} />
            <View className="mt-6 flex-row justify-between">
              <Text className="text-muted" style={{ fontSize: 10, fontWeight: '300' }}>
                {screen.gauge.axisLow}
              </Text>
              <Text
                className="text-right text-accent-deep"
                style={{ fontSize: 10, fontWeight: '300' }}
              >
                {screen.gauge.axisHigh}
              </Text>
            </View>
            <Text
              className="text-right text-accent-deep"
              style={{ fontSize: 9, fontWeight: '300', letterSpacing: 1, marginTop: 2 }}
            >
              {screen.gauge.calmLabel}
            </Text>
          </View>

          <Text
            className="mt-5 text-body"
            style={{ fontSize: 10, fontWeight: '300', letterSpacing: 2 }}
          >
            {screen.barsHeading.toUpperCase()}
          </Text>
          <View className="mt-2" style={{ gap: 8 }}>
            {orderedBars.map((bar, index) => {
              const sev = displayedSeverity(bar, index);
              const c = severityColors(sev);
              return (
              <StaggeredRow key={bar.label} index={index}>
                <View
                  className="rounded-xl bg-surface"
                  style={{ paddingVertical: 11, paddingHorizontal: 14 }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-ink" style={{ fontSize: 13, fontWeight: '400' }}>
                      {bar.label}
                    </Text>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <SeverityMeter severity={sev} />
                      <View
                        className="rounded-full"
                        style={{
                          paddingVertical: 3,
                          paddingHorizontal: 9,
                          backgroundColor: c.bg,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '600',
                            letterSpacing: 0.5,
                            color: c.text,
                          }}
                        >
                          {bar.grade.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Plain-English read of this bar, traced to his answer. */}
                  <Text
                    className="text-muted"
                    style={{ fontSize: 11.5, fontWeight: '300', lineHeight: 16.5, marginTop: 5 }}
                  >
                    {bar.detail}
                  </Text>
                </View>
              </StaggeredRow>
              );
            })}
          </View>
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

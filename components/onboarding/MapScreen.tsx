// "Your Composure Score" — the funnel's viral moment. The score lands as the
// hero: counted up, ring-framed, haptic-sealed. A verdict + hook frame why
// this number is the whole product's spine; drivers stay below as depth.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { DURATION, EASING } from '../../theme/emberDusk';
import { DEEPWATER } from '../../theme/deepwater';
import type { MapScreen as MapDescriptor } from '../../content/onboarding/types';
import {
  type ComposureResult,
  type SeverityBar,
} from '../../content/onboarding/composure';
import { GAUGE, SEVERITY } from '../../theme/emberDusk';
import { seal } from '../../services/haptics';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { DuskRadial, Eyebrow } from './chrome';
import { useReduceMotion } from '../../hooks/useReduceMotion';

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
  const clamped = Math.min(100, Math.max(0, score));
  const fillPct = Math.max(clamped, clamped > 0 ? 2 : 0);
  const trackH = 10;
  const capW = 5;
  const capH = 16;

  return (
    <View style={{ opacity: dimmed ? 0.55 : 1, paddingVertical: 4 }}>
      <View style={{ height: trackH, justifyContent: 'center' }}>
        <View
          style={{
            height: trackH,
            borderRadius: trackH / 2,
            backgroundColor: '#182430',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: `${calmZone[0]}%`,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: GAUGE.calmZone,
            }}
          />
          {fillPct > 0 && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${fillPct}%`,
                borderRadius: trackH / 2,
                overflow: 'hidden',
              }}
            >
              <Svg width="100%" height={trackH} preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="gaugeScoreFill" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={DEEPWATER.accentDeep} stopOpacity={dimmed ? 0.75 : 1} />
                    <Stop offset="0.5" stopColor={DEEPWATER.accent} stopOpacity={dimmed ? 0.8 : 1} />
                    <Stop offset="1" stopColor={DEEPWATER.accentBright} stopOpacity={dimmed ? 0.85 : 1} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width="100%"
                  height={trackH}
                  rx={trackH / 2}
                  fill="url(#gaugeScoreFill)"
                />
              </Svg>
            </View>
          )}
        </View>
        {clamped > 0 && (
          <View
            style={{
              position: 'absolute',
              left: `${clamped}%`,
              marginLeft: -capW / 2,
              width: capW,
              height: capH,
              borderRadius: capW / 2,
              backgroundColor: DEEPWATER.accentBright,
              shadowColor: DEEPWATER.accent,
              shadowOpacity: dimmed ? 0.35 : 0.7,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        )}
      </View>
    </View>
  );
}

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

const SEVERITY_ORANGE = '#DD915B';
function severityColors(severity: number): { fill: string; bg: string; text: string } {
  if (severity >= 3) return { fill: SEVERITY.red, bg: SEVERITY.redBg, text: SEVERITY.red };
  if (severity === 2)
    return { fill: SEVERITY_ORANGE, bg: 'rgba(221,145,91,0.15)', text: SEVERITY_ORANGE };
  if (severity === 1) return { fill: SEVERITY.amber, bg: SEVERITY.amberBg, text: SEVERITY.amber };
  return { fill: '#223140', bg: 'rgba(107,114,128,0.12)', text: '#93A4B0' };
}

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
            backgroundColor: i < severity ? fill : '#223140',
          }}
        />
      ))}
    </View>
  );
}

function StaggeredRow({ index, children }: { index: number; children: ReactNode }) {
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

/** Count-up + ring — the score lands like a reveal, not a label. */
function ComposureScoreHero({
  score,
  hook,
}: {
  score: number;
  hook?: string;
}) {
  const reduceMotion = useReduceMotion();
  const [displayScore, setDisplayScore] = useState(reduceMotion ? score : 0);
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.92)).current;
  const sealed = useRef(false);

  const size = 168;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = displayScore / 100;

  useEffect(() => {
    if (reduceMotion) {
      setDisplayScore(score);
      heroOpacity.setValue(1);
      heroScale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.bezier(...EASING.breathOut),
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const durationMs = 1400;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(eased * score);
      setDisplayScore(next);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (!sealed.current) {
        sealed.current = true;
        seal();
      }
    };
    requestAnimationFrame(tick);
  }, [score, reduceMotion, heroOpacity, heroScale]);

  return (
    <View className="items-center rounded-2xl border border-line bg-surface px-5 py-7">
      <Animated.View
        style={{
          opacity: heroOpacity,
          transform: [{ scale: heroScale }],
          alignSelf: 'stretch',
          alignItems: 'center',
        }}
      >
        <Eyebrow center>COMPOSURE SCORE</Eyebrow>
        <View style={{ width: size, height: size, marginTop: 18 }} className="items-center justify-center">
          <Svg
            width={size}
            height={size}
            style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
          >
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={DEEPWATER.line}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={DEEPWATER.accent}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
            />
          </Svg>
          <View className="items-center">
            <Text
              className="font-serif-light text-accent"
              style={{
                fontSize: 72,
                lineHeight: 76,
                textShadowColor: 'rgba(95,212,193,0.35)',
                textShadowRadius: 18,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              {displayScore}
            </Text>
            <Text className="font-serif-regular text-faint" style={{ fontSize: 18, marginTop: -4 }}>
              / 100
            </Text>
          </View>
        </View>
        {hook ? (
          <Text
            className="text-center text-ember-bright font-serif-italic"
            style={{ fontSize: 15, lineHeight: 22, marginTop: 16 }}
          >
            {hook}
          </Text>
        ) : null}
      </Animated.View>
    </View>
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
  headline: string;
  onAdvance: () => void;
}) {
  const [expandedBar, setExpandedBar] = useState<string | null>(null);
  const reduceMotion = useReduceMotion();
  const summaryOpacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(summaryOpacity, {
      toValue: 1,
      duration: DURATION.transitionMin,
      delay: 1500,
      easing: Easing.bezier(...EASING.breathOut),
      useNativeDriver: true,
    }).start();
  }, [summaryOpacity, reduceMotion]);

  const orderedBars = [...result.bars].sort(
    (a, b) => severityOf(b.grade) - severityOf(a.grade),
  );
  const topRaw = orderedBars.length ? severityOf(orderedBars[0].grade) : 0;
  const promoteTop = topRaw === 2;
  const displayedSeverity = (bar: SeverityBar, i: number) =>
    i === 0 && promoteTop ? 3 : severityOf(bar.grade);

  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <DuskRadial intensity={0.2} />
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 56, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <ComposureScoreHero score={result.score} hook={screen.scoreHook} />

          <Text
            className="mt-4 font-serif-regular text-ink text-center"
            style={{ fontSize: 20, lineHeight: 26 }}
          >
            {headline}
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
            <Animated.View style={{ opacity: summaryOpacity, marginTop: 16 }}>
              <Text
                className="text-ink font-serif-italic text-center"
                style={{ fontSize: 14, lineHeight: 21 }}
              >
                {result.summary}
              </Text>
            </Animated.View>
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
              const open = expandedBar === bar.label;
              return (
                <StaggeredRow key={bar.label} index={index}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setExpandedBar(open ? null : bar.label)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={`${bar.label}, ${bar.grade}. ${open ? 'Collapse' : 'Expand'} detail.`}
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
                        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                          <ChevronDown size={14} color="#6E8090" />
                        </View>
                      </View>
                    </View>
                    {open && bar.detail.length > 0 && (
                      <Text
                        className="text-muted"
                        style={{ fontSize: 12, lineHeight: 18, marginTop: 8 }}
                      >
                        {bar.detail}
                      </Text>
                    )}
                  </TouchableOpacity>
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

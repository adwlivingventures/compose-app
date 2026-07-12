// Archetype scaffolds — Ember Dusk v2 onboarding.
// Layout truth: the 3a reference screens; color/material: the ruling +
// Craft Layer Addendum. Screen components receive resolved descriptors from
// buildFlow.

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import type {
  ChapterScreen as ChapterDescriptor,
  ClinicalCardScreen as ClinicalCardDescriptor,
  CommitScreen as CommitDescriptor,
  NoteCardScreen as NoteCardDescriptor,
  ResolvedScreen,
} from '../../content/onboarding/types';
import { HERO_RENDERS } from '../../content/onboarding/heroes';
import { DURATION, EASING } from '../../theme/emberDusk';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import EmissiveCTA from './EmissiveCTA';
import { DuskRadial, Eyebrow, SecondaryLink, Wordmark } from './chrome';

const breathOut = Easing.bezier(...EASING.breathOut);

/** Screen-entrance fade used by every archetype (transitions 380–450ms). */
export function ScreenFade({ children }: { children: React.ReactNode }) {
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
      easing: breathOut,
      useNativeDriver: true,
    }).start();
  }, [t, reduceMotion]);
  return <Animated.View style={{ flex: 1, opacity: t }}>{children}</Animated.View>;
}

/** Hero render with the reference's fade-to-ground bottom gradient.
 *  overflow-hidden is load-bearing: without it a large render bleeds across
 *  the whole screen (visible once the luminous somatic asset landed on B-01). */
function HeroImage({
  asset,
  height = 300,
  mode = 'cover',
}: {
  asset: string;
  height?: number;
  mode?: 'cover' | 'contain';
}) {
  const source = HERO_RENDERS[asset];
  if (!source) return null;
  return (
    <View className="relative mx-10 overflow-hidden" style={{ height, marginTop: 18 }}>
      <Image
        source={source}
        resizeMode={mode}
        style={{ width: '100%', height: '100%', opacity: 0.95 }}
      />
      {/* Fade the bottom half into ground so the render never has an edge. */}
      <View className="absolute inset-x-0 bottom-0 h-1/2">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#080A0F" stopOpacity="0" />
              <Stop offset="1" stopColor="#080A0F" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroFade)" />
        </Svg>
      </View>
    </View>
  );
}

/**
 * Chapter / welcome archetype (B-01, B-02, B-32, B-34): centered, wordmark or
 * eyebrow, optional hero or dusk radial, single CTA.
 */
export function Chapter({
  screen,
  onAdvance,
}: {
  screen: ChapterDescriptor;
  onAdvance: () => void;
}) {
  const isWordmark = screen.eyebrow === 'COMPOSE';
  // Warm-welcome effect (founder review 2026-07-10): the headline settles in
  // on a longer breath under a stronger dusk radial — arrival, not a click.
  const welcome = screen.welcome === true;
  const reduceMotion = useReduceMotion();
  const settle = useRef(new Animated.Value(welcome && !reduceMotion ? 0 : 1)).current;
  useEffect(() => {
    if (!welcome || reduceMotion) return;
    Animated.timing(settle, {
      toValue: 1,
      duration: 1100,
      easing: breathOut,
      useNativeDriver: true,
    }).start();
  }, [welcome, reduceMotion, settle]);
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        {!screen.hero && <DuskRadial intensity={welcome ? 0.16 : 0.12} />}
        <View style={{ paddingTop: 76 }}>
          {isWordmark ? <Wordmark /> : screen.eyebrow ? <Eyebrow center>{screen.eyebrow}</Eyebrow> : null}
        </View>
        {screen.hero && (
          <HeroImage asset={screen.hero} mode={screen.heroMode} height={screen.heroHeight} />
        )}
        <View
          className="flex-1 items-center px-10"
          // No-hero chapters (welcome) center their text block in the field
          // instead of stacking it under the wordmark over a blank lower half
          // (founder review 2026-07-10).
          style={{
            paddingTop: screen.hero ? 10 : 0,
            justifyContent: screen.hero ? 'flex-start' : 'center',
          }}
        >
          {/* NativeWind classes don't reach Animated primitives — animate a
              plain wrapper and keep the styled Text inside it. */}
          <Animated.View
            style={{
              opacity: settle,
              transform: [
                { translateY: settle.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            }}
          >
            {/* An explicit \n marks intentional line breaks: each segment is
                its own no-wrap line, shrunk to fit narrow devices, so the
                break lands exactly where the copy says — never mid-sentence. */}
            {screen.headline.split('\n').map((line, i) => (
              <Text
                key={i}
                numberOfLines={screen.headline.includes('\n') ? 1 : undefined}
                adjustsFontSizeToFit={screen.headline.includes('\n')}
                minimumFontScale={0.6}
                className="text-center font-serif-regular text-ink"
                style={{ fontSize: 31, lineHeight: 40 }}
              >
                {line}
              </Text>
            ))}
          </Animated.View>
          {screen.bodyBlocks?.map((block, i) => (
            <Text
              key={i}
              className="text-center text-body"
              style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 18 }}
            >
              {block}
            </Text>
          ))}
          {screen.statCards?.map((stat, i) => (
            <View key={i} className="mt-3 w-full rounded-2xl bg-surface px-4 py-4">
              <Text
                className="text-center text-body"
                style={{ fontSize: 13, fontWeight: '300', lineHeight: 20 }}
              >
                {stat}
              </Text>
            </View>
          ))}
          {screen.advisorLine ? (
            <Text
              className="mt-4 text-center font-serif-italic text-muted"
              style={{ fontSize: 12 }}
            >
              {screen.advisorLine}
            </Text>
          ) : null}
          {screen.closingLine && (
            <Text
              className="mt-5 text-center font-serif-italic text-accent-deep"
              style={{ fontSize: 14.5 }}
            >
              {screen.closingLine}
            </Text>
          )}
        </View>
        {/* px-6 (founder review 2026-07-10): the welcome CTAs read wider. */}
        <View className="items-center px-6 pb-[52px]" style={{ gap: 20 }}>
          {screen.privacyLine && (
            // Two centered lines (founder review 2026-07-10): the promise on
            // its own line, the specifics beneath it — one long run wrapped
            // arbitrarily on narrow screens.
            <View className="items-center" style={{ gap: 4, opacity: 0.45 }}>
              {screen.privacyLine.split(' — ').map((line, i) => (
                <Text
                  key={i}
                  className="text-center text-body"
                  style={{ fontSize: 10, letterSpacing: 1 }}
                >
                  {line.toUpperCase()}
                </Text>
              ))}
            </View>
          )}
          <EmissiveCTA label={screen.button} onPress={onAdvance} paddingVertical={20} />
          {screen.microText && (
            <Text className="text-faint" style={{ fontSize: 11, fontWeight: '300' }}>
              {screen.microText}
            </Text>
          )}
        </View>
      </View>
    </ScreenFade>
  );
}

/**
 * Section transition (before Parts 1/2/3): micro-type interstitial. Auto-
 * advances (founder review 2026-07-10: 2.2s — long enough to read), and a tap
 * anywhere advances early. No button: a visible control would turn the breath
 * into a decision point.
 */
export function SectionTransition({
  label,
  autoAdvanceMs,
  onAdvance,
}: {
  label: string;
  autoAdvanceMs: number;
  onAdvance: () => void;
}) {
  const advanced = useRef(false);
  const fire = () => {
    if (!advanced.current) {
      advanced.current = true;
      onAdvance();
    }
  };
  useEffect(() => {
    const id = setTimeout(fire, autoAdvanceMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScreenFade>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} — continue`}
        onPress={fire}
        className="flex-1 items-center justify-center bg-ground"
      >
        <Eyebrow center>{label}</Eyebrow>
      </Pressable>
    </ScreenFade>
  );
}

/**
 * Circular emissive arrow — the diagnosis cards' navigation (founder review
 * 2026-07-10: a different affordance marks the reveal section as its own
 * chapter; no text, one arrow). Counts as the screen's one sand emission.
 */
export function ArrowCTA({
  onPress,
  accessibilityLabel = 'Continue',
}: {
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const press = useRef(new Animated.Value(0)).current;
  const settle = (to: number, ms: number) =>
    Animated.timing(press, { toValue: to, duration: ms, useNativeDriver: true });
  return (
    <Animated.View
      // style, not className — NativeWind doesn't reach Animated views.
      style={{
        alignSelf: 'center',
        borderRadius: 999,
        shadowColor: '#C89B6D',
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 0 },
        opacity: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }),
        transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => settle(1, DURATION.microMin).start()}
        onPressOut={() => settle(0, DURATION.microMax).start()}
        onPress={onPress}
        hitSlop={10}
        className="items-center justify-center overflow-hidden rounded-full"
        style={{ width: 58, height: 58, borderWidth: 1, borderColor: 'rgba(233,196,152,0.6)' }}
      >
        <View className="absolute inset-0">
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="arrowCore" cx="50%" cy="50%" rx="60%" ry="60%">
                <Stop offset="0" stopColor="#D9B285" />
                <Stop offset="1" stopColor="#C89B6D" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#arrowCore)" />
          </Svg>
        </View>
        <ArrowRight size={22} color="#0C0B09" strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

/**
 * Clinical Context card (the four dark cards): centered render + dusk radial,
 * "CLINICAL CONTEXT · N OF 4" eyebrow, body, optional conditional lines.
 * No per-card hope line — the batched arc holds tension across all four
 * cards and resolves at the turn-welcome pivot. Emissive CTA.
 */
export function ClinicalCard({
  screen,
  visibleConditionalLines,
  onAdvance,
}: {
  screen: ResolvedScreen & ClinicalCardDescriptor;
  /** Conditional lines already filtered against answers by the flow runner. */
  visibleConditionalLines: string[];
  onAdvance: () => void;
}) {
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <DuskRadial intensity={0.14} />
        <View className="flex-1 items-center justify-center px-9">
          <Eyebrow center>{`WHAT YOUR ANSWERS SHOW · ${screen.clinicalIndex} OF 4`}</Eyebrow>
          <Image
            source={HERO_RENDERS[screen.render]}
            resizeMode={screen.renderMode === 'cover' ? 'cover' : 'contain'}
            style={{
              width: 190,
              height: 190,
              marginTop: 22,
              ...(screen.renderMode === 'cover' ? { borderRadius: 14, opacity: 0.9 } : null),
            }}
          />
          <Text
            className="text-center font-serif-regular text-ink"
            style={{ fontSize: 29, lineHeight: 37, marginTop: 14 }}
          >
            {screen.title}
          </Text>
          <Text
            className="text-center text-body"
            style={{ fontSize: 14, fontWeight: '300', lineHeight: 23, marginTop: 16 }}
          >
            {screen.body}
          </Text>
          {visibleConditionalLines.map((line) => (
            <Text
              key={line}
              className="text-center text-body"
              style={{ fontSize: 13, fontWeight: '300', lineHeight: 20, marginTop: 12 }}
            >
              {line}
            </Text>
          ))}
        </View>
        {/* Arrow, not a labeled pill (founder review 2026-07-10): the reveal
            cards are their own section and should navigate like one. */}
        <View className="pb-[52px]">
          <ArrowCTA
            onPress={onAdvance}
            accessibilityLabel={screen.button}
          />
        </View>
      </View>
    </ScreenFade>
  );
}

/** Conditional note card (B-12 physician triage): calm, zero alarm styling. */
export function NoteCard({
  screen,
  onAdvance,
}: {
  screen: NoteCardDescriptor;
  onAdvance: () => void;
}) {
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="flex-1 justify-center px-7">
          <Eyebrow>{screen.eyebrow}</Eyebrow>
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 26, lineHeight: 34, marginTop: 12 }}
          >
            {screen.title}
          </Text>
          <Text
            className="text-body"
            style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 16 }}
          >
            {screen.body}
          </Text>
        </View>
        <View className="px-8 pb-[52px]">
          <EmissiveCTA label={screen.button} onPress={onAdvance} />
        </View>
      </View>
    </ScreenFade>
  );
}

/** Brief beat (B-38): max 2s, single line, momentum into the paywall. */
export function Beat({
  text,
  maxMs,
  onAdvance,
}: {
  text: string;
  maxMs: number;
  onAdvance: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onAdvance, maxMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScreenFade>
      <View className="flex-1 items-center justify-center bg-ground px-10">
        <Text
          className="text-center font-serif-regular text-ink"
          style={{ fontSize: 22, lineHeight: 30 }}
        >
          {text}
        </Text>
      </View>
    </ScreenFade>
  );
}

/** Commit question (B-37) with its doubt interstitial. */
export function Commit({
  screen,
  onAdvance,
}: {
  screen: CommitDescriptor;
  onAdvance: () => void;
}) {
  const [doubting, setDoubting] = useState(false);
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="flex-1 justify-center px-7">
          {doubting ? (
            <Text
              className="text-center font-serif-regular text-ink"
              style={{ fontSize: 24, lineHeight: 34 }}
            >
              {screen.doubt.body}
            </Text>
          ) : (
            <>
              <Text
                className="font-serif-regular text-ink"
                style={{ fontSize: 26, lineHeight: 35 }}
              >
                {screen.headline}
              </Text>
              <Text
                className="text-body"
                style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 16 }}
              >
                {screen.body}
              </Text>
              <Text
                className="font-serif-regular text-ink"
                style={{ fontSize: 21, lineHeight: 29, marginTop: 26 }}
              >
                {screen.question}
              </Text>
            </>
          )}
        </View>
        <View className="px-8 pb-[52px]" style={{ gap: 6 }}>
          <EmissiveCTA
            label={doubting ? screen.doubt.button : screen.button}
            onPress={onAdvance}
          />
          {!doubting && (
            <SecondaryLink label={screen.doubtLink} onPress={() => setDoubting(true)} />
          )}
        </View>
      </View>
    </ScreenFade>
  );
}

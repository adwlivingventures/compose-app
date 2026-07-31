// Archetype scaffolds — Deepwater onboarding.
// Layout truth: the 3a reference screens; color/material: the Deepwater brief
// (aqua current = actions/progress; ember = identity lines; the diagnosis
// section alone runs ember-rust). Screen components receive resolved
// descriptors from buildFlow.

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
import { COPPER_ARROW, DIAGNOSTIC, DURATION, EASING, type ArrowAccent } from '../../theme/emberDusk';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import EmissiveCTA from './EmissiveCTA';
import ClinicalHero from './ClinicalHero';
import { DuskRadial, Eyebrow, SecondaryLink, Wordmark } from './chrome';

/** Render `**word**` spans in body copy as ink-weight emphasis (QUITTR-style
 *  keyword bolding) inside an otherwise weight-300 line. */
export function EmphasizedText({ text, ...rest }: { text: string } & React.ComponentProps<typeof Text>) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text {...rest}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={i} className="text-ink" style={{ fontWeight: '500' }}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

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
              <Stop offset="0" stopColor="#0A0F16" stopOpacity="0" />
              <Stop offset="1" stopColor="#0A0F16" stopOpacity="1" />
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
          {/* Bespoke SVG motif (QUITTR-style image-forward chapter) — sits
              above the headline. Deepwater role: chapter motifs point forward,
              so they ride the aqua current (ClinicalHero default). */}
          {screen.motif ? (
            <View style={{ marginBottom: 18 }}>
              <ClinicalHero motif={screen.motif} />
            </View>
          ) : null}
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
            <EmphasizedText
              key={i}
              text={block}
              className="text-center text-body"
              style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 18 }}
            />
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
          {/* Sequenced steps (founder ruling 2026-07-25) — one frosted card,
              numbered rows, hairline separators. Deliberately the SAME visual
              grammar as the Today dashboard's training timeline: the shape a
              man learns here is the shape he reads every day for 75 days.
              Left-aligned by design — centered lists read as decoration; a
              numbered left rail reads as a process. */}
          {screen.steps?.length ? (
            <View className="mt-6 w-full rounded-2xl border border-line bg-surface px-4">
              {screen.steps.map((step, i) => (
                <View
                  key={step.label}
                  className={`flex-row items-center py-3.5 ${
                    i === screen.steps!.length - 1 ? '' : 'border-b border-line-soft'
                  }`}
                  style={{ gap: 13 }}
                >
                  <View className="h-[26px] w-[26px] items-center justify-center rounded-full border border-accent">
                    <Text className="text-accent" style={{ fontSize: 11, fontWeight: '600' }}>
                      {i + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink" style={{ fontSize: 14, fontWeight: '500' }}>
                      {step.label}
                    </Text>
                    {step.line ? (
                      <Text
                        className="text-muted"
                        style={{ fontSize: 11.5, fontWeight: '300', lineHeight: 16, marginTop: 2 }}
                      >
                        {step.line}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          {screen.advisorLine ? (
            <Text
              className="mt-4 text-center font-serif-italic text-muted"
              style={{ fontSize: 12 }}
            >
              {screen.advisorLine}
            </Text>
          ) : null}
          {screen.closingLine && (
            // Accent unification (2026-07-25): italic closing lines read in
            // ink — the serif italic carries the identity register.
            <Text
              className="mt-5 text-center font-serif-italic text-ink"
              style={{ fontSize: 14.5 }}
            >
              {screen.closingLine}
            </Text>
          )}
        </View>
        {/* px-6 (founder review 2026-07-10): the welcome CTAs read wider. */}
        <View className="items-center px-6 pb-[52px]" style={{ gap: 20 }}>
          <EmissiveCTA label={screen.button} onPress={onAdvance} paddingVertical={20} />
          {screen.privacyLine && (
            // Founder ruling 2026-07-25: the privacy line sits BELOW the CTA —
            // it is objection-handling read at the moment of commitment, not a
            // preamble competing with the headline. Two centered lines: the
            // promise on its own line, specifics beneath (one long run wraps
            // arbitrarily on narrow screens).
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
 * chapter; no text, one arrow). Counts as the screen's one accent emission.
 */
export function ArrowCTA({
  onPress,
  accessibilityLabel = 'Continue',
  accent = COPPER_ARROW,
}: {
  onPress: () => void;
  accessibilityLabel?: string;
  accent?: ArrowAccent;
}) {
  const reduceMotion = useReduceMotion();
  const press = useRef(new Animated.Value(0)).current;
  // Idle exhale — a slow, low-amplitude halo pulse (~2.6s each way). Paced to
  // a breath, not a notification blink: it invites the tap without stimulating
  // the sympathetic response the whole app exists to quiet. Off under
  // reduce-motion.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, easing: breathOut, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, easing: breathOut, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const settle = (to: number, ms: number) =>
    Animated.timing(press, { toValue: to, duration: ms, useNativeDriver: true });

  return (
    <View style={{ alignSelf: 'center', width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}>
      {/* Breathing halo ring — the emission that makes the control a focal
          object without a label. Behind the button; non-interactive. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 92,
          height: 92,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: accent.halo,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }],
        }}
      />
      <Animated.View
        // style, not className — NativeWind doesn't reach Animated views.
        style={{
          borderRadius: 999,
          shadowColor: accent.glow,
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          opacity: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }),
          transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }) }],
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPressIn={() => settle(1, DURATION.microMin).start()}
          onPressOut={() => settle(0, DURATION.microMax).start()}
          onPress={onPress}
          hitSlop={12}
          className="items-center justify-center overflow-hidden rounded-full"
          style={{ width: 66, height: 66, borderWidth: 1, borderColor: accent.border }}
        >
          <View className="absolute inset-0">
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="arrowCore" cx="42%" cy="38%" rx="72%" ry="72%">
                  <Stop offset="0" stopColor={accent.coreLight} />
                  <Stop offset="0.55" stopColor={accent.core} />
                  <Stop offset="1" stopColor={accent.coreDeep} />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#arrowCore)" />
            </Svg>
          </View>
          <ArrowRight size={25} color="#06232A" strokeWidth={2.25} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

/**
 * Clinical Context card (the reveal cards): centered motif + dusk radial,
 * "WHAT YOUR ANSWERS SHOW · N OF total" eyebrow, optional data stat, body,
 * optional conditional lines. The section runs the hotter ember-rust
 * DIAGNOSTIC accent (founder rulings 2026-07-14 and 2026-07-25) — warm
 * diagnosis inside the cool aqua funnel; the contrast is deliberate.
 * index/total are runtime values: cards
 * are conditionally shown (novelty/crutch), so the count reflects THIS user's
 * visible cards, not the static four. No per-card hope line — the batched arc
 * resolves at the turn-welcome pivot.
 */
export function ClinicalCard({
  screen,
  index,
  total,
  visibleConditionalLines,
  onAdvance,
}: {
  screen: ResolvedScreen & ClinicalCardDescriptor;
  /** 1-based position among the cards THIS user actually sees. */
  index: number;
  /** Count of cards THIS user actually sees. */
  total: number;
  /** Conditional lines already filtered against answers by the flow runner. */
  visibleConditionalLines: string[];
  onAdvance: () => void;
}) {
  const accent = DIAGNOSTIC.accent;
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <DuskRadial intensity={0.14} tint={accent} />
        <View className="flex-1 items-center justify-center px-9">
          <Eyebrow center tint={accent}>{`WHAT YOUR ANSWERS SHOW · ${index} OF ${total}`}</Eyebrow>
          {/* Bespoke SVG motif when present; legacy PNG render otherwise. */}
          {screen.motif ? (
            <View style={{ marginTop: 22 }}>
              <ClinicalHero motif={screen.motif} accent={accent} />
            </View>
          ) : screen.render ? (
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
          ) : null}
          <Text
            className="text-center font-serif-regular text-ink"
            style={{ fontSize: 29, lineHeight: 37, marginTop: 14 }}
          >
            {screen.title}
          </Text>
          {/* The "scary data" callout: a large Newsreader figure (§6 reserves
              weight-300 for 40px+ numerals) + a plain caption. Honest, citable
              prevalence — recognition, not fabricated alarm. */}
          {screen.stat ? (
            <View className="items-center" style={{ marginTop: 16 }}>
              <Text
                className="font-serif-light"
                style={{ fontSize: 46, lineHeight: 50, color: accent }}
              >
                {screen.stat.figure}
              </Text>
              <Text
                className="text-center text-body"
                style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21, marginTop: 6 }}
              >
                {screen.stat.caption}
              </Text>
            </View>
          ) : null}
          <EmphasizedText
            text={screen.body}
            className="text-center text-body"
            style={{ fontSize: 14, fontWeight: '300', lineHeight: 23, marginTop: 16 }}
          />
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
            cards are their own section and navigate like one. Ember accent. */}
        <View className="pb-[52px]">
          <ArrowCTA
            onPress={onAdvance}
            accessibilityLabel={screen.button}
            accent={DIAGNOSTIC.arrow}
          />
        </View>
      </View>
    </ScreenFade>
  );
}

/** Conditional note card (B-12 physician triage): calm, zero alarm styling.
 *  Leads with the answers that triggered it (labelled rows) so the reason is
 *  legible at a glance; optional secondary link goes back to revise an answer. */
export function NoteCard({
  screen,
  onAdvance,
  onBack,
}: {
  screen: NoteCardDescriptor;
  onAdvance: () => void;
  onBack?: () => void;
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
          {screen.triggers ? (
            <View style={{ marginTop: 22, gap: 8 }}>
              {screen.triggers.map((t) => (
                <View
                  key={t.label}
                  className="flex-row items-center justify-between rounded-xl bg-surface"
                  style={{ paddingVertical: 13, paddingHorizontal: 15 }}
                >
                  <Text className="text-body" style={{ fontSize: 13, fontWeight: '300' }}>
                    {t.label}
                  </Text>
                  <Text className="text-ink" style={{ fontSize: 13, fontWeight: '500' }}>
                    {t.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text
            className="text-body"
            style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 20 }}
          >
            {screen.body}
          </Text>
        </View>
        <View className="px-8 pb-[52px]">
          <EmissiveCTA label={screen.button} onPress={onAdvance} />
          {screen.secondaryLabel && onBack ? (
            <SecondaryLink label={screen.secondaryLabel} onPress={onBack} />
          ) : null}
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
          {doubting && screen.doubt ? (
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
              {screen.body ? (
                <Text
                  className="text-body"
                  style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 16 }}
                >
                  {screen.body}
                </Text>
              ) : null}
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
            label={doubting && screen.doubt ? screen.doubt.button : screen.button}
            onPress={onAdvance}
          />
          {!doubting && screen.doubtLink && (
            <SecondaryLink label={screen.doubtLink} onPress={() => setDoubting(true)} />
          )}
        </View>
      </View>
    </ScreenFade>
  );
}

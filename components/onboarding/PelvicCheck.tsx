// B-15/A-17 — The Pelvic Floor Check (interactive-check archetype).
// Ported from the proven clench-test logic; restyled to Dusk. Skippers are
// flagged ('skipped') — the check becomes their Day 1 opener; nothing lost
// diagnostically. The phone demonstrates tension and release: BREATHE onset
// on CLENCH, clean release cue on RELEASE (Addendum §4 — the most direct
// "instrument" moment in onboarding).

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { InteractiveCheckScreen } from '../../content/onboarding/types';
import { breatheOnset, breatheRelease } from '../../services/haptics';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { SecondaryLink } from './chrome';

type Phase = 'ready' | 0 | 1 | 'result';

function CountdownRing({
  numeral,
  label,
  active,
}: {
  numeral: string;
  label: string;
  active: boolean;
}) {
  return (
    <View
      className="items-center justify-center"
      // Deepwater role: the guided-exercise ring is an action surface → aqua.
      style={{
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1.5,
        borderColor: active ? 'rgba(95,212,193,0.9)' : 'rgba(95,212,193,0.5)',
        backgroundColor: 'rgba(95,212,193,0.07)',
        paddingHorizontal: 16,
      }}
    >
      <Text className="font-serif-light text-ink" style={{ fontSize: 34 }}>
        {numeral}
      </Text>
      {/* Single-word labels + tighter tracking so the text sits inside the
          ring (founder review 2026-07-10). */}
      <Text
        className="text-center text-muted"
        style={{ fontSize: 10, letterSpacing: 1.2, marginTop: 2 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/** 1–10 release rating — same notch language as the libido scale, with the
 *  anchors doing the explaining (what 1 means, what 10 means). */
export function ReleaseScale({
  scale,
  onSubmit,
}: {
  scale: InteractiveCheckScreen['resultScale'];
  onSubmit: (value: number) => void;
}) {
  const [value, setValue] = useState<number | null>(null);
  const notches = Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i);
  return (
    <View>
      <View className="flex-row" style={{ gap: 6 }}>
        {notches.map((n) => {
          const active = value !== null && n <= value;
          const isValue = value === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`${n} of ${scale.max}`}
              accessibilityState={{ selected: isValue }}
              onPress={() => setValue(n)}
              className="flex-1 items-center"
              style={{ paddingVertical: 10 }}
            >
              <View
                className={`w-full rounded-full ${active ? 'bg-accent' : 'bg-surface'}`}
                style={{
                  height: 24,
                  borderWidth: isValue ? 0 : 1,
                  borderColor: '#2A3A4A',
                  opacity: active && !isValue ? 0.55 : 1,
                }}
              />
              <Text
                className={isValue ? 'font-serif-regular text-ink' : 'text-faint'}
                style={{ fontSize: isValue ? 15 : 11, marginTop: 8 }}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-3 flex-row justify-between" style={{ gap: 12 }}>
        <Text className="text-muted" style={{ fontSize: 11, fontWeight: '300', flex: 1 }}>
          {scale.anchorLow}
        </Text>
        <Text
          className="text-right text-muted"
          style={{ fontSize: 11, fontWeight: '300', flex: 1 }}
        >
          {scale.anchorHigh}
        </Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <EmissiveCTA
          label={scale.button}
          disabled={value === null}
          onPress={() => value !== null && onSubmit(value)}
        />
      </View>
    </View>
  );
}

export default function PelvicCheck({
  screen,
  onComplete,
  onSkip,
}: {
  screen: InteractiveCheckScreen;
  /** 1–10 release rating (founder review 2026-07-10). */
  onComplete: (value: number) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [count, setCount] = useState(screen.phases[0].seconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => clear, []);

  const runPhase = (index: number) => {
    setPhase(index as 0 | 1);
    if (index === 0) breatheOnset();
    else breatheRelease();
    setCount(screen.phases[index].seconds);
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clear();
          if (index + 1 < screen.phases.length) runPhase(index + 1);
          else setPhase('result');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const { intro } = screen;
  const activePhase = typeof phase === 'number' ? screen.phases[phase] : null;

  return (
    <ScreenFade>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingTop: 38, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-serif-regular text-ink" style={{ fontSize: 26, lineHeight: 34.5 }}>
          {intro.headline}
        </Text>
        <Text
          className="text-body"
          style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21.5, marginTop: 14 }}
        >
          {intro.subText}
        </Text>

        {phase === 'ready' && (
          <>
            <View
              className="mt-6 rounded-[18px] border border-line bg-surface p-5"
              style={{ gap: 12 }}
            >
              {intro.steps.map((step, i) => (
                <View key={i} className="flex-row items-start" style={{ gap: 12 }}>
                  <Text className="font-serif-medium text-accent" style={{ fontSize: 13, marginTop: 2 }}>
                    {i + 1}
                  </Text>
                  <Text
                    className="flex-1 text-body"
                    style={{ fontSize: 14, fontWeight: '300', lineHeight: 20 }}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              className="mt-4 text-muted"
              style={{ fontSize: 12, fontWeight: '300', lineHeight: 18 }}
            >
              {intro.reassurance}
            </Text>
            <View className="mt-7 items-center">
              <CountdownRing
                numeral={String(screen.phases[0].seconds)}
                label={screen.phases[0].ringLabel}
                active={false}
              />
            </View>
            <View className="flex-1" />
            <View style={{ gap: 6, marginTop: 24 }}>
              <EmissiveCTA label={intro.button} onPress={() => runPhase(0)} />
              <SecondaryLink label={intro.skipLink} onPress={onSkip} />
            </View>
          </>
        )}

        {activePhase && (
          <View className="items-center" style={{ gap: 30, paddingTop: 40 }}>
            <CountdownRing
              numeral={String(count)}
              label={activePhase.ringLabel}
              active={phase === 0}
            />
            <Text
              className="px-6 text-center text-body"
              style={{ fontSize: 14, fontWeight: '300', lineHeight: 20 }}
            >
              {activePhase.instruction}
            </Text>
          </View>
        )}

        {phase === 'result' && (
          <View style={{ marginTop: 30 }}>
            <Text
              className="font-serif-regular text-ink"
              style={{ fontSize: 19, lineHeight: 26, marginBottom: 14 }}
            >
              {screen.resultQuestion}
            </Text>
            <ReleaseScale scale={screen.resultScale} onSubmit={onComplete} />
          </View>
        )}
      </ScrollView>
    </ScreenFade>
  );
}

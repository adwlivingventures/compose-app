// B-15/A-17 — The Pelvic Floor Check (interactive-check archetype).
// Ported from the proven clench-test logic; restyled to Dusk. Skippers are
// flagged ('skipped') — the check becomes their Day 1 opener; nothing lost
// diagnostically. The phone demonstrates tension and release: BREATHE onset
// on CLENCH, clean release cue on RELEASE (Addendum §4 — the most direct
// "instrument" moment in onboarding).

import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { InteractiveCheckScreen } from '../../content/onboarding/types';
import { breatheOnset, breatheRelease } from '../../services/haptics';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { SecondaryLink } from './chrome';
import { SingleSelectList } from './AnswerCards';

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
      style={{
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1.5,
        borderColor: active ? 'rgba(200,155,109,0.9)' : 'rgba(200,155,109,0.5)',
        backgroundColor: 'rgba(200,155,109,0.07)',
      }}
    >
      <Text className="font-serif-light text-ink" style={{ fontSize: 34 }}>
        {numeral}
      </Text>
      <Text
        className="text-muted"
        style={{ fontSize: 10.5, letterSpacing: 2, marginTop: 2 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function PelvicCheck({
  screen,
  onComplete,
  onSkip,
}: {
  screen: InteractiveCheckScreen;
  onComplete: (value: string) => void;
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
            <SingleSelectList options={screen.resultOptions} onAdvance={onComplete} />
          </View>
        )}
      </ScrollView>
    </ScreenFade>
  );
}

// Composure re-measurement — the "measured, not promised" evidence flow
// (CLAUDE.md §2; canon §8). Reached from the dashboard card on Days 14/40/75
// (and Act III quarterly re-use). Re-runs the onboarding composure module —
// the same eleven scored questions through computeComposure — records the
// reading locally via composureHistory, and emits the whitelisted
// `composure_measured {score, day}` event. Answers stay in local state only;
// nothing but the score+day milestone ever leaves the device (§7).
//
// Deliberately linear (§6 Hick's Law): intro → questions → result. No back
// stack inside the measurement — a half-edited instrument reads worse than
// a re-run, and re-runs replace the day's entry idempotently.

import { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { computeComposure, type ComposureResult } from '../content/onboarding/composure';
import { isScreenVisible, type Answers } from '../content/onboarding/logic';
import {
  getRemeasureCopy,
  REMEASURE_SCREENS,
  resolveResultCopy,
  RESULT_FOOTER,
} from '../content/remeasure';
import { getBaseline, getComposureHistory, recordComposure } from '../services/composureHistory';
import { track } from '../services/analytics';
import { useProtocol } from '../context/ProtocolContext';

import QuestionShell from '../components/onboarding/QuestionShell';
import { SingleSelectList } from '../components/onboarding/AnswerCards';
import { MultiSelect } from '../components/onboarding/inputs';
import PelvicCheck from '../components/onboarding/PelvicCheck';
import EmissiveCTA from '../components/onboarding/EmissiveCTA';
import { ScreenFade } from '../components/onboarding/archetypes';
import { PrivacyFooter } from '../components/onboarding/chrome';

type Phase = 'intro' | 'questions' | 'result';

export default function Remeasure() {
  const router = useRouter();
  const { activeDay } = useProtocol();
  const params = useLocalSearchParams<{ day?: string }>();

  // The milestone day this reading is recorded under. The dashboard passes
  // it explicitly; a bare deep link falls back to the current protocol day.
  const paramDay = Number(params.day);
  const day = Number.isFinite(paramDay) && paramDay > 0 ? Math.round(paramDay) : activeDay;
  const copy = getRemeasureCopy(day);

  const [phase, setPhase] = useState<Phase>('intro');
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ComposureResult | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);

  useEffect(() => {
    getComposureHistory().then((history) => {
      setBaseline(getBaseline(history)?.score ?? null);
    });
  }, []);

  const finish = useCallback(
    (finalAnswers: Answers) => {
      const computed = computeComposure(finalAnswers);
      setResult(computed);
      setPhase('result');
      // Fire-and-forget, like every other milestone write: the result screen
      // never waits on storage or the network. Same-day re-runs replace.
      recordComposure(day, computed.score);
      track('composure_measured', { score: computed.score, day });
    },
    [day],
  );

  const advance = useCallback(
    (patch: Partial<Answers>) => {
      const next = { ...answers, ...patch };
      setAnswers(next);
      for (let i = cursor + 1; i < REMEASURE_SCREENS.length; i++) {
        if (isScreenVisible(REMEASURE_SCREENS[i], next)) {
          setCursor(i);
          return;
        }
      }
      finish(next);
    },
    [answers, cursor, finish],
  );

  if (phase === 'intro') {
    return (
      <View className="flex-1 bg-ground px-7 pt-[76px]">
        <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
          {copy.eyebrow}
        </Text>
        <Text className="text-ink font-serif-regular mt-3" style={{ fontSize: 28, lineHeight: 37 }}>
          {copy.headline}
        </Text>
        <Text className="text-body text-sm leading-[22px] mt-4" style={{ fontWeight: '300' }}>
          {copy.body}
        </Text>
        <View className="flex-1" />
        <View className="pb-4">
          <EmissiveCTA label={copy.button} onPress={() => setPhase('questions')} />
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="items-center py-4"
            accessibilityRole="button"
          >
            {/* A quiet exit, no loss framing: the card resurfaces on the
                dashboard until the reading is taken. */}
            <Text className="text-muted text-[13px]">Not today</Text>
          </TouchableOpacity>
        </View>
        <PrivacyFooter />
      </View>
    );
  }

  if (phase === 'result' && result) {
    return (
      <ScreenFade>
        <View className="flex-1 bg-ground px-7 pt-[76px]">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            {copy.eyebrow}
          </Text>
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.24em]">
              Composure score
            </Text>
            {/* One of the screen's two sand moments: the reading itself. */}
            <Text className="text-accent text-[72px] font-serif-light leading-[80px] mt-2">
              {result.score}
            </Text>
            {baseline !== null && (
              <Text className="text-faint text-[13px] mt-1">Day 0 baseline: {baseline}</Text>
            )}
            <Text className="text-body text-sm leading-[22px] text-center mt-8" style={{ fontWeight: '300' }}>
              {resolveResultCopy(copy, result.score, baseline)}
            </Text>
          </View>
          <Text className="text-faint text-xs text-center leading-4 px-2">{RESULT_FOOTER}</Text>
          <View className="pt-5 pb-8">
            <EmissiveCTA label="Back to today" onPress={() => router.back()} />
          </View>
        </View>
      </ScreenFade>
    );
  }

  // ── Questions ────────────────────────────────────────────────────────────
  const screen = REMEASURE_SCREENS[cursor];
  const visible = REMEASURE_SCREENS.filter((s) => isScreenVisible(s, answers));
  const step = visible.indexOf(screen) + 1;

  const body = (() => {
    switch (screen.archetype) {
      case 'single-select':
        return (
          <QuestionShell question={screen.question} subText={screen.subText}>
            <SingleSelectList
              key={screen.id}
              options={screen.options}
              initialValue={answers[screen.answerKey] as string | undefined}
              onAdvance={(value) => advance({ [screen.answerKey]: value })}
            />
          </QuestionShell>
        );
      case 'multi-select':
        return (
          <MultiSelect
            key={screen.id}
            screen={screen}
            initialValues={(answers[screen.answerKey] as string[] | undefined) ?? []}
            onSubmit={(values) => advance({ [screen.answerKey]: values })}
          />
        );
      case 'interactive-check':
        return (
          <PelvicCheck
            screen={screen}
            onComplete={(value) => advance({ [screen.answerKey]: value })}
            onSkip={() => advance({ [screen.answerKey]: 'skipped' })}
          />
        );
      default:
        // The scored set is single/multi-select + the pelvic check only;
        // content/__tests__/remeasure.test.ts enforces this invariant.
        return null;
    }
  })();

  return (
    <View className="flex-1 bg-ground">
      <View style={{ paddingTop: 54 }} />
      <View className="px-6 pb-2">
        <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
          MEASUREMENT · {step} OF {visible.length}
        </Text>
      </View>
      <View className="flex-1">{body}</View>
      <PrivacyFooter />
    </View>
  );
}

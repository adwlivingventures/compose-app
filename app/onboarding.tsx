// Onboarding — data-driven flow runner (Ember Dusk v2 rebuild).
//
// Single flow (founder ruling 2026-07-10 — the interleaved variant and the
// onboarding A/B test are retired): buildFlow() resolves the screen order
// (content/onboarding/) and this runner walks it.
// Answers live in local state + AsyncStorage only — nothing leaves the
// device (§7). Purchase fires on Day Zero's "Sign & begin", never earlier.
//
// Step-6 items deliberately not here yet: analytics events, silent offerings
// retry, haptic vocabulary, sound, demo mode, Reduce Motion fallbacks.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { buildFlow } from '../content/onboarding/buildFlow';
import { computeComposure } from '../content/onboarding/composure';
import {
  Answers,
  DEFAULT_FLAGS,
  evalCondition,
  hasPrivacyFooter,
  nextVisibleIndex,
  progressMeta,
  withName,
} from '../content/onboarding/logic';
import type { ResolvedScreen } from '../content/onboarding/types';
import { LocalStore } from '../services/storage';
import { recordComposure } from '../services/composureHistory';
import {
  setTelemetryConsent,
  track,
  trackScreen,
  type ScreenAction,
} from '../services/analytics';
import { seal } from '../services/haptics';
import { persistSegment } from '../content/onboarding/segment';
import { useProtocol } from '../context/ProtocolContext';
import { useRevenueCat } from '../hooks/useRevenueCat';

import { Chapter, ClinicalCard, NoteCard, Beat, Commit, SectionTransition } from '../components/onboarding/archetypes';
import { ProgressHeader, PrivacyFooter } from '../components/onboarding/chrome';
import { SingleSelectList } from '../components/onboarding/AnswerCards';
import QuestionShell from '../components/onboarding/QuestionShell';
import { AgeWheel, MultiSelect, NameInput, ScaleSlider } from '../components/onboarding/inputs';
import PelvicCheck from '../components/onboarding/PelvicCheck';
import HopefulArc from '../components/onboarding/HopefulArc';
import DivergingGraphScreen from '../components/onboarding/DivergingGraphScreen';
import Generating from '../components/onboarding/Generating';
import MapScreen from '../components/onboarding/MapScreen';
import Paywall, { MembershipTerm, PriceStrings } from '../components/onboarding/Paywall';
import PaywallDismiss from '../components/onboarding/PaywallDismiss';
import DayZero from '../components/onboarding/DayZero';
import ConsentScreen from '../components/onboarding/ConsentScreen';

const STATE_KEY = '@onboarding_flow_v1';
const DISMISSED_KEY = '@paywall_dismissed';
const TERM_KEY = '@membership_term';

interface PersistedState {
  screenId: string;
  answers: Answers;
}

/** Screens the back stack can return to. */
const isStable = (s: ResolvedScreen) =>
  !['section-transition', 'beat', 'generating'].includes(s.archetype);

/** Full-bleed archetypes that get the floating back chevron (founder review
 *  2026-07-10: backwards navigation from any point). The paywall family owns
 *  its back gesture (the dismiss intercept); momentum screens have nothing
 *  to go back to. */
const hasFloatingBack = (s: ResolvedScreen) =>
  !['paywall', 'signature', 'paywall-dismiss', 'section-transition', 'beat', 'generating'].includes(
    s.archetype,
  );

export default function Onboarding() {
  const router = useRouter();
  const { unlockProtocol } = useProtocol();
  const { getAnnualPackage, getMonthlyPackage, purchasePackage, restorePurchases, isProcessing } =
    useRevenueCat();

  const [answers, setAnswers] = useState<Answers>({});
  const [cursor, setCursor] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);
  // Membership term — annual pre-selected (Model V2 annual-first). Persisted
  // so a paywall→resume round trip doesn't silently reset his choice before
  // the Day Zero purchase.
  const [term, setTerm] = useState<MembershipTerm>('annual');
  const history = useRef<number[]>([]);
  const dismissedThisSession = useRef(false);
  const screenEnteredAt = useRef(Date.now());

  const flow = useMemo(() => buildFlow(), []);

  // ── Hydration: resume state ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const saved = await LocalStore.getItem<PersistedState>(STATE_KEY);
      const dismissed = await LocalStore.getItem<boolean>(DISMISSED_KEY);
      const savedTerm = await LocalStore.getItem<MembershipTerm>(TERM_KEY);
      if (savedTerm === 'monthly') setTerm('monthly');
      const resolved = flow;
      // Cohort telemetry starts at the very first screen of a fresh install
      // (§7 events are consent-buffered — nothing leaves the device unless
      // the consent step later grants it).
      if (!saved) track('onboarding_started');
      if (saved) {
        setAnswers(saved.answers ?? {});
        const index = resolved.findIndex((s) => s.id === saved.screenId);
        if (index > 0) {
          setCursor(index);
          // Rebuild the back stack a live session would have accumulated by
          // this screen (founder review 2026-07-10: an app reload landed on a
          // question with no back chevron). Walk the same visible-screen path
          // advance() takes, honoring the one-way barrier past Generating.
          const savedAnswers = saved.answers ?? {};
          const rebuilt: number[] = [];
          let at = 0;
          while (at < index) {
            const next = nextVisibleIndex(resolved, at, savedAnswers, DEFAULT_FLAGS);
            if (next === -1 || next > index) break;
            if (isStable(resolved[at])) rebuilt.push(at);
            if (resolved[next].id === 'map') rebuilt.length = 0;
            at = next;
          }
          history.current = rebuilt;
          // The honest win-back: a returning user who backed out of the
          // paywall lands on the dismiss screen, score intact.
          const id = resolved[index].id;
          if (dismissed && (id === 'paywall' || id === 'day-zero')) {
            dismissedThisSession.current = true;
            setShowDismiss(true);
          }
        }
      }
      setHydrated(true);
    })();
  }, [flow]);

  const persist = useCallback((screenId: string, a: Answers) => {
    LocalStore.setItem(STATE_KEY, { screenId, answers: a } satisfies PersistedState);
  }, []);

  // paywall_viewed = the top of the conversion funnel (§7) — the RC pricing
  // Experiment's denominator (the annual price test is server-side product
  // swap; it needs no client tag).
  useEffect(() => {
    if (showDismiss) return;
    if (flow[cursor]?.id === 'paywall') track('paywall_viewed');
  }, [flow, cursor, showDismiss]);

  // ── Navigation ──────────────────────────────────────────────────────────
  // One anonymous event per screen leave: screen_id, elapsed, action.
  // Nothing about what was answered (§7).
  const emit = useCallback(
    (action: ScreenAction, screenId?: string) => {
      trackScreen(
        screenId ?? flow[cursor].id,
        Date.now() - screenEnteredAt.current,
        action,
      );
    },
    [flow, cursor],
  );

  const moveTo = useCallback(
    (index: number, nextAnswers: Answers) => {
      setCursor(index);
      screenEnteredAt.current = Date.now();
      persist(flow[index].id, nextAnswers);
    },
    [flow, persist],
  );

  const advance = useCallback(
    (patch?: Partial<Answers>, action: ScreenAction = 'advance') => {
      const nextAnswers = patch ? { ...answers, ...patch } : answers;
      if (patch) setAnswers(nextAnswers);
      const next = nextVisibleIndex(flow, cursor, nextAnswers, DEFAULT_FLAGS);
      if (next === -1) return;
      emit(action);
      if (flow[next].id === 'discretion-setup') {
        // B-42 is the existing discretion screen — reached only post-purchase.
        router.replace('/discretion?intro=1');
        return;
      }
      if (isStable(flow[cursor])) history.current.push(cursor);
      if (flow[next].id === 'map') history.current = []; // one-way past Generating
      moveTo(next, nextAnswers);
    },
    [flow, cursor, answers, emit, moveTo, router],
  );

  const goBack = useCallback(() => {
    const prev = history.current.pop();
    if (prev === undefined) return;
    emit('back');
    moveTo(prev, answers);
  }, [flow, answers, emit, moveTo]);

  /** Back/close on Paywall or Day Zero → the B-40 intercept, once per session. */
  const closeAttempt = useCallback(() => {
    if (!dismissedThisSession.current) {
      dismissedThisSession.current = true;
      LocalStore.setItem(DISMISSED_KEY, true);
      emit('dismiss-shown', 'paywall-dismiss');
      setShowDismiss(true);
      return;
    }
    goBack();
  }, [goBack, emit]);

  // ── Purchase (minimal wiring — offerings retry + attributes are step 6) ──
  const prices = usePriceStrings(getAnnualPackage, getMonthlyPackage);

  const selectTerm = useCallback((next: MembershipTerm) => {
    setTerm(next);
    LocalStore.setItem(TERM_KEY, next);
  }, []);

  /** Restore (App Store requirement): a reinstalling owner re-enters the app;
   *  unsigned restores route through the existing oath screen first. */
  const restore = useCallback(async () => {
    emit('restore');
    const granted = await restorePurchases();
    if (!granted) return;
    await unlockProtocol();
    const signature = await LocalStore.getItem<{ name: string }>('@signature_data');
    router.replace(signature?.name ? '/(tabs)' : '/oath');
  }, [restorePurchases, unlockProtocol, router, emit]);

  const signAndBegin = useCallback(
    async (signedName: string) => {
      // Signature persists BEFORE purchase — an interrupted transaction never
      // loses the oath.
      await LocalStore.setItem('@signature_data', {
        name: signedName,
        signedAt: new Date().toISOString(),
      });
      // The paywall's selected term decides the package; annual is the
      // pre-selected default (Model V2: annual-first). The active annual
      // product comes from the current Offering — the RC Experiment's swap
      // point.
      const pack =
        term === 'monthly' ? (getMonthlyPackage() ?? getAnnualPackage()) : getAnnualPackage();
      if (!pack) return; // silent — never an error toast in onboarding
      emit('purchase-attempt');
      const granted = await purchasePackage(pack);
      if (granted) {
        seal(); // the word is given and the threshold is crossed
        emit('purchase-success');
        // Conversion event carries the term only — the funnel's bottom line.
        track('purchase', { term });
        await unlockProtocol();
        router.replace('/discretion?intro=1');
      }
    },
    [term, getAnnualPackage, getMonthlyPackage, purchasePackage, unlockProtocol, router, emit],
  );

  // ── Render ──────────────────────────────────────────────────────────────
  if (!hydrated) {
    return <View className="flex-1 bg-ground" />;
  }

  const screen = flow[cursor];
  const composure = computeComposure(answers);
  const goalEcho = resolveGoalEcho(answers, flow);

  if (showDismiss) {
    const dismissScreen = flow.find((s) => s.archetype === 'paywall-dismiss');
    if (dismissScreen && dismissScreen.archetype === 'paywall-dismiss') {
      return (
        <View className="flex-1 bg-ground">
          <PaywallDismiss
            screen={dismissScreen}
            result={composure}
            goalEcho={goalEcho}
            onKeepGoing={() => {
              emit('dismiss-keep-going', 'paywall-dismiss');
              setShowDismiss(false);
            }}
            onExit={() => {
              emit('dismiss-exit', 'paywall-dismiss');
              setShowDismiss(false);
            }}
          />
        </View>
      );
    }
  }

  const meta = progressMeta(flow, cursor);
  const body = renderScreen();

  function renderScreen() {
    switch (screen.archetype) {
      case 'chapter':
        return <Chapter screen={screen} onAdvance={() => advance()} />;
      case 'hopeful-arc':
        return <HopefulArc screen={screen} onComplete={() => advance()} />;
      case 'section-transition':
        return (
          <SectionTransition
            label={screen.label}
            autoAdvanceMs={screen.autoAdvanceMs}
            onAdvance={() => advance()}
          />
        );
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
            initialFreeText={
              screen.freeText
                ? ((answers[screen.freeText.answerKey] as string | undefined) ?? '')
                : ''
            }
            onSubmit={(values, freeText) =>
              advance({
                [screen.answerKey]: values,
                ...(screen.freeText ? { [screen.freeText.answerKey]: freeText ?? '' } : null),
              })
            }
          />
        );
      case 'text-input':
        return (
          <NameInput
            screen={screen}
            initialValue={(answers[screen.answerKey] as string | undefined) ?? ''}
            onSubmit={(name) => advance({ [screen.answerKey]: name })}
          />
        );
      case 'wheel-input':
        return (
          <AgeWheel
            screen={screen}
            initialValue={(answers[screen.answerKey] as number | undefined) ?? 30}
            onSubmit={(age) => advance({ [screen.answerKey]: age })}
          />
        );
      case 'slider-input':
        return (
          <ScaleSlider
            screen={screen}
            initialValue={answers[screen.answerKey] as number | undefined}
            onSubmit={(value) => advance({ [screen.answerKey]: value })}
          />
        );
      case 'note-card':
        return <NoteCard screen={screen} onAdvance={() => advance()} />;
      case 'interactive-check':
        return (
          <PelvicCheck
            screen={screen}
            onComplete={(value) => advance({ [screen.answerKey]: value })}
            onSkip={() => advance({ [screen.answerKey]: 'skipped' }, 'skip')}
          />
        );
      case 'generating':
        return (
          <Generating screen={screen} score={composure.score} onComplete={() => advance()} />
        );
      case 'map':
        return (
          <MapScreen
            screen={screen}
            result={composure}
            headline={withName(screen.headline, answers)}
            onAdvance={() => {
              // The coarse presentation segment is derived and stored the
              // moment the diagnostic is complete — before the first
              // lifecycle event fires, so the Day-0 baseline already
              // carries the tag. Slug only; the answers stay on-device.
              persistSegment(answers);
              // The Day-0 baseline point of the outcome curve (§7): the
              // score alone, never the inputs that produced it. The same
              // reading is persisted locally (services/composureHistory)
              // as the fixed point every Day 14/40/75 re-measurement
              // stands against. Fire-and-forget; the flow never waits.
              recordComposure(0, composure.score);
              track('composure_measured', { score: composure.score, day: 0 });
              advance();
            }}
          />
        );
      case 'clinical-card':
        return (
          <ClinicalCard
            screen={screen}
            visibleConditionalLines={(screen.conditionalLines ?? [])
              .filter((line) => evalCondition(line.showIf, answers))
              .map((line) => line.text)}
            onAdvance={() => advance()}
          />
        );
      case 'diverging-graph':
        return <DivergingGraphScreen screen={screen} onAdvance={() => advance()} />;
      case 'commit':
        return <Commit screen={screen} onAdvance={() => advance()} />;
      case 'consent':
        return (
          <ConsentScreen
            screen={screen}
            onDecision={(granted) => {
              // Decline is final and total: zero events, including the ones
              // already buffered this session. The flow continues identically.
              setTelemetryConsent(granted);
              advance();
            }}
          />
        );
      case 'beat':
        return <Beat text={screen.text} maxMs={screen.maxMs} onAdvance={() => advance()} />;
      case 'paywall':
        return (
          <Paywall
            screen={screen}
            result={composure}
            goalEcho={goalEcho}
            prices={prices}
            term={term}
            onSelectTerm={selectTerm}
            onContinue={() => advance()}
            onRestore={restore}
            restoring={isProcessing}
            onBack={closeAttempt}
            onDevSkip={
              __DEV__ ? () => router.replace('/discretion?intro=1') : undefined
            }
            onDevEmberDemo={__DEV__ ? () => router.push('/ember-demo') : undefined}
          />
        );
      case 'signature':
        return (
          <DayZero
            screen={screen}
            prices={prices}
            term={term}
            purchasing={isProcessing}
            onSignAndBegin={signAndBegin}
            onBack={closeAttempt}
          />
        );
      // paywall-dismiss is interceptor-only; discretion routes out in advance().
      default:
        return <View className="flex-1 bg-ground" />;
    }
  }

  // Question-family screens get the shared chrome; full-bleed archetypes
  // (chapters, cards, map, paywall family) own their whole canvas.
  if (meta) {
    return (
      <View className="flex-1 bg-ground">
        <View style={{ paddingTop: 54 }} />
        <ProgressHeader
          step={meta.step}
          total={meta.total}
          minutesLeft={meta.minutesLeft}
          onBack={history.current.length > 0 ? goBack : undefined}
        />
        <View className="flex-1">{body}</View>
        {hasPrivacyFooter(screen) && <PrivacyFooter />}
      </View>
    );
  }
  // Question-family screens beyond the numbered range (Symptoms sits past the
  // progress bar's total) render without the ProgressHeader chrome — give them
  // the same top breathing room so the question doesn't ride the status bar
  // (founder review 2026-07-13).
  const isHeaderlessQuestion = [
    'single-select',
    'multi-select',
    'text-input',
    'wheel-input',
    'slider-input',
    'interactive-check',
    'note-card',
  ].includes(screen.archetype);
  return (
    <View className="flex-1 bg-ground">
      {isHeaderlessQuestion ? (
        <View className="flex-1" style={{ paddingTop: 54 }}>
          {body}
        </View>
      ) : (
        body
      )}
      {history.current.length > 0 && hasFloatingBack(screen) && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBack}
          hitSlop={14}
          className="absolute"
          style={{ top: 62, left: 22, opacity: 0.75 }}
        >
          <ChevronLeft size={20} color="#6B7280" strokeWidth={1.5} />
        </Pressable>
      )}
    </View>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function usePriceStrings(
  getAnnualPackage: ReturnType<typeof useRevenueCat>['getAnnualPackage'],
  getMonthlyPackage: ReturnType<typeof useRevenueCat>['getMonthlyPackage'],
): PriceStrings | null {
  const annualPack = getAnnualPackage();
  const monthlyPack = getMonthlyPackage();
  return useMemo(() => {
    if (!annualPack) return null;
    const { priceString, price, currencyCode } = annualPack.product;
    // Per-day reframe of the ANNUAL price (365, not 75): the membership
    // covers the full year, and honest math is part of the honest-billing
    // posture — a /75 divisor on an annual charge would be a dark pattern.
    let annualPerDay: string | null = null;
    try {
      annualPerDay = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
      }).format(price / 365);
    } catch {
      annualPerDay = `$${(price / 365).toFixed(2)}`;
    }
    return {
      annual: priceString,
      annualPerDay,
      monthly: monthlyPack?.product.priceString ?? null,
    };
  }, [annualPack, monthlyPack]);
}

/** The user's goal, echoed verbatim: free text first, else the first selected goal. */
function resolveGoalEcho(answers: Answers, flow: ResolvedScreen[]): string | null {
  const freeText = typeof answers.goalFreeText === 'string' ? answers.goalFreeText.trim() : '';
  if (freeText) return freeText;
  const goals = Array.isArray(answers.goals) ? answers.goals : [];
  if (goals.length === 0) return null;
  const goalsScreen = flow.find((s) => s.id === 'goals');
  if (goalsScreen?.archetype !== 'multi-select') return null;
  const first = goalsScreen.options.find((o) => o.value === goals[0]);
  return first?.label ?? null;
}

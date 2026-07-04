import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Linking,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  Brain,
  Zap,
  Repeat,
  Pill,
  Target,
  Lock,
  ChevronRight,
  Crown,
  Check,
} from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useRevenueCat, RC_PRODUCTS } from '../hooks/useRevenueCat';
import { LocalStore } from '../services/storage';

/**
 * Onboarding-to-Paywall Pipeline — the 27-step clinical funnel.
 *
 * One component, one step index, zero navigation-stack churn. Every screen
 * asks exactly one thing (Hick's Law); educational interstitials pay the user
 * back for disclosure with mechanism, so each question deepens investment
 * instead of depleting it. Answers live in local state only — nothing leaves
 * the device (§7).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type Pathway = 'Presence' | 'Control' | 'Confidence';
type ClenchPhase = 'ready' | 'clench' | 'relax' | 'result';

interface OnboardingAnswers {
  name: string;
  age: number | null;
  relationship: string | null;
  painPoint: string | null;
  timeline: string | null;
  spectator: string | null;
  autonomic: string | null;
  partnerImpact: string | null;
  pelvic: string | null;
  hardware: string | null;
  dopamine: string | null;
  bandaid: string | null;
  breath: string | null;
  avoidance: string | null;
  mentalLoop: string | null;
  spillover: string | null;
  goal: string | null;
}

// The user's stated pain point weights their protocol label on the paywall.
function pathwayForPainPoint(painPoint: string | null): Pathway {
  if (painPoint === 'I finish too quickly') return 'Control';
  if (painPoint === 'I struggle to maintain my erection') return 'Confidence';
  return 'Presence';
}

// Steps 1–23 show the progress bar (the diagnostic arc). Welcome, analyzer,
// profile readout, and checkout stand outside it.
const DIAGNOSTIC_FIRST = 1;
const DIAGNOSTIC_LAST = 23;
const STEP_ANALYZER = 24;
const STEP_PROFILE = 25;
const STEP_CHECKOUT = 26;

// ─── Root ────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { unlockProtocol } = useProtocol();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: '',
    age: null,
    relationship: null,
    painPoint: null,
    timeline: null,
    spectator: null,
    autonomic: null,
    partnerImpact: null,
    pelvic: null,
    hardware: null,
    dopamine: null,
    bandaid: null,
    breath: null,
    avoidance: null,
    mentalLoop: null,
    spillover: null,
    goal: null,
  });

  const goNext = () => setStep((s) => Math.min(s + 1, STEP_CHECKOUT));

  const pick =
    (key: keyof OnboardingAnswers) =>
    (value: string) => {
      setAnswers((a) => ({ ...a, [key]: value }));
      goNext();
    };

  const inDiagnostic = step >= DIAGNOSTIC_FIRST && step <= DIAGNOSTIC_LAST;

  return (
    <View className="flex-1 bg-ground">
      {inDiagnostic && <ProgressHeader step={step} total={DIAGNOSTIC_LAST} />}

      {/* 1 — Welcome */}
      {step === 0 && <WelcomeScreen onContinue={goNext} />}

      {/* 2 — Identity */}
      {step === 1 && (
        <NameScreen
          value={answers.name}
          onSubmit={(name) => {
            setAnswers((a) => ({ ...a, name }));
            // Local-only (§7): kept on-device for in-app personalization.
            LocalStore.setItem('@user_first_name', name);
            goNext();
          }}
        />
      )}

      {/* 3 — Demographics */}
      {step === 2 && (
        <AgeScreen
          onSubmit={(age) => {
            setAnswers((a) => ({ ...a, age }));
            goNext();
          }}
        />
      )}

      {/* 4 — Context */}
      {step === 3 && (
        <ChoiceScreen
          title="What is your current relationship status?"
          options={['Single', 'Casual Dating', 'Committed Relationship', 'Married']}
          value={answers.relationship}
          onSelect={pick('relationship')}
        />
      )}

      {/* 5 — Core Pain Point */}
      {step === 4 && (
        <ChoiceScreen
          title="What is the primary reason you are here today?"
          options={[
            'I finish too quickly',
            'I struggle to maintain my erection',
            'I get trapped in my own head (Performance Anxiety)',
          ]}
          value={answers.painPoint}
          onSelect={pick('painPoint')}
        />
      )}

      {/* 6 — Timeline */}
      {step === 5 && (
        <ChoiceScreen
          title="How long has this been affecting your intimate life?"
          normalization="However long it's been: conditioned means learned, and learned means reversible."
          options={[
            'Less than 6 months',
            '1 to 3 years',
            'More than 3 years',
            'As long as I can remember',
          ]}
          value={answers.timeline}
          onSelect={pick('timeline')}
        />
      )}

      {/* 7 — Spectator */}
      {step === 6 && (
        <ChoiceScreen
          title="During intimacy, do you ever feel like you're watching yourself from the outside — evaluating instead of experiencing?"
          normalization={'Clinicians call this "spectatoring." It has a name because it\'s common.'}
          options={['Yes — almost every time', 'Sometimes', 'Rarely']}
          value={answers.spectator}
          onSelect={pick('spectator')}
        />
      )}

      {/* 8 — Autonomic */}
      {step === 7 && (
        <ChoiceScreen
          title="When you initiate intimacy, do you feel a sudden spike in your heart rate, or a rush of nervous adrenaline in your chest?"
          normalization="That surge is adrenaline — a nervous-system reflex, not a verdict on you."
          options={['Yes, it feels like panic', 'Sometimes', 'No, I stay calm']}
          value={answers.autonomic}
          onSelect={pick('autonomic')}
        />
      )}

      {/* 9 — EDU: The Adrenaline Trap */}
      {step === 8 && (
        <EducationScreen
          icon={<Zap color="#C89B6D" size={30} />}
          title="The Adrenaline Trap"
          body="What you are experiencing is not a physical defect. It is a Sympathetic Nervous System override. Your brain is mistakenly treating intimacy as a high-stress 'exam,' flooding your body with adrenaline. Adrenaline constricts blood vessels and accelerates reflexes."
          cta="I understand"
          onContinue={goNext}
        />
      )}

      {/* 10 — Partner Impact */}
      {step === 9 && (
        <ChoiceScreen
          title="When things don't go as planned in the bedroom, how does it affect your connection with your partner?"
          normalization="Most men have never said this part out loud. Here, you're just tapping a card."
          options={[
            "She thinks it's her fault",
            'It causes tension and frustration',
            'We avoid talking about it',
            'I am single / N/A',
          ]}
          value={answers.partnerImpact}
          onSelect={pick('partnerImpact')}
        />
      )}

      {/* 11 — Pelvic (interactive clench test: the funnel's one felt-proof
          moment — the user experiences the release deficit instead of
          estimating it) */}
      {step === 10 && <HypertonicityScreen onSelect={pick('pelvic')} />}

      {/* 12 — Hardware Check */}
      {step === 11 && (
        <ChoiceScreen
          title="Are your solo sessions (masturbation) generally easier to control and maintain than partner intimacy?"
          normalization="If solo is easier, the machinery works. The difference is nervous-system state."
          options={['Yes, significantly easier', 'About the same', 'No']}
          value={answers.hardware}
          onSelect={pick('hardware')}
        />
      )}

      {/* 13 — Dopamine */}
      {step === 12 && (
        <ChoiceScreen
          title="In an average week, how frequently do you rely on highly visual stimulation (adult content) during solo sessions?"
          normalization="No judgment in this question — it maps how your arousal system has been trained."
          options={['Rarely / Never', '1 to 2 times', '3 to 5 times', 'Daily']}
          value={answers.dopamine}
          onSelect={pick('dopamine')}
        />
      )}

      {/* 14 — EDU: The Novelty Loop */}
      {step === 13 && (
        <EducationScreen
          icon={<Repeat color="#C89B6D" size={30} />}
          title="The Novelty Loop"
          body="High-speed visual stimulation floods the brain with dopamine, conditioning your nervous system to sprint to the finish line. COMPOSE is designed to break this dopamine dependency and retrain your brain for grounded, oxytocin-based connection."
          cta="Makes sense"
          onContinue={goNext}
        />
      )}

      {/* 15 — Band-Aid */}
      {step === 14 && (
        <ChoiceScreen
          title="Have you ever tried pills (Viagra/Cialis), sprays, or numbing creams to fix this?"
          normalization="Most men try these first. What they treat isn't what's driving this."
          options={['Yes, pills', 'Yes, sprays/creams', 'Both', 'Neither']}
          value={answers.bandaid}
          onSelect={pick('bandaid')}
        />
      )}

      {/* 16 — EDU: Why Band-Aids Fail */}
      {step === 15 && (
        <EducationScreen
          icon={<Pill color="#C89B6D" size={30} />}
          title="Why Band-Aids Fail"
          body="Pills treat blood flow. Numbing creams treat skin. Neither treats the amygdala — the fear center of your brain. COMPOSE works by physically down-training the pelvic floor and retraining the autonomic nervous system."
          cta="Show me how"
          onContinue={goNext}
        />
      )}

      {/* 17 — Breath Mechanics */}
      {step === 16 && (
        <ChoiceScreen
          title="Right before the point of no return, or right before you lose an erection, does your breathing become shallow, rapid — or do you hold your breath?"
          normalization="Breath-holding under arousal is a textbook sympathetic tell. Most men have never been asked."
          options={['Yes, I gasp / hold it', "I haven't noticed", 'No, I breathe deeply']}
          value={answers.breath}
          onSelect={pick('breath')}
        />
      )}

      {/* 18 — Avoidance */}
      {step === 17 && (
        <ChoiceScreen
          title="How often does this anxiety prevent you from initiating intimacy with a partner altogether?"
          options={['Frequently', 'Sometimes', 'Rarely']}
          value={answers.avoidance}
          onSelect={pick('avoidance')}
        />
      )}

      {/* 19 — Mental Loop */}
      {step === 18 && (
        <ChoiceScreen
          title="When a session ends prematurely or falters, where does your mind go?"
          normalization="These are scripts, not facts. Naming yours is the first step to interrupting it."
          options={[
            '"I am broken"',
            '"She is disappointed in me"',
            '"I will never fix this"',
            'All of the above',
          ]}
          value={answers.mentalLoop}
          onSelect={pick('mentalLoop')}
        />
      )}

      {/* 20 — EDU: The Default Mode Network */}
      {step === 19 && (
        <EducationScreen
          icon={<Brain color="#C89B6D" size={30} />}
          title="The Default Mode Network"
          body="That shame loop is generated by your Default Mode Network (DMN) — the brain's self-referential replay circuit. It tags bedroom falters as threats, making the anxiety worse next time. We are going to teach you how to interrupt it."
          cta="Continue"
          onContinue={goNext}
        />
      )}

      {/* 21 — Spillover */}
      {step === 20 && (
        <ChoiceScreen
          title="Does the anxiety you feel in the bedroom ever spill over into your daily confidence — work, social life, self-esteem?"
          options={['Yes, heavily', 'Sometimes', 'No, strictly in the bedroom']}
          value={answers.spillover}
          onSelect={pick('spillover')}
        />
      )}

      {/* 22 — Transformation Goal */}
      {step === 21 && (
        <ChoiceScreen
          title="If you could retrain your nervous system to stay completely calm and grounded during intimacy, how would it change your life?"
          options={[
            'Deepen my relationship',
            'Give me my confidence back',
            'Allow me to start dating again',
          ]}
          value={answers.goal}
          onSelect={pick('goal')}
        />
      )}

      {/* 23 — EDU: The Protocol */}
      {step === 22 && (
        <EducationScreen
          icon={<Target color="#C89B6D" size={30} />}
          title="The 75-Day Blueprint"
          body="Habit-formation research shows a new behavior takes 66 days on average to become automatic. COMPOSE is a rigorous 75-day daily audio protocol built to habituate a calm nervous system baseline — with margin past the threshold, not up to it."
          cta="I am ready"
          onContinue={goNext}
        />
      )}

      {/* 24 — Commitment */}
      {step === 23 && (
        <ChoiceScreen
          title="Are you willing to commit less than ten focused minutes a day to your Auditory Anchor and dropping your pelvic tension?"
          options={['Yes, I am fully committed']}
          value={null}
          onSelect={() => goNext()}
        />
      )}

      {/* 25 — Analyzer */}
      {step === STEP_ANALYZER && <AnalyzerScreen onComplete={goNext} />}

      {/* 26 — Profile Readout (E05): the personalization receipt before the
          ask — the user sees his own answers reflected back as a map, so the
          paywall reads as "the plan for *this* profile," not a generic sell. */}
      {step === STEP_PROFILE && (
        <ProfileReadoutScreen answers={answers} onContinue={goNext} />
      )}

      {/* 27 — Paywall */}
      {step === STEP_CHECKOUT && (
        <CheckoutScreen
          pathway={pathwayForPainPoint(answers.painPoint)}
          onPurchaseComplete={async () => {
            await unlockProtocol();
            // Surface Discreet Mode once, right after purchase (E18): the
            // moment after paying is when exposure fear peaks — showing the
            // privacy controls here converts buyer's remorse into trust.
            router.replace('/discretion?intro=1');
          }}
        />
      )}
    </View>
  );
}

// ─── Progress Header (E02) ───────────────────────────────────────────────────

// Time-remaining beats raw step-count: "7 of 23" invites bail-out math, while
// "~4 min left" frames the rest of the arc as nearly free (goal-gradient).
function ProgressHeader({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  const minutesLeft = Math.max(1, Math.ceil(((total - step) * 12) / 60));
  return (
    <View className="px-7 pt-14">
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-dim text-[11px] font-semibold tracking-[0.14em]">
          MAPPING · {step} OF {total}
        </Text>
        <Text className="text-dim text-[11px]">~{minutesLeft} min left</Text>
      </View>
      <View className="h-[3px] w-full bg-line-soft rounded-full overflow-hidden">
        <View className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

// E02 footer — the privacy promise repeats on every diagnostic step because
// disclosure depth tracks perceived safety, not one-time assurances.
function PrivacyFooter() {
  return (
    <Text className="text-dim text-xs text-center pb-2">
      Answers stay on this phone. Always.
    </Text>
  );
}

// ─── Screen 1: Welcome ────────────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View className="flex-1 px-7 pb-9" style={{ overflow: 'hidden' }}>
      {/* Radial copper glow, bottom-center — the first frame is already a
          warm-light parasympathetic cue, before a single word is read. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', bottom: -180, left: '50%', marginLeft: -260 }}
      >
        <Svg width={520} height={520}>
          <Defs>
            <RadialGradient id="welcomeGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#C89B6D" stopOpacity={0.13} />
              <Stop offset="65%" stopColor="#C89B6D" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={260} cy={260} r={260} fill="url(#welcomeGlow)" />
        </Svg>
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-muted text-xs font-semibold uppercase tracking-[0.32em]">
          Compose
        </Text>
        <Text className="text-ink text-[34px] font-serif-light leading-[44px] mt-5">
          Your body isn't failing you.{'\n'}It's following orders.
        </Text>
        <Text className="text-muted text-[15.5px] mt-4 leading-6">
          Over the next few minutes we'll map where those orders come from. Every answer stays
          on this phone.
        </Text>
        {/* Privacy promise before the first question — for this user, safety
            is the conversion lever, not a compliance footnote. */}
        <View className="flex-row items-center gap-2.5 mt-6">
          <Lock color="#C89B6D" size={14} />
          <Text className="text-muted text-[12.5px]">
            Private by design — no account, no sync, no lock-screen tells
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center"
      >
        <Text className="text-on-accent font-bold text-base">Find my baseline</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 2: Name ───────────────────────────────────────────────────────────

function NameScreen({ value, onSubmit }: { value: string; onSubmit: (name: string) => void }) {
  const [name, setName] = useState(value);
  const canContinue = name.trim().length > 0;

  return (
    <View className="flex-1 px-7 pt-9">
      <Text className="text-ink text-[23px] font-serif-regular leading-8">What is your name?</Text>
      <Text className="text-muted text-[13px] mt-3 leading-5">
        First name only. Like every answer here, it never leaves this device.
      </Text>
      <TextInput
        className="bg-surface border border-line rounded-xl p-4 text-ink text-base mt-6"
        placeholder="Your first name"
        placeholderTextColor="#6E675D"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={() => canContinue && onSubmit(name.trim())}
      />
      <TouchableOpacity
        onPress={() => onSubmit(name.trim())}
        disabled={!canContinue}
        activeOpacity={0.85}
        className={`rounded-2xl py-[19px] items-center mt-4 ${canContinue ? 'bg-accent' : 'bg-surface-deep'}`}
      >
        <Text className={`font-bold text-base ${canContinue ? 'text-on-accent' : 'text-faint'}`}>
          Continue
        </Text>
      </TouchableOpacity>
      <View className="flex-1" />
      <PrivacyFooter />
    </View>
  );
}

// ─── Screen 3: Age (rolling ticker) ───────────────────────────────────────────

const AGE_MIN = 18;
const AGE_MAX = 70;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);
const ITEM_HEIGHT = 56;
// Rows visible above/below the selection line
const WHEEL_PADDING = ITEM_HEIGHT * 2;

function AgeScreen({ onSubmit }: { onSubmit: (age: number) => void }) {
  const [selected, setSelected] = useState(30);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const age = AGES[Math.max(0, Math.min(index, AGES.length - 1))];
    setSelected(age);
  };

  return (
    <View className="flex-1 px-7 pt-9">
      <Text className="text-ink text-[23px] font-serif-regular leading-8">How old are you?</Text>

      <View className="flex-1 justify-center">
        <View style={{ height: ITEM_HEIGHT * 5 }} className="overflow-hidden">
          {/* Selection band */}
          <View
            pointerEvents="none"
            style={{ top: WHEEL_PADDING, height: ITEM_HEIGHT }}
            className="absolute left-0 right-0 border-y border-accent/40 bg-accent/5 rounded-lg z-10"
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentOffset={{ x: 0, y: (30 - AGE_MIN) * ITEM_HEIGHT }}
            onMomentumScrollEnd={onMomentumEnd}
            contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
          >
            {AGES.map((age) => (
              <View key={age} style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
                <Text
                  className={
                    age === selected
                      ? 'text-ink text-3xl font-serif-light'
                      : 'text-faint text-xl'
                  }
                >
                  {age}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onSubmit(selected)}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center mb-4"
      >
        <Text className="text-on-accent font-bold text-base">Continue</Text>
      </TouchableOpacity>
      <PrivacyFooter />
    </View>
  );
}

// ─── Screen 11: Hypertonicity Clench Test ─────────────────────────────────────

function HypertonicityScreen({ onSelect }: { onSelect: (v: string) => void }) {
  const [phase, setPhase] = useState<ClenchPhase>('ready');
  const [count, setCount] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startClench = () => {
    setPhase('clench');
    setCount(5);
    intervalRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearTimer();
          setPhase('relax');
          setCount(10);
          intervalRef.current = setInterval(() => {
            setCount((rc) => {
              if (rc <= 1) {
                clearTimer();
                setPhase('result');
                return 0;
              }
              return rc - 1;
            });
          }, 1000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearTimer(), []);

  const RESULT_OPTIONS = [
    'Complete release — I felt clear relaxation',
    'Partial release — some tension remained',
    'Difficulty releasing — stayed contracted',
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 36 }} className="px-7">
      <View className="mt-8">
        <Text className="text-ink text-[23px] font-serif-regular leading-8">
          Let's feel it, not describe it.
        </Text>
        <Text className="text-muted text-[13.5px] mt-2.5 leading-5">
          Chronic pelvic tension is the physical arm of the adrenaline trap. Twenty seconds
          gives us your baseline.
        </Text>
      </View>

      {phase === 'ready' && (
        <>
          <View className="bg-surface border border-line rounded-[18px] p-5 gap-3 mt-6">
            <StepInstruction number="1" text="Sit comfortably, feet flat on the floor." />
            <StepInstruction
              number="2"
              text="On Begin, clench your pelvic floor — as if stopping urine flow."
            />
            <StepInstruction
              number="3"
              text="Hold five seconds, release fully on cue. Notice what release feels like."
            />
          </View>
          <View className="items-center mt-8">
            <ClenchCircle numeral="5" label="Clench & hold" active={false} />
          </View>
          <View className="flex-1" />
          <TouchableOpacity
            onPress={startClench}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-[18px] items-center mt-6"
          >
            <Text className="text-on-accent font-bold text-[15px]">Begin the 20-second check</Text>
          </TouchableOpacity>
        </>
      )}

      {(phase === 'clench' || phase === 'relax') && (
        <View className="items-center pt-10 gap-8">
          <ClenchCircle
            numeral={String(count)}
            label={phase === 'clench' ? 'Clench & hold' : 'Release & observe'}
            active={phase === 'clench'}
          />
          <Text className="text-body text-sm text-center px-6 leading-5">
            {phase === 'clench'
              ? 'Squeeze your pelvic floor firmly upward and inward.'
              : 'Let go completely. Notice how fully your muscles can relax.'}
          </Text>
        </View>
      )}

      {phase === 'result' && (
        <View className="gap-[11px] mt-8">
          <Text className="text-ink text-base font-serif-regular mb-1">
            After releasing, what did you notice?
          </Text>
          {RESULT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className="bg-surface border border-line rounded-[14px] px-[18px] py-[17px]"
            >
              <Text className="text-body text-[15px]">{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// E03's 150px countdown ring — the numeral is serif display type; the copper
// border reads "active" during the clench, neutral during release.
function ClenchCircle({
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
      style={{
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1.5,
        borderColor: active ? 'rgba(200,155,109,0.9)' : 'rgba(200,155,109,0.5)',
        backgroundColor: 'rgba(200,155,109,0.07)',
      }}
      className="items-center justify-center"
    >
      <Text className="text-ink text-[34px] font-serif-light">{numeral}</Text>
      <Text className="text-muted text-[10.5px] uppercase tracking-[0.2em] mt-0.5">{label}</Text>
    </View>
  );
}

function StepInstruction({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row gap-3 items-start">
      <Text className="text-accent text-[13px] font-serif-semi mt-0.5">{number}</Text>
      <Text className="text-body text-sm leading-5 flex-1">{text}</Text>
    </View>
  );
}

// ─── Generic single-choice screen ─────────────────────────────────────────────

function ChoiceScreen({
  title,
  normalization,
  options,
  value,
  onSelect,
}: {
  title: string;
  /**
   * One line under sensitive questions that names the pattern as common
   * before the user answers — normalization lowers the disclosure cost, and
   * honest answers are what make the profile readout land later (E02).
   */
  normalization?: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }} className="px-7">
      <View className="mt-9">
        <Text className="text-ink text-[23px] font-serif-regular leading-8">{title}</Text>
        {normalization && (
          <Text className="text-muted text-[13px] mt-3 leading-5">{normalization}</Text>
        )}
      </View>
      <View className="gap-[11px] mt-8">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className={`rounded-[14px] border px-[18px] py-[17px] ${
                isSelected ? 'bg-accent/10 border-accent/50' : 'bg-surface border-line'
              }`}
            >
              <Text className={`text-[15px] ${isSelected ? 'text-accent-soft' : 'text-body'}`}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="flex-1" />
      <PrivacyFooter />
    </ScrollView>
  );
}

// ─── Educational interstitial ─────────────────────────────────────────────────

function EducationScreen({
  icon,
  title,
  body,
  cta,
  onContinue,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onContinue: () => void;
}) {
  return (
    <View className="flex-1 px-7 justify-between pb-9">
      <View className="flex-1 justify-center">
        <View className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center mb-6">
          {icon}
        </View>
        <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-2">
          Clinical Context
        </Text>
        <Text className="text-ink text-2xl font-serif-regular leading-9">{title}</Text>
        <Text className="text-body text-base mt-4 leading-7">{body}</Text>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center"
      >
        <Text className="text-on-accent font-bold text-base">{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 25: Analyzer ──────────────────────────────────────────────────────

function AnalyzerScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const size = 190;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  useEffect(() => {
    // ~3.5s total — long enough to register as computation, short enough
    // not to invite an app switch.
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(onComplete, 400);
          return 100;
        }
        return next;
      });
    }, 35);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View style={{ width: size, height: size }} className="items-center justify-center mb-8">
        <Svg
          width={size}
          height={size}
          style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#201D19"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#C89B6D"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text className="text-ink text-[38px] font-serif-light">{progress}%</Text>
      </View>

      <Text className="text-body text-sm text-center">
        Structuring your neuroplasticity timeline
      </Text>
      <Text className="text-dim text-xs text-center mt-2">
        autonomic profile ✓ · pelvic baseline ✓ · 75-day sequence…
      </Text>
    </View>
  );
}

// ─── Screen 26: Profile Readout (E05) ─────────────────────────────────────────

interface ProfileMeter {
  label: string;
  value: number; // 0–100
  grade: string;
  high: boolean; // High grades get the accent-bright label + copper bar
}

function scoreFor(
  map: Record<string, number>,
  answer: string | null,
  fallback: number,
): number {
  return answer !== null && map[answer] !== undefined ? map[answer] : fallback;
}

/**
 * Maps questionnaire answers → the three severity meters (E05). Weights are
 * deterministic and versioned here (§7 — no runtime generation). Each meter
 * blends the two answers that most directly index that construct; fallbacks
 * sit mid-scale so a skipped answer never fabricates severity.
 */
function computeProfileMeters(a: OnboardingAnswers): ProfileMeter[] {
  const autonomic = scoreFor(
    { 'Yes, it feels like panic': 88, Sometimes: 62, 'No, I stay calm': 34 },
    a.autonomic,
    62,
  );
  const breath = scoreFor(
    { 'Yes, I gasp / hold it': 84, "I haven't noticed": 58, 'No, I breathe deeply': 30 },
    a.breath,
    58,
  );
  const sympathetic = Math.round(autonomic * 0.6 + breath * 0.4);

  const spectator = scoreFor(
    { 'Yes — almost every time': 86, Sometimes: 60, Rarely: 32 },
    a.spectator,
    60,
  );
  const rumination = scoreFor(
    {
      '"I am broken"': 78,
      '"She is disappointed in me"': 74,
      '"I will never fix this"': 78,
      'All of the above': 90,
    },
    a.mentalLoop,
    66,
  );
  const spectatoring = Math.round(spectator * 0.6 + rumination * 0.4);

  // Capacity meter (higher = better), from the felt clench test — the one
  // answer in the funnel the user experienced rather than estimated.
  const release = scoreFor(
    {
      'Complete release — I felt clear relaxation': 76,
      'Partial release — some tension remained': 38,
      'Difficulty releasing — stayed contracted': 22,
    },
    a.pelvic,
    38,
  );

  const loadGrade = (v: number) => (v >= 70 ? 'High' : v >= 45 ? 'Moderate' : 'Low');
  const capacityGrade = (v: number) => (v >= 70 ? 'Strong' : v >= 35 ? 'Partial' : 'Limited');

  return [
    {
      label: 'Sympathetic override',
      value: sympathetic,
      grade: loadGrade(sympathetic),
      high: sympathetic >= 70,
    },
    {
      label: 'Spectatoring loop',
      value: spectatoring,
      grade: loadGrade(spectatoring),
      high: spectatoring >= 70,
    },
    {
      label: 'Pelvic release capacity',
      value: release,
      grade: capacityGrade(release),
      high: release >= 70,
    },
  ];
}

const TIMELINE_PHRASES: Record<string, string> = {
  'Less than 6 months': 'over the last six months',
  '1 to 3 years': 'over 1–3 years',
  'More than 3 years': 'over more than three years',
  'As long as I can remember': 'over most of your adult life',
};

// Bar widths animate in on mount (300ms ease-out per spec) — the meters
// filling is the "your answers were computed" receipt, not decoration.
function MeterBar({ value, high }: { value: number; high: boolean }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: value,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width in % can't ride the native driver
    }).start();
  }, []);
  return (
    <View className="h-[5px] bg-line rounded-full overflow-hidden">
      <Animated.View
        className={`h-full rounded-full ${high ? 'bg-accent' : 'bg-muted'}`}
        style={{
          width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

function ProfileReadoutScreen({
  answers,
  onContinue,
}: {
  answers: OnboardingAnswers;
  onContinue: () => void;
}) {
  const meters = computeProfileMeters(answers);
  const firstName = answers.name.trim();
  const duration = (answers.timeline && TIMELINE_PHRASES[answers.timeline]) || 'over time';

  return (
    <View className="flex-1 px-7 pt-16">
      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Your map
      </Text>
      <Text className="text-ink text-[27px] font-serif-light leading-9 mt-2">
        {firstName
          ? `${firstName}, here is what your answers show.`
          : 'Here is what your answers show.'}
      </Text>

      <View className="bg-surface border border-line rounded-[18px] p-5 mt-5 gap-[13px]">
        {meters.map((meter) => (
          <View key={meter.label}>
            <View className="flex-row justify-between mb-[5px]">
              <Text className="text-body text-[13px]">{meter.label}</Text>
              <Text
                className={`text-xs font-bold ${meter.high ? 'text-accent-bright' : 'text-muted'}`}
              >
                {meter.grade}
              </Text>
            </View>
            <MeterBar value={meter.value} high={meter.high} />
          </View>
        ))}
      </View>

      <Text className="text-body text-sm leading-[22px] mt-4">
        This is a conditioned adrenaline response, established {duration}. Conditioned means
        learned — and learned means reversible. Your 75-day sequence is built.
      </Text>

      <View className="flex-1" />

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center"
      >
        <Text className="text-on-accent font-bold text-base">See my protocol</Text>
      </TouchableOpacity>
      <Text className="text-dim text-xs text-center py-3 mb-3">Stored on this device only</Text>
    </View>
  );
}

// ─── Screen 27: Checkout Paywall ─────────────────────────────────────────────

const LEGAL_URLS = {
  privacy: 'https://adwlivingventures.github.io/compose-legal/privacy-policy.html',
  terms: 'https://adwlivingventures.github.io/compose-legal/terms-of-use.html',
};

const PAYWALL_FEATURES = [
  'Full 75-day somatic & pelvic protocol',
  'Interactive hypertonicity release tracks',
  'Daily guided pacing sessions',
  'CBST cognitive restructuring log',
  'Pathway-specific habit coaching',
  'Optional $4.99/mo membership after Day 75',
];

function CheckoutScreen({
  pathway,
  onPurchaseComplete,
}: {
  pathway: Pathway | null;
  onPurchaseComplete: () => Promise<void>;
}) {
  const {
    currentOffering,
    purchasePackage,
    restorePurchases,
    isProcessing,
    hasProAccess,
    getPackageByProduct,
  } = useRevenueCat();

  // If the entitlement arrives asynchronously — a delayed StoreKit
  // confirmation or a restore landing via the customer-info listener — the
  // user should never sit on a paywall for a product he already owns.
  const advancedRef = useRef(false);
  useEffect(() => {
    if (hasProAccess && !advancedRef.current) {
      advancedRef.current = true;
      onPurchaseComplete();
    }
  }, [hasProAccess]);

  const handlePurchase = async () => {
    // Try to get the specific 75-day product first
    const pack =
      getPackageByProduct(RC_PRODUCTS.program) ??
      currentOffering?.availablePackages[0];

    if (!pack) {
      Alert.alert('Offer Unavailable', 'Please check your connection and try again.');
      return;
    }
    const success = await purchasePackage(pack);
    if (success && !advancedRef.current) {
      advancedRef.current = true;
      await onPurchaseComplete();
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success && !advancedRef.current) {
      advancedRef.current = true;
      await onPurchaseComplete();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
      className="px-6 bg-ground"
    >
      <View className="items-center mt-6 mb-6">
        <View className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 items-center justify-center mb-4">
          <Crown color="#C89B6D" size={30} />
        </View>
        <Text className="text-ink text-2xl font-serif-regular text-center">
          Your {pathway ?? 'Personalized'} Protocol Is Ready
        </Text>
        <Text className="text-muted text-sm text-center mt-2 leading-5">
          Commit to the 75-day autonomic reset and reclaim your confidence.
        </Text>
      </View>

      {/* Feature list */}
      <View className="bg-surface border border-line rounded-2xl p-5 mb-5">
        {PAYWALL_FEATURES.map((feature, i) => (
          <View
            key={feature}
            className={`flex-row items-center gap-3 ${
              i < PAYWALL_FEATURES.length - 1 ? 'mb-3' : ''
            }`}
          >
            <Check color="#C89B6D" size={16} />
            <Text className="text-body text-sm flex-1">{feature}</Text>
          </View>
        ))}
      </View>

      {/* Primary price card — $49.99 one-time */}
      <View className="bg-accent/10 border border-accent/30 rounded-2xl p-5 mb-3 items-center">
        <Text className="text-body text-xs uppercase tracking-widest font-bold">
          One-time offer
        </Text>
        <Text className="text-ink text-5xl font-serif-light mt-2">$49.99</Text>
        <Text className="text-muted text-xs mt-1">
          Full 75-day protocol · No subscription required
        </Text>
      </View>

      {/* Secondary info card — $4.99/mo continuation */}
      <View className="bg-surface border border-line rounded-2xl px-5 py-4 mb-6 flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-full bg-surface-deep border border-line items-center justify-center">
          <Crown color="#B9B2A6" size={14} />
        </View>
        <View className="flex-1">
          <Text className="text-body text-sm font-bold">
            Keep access after Day 75
          </Text>
          <Text className="text-muted text-xs mt-0.5 leading-4">
            Continue your protocol membership for $4.99/mo — cancel anytime.
          </Text>
        </View>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        onPress={handlePurchase}
        disabled={isProcessing}
        activeOpacity={0.85}
        className="bg-accent rounded-xl py-4 items-center mb-3 flex-row justify-center gap-2"
      >
        {isProcessing ? (
          <ActivityIndicator color="#171310" />
        ) : (
          <>
            <Text className="text-on-accent font-bold text-base">Begin My Reset — $49.99</Text>
            <ChevronRight color="#171310" size={18} />
          </>
        )}
      </TouchableOpacity>

      {/* Restore Purchases — required for App Store review compliance */}
      <TouchableOpacity
        onPress={handleRestore}
        disabled={isProcessing}
        activeOpacity={0.7}
        className="py-3 items-center"
      >
        <Text className="text-muted text-xs">Restore Purchases</Text>
      </TouchableOpacity>

      {__DEV__ && (
        <TouchableOpacity
          onPress={async () => {
            if (!advancedRef.current) {
              advancedRef.current = true;
              await onPurchaseComplete();
            }
          }}
          activeOpacity={0.7}
          className="py-2 items-center"
        >
          <Text className="text-dim text-xs">Skip paywall (dev only)</Text>
        </TouchableOpacity>
      )}

      {/* Legal links — Apple requires both on any paywall offering an
          auto-renewable subscription */}
      <View className="flex-row justify-center gap-6 mt-1">
        <TouchableOpacity
          onPress={() => Linking.openURL(LEGAL_URLS.privacy)}
          activeOpacity={0.7}
          className="py-2"
        >
          <Text className="text-faint text-xs">Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(LEGAL_URLS.terms)}
          activeOpacity={0.7}
          className="py-2"
        >
          <Text className="text-faint text-xs">Terms of Use</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

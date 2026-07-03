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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  Brain,
  Zap,
  Repeat,
  Pill,
  Target,
  Activity,
  ChevronRight,
  CheckCircle2,
  Circle as CircleIcon,
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
// blueprint, and checkout stand outside it.
const DIAGNOSTIC_FIRST = 1;
const DIAGNOSTIC_LAST = 23;
const STEP_ANALYZER = 24;
const STEP_BLUEPRINT = 25;
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
          title="During intimacy, do you ever feel like you are 'watching yourself perform' from the outside, evaluating your own body?"
          options={['Yes, constantly', 'Sometimes', 'Rarely']}
          value={answers.spectator}
          onSelect={pick('spectator')}
        />
      )}

      {/* 8 — Autonomic */}
      {step === 7 && (
        <ChoiceScreen
          title="When you initiate intimacy, do you feel a sudden spike in your heart rate, or a rush of nervous adrenaline in your chest?"
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
          options={['Yes, significantly easier', 'About the same', 'No']}
          value={answers.hardware}
          onSelect={pick('hardware')}
        />
      )}

      {/* 13 — Dopamine */}
      {step === 12 && (
        <ChoiceScreen
          title="In an average week, how frequently do you rely on highly visual stimulation (adult content) during solo sessions?"
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

      {/* 26 — Blueprint Ready */}
      {step === STEP_BLUEPRINT && (
        <BlueprintReadyScreen name={answers.name} onContinue={goNext} />
      )}

      {/* 27 — Paywall */}
      {step === STEP_CHECKOUT && (
        <CheckoutScreen
          pathway={pathwayForPainPoint(answers.painPoint)}
          onPurchaseComplete={async () => {
            await unlockProtocol();
            router.replace('/(tabs)');
          }}
        />
      )}
    </View>
  );
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function ProgressHeader({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <View className="px-6 pt-14 pb-3">
      <View className="h-1.5 w-full bg-surface-deep rounded-full overflow-hidden">
        <View className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

// ─── Screen 1: Welcome ────────────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View className="flex-1 px-6 justify-between pb-10">
      <View className="flex-1 items-center justify-center">
        <Text className="text-body text-sm font-bold uppercase tracking-[0.3em] mb-8">
          COMPOSE
        </Text>
        <Text className="text-ink text-[34px] font-serif-light text-center leading-[44px]">
          Your body isn't failing you.{'\n'}It's following orders.
        </Text>
        <Text className="text-muted text-base text-center mt-5 leading-6 px-2">
          COMPOSE retrains the system giving them.{'\n'}Let's find your baseline.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-accent rounded-xl py-4 items-center flex-row justify-center gap-2"
      >
        <Text className="text-on-accent font-bold text-base">Begin</Text>
        <ChevronRight color="#171310" size={18} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 2: Name ───────────────────────────────────────────────────────────

function NameScreen({ value, onSubmit }: { value: string; onSubmit: (name: string) => void }) {
  const [name, setName] = useState(value);
  const canContinue = name.trim().length > 0;

  return (
    <View className="flex-1 px-6 pt-6">
      <Text className="text-ink text-2xl font-serif-regular leading-8">What is your name?</Text>
      <Text className="text-muted text-sm mt-2 leading-5">
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
        className={`rounded-xl py-4 items-center mt-4 ${canContinue ? 'bg-accent' : 'bg-surface-deep'}`}
      >
        <Text className={`font-bold text-base ${canContinue ? 'text-on-accent' : 'text-faint'}`}>
          Continue
        </Text>
      </TouchableOpacity>
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
    <View className="flex-1 px-6 pt-6">
      <Text className="text-ink text-2xl font-serif-regular leading-8">How old are you?</Text>

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
        className="bg-accent rounded-xl py-4 items-center mb-10"
      >
        <Text className="text-on-accent font-bold text-base">Continue</Text>
      </TouchableOpacity>
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-6">
      <View className="mt-4 mb-6">
        <View className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center mb-5">
          <Activity color="#C89B6D" size={28} />
        </View>
        <Text className="text-ink text-xl font-serif-regular leading-7">
          Let's test that adrenaline response — right now.
        </Text>
        <Text className="text-muted text-sm mt-2 leading-5">
          Chronic pelvic tightness (hypertonicity) is the hidden physical arm of the
          adrenaline trap. This 20-second check gives us your baseline.
        </Text>
      </View>

      {phase === 'ready' && (
        <View className="gap-4">
          <View className="bg-surface border border-line rounded-2xl p-5 gap-3">
            <StepInstruction number="1" text="Sit comfortably with feet flat on the floor." />
            <StepInstruction
              number="2"
              text="When you tap Begin, clench your pelvic floor muscles — like you're stopping urine flow."
            />
            <StepInstruction
              number="3"
              text="Hold for 5 seconds, then fully release on cue. Observe what you feel."
            />
          </View>
          <TouchableOpacity
            onPress={startClench}
            activeOpacity={0.85}
            className="bg-accent rounded-xl py-4 items-center mt-2"
          >
            <Text className="text-on-accent font-bold text-base">Begin 20-Second Test</Text>
          </TouchableOpacity>
        </View>
      )}

      {(phase === 'clench' || phase === 'relax') && (
        <View className="items-center py-4 gap-6">
          <View
            className="w-36 h-36 rounded-full border-2 items-center justify-center"
            style={{ borderColor: phase === 'clench' ? '#C89B6D' : '#8A8378' }}
          >
            <Text className="text-ink text-4xl font-serif-light">{count}</Text>
            <Text className="text-body text-xs uppercase tracking-widest mt-1">seconds</Text>
          </View>

          <View className="bg-surface border border-line rounded-2xl p-5 w-full items-center gap-2">
            {phase === 'clench' ? (
              <>
                <Text className="text-accent text-base font-bold">CLENCH & HOLD</Text>
                <Text className="text-body text-sm text-center">
                  Squeeze your pelvic floor firmly upward and inward.
                </Text>
              </>
            ) : (
              <>
                <Text className="text-body text-base font-bold">RELEASE & OBSERVE</Text>
                <Text className="text-body text-sm text-center">
                  Let go completely. Notice how fully your muscles can relax.
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {phase === 'result' && (
        <View className="gap-3">
          <Text className="text-ink text-base font-bold mb-1">
            After releasing, what did you notice?
          </Text>
          {RESULT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className="flex-row items-center justify-between bg-surface border border-line rounded-xl p-4 gap-3"
            >
              <Text className="text-body text-sm flex-1">{option}</Text>
              <CircleIcon color="#6E675D" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StepInstruction({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row gap-3 items-start">
      <View className="w-6 h-6 rounded-full bg-accent/20 items-center justify-center mt-0.5">
        <Text className="text-accent text-xs font-bold">{number}</Text>
      </View>
      <Text className="text-body text-sm leading-5 flex-1">{text}</Text>
    </View>
  );
}

// ─── Generic single-choice screen ─────────────────────────────────────────────

function ChoiceScreen({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-6">
      <View className="mt-4 mb-8">
        <Text className="text-ink text-xl font-serif-regular leading-7">{title}</Text>
      </View>
      <View className="gap-3">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className={`flex-row items-center justify-between rounded-xl border p-4 ${
                isSelected ? 'bg-accent/10 border-accent' : 'bg-surface border-line'
              }`}
            >
              <Text
                className={`text-sm font-medium flex-1 ${
                  isSelected ? 'text-accent' : 'text-body'
                }`}
              >
                {option}
              </Text>
              {isSelected ? (
                <CheckCircle2 color="#C89B6D" size={20} />
              ) : (
                <CircleIcon color="#6E675D" size={20} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
    <View className="flex-1 px-6 justify-between pb-10">
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
        className="bg-accent rounded-xl py-4 items-center"
      >
        <Text className="text-on-accent font-bold text-base">{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 25: Analyzer ──────────────────────────────────────────────────────

const ANALYZER_LABELS = [
  'Analyzing autonomic profile...',
  'Structuring neuroplasticity timeline...',
  'Building 75-day clinical protocol...',
];

function AnalyzerScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labelIndex = Math.min(
    Math.floor((progress / 100) * ANALYZER_LABELS.length),
    ANALYZER_LABELS.length - 1,
  );

  const size = 180;
  const strokeWidth = 12;
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
        <Text className="text-ink text-3xl font-serif-light">{progress}%</Text>
      </View>

      <Text
        className="text-accent text-sm text-center font-mono"
        style={{ minHeight: 20 }}
      >
        {ANALYZER_LABELS[labelIndex]}
      </Text>
    </View>
  );
}

// ─── Screen 26: Blueprint Ready ───────────────────────────────────────────────

function BlueprintReadyScreen({ name, onContinue }: { name: string; onContinue: () => void }) {
  const firstName = name.trim();
  return (
    <View className="flex-1 px-6 justify-between pb-10">
      <View className="flex-1 justify-center items-center">
        <View className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 items-center justify-center mb-6">
          <CheckCircle2 color="#C89B6D" size={32} />
        </View>
        <Text className="text-ink text-2xl font-serif-regular text-center leading-9">
          {firstName ? `${firstName}, your 75-Day Blueprint is ready.` : 'Your 75-Day Blueprint is ready.'}
        </Text>
        <Text className="text-body text-base text-center mt-4 leading-6">
          Your baseline can be reset. We have compiled your daily autonomic exposure and
          somatic training protocol.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-accent rounded-xl py-4 items-center flex-row justify-center gap-2"
      >
        <Text className="text-on-accent font-bold text-base">Unlock My Protocol</Text>
        <ChevronRight color="#171310" size={18} />
      </TouchableOpacity>
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

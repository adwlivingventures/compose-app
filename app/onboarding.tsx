import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  ShieldCheck,
  Lock,
  Eye,
  Brain,
  Sunrise,
  Moon,
  Activity,
  Wind,
  Target,
  Compass,
  Sparkles,
  CheckCircle2,
  Circle as CircleIcon,
  ChevronRight,
  Crown,
  Check,
  Zap,
  Apple,
  Heart,
} from 'lucide-react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useProtocol } from '../context/ProtocolContext';
import { useRevenueCat, RC_PRODUCTS } from '../hooks/useRevenueCat';

// ─── Types ───────────────────────────────────────────────────────────────────

type Pathway = 'Presence' | 'Control' | 'Confidence';
type ClenchPhase = 'ready' | 'clench' | 'relax' | 'result';

interface OnboardingAnswers {
  goal: string | null;
  hypertonicity: string | null;
  spectatoring: string | null;
  stress: string | null;
  bodyAwareness: string | null;
  morningErections: string | null;
  sleepQuality: string | null;
  movement: string | null;
  diet: string | null;
  commitment: string | null;
  pathway: Pathway | null;
}

// Screens 0-12 are diagnostic — progress header visible.
const DIAGNOSTIC_SCREENS = 13;
const MAX_STEP = 14;

// ─── Root Screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { unlockProtocol } = useProtocol();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    goal: null,
    hypertonicity: null,
    spectatoring: null,
    stress: null,
    bodyAwareness: null,
    morningErections: null,
    sleepQuality: null,
    movement: null,
    diet: null,
    commitment: null,
    pathway: null,
  });

  const goNext = () => setStep((s) => Math.min(s + 1, MAX_STEP));

  return (
    <View className="flex-1 bg-slate-950">
      {step < DIAGNOSTIC_SCREENS && (
        <ProgressHeader step={step} total={DIAGNOSTIC_SCREENS} />
      )}

      {step === 0 && <WelcomeScreen onContinue={goNext} />}

      {step === 1 && <PrivacyGuardScreen onContinue={goNext} />}

      {step === 2 && (
        <SingleChoiceScreen
          icon={<Brain color="#34d399" size={28} />}
          title="What brings you to COMPOSE?"
          subtitle="There's no wrong answer — this just calibrates your starting protocol."
          options={[
            'Performance anxiety',
            'Low confidence',
            'Disconnected during intimacy',
            'General self-improvement',
          ]}
          value={answers.goal}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, goal: v }));
            goNext();
          }}
        />
      )}

      {step === 3 && (
        <HypertonitictyScreen
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, hypertonicity: v }));
            goNext();
          }}
        />
      )}

      {step === 4 && (
        <SingleChoiceScreen
          icon={<Eye color="#34d399" size={28} />}
          title="During intimacy, do you mentally watch or judge yourself rather than feeling present?"
          subtitle="This is called spectatoring — it's extremely common and fully trainable."
          options={['Never', 'Occasionally', 'Frequently', 'Almost every time']}
          value={answers.spectatoring}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, spectatoring: v }));
            goNext();
          }}
        />
      )}

      {step === 5 && (
        <SingleChoiceScreen
          icon={<Wind color="#34d399" size={28} />}
          title="How would you rate your day-to-day stress and nervous system tension?"
          options={[
            'Calm and regulated',
            'Manageable',
            'Often tense',
            'Frequently overwhelmed',
          ]}
          value={answers.stress}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, stress: v }));
            goNext();
          }}
        />
      )}

      {step === 6 && (
        <SingleChoiceScreen
          icon={<Activity color="#34d399" size={28} />}
          title="How aware are you of sensation in your pelvic floor and lower body?"
          subtitle="Most men have never been taught to notice this region at all."
          options={[
            "I can't feel it",
            'Vague awareness',
            'Some control',
            'Strong mind-body connection',
          ]}
          value={answers.bodyAwareness}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, bodyAwareness: v }));
            goNext();
          }}
        />
      )}

      {step === 7 && (
        <SingleChoiceScreen
          icon={<Sunrise color="#34d399" size={28} />}
          title="How often do you experience morning erections?"
          subtitle="A key vascular and nervous system baseline marker."
          options={['Daily', 'Several times a week', 'Rarely', 'Never']}
          value={answers.morningErections}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, morningErections: v }));
            goNext();
          }}
        />
      )}

      {step === 8 && (
        <SingleChoiceScreen
          icon={<Moon color="#34d399" size={28} />}
          title="How would you describe your sleep quality?"
          options={[
            'Deep and consistent',
            'Decent, some disruption',
            'Restless',
            'Poor most nights',
          ]}
          value={answers.sleepQuality}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, sleepQuality: v }));
            goNext();
          }}
        />
      )}

      {step === 9 && (
        <SingleChoiceScreen
          icon={<Activity color="#34d399" size={28} />}
          title="How often do you move your body or train deliberately each week?"
          options={['5+ times', '2-4 times', 'Once in a while', 'Rarely or never']}
          value={answers.movement}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, movement: v }));
            goNext();
          }}
        />
      )}

      {step === 10 && (
        <SingleChoiceScreen
          icon={<Apple color="#34d399" size={28} />}
          title="How would you describe your current diet and lifestyle habits?"
          subtitle="Nutrition and inflammation directly influence vascular and hormonal health."
          options={[
            'Whole foods, low processed',
            'Mixed — room to improve',
            'Mostly processed / convenience',
            'Not paying much attention',
          ]}
          value={answers.diet}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, diet: v }));
            goNext();
          }}
        />
      )}

      {step === 11 && (
        <SingleChoiceScreen
          icon={<Compass color="#34d399" size={28} />}
          title="How committed are you to working through a structured 75-day protocol?"
          options={[
            'Fully committed',
            'Motivated, just need structure',
            'Curious but unsure',
            'Only mildly interested',
          ]}
          value={answers.commitment}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, commitment: v }));
            goNext();
          }}
        />
      )}

      {step === 12 && (
        <PathwayScreen
          value={answers.pathway}
          onSelect={(pathway) => {
            setAnswers((a) => ({ ...a, pathway }));
            goNext();
          }}
        />
      )}

      {step === 13 && (
        <CalculatingScreen pathway={answers.pathway} onComplete={goNext} />
      )}

      {step === 14 && (
        <CheckoutScreen
          pathway={answers.pathway}
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
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <View className="px-6 pt-14 pb-3">
      <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <View
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
      <Text className="text-slate-500 text-xs font-mono mt-2 tracking-widest">
        STEP {step + 1} OF {total}
      </Text>
    </View>
  );
}

// ─── Screen 0: Welcome Hero ───────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View className="flex-1 px-6 justify-between pb-10">
      <View className="flex-1 items-center justify-center">
        <View className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-8">
          <Zap color="#34d399" size={44} />
        </View>
        <Text className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] mb-3">
          COMPOSE
        </Text>
        <Text className="text-white text-3xl font-bold text-center leading-9">
          Men's Somatic Presence{'\n'}& Pelvic Coach
        </Text>
        <Text className="text-slate-500 text-base text-center mt-4 leading-6">
          A 75-day science-backed protocol for presence, control, and confidence — built
          from the inside out.
        </Text>

        <View className="flex-row gap-6 mt-10">
          <StatPill value="75" label="Day Protocol" />
          <StatPill value="3" label="Pathways" />
          <StatPill value="100%" label="On-Device" />
        </View>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-emerald-500 rounded-xl py-4 items-center shadow-lg shadow-emerald-500/20 flex-row justify-center gap-2"
      >
        <Text className="text-slate-950 font-bold text-base">Begin Free Assessment</Text>
        <ChevronRight color="#020617" size={18} />
      </TouchableOpacity>
    </View>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-emerald-400 text-xl font-bold">{value}</Text>
      <Text className="text-slate-500 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

// ─── Screen 1: Privacy Guard ──────────────────────────────────────────────────

function PrivacyGuardScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      className="px-6"
    >
      <View className="flex-1 items-center justify-center py-8">
        <View className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-6">
          <ShieldCheck color="#34d399" size={40} />
        </View>

        <Text className="text-white text-2xl font-bold text-center">
          Your Privacy is Locked Down
        </Text>
        <Text className="text-slate-400 text-base text-center mt-3 leading-6">
          Every answer stays on this device. Sensitive data is encrypted directly to
          your phone's secure keychain — never uploaded, never shared.
        </Text>

        <View className="w-full mt-8 gap-3">
          <PrivacyRow
            icon={<Lock color="#34d399" size={18} />}
            label="On-device encryption (Keychain / Keystore)"
          />
          <PrivacyRow
            icon={<CheckCircle2 color="#34d399" size={18} />}
            label="No data sold or shared with third parties"
          />
          <PrivacyRow
            icon={<ShieldCheck color="#34d399" size={18} />}
            label="Answers used only to calibrate your protocol"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-emerald-500 rounded-xl py-4 items-center shadow-lg shadow-emerald-500/20"
      >
        <Text className="text-slate-950 font-bold text-base">
          I Understand, Continue Securely
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PrivacyRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-xl p-4 gap-3">
      {icon}
      <Text className="text-slate-300 text-sm flex-1">{label}</Text>
    </View>
  );
}

// ─── Screen 3: Hypertonicity Clench Diagnostic ────────────────────────────────

function HypertonitictyScreen({ onSelect }: { onSelect: (v: string) => void }) {
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
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      className="px-6"
    >
      <View className="mt-4 mb-6">
        <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-5">
          <Activity color="#34d399" size={28} />
        </View>
        <Text className="text-white text-xl font-bold leading-7">
          Pelvic Floor Hypertonicity Check
        </Text>
        <Text className="text-slate-500 text-sm mt-2 leading-5">
          Chronic tightness (hypertonicity) is a hidden driver of performance issues. This
          20-second test gives us your baseline.
        </Text>
      </View>

      {phase === 'ready' && (
        <View className="gap-4">
          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 gap-3">
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
            className="bg-emerald-500 rounded-xl py-4 items-center shadow-lg shadow-emerald-500/20 mt-2"
          >
            <Text className="text-slate-950 font-bold text-base">Begin 20-Second Test</Text>
          </TouchableOpacity>
        </View>
      )}

      {(phase === 'clench' || phase === 'relax') && (
        <View className="items-center py-4 gap-6">
          <View className="w-36 h-36 rounded-full border-2 items-center justify-center"
            style={{ borderColor: phase === 'clench' ? '#34d399' : '#64748b' }}>
            <Text className="text-white text-4xl font-bold">{count}</Text>
            <Text className="text-slate-400 text-xs uppercase tracking-widest mt-1">
              {phase === 'clench' ? 'seconds' : 'seconds'}
            </Text>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full items-center gap-2">
            {phase === 'clench' ? (
              <>
                <Text className="text-emerald-400 text-base font-bold">CLENCH & HOLD</Text>
                <Text className="text-slate-400 text-sm text-center">
                  Squeeze your pelvic floor firmly upward and inward.
                </Text>
              </>
            ) : (
              <>
                <Text className="text-slate-300 text-base font-bold">RELEASE & OBSERVE</Text>
                <Text className="text-slate-400 text-sm text-center">
                  Let go completely. Notice how fully your muscles can relax.
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {phase === 'result' && (
        <View className="gap-3">
          <Text className="text-white text-base font-bold mb-1">
            After releasing, what did you notice?
          </Text>
          {RESULT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className="flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 gap-3"
            >
              <Text className="text-slate-300 text-sm flex-1">{option}</Text>
              <CircleIcon color="#475569" size={20} />
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
      <View className="w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mt-0.5">
        <Text className="text-emerald-400 text-xs font-bold">{number}</Text>
      </View>
      <Text className="text-slate-400 text-sm leading-5 flex-1">{text}</Text>
    </View>
  );
}

// ─── Generic Single-Choice Screen ────────────────────────────────────────────

function SingleChoiceScreen({
  icon,
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      className="px-6"
    >
      <View className="mt-4 mb-8">
        <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-5">
          {icon}
        </View>
        <Text className="text-white text-xl font-bold leading-7">{title}</Text>
        {subtitle ? (
          <Text className="text-slate-500 text-sm mt-2 leading-5">{subtitle}</Text>
        ) : null}
      </View>

      <View className="gap-3">
        {options.map((option) => {
          const selected = value === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              onPress={() => onSelect(option)}
              className={`flex-row items-center justify-between rounded-xl border p-4 ${
                selected
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Text
                className={`text-sm font-medium flex-1 ${
                  selected ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {option}
              </Text>
              {selected ? (
                <CheckCircle2 color="#34d399" size={20} />
              ) : (
                <CircleIcon color="#475569" size={20} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Screen 12: Pathway Selection ────────────────────────────────────────────

const PATHWAYS: {
  key: Pathway;
  description: string;
  detail: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'Presence',
    description: 'Quiet the spectator mind and stay grounded in the moment.',
    detail: 'Somatic anchoring, breath regulation, sensory attunement',
    icon: <Sparkles color="#34d399" size={22} />,
  },
  {
    key: 'Control',
    description: 'Build pelvic floor command and physical staying power.',
    detail: 'Pelvic sequencing, hypertonicity release, threshold training',
    icon: <Target color="#34d399" size={22} />,
  },
  {
    key: 'Confidence',
    description: 'Rebuild self-trust through consistent daily practice.',
    detail: 'Cognitive reframe, arousal mapping, CBST restructuring',
    icon: <Compass color="#34d399" size={22} />,
  },
];

function PathwayScreen({
  value,
  onSelect,
}: {
  value: Pathway | null;
  onSelect: (p: Pathway) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      className="px-6"
    >
      <View className="mt-4 mb-8">
        <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-5">
          <Heart color="#34d399" size={26} />
        </View>
        <Text className="text-white text-xl font-bold">Choose your primary pathway</Text>
        <Text className="text-slate-500 text-sm mt-2 leading-5">
          Your 75-day protocol will be weighted toward this focus. You can blend pathways
          after your first week.
        </Text>
      </View>

      <View className="gap-4">
        {PATHWAYS.map((p) => {
          const selected = value === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.85}
              onPress={() => onSelect(p.key)}
              className={`rounded-2xl border p-5 ${
                selected
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <View className="flex-row items-center gap-3 mb-2">
                {p.icon}
                <Text
                  className={`text-base font-bold ${
                    selected ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {p.key}
                </Text>
                {selected && (
                  <View className="ml-auto">
                    <CheckCircle2 color="#34d399" size={18} />
                  </View>
                )}
              </View>
              <Text className="text-slate-400 text-sm leading-5">{p.description}</Text>
              <Text className="text-slate-600 text-xs mt-2 leading-4">{p.detail}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Screen 13: SVG Calculating Intermission ─────────────────────────────────

const CALC_LABELS = [
  'Mapping pelvic floor baseline...',
  'Scoring spectatoring index...',
  'Calibrating stress load...',
  'Matching pathway weighting...',
  'Finalizing your protocol...',
];

function CalculatingScreen({
  pathway,
  onComplete,
}: {
  pathway: Pathway | null;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labelIndex = Math.min(
    Math.floor((progress / 100) * CALC_LABELS.length),
    CALC_LABELS.length - 1,
  );

  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, 28);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center mb-8"
      >
        <Svg
          width={size}
          height={size}
          style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#34d399"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text className="text-white text-3xl font-bold">{progress}%</Text>
      </View>

      <Text className="text-white text-lg font-bold text-center">
        Calibrating your {pathway ?? 'personalized'} protocol
      </Text>
      <Text
        className="text-emerald-400 text-sm text-center mt-3 font-mono"
        style={{ minHeight: 20 }}
      >
        {CALC_LABELS[labelIndex]}
      </Text>
    </View>
  );
}

// ─── Screen 14: Checkout Paywall ─────────────────────────────────────────────

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
    getPackageByProduct,
  } = useRevenueCat();

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
    if (success) await onPurchaseComplete();
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) await onPurchaseComplete();
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
      className="px-6 bg-slate-950"
    >
      <View className="items-center mt-6 mb-6">
        <View className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 items-center justify-center mb-4">
          <Crown color="#fbbf24" size={30} />
        </View>
        <Text className="text-white text-2xl font-bold text-center">
          Your {pathway ?? 'Personalized'} Protocol Is Ready
        </Text>
        <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
          Commit to the 75-day autonomic reset and reclaim your confidence.
        </Text>
      </View>

      {/* Feature list */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
        {PAYWALL_FEATURES.map((feature, i) => (
          <View
            key={feature}
            className={`flex-row items-center gap-3 ${
              i < PAYWALL_FEATURES.length - 1 ? 'mb-3' : ''
            }`}
          >
            <Check color="#34d399" size={16} />
            <Text className="text-slate-300 text-sm flex-1">{feature}</Text>
          </View>
        ))}
      </View>

      {/* Price card */}
      <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 items-center">
        <Text className="text-slate-400 text-xs uppercase tracking-widest font-bold">
          One-time offer
        </Text>
        <Text className="text-white text-5xl font-bold mt-2">$49.99</Text>
        <Text className="text-slate-500 text-xs mt-1">
          Full 75-day protocol · No subscription required
        </Text>
        <Text className="text-slate-600 text-xs mt-1">
          Optional $4.99/mo continuation available after Day 75
        </Text>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        onPress={handlePurchase}
        disabled={isProcessing}
        activeOpacity={0.85}
        className="bg-emerald-500 rounded-xl py-4 items-center mb-3 shadow-lg shadow-emerald-500/20 flex-row justify-center gap-2"
      >
        {isProcessing ? (
          <ActivityIndicator color="#020617" />
        ) : (
          <>
            <Text className="text-slate-950 font-bold text-base">Begin My Reset — $49.99</Text>
            <ChevronRight color="#020617" size={18} />
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
        <Text className="text-slate-500 text-xs">Restore Purchases</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

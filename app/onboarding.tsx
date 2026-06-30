import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
} from 'lucide-react-native';
import { useProtocol } from '../context/ProtocolContext';

type Pathway = 'Presence' | 'Control' | 'Confidence';

interface OnboardingAnswers {
  spectatoring: string | null;
  stress: string | null;
  bodyAwareness: string | null;
  morningErections: string | null;
  sleepQuality: string | null;
  movement: string | null;
  commitment: string | null;
  pathway: Pathway | null;
}

const TOTAL_DIAGNOSTIC_STEPS = 10;

export default function OnboardingScreen() {
  const router = useRouter();
  const { unlockProtocol } = useProtocol();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    spectatoring: null,
    stress: null,
    bodyAwareness: null,
    morningErections: null,
    sleepQuality: null,
    movement: null,
    commitment: null,
    pathway: null,
  });

  const goNext = () => setStep((s) => Math.min(s + 1, 12));

  return (
    <View className="flex-1 bg-slate-950">
      {step <= TOTAL_DIAGNOSTIC_STEPS && <ProgressHeader step={step} total={TOTAL_DIAGNOSTIC_STEPS} />}

      {step === 1 && <PrivacyGuardScreen onContinue={goNext} />}
      {step === 2 && (
        <SingleChoiceScreen
          icon={<Brain color="#34d399" size={28} />}
          title="What brings you to COMPOSE?"
          subtitle="There's no wrong answer — this just calibrates your starting protocol."
          options={['Performance anxiety', 'Low confidence', 'Disconnected during intimacy', 'General self-improvement']}
          value={null}
          onSelect={goNext}
        />
      )}
      {step === 3 && (
        <SingleChoiceScreen
          icon={<Eye color="#34d399" size={28} />}
          title="Do you find yourself mentally watching or judging yourself during intimacy, rather than feeling present?"
          subtitle="This pattern is called spectatoring — it's extremely common and fully trainable."
          options={['Never', 'Occasionally', 'Frequently', 'Almost every time']}
          value={answers.spectatoring}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, spectatoring: v }));
            goNext();
          }}
        />
      )}
      {step === 4 && (
        <SingleChoiceScreen
          icon={<Wind color="#34d399" size={28} />}
          title="How would you rate your day-to-day stress and nervous system tension?"
          options={['Calm and regulated', 'Manageable', 'Often tense', 'Frequently overwhelmed']}
          value={answers.stress}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, stress: v }));
            goNext();
          }}
        />
      )}
      {step === 5 && (
        <SingleChoiceScreen
          icon={<Activity color="#34d399" size={28} />}
          title="How aware are you of sensation in your pelvic floor and lower body?"
          subtitle="Most men have never been taught to notice this region at all."
          options={["I can't feel it", "Vague awareness", "Some control", "Strong mind-body connection"]}
          value={answers.bodyAwareness}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, bodyAwareness: v }));
            goNext();
          }}
        />
      )}
      {step === 6 && (
        <SingleChoiceScreen
          icon={<Sunrise color="#34d399" size={28} />}
          title="How often do you experience morning erections?"
          subtitle="A useful baseline marker of vascular and nervous system health."
          options={['Daily', 'Several times a week', 'Rarely', 'Never']}
          value={answers.morningErections}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, morningErections: v }));
            goNext();
          }}
        />
      )}
      {step === 7 && (
        <SingleChoiceScreen
          icon={<Moon color="#34d399" size={28} />}
          title="How would you describe your sleep quality?"
          options={['Deep and consistent', 'Decent, some disruption', 'Restless', 'Poor most nights']}
          value={answers.sleepQuality}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, sleepQuality: v }));
            goNext();
          }}
        />
      )}
      {step === 8 && (
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
      {step === 9 && (
        <SingleChoiceScreen
          icon={<Compass color="#34d399" size={28} />}
          title="How committed are you to working through a structured 75-day protocol?"
          options={['Fully committed', 'Motivated, just need structure', 'Curious but unsure', 'Only mildly interested']}
          value={answers.commitment}
          onSelect={(v) => {
            setAnswers((a) => ({ ...a, commitment: v }));
            goNext();
          }}
        />
      )}
      {step === 10 && (
        <PathwayScreen
          value={answers.pathway}
          onSelect={(pathway) => {
            setAnswers((a) => ({ ...a, pathway }));
            goNext();
          }}
        />
      )}
      {step === 11 && <CalculatingScreen pathway={answers.pathway} onComplete={goNext} />}
      {step === 12 && (
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

function ProgressHeader({ step, total }: { step: number; total: number }) {
  return (
    <View className="px-6 pt-16 pb-4">
      <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <View
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </View>
      <Text className="text-slate-500 text-xs font-mono mt-2 tracking-widest">
        STEP {step} OF {total}
      </Text>
    </View>
  );
}

function PrivacyGuardScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
      <View className="flex-1 items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-6">
          <ShieldCheck color="#34d399" size={40} />
        </View>

        <Text className="text-white text-2xl font-bold text-center">
          Your Privacy is Locked Down
        </Text>
        <Text className="text-slate-400 text-base text-center mt-3 leading-6">
          Every answer you give stays on this device. Sensitive data is encrypted
          directly to your phone's secure keychain — never uploaded, never shared.
        </Text>

        <View className="w-full mt-8 gap-3">
          <PrivacyRow icon={<Lock color="#34d399" size={18} />} label="On-device encryption (Keychain / Keystore)" />
          <PrivacyRow icon={<CheckCircle2 color="#34d399" size={18} />} label="No data sold or shared with third parties" />
          <PrivacyRow icon={<ShieldCheck color="#34d399" size={18} />} label="Answers used only to calibrate your protocol" />
        </View>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        className="bg-emerald-500 rounded-xl py-4 items-center mb-10 shadow-lg shadow-emerald-500/20"
      >
        <Text className="text-slate-950 font-bold text-base">I Understand, Continue Securely</Text>
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
      <View className="mt-4 mb-8">
        <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-5">
          {icon}
        </View>
        <Text className="text-white text-xl font-bold leading-7">{title}</Text>
        {subtitle ? <Text className="text-slate-500 text-sm mt-2 leading-5">{subtitle}</Text> : null}
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
                selected ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Text className={`text-sm font-medium ${selected ? 'text-emerald-400' : 'text-slate-300'}`}>
                {option}
              </Text>
              {selected ? <CheckCircle2 color="#34d399" size={20} /> : <CircleIcon color="#475569" size={20} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const PATHWAYS: { key: Pathway; description: string; icon: React.ReactNode }[] = [
  { key: 'Presence', description: 'Quiet the spectator mind and stay grounded in the moment.', icon: <Sparkles color="#34d399" size={22} /> },
  { key: 'Control', description: 'Build pelvic floor command and physical staying power.', icon: <Target color="#34d399" size={22} /> },
  { key: 'Confidence', description: 'Rebuild self-trust through consistent daily practice.', icon: <Compass color="#34d399" size={22} /> },
];

function PathwayScreen({ value, onSelect }: { value: Pathway | null; onSelect: (p: Pathway) => void }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
      <View className="mt-4 mb-8">
        <Text className="text-white text-xl font-bold">Choose your primary pathway</Text>
        <Text className="text-slate-500 text-sm mt-2 leading-5">
          Your 75-day protocol will be weighted toward this focus area. You can adjust later.
        </Text>
      </View>

      <View className="gap-3">
        {PATHWAYS.map((p) => {
          const selected = value === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.85}
              onPress={() => onSelect(p.key)}
              className={`rounded-2xl border p-5 ${
                selected ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <View className="flex-row items-center gap-3 mb-2">
                {p.icon}
                <Text className={`text-base font-bold ${selected ? 'text-emerald-400' : 'text-white'}`}>
                  {p.key}
                </Text>
              </View>
              <Text className="text-slate-400 text-sm leading-5">{p.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CalculatingScreen({ pathway, onComplete }: { pathway: Pathway | null; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(onComplete, 350);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View style={{ width: size, height: size }} className="items-center justify-center mb-8">
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
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

      <Text className="text-white text-lg font-bold text-center">Calibrating your protocol</Text>
      <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
        Building your {pathway ?? 'personalized'} pathway from your diagnostic answers...
      </Text>
    </View>
  );
}

const PAYWALL_FEATURES = [
  'Full 75-day somatic & pelvic protocol',
  'Daily guided pacing sessions',
  'Progress tracking & streak system',
  'Pathway-specific habit coaching',
];

function CheckoutScreen({
  pathway,
  onPurchaseComplete,
}: {
  pathway: Pathway | null;
  onPurchaseComplete: () => Promise<void>;
}) {
  const [processing, setProcessing] = useState(false);

  const handlePurchase = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(async () => {
      await onPurchaseComplete();
    }, 1400);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 bg-slate-950">
      <View className="items-center mt-6 mb-6">
        <View className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 items-center justify-center mb-4">
          <Crown color="#fbbf24" size={30} />
        </View>
        <Text className="text-white text-2xl font-bold text-center">
          Your {pathway ?? 'Personalized'} Protocol Is Ready
        </Text>
        <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
          Start your 75-day transformation journey today.
        </Text>
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
        {PAYWALL_FEATURES.map((feature) => (
          <View key={feature} className="flex-row items-center gap-3 mb-3 last:mb-0">
            <Check color="#34d399" size={16} />
            <Text className="text-slate-300 text-sm flex-1">{feature}</Text>
          </View>
        ))}
      </View>

      <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 items-center">
        <Text className="text-slate-400 text-xs uppercase tracking-widest font-bold">One-time transformation offer</Text>
        <Text className="text-white text-4xl font-bold mt-2">$49.99</Text>
        <Text className="text-slate-500 text-xs mt-1">Full lifetime access, no subscription</Text>
      </View>

      <TouchableOpacity
        onPress={handlePurchase}
        disabled={processing}
        activeOpacity={0.85}
        className="bg-emerald-500 rounded-xl py-4 items-center mb-3 shadow-lg shadow-emerald-500/20 flex-row justify-center gap-2"
      >
        {processing ? (
          <ActivityIndicator color="#020617" />
        ) : (
          <>
            <Text className="text-slate-950 font-bold text-base">Start My Transformation</Text>
            <ChevronRight color="#020617" size={18} />
          </>
        )}
      </TouchableOpacity>

      <Text className="text-slate-600 text-xs text-center mb-10 leading-4">
        Simulated checkout for development. No real payment will be charged.
      </Text>
    </ScrollView>
  );
}

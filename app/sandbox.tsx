import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Minus, Plus } from 'lucide-react-native';
import BreathingOrb, { FULL_BREATH, OrbPhase } from '../components/BreathingOrb';
import { useProtocol } from '../context/ProtocolContext';
import { LocalStore } from '../services/storage';

/**
 * Somatic Sandbox — the Day-26 unlock (strategy ruling: Phase 2 start, in
 * the $49.99 tier, NOT Day 76).
 *
 * A configurable pacer built on the same BreathingOrb as the daily session
 * and the SOS sheet. Locked through Phase 1 on purpose: the first 25 days
 * exist to habituate ONE fixed ratio, and handing the user a mixing desk
 * during acquisition invites tinkering — novelty-seeking is the adrenaline
 * system's move. Opening it on Day 26 turns the Phase-2 threshold into a
 * milestone reward and lands new surface area exactly in the Day-22–30
 * relapse window, when the daily loop's novelty is at its lowest.
 *
 * Config persists locally (`@sandbox_config`) — local-only per §7.
 */

interface PacerConfig {
  inhale: number;
  hold: number;
  exhale: number;
  /** Post-exhale hold (box breathing). Custom mode doesn't expose it. */
  holdOut?: number;
}

interface Preset {
  id: string;
  title: string;
  ratio: string;
  config: PacerConfig;
}

const PRESETS: Preset[] = [
  // The daily conditioning ratio — the long-exhale vagal brake.
  { id: 'downshift', title: 'Downshift', ratio: '4 : 6', config: { inhale: 4, hold: 0, exhale: 6 } },
  // The SOS ratio — retention plus an even longer exhale, for the spikes.
  { id: 'release', title: 'Deep release', ratio: '4-7-8', config: { inhale: 4, hold: 7, exhale: 8 } },
  // Even-sided box — steadiness without sedation: meetings, focus.
  { id: 'box', title: 'Box', ratio: '4-4-4-4', config: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 } },
];

const CUSTOM_DEFAULT: PacerConfig = { inhale: 4, hold: 2, exhale: 6 };
const CUSTOM_LIMITS: Record<'inhale' | 'hold' | 'exhale', [number, number]> = {
  inhale: [2, 8],
  hold: [0, 10],
  exhale: [2, 12],
};

interface SandboxState {
  selected: string; // preset id or 'custom'
  custom: PacerConfig;
}

function buildPhases(config: PacerConfig): { phases: OrbPhase[]; labels: string[] } {
  const phases: OrbPhase[] = [{ toScale: FULL_BREATH, durationMs: config.inhale * 1000 }];
  const labels = ['Inhale'];
  if (config.hold > 0) {
    phases.push({ toScale: FULL_BREATH, durationMs: config.hold * 1000 });
    labels.push('Hold');
  }
  phases.push({ toScale: 1, durationMs: config.exhale * 1000 });
  labels.push('Exhale');
  if (config.holdOut) {
    phases.push({ toScale: 1, durationMs: config.holdOut * 1000 });
    labels.push('Hold');
  }
  return { phases, labels };
}

// Quiet stepper row for the custom ratio — borders and glyphs, no chrome.
function StepperRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-2.5">
      <Text className="text-body text-[13px]">{label}</Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.7}
          className="w-8 h-8 rounded-full border border-line items-center justify-center"
          style={{ opacity: value <= min ? 0.35 : 1 }}
        >
          <Minus color="#6B7280" size={14} />
        </TouchableOpacity>
        <Text className="text-ink text-base font-serif-regular w-8 text-center">{value}s</Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.7}
          className="w-8 h-8 rounded-full border border-line items-center justify-center"
          style={{ opacity: value >= max ? 0.35 : 1 }}
        >
          <Plus color="#6B7280" size={14} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SandboxScreen() {
  const router = useRouter();
  const { activeDay, completedDays } = useProtocol();
  const unlocked = activeDay >= 26 || completedDays[75]?.completed === true;

  const [state, setState] = useState<SandboxState | null>(null);
  const [phaseLabel, setPhaseLabel] = useState('Inhale');
  const [count, setCount] = useState(0);
  const countInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate before first orb render so the glow starts on the user's own
  // ratio, not a default that swaps out one breath in.
  useEffect(() => {
    LocalStore.getItem<SandboxState>('@sandbox_config').then((saved) => {
      setState(saved ?? { selected: 'downshift', custom: CUSTOM_DEFAULT });
    });
    return () => {
      if (countInterval.current) clearInterval(countInterval.current);
    };
  }, []);

  useEffect(() => {
    if (state) LocalStore.setItem('@sandbox_config', state);
  }, [state]);

  // Deep-link guard: the You-tab row is inert while locked, but the route
  // itself must hold the same line. Same register as the locked cards —
  // quiet, no countdown, no sell.
  if (!unlocked) {
    return (
      <View className="flex-1 bg-ground px-7 pt-14">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 mb-10 self-start"
        >
          <ChevronLeft size={16} color="#6B7280" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
        <Lock color="#4B5563" size={18} />
        <Text className="text-ink text-[24px] font-serif-regular mt-4">
          The Sandbox opens on Day 26.
        </Text>
        <Text className="text-muted text-[13px] leading-5 mt-3">
          Phase 1 trains one ratio until it holds on its own. Then the pacer becomes yours to
          shape.
        </Text>
      </View>
    );
  }

  if (!state) return <View className="flex-1 bg-ground" />;

  const config =
    state.selected === 'custom'
      ? state.custom
      : (PRESETS.find((p) => p.id === state.selected) ?? PRESETS[0]).config;
  const { phases, labels } = buildPhases(config);
  // Key the orb on the ratio: any change remounts it at the top of an
  // inhale instead of warping mid-breath.
  const orbKey = `${config.inhale}-${config.hold}-${config.exhale}-${config.holdOut ?? 0}`;

  const handlePhaseStart = (index: number) => {
    setPhaseLabel(labels[index]);
    const seconds = Math.round(phases[index].durationMs / 1000);
    setCount(seconds);
    if (countInterval.current) clearInterval(countInterval.current);
    countInterval.current = setInterval(() => {
      setCount((c) => (c > 1 ? c - 1 : c));
    }, 1000);
  };

  const setCustomField = (field: 'inhale' | 'hold' | 'exhale', next: number) =>
    setState((s) => s && { selected: 'custom', custom: { ...s.custom, [field]: next } });

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 56, paddingBottom: 48 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 mb-5 self-start"
      >
        <ChevronLeft size={16} color="#6B7280" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        On-demand regulation
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">Somatic Sandbox</Text>
      <Text className="text-muted text-[13px] leading-5 mt-2">
        Your pacer, your ratio — for the drive over, the meeting, the hour before sleep. The
        daily session stays as written.
      </Text>

      <View className="items-center mt-6">
        <BreathingOrb
          key={orbKey}
          phases={phases}
          size={280}
          glowSize={260}
          innerSize={180}
          onPhaseStart={handlePhaseStart}
          haptics
          announcements={labels}
        >
          <Text className="text-ink text-[34px] font-serif-light">{count}</Text>
          <Text className="text-accent-soft text-[11px] font-semibold uppercase tracking-[0.22em] mt-1">
            {phaseLabel}
          </Text>
        </BreathingOrb>
      </View>

      <View className="flex-row gap-2.5 mt-6">
        {PRESETS.map((preset) => {
          const active = state.selected === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => setState((s) => s && { ...s, selected: preset.id })}
              activeOpacity={0.8}
              className={`flex-1 rounded-[14px] border py-3 items-center ${
                active ? 'bg-accent/10 border-accent/40' : 'bg-surface border-line'
              }`}
            >
              <Text className={`text-[13px] font-semibold ${active ? 'text-accent-soft' : 'text-body'}`}>
                {preset.title}
              </Text>
              <Text className={`text-[11px] mt-0.5 ${active ? 'text-accent' : 'text-faint'}`}>
                {preset.ratio}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        className={`bg-surface border rounded-[18px] px-5 py-3 mt-3 ${
          state.selected === 'custom' ? 'border-accent/40' : 'border-line'
        }`}
      >
        <Text className="text-muted text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 mb-1">
          Your own ratio
        </Text>
        <StepperRow
          label="Inhale"
          value={state.custom.inhale}
          min={CUSTOM_LIMITS.inhale[0]}
          max={CUSTOM_LIMITS.inhale[1]}
          onChange={(v) => setCustomField('inhale', v)}
        />
        <StepperRow
          label="Hold"
          value={state.custom.hold}
          min={CUSTOM_LIMITS.hold[0]}
          max={CUSTOM_LIMITS.hold[1]}
          onChange={(v) => setCustomField('hold', v)}
        />
        <StepperRow
          label="Exhale"
          value={state.custom.exhale}
          min={CUSTOM_LIMITS.exhale[0]}
          max={CUSTOM_LIMITS.exhale[1]}
          onChange={(v) => setCustomField('exhale', v)}
        />
        <Text className="text-faint text-[11.5px] leading-4 mt-1.5 mb-1">
          Keep the exhale longer than the inhale to settle; even them out to steady.
        </Text>
      </View>
    </ScrollView>
  );
}

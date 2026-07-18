import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import AudioPlayer from '../components/AudioPlayer';
import BreathingOrb from '../components/BreathingOrb';
import { practiceById, REGULATION_AUDIO, Practice } from '../content/regulation';
import { track } from '../services/analytics';

/**
 * Practice runner — one screen for every Library practice kind.
 *
 * Anti-binge by design (docs/STEADY-TAB-SPEC.md): no autoplay, no "up
 * next", no recommendations. Every practice ends on a quiet close line and
 * a single Return action — the session resolves into stillness, it doesn't
 * chain. Library use casts no protocol votes (no streaks, no completion
 * records): the Blueprint stays the sole source of identity evidence.
 *
 * §7 telemetry: the practice TAG only, at start. Nothing else leaves.
 */

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const practice = id ? practiceById(id) : undefined;
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (practice) track('library_practice_started', { practice: practice.id });
  }, [practice?.id]);

  if (!practice) {
    // Unknown id — return quietly rather than showing an error surface.
    return (
      <View className="flex-1 bg-ground items-center justify-center">
        <TouchableOpacity onPress={() => router.back()} className="p-4">
          <Text className="text-muted text-sm">Return</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ground">
      <View className="flex-row items-center justify-between px-6 pt-14 pb-2">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          The Library
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close practice"
          className="bg-surface border border-line rounded-full p-2.5"
        >
          <X color="#6B7280" size={18} />
        </TouchableOpacity>
      </View>

      {done ? (
        <CloseState practice={practice} />
      ) : practice.kind === 'audio' ? (
        <AudioRunner practice={practice} onDone={() => setDone(true)} />
      ) : practice.kind === 'orb' ? (
        <OrbRunner practice={practice} onDone={() => setDone(true)} />
      ) : (
        <StepsRunner practice={practice} onDone={() => setDone(true)} />
      )}
    </View>
  );
}

// ─── Close state — the practice resolves into stillness ──────────────────────

function CloseState({ practice }: { practice: Practice }) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <Text className="text-ink text-xl font-serif-regular text-center leading-8">
        {practice.closing}
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.85}
        className="bg-surface border border-line rounded-xl py-3.5 px-12 mt-10"
      >
        <Text className="text-body font-semibold text-sm">Return</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Audio ───────────────────────────────────────────────────────────────────

function AudioRunner({ practice, onDone }: { practice: Practice; onDone: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <AudioPlayer
        title={practice.title}
        focus={practice.intro}
        source={REGULATION_AUDIO[practice.audioKey!]}
        onComplete={onDone}
      />
      <TouchableOpacity onPress={onDone} activeOpacity={0.7} className="mt-10 py-2 px-6">
        <Text className="text-dim text-xs font-semibold">End practice</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Orb — silent paced breathing (pattern mirrors the SOS BreathingGuide) ───

function OrbRunner({ practice, onDone }: { practice: Practice; onDone: () => void }) {
  const { phases, labels, sub } = practice.orb!;
  const seconds = phases.map((p) => Math.round(p.durationMs / 1000));
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(seconds[0]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const onPhaseStart = (index: number, completedCycles: number) => {
    setPhaseIndex(index);
    setCycles(completedCycles);
    setSecondsLeft(seconds[index]);
    clearTick();
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(1, s - 1));
    }, 1000);
  };

  useEffect(() => clearTick, []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-ink text-2xl font-serif-regular text-center mb-6">
        {practice.title}
      </Text>
      <BreathingOrb
        phases={phases}
        size={250}
        glowSize={230}
        innerSize={160}
        onPhaseStart={onPhaseStart}
        haptics
        announcements={labels}
      >
        <Text className="text-accent-soft text-3xl font-serif-light">{secondsLeft}</Text>
      </BreathingOrb>

      <Text className="text-ink text-[17px] font-semibold mt-4 h-6">{labels[phaseIndex]}</Text>
      <Text className="text-muted text-[12.5px] mt-1 h-5">
        {cycles > 0
          ? `${cycles} ${cycles === 1 ? 'round' : 'rounds'} complete · ${sub}`
          : sub}
      </Text>

      <TouchableOpacity
        onPress={onDone}
        activeOpacity={0.85}
        className="bg-surface border border-line rounded-xl py-3.5 px-11 mt-8"
      >
        <Text className="text-body font-semibold text-sm">Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Steps — paced card sequence, advanced by tap ────────────────────────────

function StepsRunner({ practice, onDone }: { practice: Practice; onDone: () => void }) {
  const steps = practice.steps!;
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = index === steps.length - 1;

  return (
    <View className="flex-1 px-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink text-2xl font-serif-regular text-center mb-8">
          {practice.title}
        </Text>

        <View className="bg-surface border border-line rounded-2xl p-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest">
            {step.title}
          </Text>
          <Text className="text-ink text-[15px] leading-7 font-serif-regular mt-3">
            {step.body}
          </Text>
          {step.hint ? (
            <Text className="text-dim text-[11.5px] mt-4">{step.hint}</Text>
          ) : null}
        </View>

        <View className="flex-row justify-center gap-1.5 mt-5">
          {steps.map((s, i) => (
            <View
              key={s.title}
              className={`h-1.5 w-1.5 rounded-full ${
                i <= index ? 'bg-accent' : 'bg-surface-deep'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={() => (last ? onDone() : setIndex(index + 1))}
          activeOpacity={0.85}
          className="bg-accent rounded-xl py-3.5 items-center mt-6"
        >
          <Text className="text-on-accent font-bold text-sm">
            {last ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
        <Text className="text-faint text-[11px] text-center mt-3">
          Move at the body's pace, not the card's.
        </Text>
      </ScrollView>
    </View>
  );
}

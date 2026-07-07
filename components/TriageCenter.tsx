import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Wind, Anchor, PenLine, CheckCircle2 } from 'lucide-react-native';
import { useDefusionLog, FALLACY_META, Fallacy } from '../hooks/useDefusionLog';
import BreathingOrb, { SOS_478_PHASES } from './BreathingOrb';
import BottomSheet from './BottomSheet';

/**
 * Triage Center — the "painkiller" mechanic (CLAUDE.md §6).
 *
 * A bottom sheet, not a screen push: the user is already sympathetically
 * activated; sliding a dark sheet over the current context avoids the
 * re-orientation cost of a full navigation. Three state-dependent branches,
 * because the right intervention differs by autonomic state:
 *
 *  - Anticipatory spike → paced 4-7-8 breathing (the extended exhale engages
 *    the vagal brake; the expanding/contracting circle gives the eyes a
 *    pacing target so the user isn't counting cognitively).
 *  - Mid-encounter spectatoring → sensory grounding (attention on raw
 *    sensation starves the evaluative loop).
 *  - Post-falter shame → Spectator Disassembly: a 3-step defusion log that
 *    interrupts rumination by forcing observation (what happened) apart from
 *    narration (what the Spectator says it means), then names the fallacy
 *    and answers it with an authored reframe. Entries persist locally only.
 */

type TriageView = 'menu' | 'breath' | 'ground' | 'defuse';

interface TriageCenterProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Branch: Sensory Grounding (deterministic text) ───────────────────────────

// Mirrors the Day 16 anchor ("Sensory Grounding") exactly — the SOS tool and
// the audio train the same 3-2-1 sequence, so under pressure there is one
// protocol to remember, not two.
const GROUNDING_STEPS = [
  'You don’t need to leave or explain. Do not fight the thoughts — override them with sensory data.',
  'Find three things you can physically see — the shadow on the wall, the texture of the blanket.',
  'Find two things you can physically feel — the weight of your partner, the temperature of the air.',
  'Find one thing you can hear — her breathing, or the hum of the air conditioner.',
  'Anxiety requires you to be in the future. Sensory data forces your brain back into the present second. See it. Feel it. Hear it. Ground yourself.',
];

// ─── Branch: 4-7-8 Breathing ──────────────────────────────────────────────────

const BREATH_LABELS = [
  'Inhale through your nose',
  'Hold',
  'Exhale slowly through your lips',
] as const;
const BREATH_SECONDS = SOS_478_PHASES.map((p) => Math.round(p.durationMs / 1000));

function BreathingGuide() {
  // Starts breathing the moment the branch opens — the user arrived
  // sympathetically activated; asking them to make a "start" decision first
  // is one decision too many. Stop is the only control while running.
  // runId keys the orb so an explicit restart begins cleanly from the top of
  // an inhale (re-renders never restart it — that's handled inside the orb).
  const [runId, setRunId] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATH_SECONDS[0]);
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
    setSecondsLeft(BREATH_SECONDS[index]);
    clearTick();
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(1, s - 1));
    }, 1000);
  };

  const stop = () => {
    clearTick();
    setRunId(0);
    setCycles(0);
  };

  const start = () => {
    setPhaseIndex(0);
    setSecondsLeft(BREATH_SECONDS[0]);
    setRunId((id) => id + 1);
  };

  useEffect(() => clearTick, []);

  const running = runId > 0;

  return (
    <View className="items-center py-4">
      {running ? (
        <BreathingOrb
          key={runId}
          phases={SOS_478_PHASES}
          size={230}
          glowSize={210}
          innerSize={150}
          onPhaseStart={onPhaseStart}
          haptics
          announcements={[...BREATH_LABELS]}
        >
          <Text className="text-accent-soft text-3xl font-serif-light">{secondsLeft}</Text>
        </BreathingOrb>
      ) : (
        <View style={{ width: 230, height: 230 }} className="items-center justify-center">
          <View
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: 'rgba(200,155,109,0.09)',
              borderWidth: 1.5,
              borderColor: 'rgba(200,155,109,0.5)',
            }}
            className="items-center justify-center"
          >
            <Text className="text-accent-soft text-lg font-serif-light">4 · 7 · 8</Text>
          </View>
        </View>
      )}

      <Text className="text-ink text-[17px] font-semibold mt-2 h-6">
        {running ? BREATH_LABELS[phaseIndex] : 'Ready when you are'}
      </Text>
      <Text className="text-muted text-[12.5px] mt-1 h-5">
        {running
          ? cycles > 0
            ? `${cycles} ${cycles === 1 ? 'cycle' : 'cycles'} complete · four is usually enough`
            : 'Follow the orb'
          : 'Four rounds is usually enough to feel the shift.'}
      </Text>

      <TouchableOpacity
        onPress={running ? stop : start}
        activeOpacity={0.85}
        className={`rounded-xl py-3.5 px-11 mt-5 ${running ? 'bg-surface border border-line' : 'bg-accent'}`}
      >
        <Text className={`font-semibold text-sm ${running ? 'text-body' : 'text-on-accent'}`}>
          {running ? 'Stop' : 'Begin again'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Branch: Spectator Disassembly (defusion log) ─────────────────────────────

function DefusionLogForm({ onDone }: { onDone: () => void }) {
  const { addEntry } = useDefusionLog();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [somaticReality, setSomaticReality] = useState('');
  const [spectatorClaim, setSpectatorClaim] = useState('');
  const [chosenFallacy, setChosenFallacy] = useState<Fallacy | null>(null);
  const [ventralAnchor, setVentralAnchor] = useState('');
  const [saving, setSaving] = useState(false);

  const saveEntry = async () => {
    if (!chosenFallacy || saving) return;
    setSaving(true);
    await addEntry({
      somaticReality: somaticReality.trim(),
      spectatorClaim: spectatorClaim.trim(),
      fallacy: chosenFallacy,
      ventralAnchor: ventralAnchor.trim(),
    });
    onDone();
  };

  // Step 4 — read the authored reframe, then write the truth in his own
  // words. The saved entry is his statement, not just ours.
  if (chosenFallacy) {
    const canSave = ventralAnchor.trim().length > 0;
    return (
      <View className="py-2">
        <View className="flex-row items-center gap-2 mb-3">
          <CheckCircle2 color="#C89B6D" size={18} />
          <Text className="text-accent text-xs font-bold uppercase tracking-widest">
            {FALLACY_META[chosenFallacy].label} — Named
          </Text>
        </View>
        <Text className="text-ink text-sm leading-6">
          {FALLACY_META[chosenFallacy].reframe}
        </Text>

        <Text className="text-accent text-xs font-bold uppercase tracking-widest mt-6">
          Step 4 of 4 — Your Ventral Vagal Anchor
        </Text>
        <Text className="text-body text-sm mt-2 leading-5">
          Now say it in your own words. What is the clinical truth of what happened?
        </Text>
        <TextInput
          className="bg-surface-deep border border-line rounded-xl p-4 text-ink text-sm leading-5 min-h-[80px] mt-3"
          multiline
          textAlignVertical="top"
          placeholder="e.g. “My body followed adrenaline. That's physiology, not a verdict on me.”"
          placeholderTextColor="#6E675D"
          value={ventralAnchor}
          onChangeText={setVentralAnchor}
        />
        <TouchableOpacity
          onPress={saveEntry}
          disabled={!canSave || saving}
          activeOpacity={0.85}
          className={`rounded-xl py-3.5 items-center mt-4 ${canSave ? 'bg-accent' : 'bg-surface-deep'}`}
        >
          <Text className={`font-bold text-sm ${canSave ? 'text-on-accent' : 'text-faint'}`}>
            Save My Anchor
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step < 2) {
    const meta =
      step === 0
        ? {
            label: 'Somatic Reality',
            question: 'What actually happened, physically? Facts only — no interpretation.',
            placeholder: 'e.g. “I lost my erection about ten minutes in.”',
            value: somaticReality,
            set: setSomaticReality,
          }
        : {
            label: 'The Spectator’s Claim',
            question: 'What is the voice saying it means?',
            placeholder: 'e.g. “She thinks something is wrong with me.”',
            value: spectatorClaim,
            set: setSpectatorClaim,
          };
    const canAdvance = meta.value.trim().length > 0;

    return (
      <View className="py-2">
        <Text className="text-accent text-xs font-bold uppercase tracking-widest">
          Step {step + 1} of 4 — {meta.label}
        </Text>
        <Text className="text-body text-sm mt-2 leading-5">{meta.question}</Text>
        <TextInput
          className="bg-surface-deep border border-line rounded-xl p-4 text-ink text-sm leading-5 min-h-[90px] mt-3"
          multiline
          textAlignVertical="top"
          placeholder={meta.placeholder}
          placeholderTextColor="#6E675D"
          value={meta.value}
          onChangeText={meta.set}
        />
        <TouchableOpacity
          onPress={() => setStep((s) => (s + 1) as 1 | 2)}
          disabled={!canAdvance}
          activeOpacity={0.85}
          className={`rounded-xl py-3.5 items-center mt-4 ${canAdvance ? 'bg-accent' : 'bg-surface-deep'}`}
        >
          <Text className={`font-bold text-sm ${canAdvance ? 'text-on-accent' : 'text-faint'}`}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 3 — name the fallacy
  return (
    <View className="py-2">
      <Text className="text-accent text-xs font-bold uppercase tracking-widest">
        Step 3 of 4 — Name the Fallacy
      </Text>
      <Text className="text-body text-sm mt-2 leading-5">
        Read the Spectator’s claim again. Which pattern is it running?
      </Text>
      <View className="gap-3 mt-4">
        {(Object.keys(FALLACY_META) as Fallacy[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setChosenFallacy(f)}
            activeOpacity={0.8}
            className="bg-surface-deep border border-line rounded-xl px-4 py-3.5 flex-row items-center justify-between"
          >
            <Text className="text-ink text-sm font-bold">{FALLACY_META[f].label}</Text>
            <ChevronRight size={16} color="#8A8378" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Triage Center (root sheet) ───────────────────────────────────────────────

const MENU_ITEMS: { view: TriageView; icon: React.ReactNode; title: string; subtitle: string }[] = [
  {
    view: 'breath',
    icon: <Wind color="#C89B6D" size={20} />,
    title: 'Before Intimacy — Rising Pressure',
    subtitle: 'A paced breathing sequence to settle the surge.',
  },
  {
    view: 'ground',
    icon: <Anchor color="#C89B6D" size={20} />,
    title: 'During — Watching Yourself',
    subtitle: 'Return attention from evaluation to sensation.',
  },
  {
    view: 'defuse',
    icon: <PenLine color="#C89B6D" size={20} />,
    title: 'Afterward — The Replay Has Started',
    subtitle: 'Take the Spectator’s story apart, piece by piece.',
  },
];

export default function TriageCenter({ visible, onClose }: TriageCenterProps) {
  const [view, setView] = useState<TriageView>('menu');

  const close = () => {
    onClose();
    // Reset after the slide-down so the user never sees the flip
    setTimeout(() => setView('menu'), 300);
  };

  return (
    <BottomSheet visible={visible} onClose={close}>
      <View className="bg-tab border-t border-line-soft rounded-t-3xl px-6 pt-5 pb-10 max-h-[85%]">
          <View className="w-10 h-1 bg-line rounded-full self-center mb-4" />

          {view === 'menu' ? (
            <>
              <Text className="text-ink text-xl font-serif-regular">Steady. You’re in the right place.</Text>
              <Text className="text-muted text-sm mt-1 mb-4 leading-5">
                Pick the moment you’re in.
              </Text>
              <View className="gap-3 pb-2">
                {MENU_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.view}
                    onPress={() => setView(item.view)}
                    activeOpacity={0.8}
                    className="bg-ground border border-line rounded-2xl p-4 flex-row items-center gap-3"
                  >
                    <View className="w-10 h-10 rounded-full bg-surface-deep items-center justify-center">
                      {item.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-ink text-sm font-bold">{item.title}</Text>
                      <Text className="text-muted text-xs mt-0.5 leading-4">{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={18} color="#8A8378" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setView('menu')}
                activeOpacity={0.7}
                className="flex-row items-center gap-1 mb-2 self-start"
              >
                <ChevronLeft size={16} color="#8A8378" />
                <Text className="text-muted text-xs font-bold">Back</Text>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {view === 'breath' && <BreathingGuide />}
                {view === 'ground' && (
                  <View className="py-2">
                    {GROUNDING_STEPS.map((step, i) => (
                      <View key={i} className="flex-row gap-3 mt-3">
                        <Text className="text-accent text-xs font-bold mt-0.5">{i + 1}</Text>
                        <Text className="text-body text-sm leading-5 flex-1">{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {view === 'defuse' && <DefusionLogForm onDone={close} />}
              </ScrollView>
            </>
          )}
        </View>
    </BottomSheet>
  );
}

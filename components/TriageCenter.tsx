import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Wind, Anchor, PenLine, CheckCircle2 } from 'lucide-react-native';
import { useDefusionLog, FALLACY_META, Fallacy } from '../hooks/useDefusionLog';
import { track } from '../services/analytics';
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
// protocol to remember, not two. Formatted as three large count-cards
// (founder review 2026-07-10): a panicked reader scans numerals, he doesn't
// read paragraphs.
const GROUNDING_INTRO =
  'You don’t need to leave or explain. Don’t fight the thoughts — override them with your senses.';
const GROUNDING_COUNTS: { count: string; verb: string; line: string; examples: string }[] = [
  {
    count: '3',
    verb: 'SEE',
    line: 'Three things you can see.',
    examples: 'The shadow on the wall. The texture of the blanket.',
  },
  {
    count: '2',
    verb: 'FEEL',
    line: 'Two things you can feel.',
    examples: 'The weight of your partner. The temperature of the air.',
  },
  {
    count: '1',
    verb: 'HEAR',
    line: 'One thing you can hear.',
    examples: 'Her breathing. The hum of the room.',
  },
];
const GROUNDING_CLOSE =
  'Anxiety lives in the future. Your senses only work in the present. See it. Feel it. Hear it.';

function GroundingGuide() {
  return (
    <View className="py-2">
      <Text className="text-body text-sm leading-5">{GROUNDING_INTRO}</Text>
      <View className="gap-3 mt-4">
        {GROUNDING_COUNTS.map((step) => (
          <View
            key={step.verb}
            className="bg-ground border border-line rounded-2xl p-4 flex-row items-center gap-4"
          >
            <Text className="text-accent font-serif-light" style={{ fontSize: 34, width: 30 }}>
              {step.count}
            </Text>
            <View className="flex-1">
              <Text className="text-ink text-sm font-bold tracking-widest">{step.verb}</Text>
              <Text className="text-body text-[13px] mt-0.5">{step.line}</Text>
              <Text className="text-muted text-xs mt-1 leading-4">{step.examples}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text className="text-muted text-[12.5px] leading-5 mt-4">{GROUNDING_CLOSE}</Text>
    </View>
  );
}

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

// Founder review 2026-07-10: the post-falter user gets a TAP-FIRST flow —
// the old version opened with two required free-text fields, which is
// homework for a man mid-rumination. The common Spectator claims are
// pre-written (deterministic, §7) and each carries its fallacy tag, so one
// tap names the distortion and surfaces the authored reframe. Writing his
// own anchor is still offered (generation effect) but never required.
const COMMON_CLAIMS: { text: string; fallacy: Fallacy }[] = [
  { text: '“She thinks something is wrong with me.”', fallacy: 'mind_reading' },
  { text: '“She’s disappointed — she just won’t say it.”', fallacy: 'mind_reading' },
  { text: '“It’s always going to be like this now.”', fallacy: 'catastrophizing' },
  { text: '“I’ve ruined how she sees me.”', fallacy: 'catastrophizing' },
  { text: '“The whole night was a failure.”', fallacy: 'all_or_nothing' },
  { text: '“If my body doesn’t cooperate, I’m useless.”', fallacy: 'all_or_nothing' },
];

function DefusionLogForm({ onDone }: { onDone: () => void }) {
  const { addEntry } = useDefusionLog();
  const [spectatorClaim, setSpectatorClaim] = useState('');
  const [customClaim, setCustomClaim] = useState('');
  const [writingOwn, setWritingOwn] = useState(false);
  const [chosenFallacy, setChosenFallacy] = useState<Fallacy | null>(null);
  const [ventralAnchor, setVentralAnchor] = useState('');
  const [saving, setSaving] = useState(false);

  const saveEntry = async () => {
    if (!chosenFallacy || saving) return;
    setSaving(true);
    await addEntry({
      somaticReality: '',
      spectatorClaim: spectatorClaim.trim(),
      fallacy: chosenFallacy,
      ventralAnchor: ventralAnchor.trim(),
    });
    // §7: the distortion TAG only — the entry's text never leaves the device.
    track('restructurer_used', { distortion: chosenFallacy });
    onDone();
  };

  // Screen 2 — the fallacy named, the authored reframe, and an OPTIONAL
  // anchor. "Done" saves with or without his own words: zero required typing.
  if (chosenFallacy) {
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

        <Text className="text-muted text-xs font-bold uppercase tracking-widest mt-6">
          Optional — say it in your own words
        </Text>
        <TextInput
          className="bg-surface-deep border border-line rounded-xl p-4 text-ink text-sm leading-5 min-h-[70px] mt-3"
          multiline
          textAlignVertical="top"
          placeholder="e.g. “My body followed adrenaline. That's physiology, not a verdict on me.”"
          placeholderTextColor="#4B5563"
          value={ventralAnchor}
          onChangeText={setVentralAnchor}
        />
        <TouchableOpacity
          onPress={saveEntry}
          disabled={saving}
          activeOpacity={0.85}
          className="rounded-xl py-3.5 items-center mt-4 bg-accent"
        >
          <Text className="font-bold text-sm text-on-accent">
            {ventralAnchor.trim().length > 0 ? 'Save my anchor' : 'Done — filed and dismissed'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Custom path: he writes the claim, then names its pattern himself.
  if (writingOwn) {
    if (spectatorClaim.trim().length > 0) {
      return (
        <View className="py-2">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest">
            Which pattern is it running?
          </Text>
          <Text className="text-body text-sm mt-2 leading-5">
            Read the claim again. It’s one of these three.
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
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    return (
      <View className="py-2">
        <Text className="text-accent text-xs font-bold uppercase tracking-widest">
          What is the voice saying?
        </Text>
        <TextInput
          className="bg-surface-deep border border-line rounded-xl p-4 text-ink text-sm leading-5 min-h-[80px] mt-3"
          multiline
          textAlignVertical="top"
          placeholder="Write the claim, word for word."
          placeholderTextColor="#4B5563"
          value={customClaim}
          onChangeText={setCustomClaim}
        />
        <TouchableOpacity
          onPress={() => customClaim.trim() && setSpectatorClaim(customClaim)}
          disabled={customClaim.trim().length === 0}
          activeOpacity={0.85}
          className={`rounded-xl py-3.5 items-center mt-4 ${
            customClaim.trim() ? 'bg-accent' : 'bg-surface-deep'
          }`}
        >
          <Text
            className={`font-bold text-sm ${customClaim.trim() ? 'text-on-accent' : 'text-faint'}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Screen 1 — tap the claim the replay is making. One tap does the naming.
  return (
    <View className="py-2">
      <Text className="text-accent text-xs font-bold uppercase tracking-widest">
        The replay has started
      </Text>
      <Text className="text-body text-sm mt-2 leading-5">
        What is it saying? Tap the line closest to yours.
      </Text>
      <View className="gap-2.5 mt-4">
        {COMMON_CLAIMS.map((claim) => (
          <TouchableOpacity
            key={claim.text}
            onPress={() => {
              setSpectatorClaim(claim.text);
              setChosenFallacy(claim.fallacy);
            }}
            activeOpacity={0.8}
            className="bg-surface-deep border border-line rounded-xl px-4 py-3.5"
          >
            <Text className="text-ink text-sm leading-5 font-serif-italic">{claim.text}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setWritingOwn(true)}
          activeOpacity={0.8}
          className="px-4 py-3 items-center"
        >
          <Text className="text-muted text-[13px] font-semibold">It’s saying something else</Text>
        </TouchableOpacity>
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

  // §7 cohort telemetry: the fact that the SOS sheet opened — never which
  // tool was chosen or what was written inside it.
  useEffect(() => {
    if (visible) track('sos_opened');
  }, [visible]);

  const close = () => {
    onClose();
    // Reset after the slide-down so the user never sees the flip
    setTimeout(() => setView('menu'), 300);
  };

  return (
    // Opaque scrim (founder review 2026-07-10): the sheet is its own room —
    // the tab bar and dashboard must not read through it. draggable makes
    // the grab handle real: drag-down closes.
    <BottomSheet visible={visible} onClose={close} draggable scrimClass="bg-ground">
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
                    <ChevronRight size={18} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Normalization — the isolation is part of the spike, so the
                  counter-signal lives where the spike is. Real, hedged
                  epidemiology only ("most common sexual complaint" is
                  standard ISSM/urology literature; "most men meet it at
                  least once" is the defensible phrasing of lifetime
                  figures), NOT manufactured active-user telemetry —
                  fabricated social-proof counters are an FTC/App-Store
                  tripwire, ruling in .claude/ember-progress.md. Kept
                  number-free and PE-nonspecific in the closing beat: the
                  SOS user may be the ED or pure-anxiety profile, and a
                  minutes/percentage benchmark mid-spike invites the exact
                  comparison loop this sheet exists to interrupt. */}
              <Text className="text-faint text-xs leading-[18px] text-center px-3 pt-2 pb-1">
                Most men never say this out loud — yet early finishing is the most common
                sexual complaint men report, and most men meet it at least once. Whatever
                brought you here tonight, you are not an outlier.
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setView('menu')}
                activeOpacity={0.7}
                className="flex-row items-center gap-1 mb-2 self-start"
              >
                <ChevronLeft size={16} color="#6B7280" />
                <Text className="text-muted text-xs font-bold">Back</Text>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {view === 'breath' && <BreathingGuide />}
                {view === 'ground' && <GroundingGuide />}
                {view === 'defuse' && <DefusionLogForm onDone={close} />}
              </ScrollView>
            </>
          )}
        </View>
    </BottomSheet>
  );
}

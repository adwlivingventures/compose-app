import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
} from 'react-native';
import { ChevronRight, Trash2, CheckCircle2 } from 'lucide-react-native';
import { LocalStore } from '../../services/storage';
import { useProtocol } from '../../context/ProtocolContext';
import { useDefusionLog, FALLACY_META, DefusionEntry } from '../../hooks/useDefusionLog';
import { useSpikeLog, daysSince, SpikeEntry } from '../../hooks/useSpikeLog';
import {
  Distortion,
  DISTORTION_META,
  DISTORTION_ORDER,
  SPIKE_FLOW_COPY,
} from '../../content/restructure';
import { track } from '../../services/analytics';

/**
 * Restructure tab v2 — "Rewire" (founder review 2026-07-12).
 *
 * Spec correction at the core: §5 promises an IMMEDIATE, PRE-WRITTEN
 * reframe. v1 asked the user to author his own rational reframe — demanding
 * prefrontal work at the exact moment sympathetic activation has taken the
 * prefrontal offline. v2 asks him only to RECOGNIZE (tag the distortion);
 * the authored counter is delivered (§7 deterministic). Optional one-line
 * capture comes after, once down-regulated.
 *
 * Three instruments, one narrative:
 *  1. Daily Rewire — now a motor act: press-and-hold crosses out the old
 *     script (embodied defusion + commitment gesture; a tap is ignorable,
 *     a 1.2s hold is a decision), then the truth is read at a paced line.
 *  2. Spike flow — name it → counter it → close it with one long exhale
 *     (the vagal brake paired with the cognitive counter: every use ends
 *     calmer than it began, which is why he returns to it).
 *  3. Evidence Locker — history as an asset: loops closed, days quiet,
 *     the dominant pattern named (trait-level defusion: one known voice,
 *     not many problems).
 */

// ─── Legacy freeform entries (v1) — still displayed, never created ───────────

interface CBSTEntry {
  id: string;
  date: string;
  trigger: string;
  automaticThought: string;
  reframe: string;
}

const LEGACY_KEY = '@cbst_log_entries';

// ─── Root Screen ──────────────────────────────────────────────────────────────

export default function CBSTScreen() {
  return (
    <View className="flex-1 bg-ground">
      <View className="px-6 pt-14 pb-4 border-b border-line/60">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">COMPOSE</Text>
        <Text className="text-ink text-2xl font-serif-regular mt-0.5">Restructure</Text>
        <Text className="text-muted text-[11.5px] mt-1">
          Built on CBST — Cognitive Behavioral Sex Therapy.
        </Text>
      </View>
      <RewireBody />
    </View>
  );
}

// ─── Spike flow — name it, counter it, close it ───────────────────────────────

type SpikeStage = 'home' | 'name' | 'counter' | 'close' | 'closed';

function SpikeFlow({ onSaved }: { onSaved: (entry: SpikeEntry) => void }) {
  const { addEntry } = useSpikeLog();
  const [stage, setStage] = useState<SpikeStage>('home');
  const [chosen, setChosen] = useState<Distortion | null>(null);
  const [note, setNote] = useState('');
  const exhaleProgress = useRef(new Animated.Value(0)).current;

  const reset = () => {
    setStage('home');
    setChosen(null);
    setNote('');
    exhaleProgress.setValue(0);
  };

  // The exhale close: cognition + vagal brake, then save. The entry is
  // written AFTER the exhale so the flow's last beat is regulation, not
  // record-keeping.
  const closeLoop = () => {
    setStage('close');
    Animated.timing(exhaleProgress, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start(async ({ finished }) => {
      if (!finished || !chosen) return;
      const entry = await addEntry({
        distortion: chosen,
        note: note.trim() || undefined,
      });
      // Whitelisted tag only — never the note (§7).
      track('restructurer_used', { distortion: chosen });
      onSaved(entry);
      setStage('closed');
    });
  };

  if (stage === 'home') {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 mb-6">
        <TouchableOpacity
          onPress={() => setStage('name')}
          activeOpacity={0.85}
          className="bg-surface-deep border border-line rounded-xl py-3.5 items-center"
        >
          <Text className="text-ink font-semibold text-sm">{SPIKE_FLOW_COPY.cta}</Text>
        </TouchableOpacity>
        <Text className="text-dim text-[11.5px] text-center leading-4 mt-2.5">
          {SPIKE_FLOW_COPY.ctaSub}
        </Text>
      </View>
    );
  }

  if (stage === 'name') {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 mb-6">
        <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
          {SPIKE_FLOW_COPY.step1Title}
        </Text>
        <View className="flex-row flex-wrap -mx-1">
          {DISTORTION_ORDER.map((key) => (
            <View key={key} className="w-1/2 px-1 mb-2">
              <TouchableOpacity
                onPress={() => {
                  setChosen(key);
                  setStage('counter');
                }}
                activeOpacity={0.8}
                className="bg-surface-deep border border-line rounded-xl p-3 min-h-[86px]"
              >
                <Text className="text-ink text-[12.5px] font-bold">
                  {DISTORTION_META[key].label}
                </Text>
                <Text className="text-muted text-[10.5px] leading-4 mt-1">
                  {DISTORTION_META[key].definition}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={reset} activeOpacity={0.7} className="items-center py-2.5">
          <Text className="text-muted text-xs font-semibold">Never mind — I'm steady</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === 'counter' && chosen) {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 mb-6">
        <View className="self-start bg-surface-deep border border-accent/30 rounded-full px-3 py-1">
          <Text className="text-accent-soft text-[10px] font-bold uppercase tracking-wider">
            {DISTORTION_META[chosen].label}
          </Text>
        </View>
        <Text className="text-muted text-xs mt-4 mb-1.5 font-bold uppercase tracking-wider">
          {SPIKE_FLOW_COPY.counterLabel}
        </Text>
        <Text className="text-ink text-[15px] leading-6 font-serif-regular">
          {DISTORTION_META[chosen].counter}
        </Text>
        <Text className="text-dim text-[11px] mt-2">{SPIKE_FLOW_COPY.counterInstruction}</Text>

        <TextInput
          className="bg-surface-deep border border-line rounded-xl p-3.5 text-ink text-sm leading-5 mt-4"
          multiline
          textAlignVertical="top"
          placeholder={SPIKE_FLOW_COPY.captureaPlaceholder}
          placeholderTextColor="#4B5563"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity
          onPress={closeLoop}
          activeOpacity={0.85}
          className="bg-accent rounded-xl py-3.5 items-center mt-4"
        >
          <Text className="text-on-accent font-bold text-sm">{SPIKE_FLOW_COPY.closeCta}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStage('name')} activeOpacity={0.7} className="items-center py-2.5">
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === 'close') {
    return (
      <View className="bg-surface border border-line rounded-2xl p-5 mb-6 items-center">
        <Text className="text-ink text-[15px] font-serif-regular mt-2 text-center">
          {SPIKE_FLOW_COPY.exhaleCue}
        </Text>
        <Text className="text-muted text-xs mt-1.5">{SPIKE_FLOW_COPY.exhaleSub}</Text>
        <View className="h-[2px] w-full bg-line-soft rounded-full overflow-hidden mt-5 mb-2">
          <Animated.View
            style={{
              height: '100%',
              borderRadius: 9999,
              backgroundColor: '#C89B6D',
              width: exhaleProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      </View>
    );
  }

  // closed
  return (
    <View className="bg-accent/10 border border-accent/30 rounded-2xl p-5 mb-6 items-center">
      <CheckCircle2 color="#C89B6D" size={28} />
      <Text className="text-ink text-lg font-serif-regular mt-2">
        {SPIKE_FLOW_COPY.closedTitle}
      </Text>
      <Text className="text-muted text-sm text-center mt-1 leading-5">
        {SPIKE_FLOW_COPY.closedBody}
      </Text>
      <TouchableOpacity onPress={reset} activeOpacity={0.7} className="items-center py-2.5 mt-1">
        <Text className="text-accent text-xs font-bold">Done</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Body: rewire → spike tool → evidence locker ─────────────────────────────

type HistoryItem =
  | { kind: 'legacy'; id: string; entry: CBSTEntry }
  | { kind: 'defusion'; id: string; entry: DefusionEntry }
  | { kind: 'spike'; id: string; entry: SpikeEntry };

function RewireBody() {
  const [legacy, setLegacy] = useState<CBSTEntry[]>([]);
  const [loadingLegacy, setLoadingLegacy] = useState(true);
  const {
    entries: defusionEntries,
    deleteEntry: deleteDefusion,
    reload: reloadDefusion,
  } = useDefusionLog();
  const {
    entries: spikeEntries,
    deleteEntry: deleteSpike,
    reload: reloadSpikes,
  } = useSpikeLog();

  useFocusEffect(
    useCallback(() => {
      reloadDefusion();
      reloadSpikes();
    }, [reloadDefusion, reloadSpikes]),
  );

  useEffect(() => {
    LocalStore.getItem<CBSTEntry[]>(LEGACY_KEY).then((data) => {
      setLegacy(data ?? []);
      setLoadingLegacy(false);
    });
  }, []);

  const deleteLegacy = useCallback(
    async (id: string) => {
      const updated = legacy.filter((e) => e.id !== id);
      setLegacy(updated);
      await LocalStore.setItem(LEGACY_KEY, updated);
    },
    [legacy],
  );

  const confirmDelete = (id: string, kind: HistoryItem['kind']) => {
    Alert.alert('Delete Entry', 'Remove this log entry permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          kind === 'legacy' ? deleteLegacy(id) : kind === 'defusion' ? deleteDefusion(id) : deleteSpike(id),
      },
    ]);
  };

  // All three tools stamp id = Date.now().toString(); numeric id sorts the
  // merged timeline newest-first.
  const history: HistoryItem[] = [
    ...legacy.map((e): HistoryItem => ({ kind: 'legacy', id: e.id, entry: e })),
    ...defusionEntries.map((e): HistoryItem => ({ kind: 'defusion', id: e.id, entry: e })),
    ...spikeEntries.map((e): HistoryItem => ({ kind: 'spike', id: e.id, entry: e })),
  ].sort((a, b) => Number(b.id) - Number(a.id));

  // Evidence stats — the tab-local compact form (the Baseline tab carries
  // the full extinction curve).
  const loopsClosed = history.length;
  const quietDays = daysSince([
    ...spikeEntries.map((s) => s.date),
    ...defusionEntries.map((d) => d.date),
  ]);
  const counts = new Map<Distortion, number>();
  for (const s of spikeEntries) counts.set(s.distortion, (counts.get(s.distortion) ?? 0) + 1);
  for (const d of defusionEntries) counts.set(d.fallacy, (counts.get(d.fallacy) ?? 0) + 1);
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Daily Rewire moved into the session's own stages (founder ruling
            2026-07-15) — this tab is now purely incident work + history. */}
        <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
          When a thought spikes
        </Text>
        <SpikeFlow onSaved={() => reloadSpikes()} />

        {/* Evidence Locker */}
        <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
          The Evidence Locker
        </Text>

        {loopsClosed > 0 && (
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-surface border border-line rounded-2xl p-4">
              <Text className="text-ink text-2xl font-serif-light">{loopsClosed}</Text>
              <Text className="text-muted text-xs mt-0.5">
                {loopsClosed === 1 ? 'loop closed' : 'loops closed'}
              </Text>
            </View>
            {quietDays !== null && quietDays >= 1 && (
              <View className="flex-1 bg-surface border border-line rounded-2xl p-4">
                <Text className="text-ink text-2xl font-serif-light">{quietDays}</Text>
                <Text className="text-muted text-xs mt-0.5">
                  {quietDays === 1 ? 'day' : 'days'} since the last spike
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Trait-level defusion: fourteen spikes are not fourteen problems —
            they are one known, nameable voice he can now see coming. */}
        {dominant && dominant[1] >= 3 && loopsClosed >= 5 && (
          <View className="bg-surface-deep border border-line rounded-2xl px-4 py-3.5 mb-3">
            <Text className="text-body text-xs leading-5">
              {dominant[1]} of your {loopsClosed} loops are one known voice —{' '}
              <Text className="text-accent-soft font-serif-italic">
                {DISTORTION_META[dominant[0]].label.toLowerCase()}
              </Text>
              . One pattern, named. It arrives; you counter it; it leaves.
            </Text>
          </View>
        )}

        {loadingLegacy ? (
          <Text className="text-faint text-sm">Loading...</Text>
        ) : history.length === 0 ? (
          <View className="bg-surface border border-line rounded-2xl p-5 items-center">
            <Text className="text-muted text-sm text-center leading-5">
              Closed loops collect here — the record that the pattern is losing.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {history.map((item) =>
              item.kind === 'legacy' ? (
                <LegacyEntryCard
                  key={item.id}
                  entry={item.entry}
                  onDelete={() => confirmDelete(item.id, 'legacy')}
                />
              ) : item.kind === 'defusion' ? (
                <DefusionEntryCard
                  key={item.id}
                  entry={item.entry}
                  onDelete={() => confirmDelete(item.id, 'defusion')}
                />
              ) : (
                <SpikeEntryCard
                  key={item.id}
                  entry={item.entry}
                  onDelete={() => confirmDelete(item.id, 'spike')}
                />
              ),
            )}
          </View>
        )}

        <Text className="text-faint text-xs text-center mt-6 leading-4">
          Every word on this screen lives only on this device.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Entry cards ──────────────────────────────────────────────────────────────

function SpikeEntryCard({ entry, onDelete }: { entry: SpikeEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = DISTORTION_META[entry.distortion];
  const dateLabel = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View className="bg-surface border border-line rounded-2xl overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-muted text-xs font-mono">{dateLabel}</Text>
            <View className="bg-surface-deep rounded-full px-2 py-0.5">
              <Text className="text-accent/80 text-[10px] font-bold uppercase tracking-wider">
                {meta.label}
              </Text>
            </View>
          </View>
          <Text className="text-ink text-sm font-medium mt-0.5" numberOfLines={1}>
            {entry.note || meta.definition}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color="#4B5563" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#4B5563"
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 gap-3 border-t border-line">
          {entry.note ? <EntryField label="The thought, named" value={entry.note} /> : null}
          <EntryField label={`The counter — ${meta.label}`} value={meta.counter} highlight />
        </View>
      )}
    </View>
  );
}

function LegacyEntryCard({ entry, onDelete }: { entry: CBSTEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-surface border border-line rounded-2xl overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1">
          <Text className="text-muted text-xs font-mono">{entry.date}</Text>
          <Text className="text-ink text-sm font-medium mt-0.5" numberOfLines={1}>
            {entry.trigger}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color="#4B5563" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#4B5563"
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 gap-3 border-t border-line">
          <EntryField label="Trigger" value={entry.trigger} />
          <EntryField label="Automatic Thought" value={entry.automaticThought} />
          <EntryField label="Rational Reframe" value={entry.reframe} highlight />
        </View>
      )}
    </View>
  );
}

function DefusionEntryCard({
  entry,
  onDelete,
}: {
  entry: DefusionEntry;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = FALLACY_META[entry.fallacy];
  const dateLabel = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View className="bg-surface border border-line rounded-2xl overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-muted text-xs font-mono">{dateLabel}</Text>
            <View className="bg-surface-deep rounded-full px-2 py-0.5">
              <Text className="text-accent/80 text-[10px] font-bold uppercase tracking-wider">
                {meta.label}
              </Text>
            </View>
          </View>
          {/* Quick-flow SOS entries carry no somatic-reality text — the
              tapped claim is the headline. */}
          <Text className="text-ink text-sm font-medium mt-0.5" numberOfLines={1}>
            {entry.somaticReality || entry.spectatorClaim}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color="#4B5563" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#4B5563"
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 gap-3 border-t border-line">
          {entry.somaticReality ? (
            <EntryField label="Somatic Reality" value={entry.somaticReality} />
          ) : null}
          <EntryField label="The Spectator's Claim" value={entry.spectatorClaim} />
          <EntryField label={`Reframe — ${meta.label}`} value={meta.reframe} />
          {entry.ventralAnchor ? (
            <EntryField label="Your Anchor" value={entry.ventralAnchor} highlight />
          ) : null}
        </View>
      )}
    </View>
  );
}

function EntryField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="mt-3">
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className={`text-sm leading-5 ${highlight ? 'text-accent-soft' : 'text-body'}`}>
        {value}
      </Text>
    </View>
  );
}

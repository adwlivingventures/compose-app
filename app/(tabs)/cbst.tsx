import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
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
import {
  PRACTICES,
  SHELF_META,
  SHELF_ORDER,
  Practice,
  isOpen,
  openCount,
  resolveDoor,
} from '../../content/regulation';
import { track } from '../../services/analytics';
import TabContextBanner from '../../components/TabContextBanner';

/**
 * Steady tab v3 (founder ruling 2026-07-18; spec: docs/STEADY-TAB-SPEC.md).
 * Formerly "Restructure" — the route name stays `cbst` to avoid nav churn.
 *
 * The on-demand layer, in three levels:
 *  1. The router — "What do you need right now?" Four state doors, each
 *     opening exactly one thing (Hick's Law survives where it matters: at
 *     the moment of need). Spike door runs the Spike Flow in place; the
 *     other three push the highest-priority OPEN practice for that state.
 *  2. The Library — the full collection, visible from Day 1, sequenced by
 *     phase ("Opens Day N" + honest clinical reason, never "locked").
 *     Perceived wealth without decision load; the freedom layer for the
 *     regulated-and-curious state, one level below the anxious-state path.
 *  3. Evidence Locker — history as an asset: loops closed, days quiet,
 *     the dominant pattern named (trait-level defusion: one known voice,
 *     not many problems).
 *
 * Spike Flow spec note (v2, retained): §5 promises an IMMEDIATE,
 * PRE-WRITTEN reframe — the user only RECOGNIZES (tags the distortion);
 * the authored counter is delivered (§7 deterministic). Optional one-line
 * capture comes after, once down-regulated.
 *
 * Library rules (anti-derailment, invisible as rules): no autoplay, no
 * "up next"; practices end in stillness and return here; Library use casts
 * NO protocol votes — the Blueprint stays the sole identity-evidence source.
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
      {/* Header copy passes the stranger test (§6): the clinical framework
          names live in onboarding, where they convert — not on persistent
          chrome, where they expose. */}
      <View className="px-6 pt-14 pb-4 border-b border-line/60">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">COMPOSE</Text>
        <Text className="text-ink text-2xl font-serif-regular mt-0.5">Steady</Text>
        <Text className="text-muted text-[11.5px] mt-1">
          The work between sessions.
        </Text>
      </View>
      <TabContextBanner tab="steady" />
      <RewireBody />
    </View>
  );
}

// ─── The router — four state doors ───────────────────────────────────────────

function StateDoors({
  day,
  spikeOpen,
  onSpike,
}: {
  day: number;
  spikeOpen: boolean;
  onSpike: () => void;
}) {
  const openPractice = (door: 'settle' | 'drop_in' | 'release') => {
    const practice = resolveDoor(door, day);
    router.push({ pathname: '/practice', params: { id: practice.id } });
  };

  const doors: { key: string; label: string; sub: string; onPress: () => void; active?: boolean }[] = [
    {
      key: 'spike',
      label: 'A thought is spiking',
      sub: 'Name it, counter it, close it.',
      onPress: onSpike,
      active: spikeOpen,
    },
    {
      key: 'settle',
      label: 'Settle me fast',
      sub: 'The quickest breath you own.',
      onPress: () => openPractice('settle'),
    },
    {
      key: 'drop_in',
      label: 'Get me out of my head',
      sub: 'Attention, walked back into the body.',
      onPress: () => openPractice('drop_in'),
    },
    {
      key: 'release',
      label: 'Release the tension',
      sub: 'From the floor up.',
      onPress: () => openPractice('release'),
    },
  ];

  return (
    <>
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
        What do you need right now?
      </Text>
      <View className="flex-row flex-wrap -mx-1 mb-3">
        {doors.map((door) => (
          <View key={door.key} className="w-1/2 px-1 mb-2">
            <TouchableOpacity
              onPress={door.onPress}
              activeOpacity={0.8}
              // Deepwater ROLE: one quiet aqua element per door, max — here
              // it's the active-state border only; resting doors absorb.
              className={`rounded-2xl p-4 min-h-[96px] border ${
                door.active ? 'bg-surface border-accent/40' : 'bg-surface border-line'
              }`}
            >
              <Text className="text-ink text-[13.5px] font-bold leading-[18px]">
                {door.label}
              </Text>
              <Text className="text-muted text-[11px] leading-4 mt-1.5">{door.sub}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );
}

// ─── The Library — full collection, sequenced by phase ───────────────────────

/**
 * Tonight's suggestion (2026-08-03, build order 2.4) — one day-keyed row
 * above the Library. Sixteen of the 27 practices sit below the fold behind
 * four doors and a spike flow; without a served surface most are never
 * seen. One row converts the shelf into a rotation: impression content is
 * served, not browsed.
 *
 * Selection is DETERMINISTIC (§7): keyed to the protocol day, drawn only
 * from open, navigable practices, rotating shelves so each discipline
 * surfaces across the week. Same day → same suggestion, all day. Never a
 * carousel — one row, or the Library has leaked into the corridor.
 */
function suggestionForDay(day: number): Practice | null {
  const shelfOrder = SHELF_ORDER;
  for (let hop = 0; hop < shelfOrder.length; hop++) {
    const shelf = shelfOrder[(day - 1 + hop) % shelfOrder.length];
    const open = PRACTICES.filter((p) => p.shelf === shelf && p.kind !== 'tool' && isOpen(p, day));
    if (open.length === 0) continue; // a shelf with nothing open yet — hop on
    return open[Math.floor((day - 1) / shelfOrder.length) % open.length];
  }
  return null;
}

function LibraryShelves({ day }: { day: number }) {
  const { open, total } = openCount(day);
  const suggestion = suggestionForDay(day);

  const onOpenPractice = (practice: Practice) => {
    router.push({ pathname: '/practice', params: { id: practice.id } });
  };

  return (
    <View className="mt-3">
      {suggestion && (
        <View className="mb-5">
          <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-2">
            Tonight’s suggestion
          </Text>
          <TouchableOpacity
            onPress={() => onOpenPractice(suggestion)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Tonight's suggestion: ${suggestion.title}, ${suggestion.minutes} minutes`}
            className="bg-surface border border-line rounded-2xl px-4 py-3.5"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-ink text-[13.5px] font-semibold flex-1 pr-3">
                {suggestion.title}
              </Text>
              <Text className="text-dim text-[10.5px] font-semibold">
                {suggestion.minutes} min
              </Text>
            </View>
            <Text className="text-muted text-[11.5px] leading-4 mt-1">{suggestion.purpose}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-baseline justify-between mb-1">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          The Library
        </Text>
        <Text className="text-dim text-[10.5px] font-semibold tracking-[0.08em]">
          {open} of {total} open
        </Text>
      </View>
      {/* The frame line — does all the "don't abuse this" work, positively. */}
      <Text className="text-faint text-[11.5px] leading-4 mb-4">
        Your daily session is the training. These are the tools for the moments between.
      </Text>

      {SHELF_ORDER.map((shelf) => {
        const items = PRACTICES.filter((p) => p.shelf === shelf);
        return (
          <View key={shelf} className="mb-5">
            <View className="flex-row items-baseline gap-2 mb-2">
              <Text className="text-ink text-sm font-bold">{SHELF_META[shelf].title}</Text>
              <Text className="text-dim text-[10.5px]">{SHELF_META[shelf].sub}</Text>
            </View>
            <View className="bg-surface border border-line rounded-2xl overflow-hidden">
              {items.map((p, i) => {
                const openNow = isOpen(p, day);
                // The Spike Flow lives on this tab — its row is a no-op
                // pointer to the door above rather than a navigation.
                const isTool = p.kind === 'tool';
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => (openNow && !isTool ? onOpenPractice(p) : undefined)}
                    disabled={!openNow || isTool}
                    activeOpacity={0.8}
                    className={`px-4 py-3.5 ${i > 0 ? 'border-t border-line-soft' : ''}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-[13.5px] font-semibold flex-1 pr-3 ${
                          openNow ? 'text-ink' : 'text-muted'
                        }`}
                      >
                        {p.title}
                      </Text>
                      {openNow ? (
                        <Text className="text-dim text-[10.5px] font-semibold">
                          {isTool ? 'above' : `${p.minutes} min`}
                        </Text>
                      ) : (
                        // Deepwater ROLE: sequencing is identity pacing, not a
                        // lock — muted "Opens", muted day-number, no lock icon
                        // (accent unification 2026-07-25: one accent only).
                        <Text className="text-muted text-[10.5px] font-semibold">
                          Opens <Text className="text-muted">Day {p.opensOnDay}</Text>
                        </Text>
                      )}
                    </View>
                    <Text
                      className={`text-[11.5px] leading-4 mt-1 ${
                        openNow ? 'text-muted' : 'text-faint'
                      }`}
                    >
                      {openNow ? p.purpose : p.sequencedReason ?? p.purpose}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Spike flow — name it, counter it, close it ───────────────────────────────

type SpikeStage = 'home' | 'name' | 'counter' | 'close' | 'closed';

function SpikeFlow({
  onSaved,
  initialStage = 'home',
  onExit,
}: {
  onSaved: (entry: SpikeEntry) => void;
  /** 'name' when opened from a router door — the door tap IS the CTA. */
  initialStage?: SpikeStage;
  /** When set, leaving the flow closes it (the parent unmounts) instead of
   *  falling back to the standalone CTA card. */
  onExit?: () => void;
}) {
  const { addEntry } = useSpikeLog();
  const [stage, setStage] = useState<SpikeStage>(initialStage);
  const [chosen, setChosen] = useState<Distortion | null>(null);
  const [note, setNote] = useState('');
  const exhaleProgress = useRef(new Animated.Value(0)).current;

  const reset = () => {
    if (onExit) {
      onExit();
      return;
    }
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
        {/* Deepwater grammar: eyebrows are muted — aqua here is saved for
            the close CTA, the flow's one true next action. */}
        <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
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
        {/* Deepwater ROLE: the named distortion is a functional tag, not an
            action or identity — it absorbs (matte chip). */}
        <View className="self-start bg-surface-deep border border-line rounded-full px-3 py-1">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
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
          placeholderTextColor="#53626E"
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
              // Deepwater ROLE: the exhale bar is a progress fill → aqua.
              backgroundColor: '#5FD4C1',
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
    // Deepwater ROLE: a closed loop is earned progress → aqua tint + check.
    <View className="bg-accent/10 border border-accent/30 rounded-2xl p-5 mb-6 items-center">
      <CheckCircle2 color="#5FD4C1" size={28} />
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
  const { activeDay } = useProtocol();
  const [spikeOpen, setSpikeOpen] = useState(false);
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
        {/* Level 1 — the router. Four state doors; the default path. */}
        <StateDoors
          day={activeDay}
          spikeOpen={spikeOpen}
          onSpike={() => setSpikeOpen((v) => !v)}
        />
        {spikeOpen && (
          <SpikeFlow
            initialStage="name"
            onSaved={() => reloadSpikes()}
            onExit={() => setSpikeOpen(false)}
          />
        )}

        {/* Level 2 — the Library. The freedom layer, one level down. */}
        <LibraryShelves day={activeDay} />

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
              {/* Deepwater ROLE: the named voice is an identity line (serif
                  italic) → ink (accent unification 2026-07-25). */}
              <Text className="text-ink font-serif-italic">
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
              {/* Deepwater ROLE: history tags absorb — no accent on records. */}
              <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
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
            <Trash2 size={16} color="#53626E" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#53626E"
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
            <Trash2 size={16} color="#53626E" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#53626E"
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
              {/* Deepwater ROLE: history tags absorb — no accent on records. */}
              <Text className="text-muted text-[10px] font-bold uppercase tracking-wider">
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
            <Trash2 size={16} color="#53626E" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#53626E"
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
      {/* Deepwater ROLE: the authored counter is content, not action —
          highlight lifts to ink, never accent. */}
      <Text className={`text-sm leading-5 ${highlight ? 'text-ink' : 'text-body'}`}>
        {value}
      </Text>
    </View>
  );
}

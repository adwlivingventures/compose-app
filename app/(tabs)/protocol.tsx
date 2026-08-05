import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getPhaseForDay, localDateString, useProtocol } from '../../context/ProtocolContext';
import BottomSheet from '../../components/BottomSheet';
import TabContextBanner from '../../components/TabContextBanner';

/**
 * The Protocol tab — The Somatic 75 map (Deepwater build phase 1;
 * spec: claude/DEEPWATER-FLOW-MAP.md §4C, concept 02).
 *
 * Chunking is the navigation fix: nobody runs 75 days — he runs 25, three
 * times. The active phase carries a 25-dot grid with today findable at a
 * glance; future phases are visible but quiet ("Opens Day N" — honest
 * sequencing, never "locked"; the Steady-tab vocabulary rule applies here
 * too). Accent unification (founder ruling 2026-07-25): the aqua current is
 * the only accent here — no ember on this screen.
 *
 * Replay (2026-07-25): completed dots are pressable and re-open that day's
 * session in read-only replay mode (app/session.tsx `replay=1`) — the man
 * can re-hear any anchor he has already earned without touching protocol
 * state. A quiet "Revisit a day" row under the active phase card surfaces
 * the last three completed days as pills.
 */

const PHASES = [
  {
    number: 1 as const,
    days: [1, 25] as const,
    title: 'Autonomic Reset',
    goal: 'Down-regulate the alarm response and break the intimacy→anxiety link.',
  },
  {
    number: 2 as const,
    days: [26, 50] as const,
    title: 'Exposure & Mastery',
    goal: 'Build tolerance to high arousal without losing present-moment control.',
  },
  {
    number: 3 as const,
    days: [51, 75] as const,
    title: 'Identity Consolidation',
    goal: 'Anchor the shift so it is self-sustaining — this is who you are now.',
  },
];

/**
 * Phase detail sheets (2026-08-03, build order 3.2 — DEEPWATER-FLOW-MAP §4
 * C2, previously specified and unbuilt). Tap a phase card → one bottom
 * sheet, one screen deep, never a rabbit hole. Three blocks per phase: the
 * mechanism in plain language, what opens, and what "done" means — stated
 * as capability, never a performance bar (the dartboard rule). This is the
 * natural home of future-pacing: the man on Day 18 reading what Phase 2
 * will ask of him is rehearsing continuation, the cheapest retention
 * content there is. Locked phases show the same sheet — sequencing is
 * pacing, not a lock, so the door is glass.
 */
const PHASE_DETAILS: Record<
  1 | 2 | 3,
  { mechanism: string; opens: string; done: string }
> = {
  1: {
    mechanism:
      'The long exhale engages the vagal brake; the floor learns to drop instead of clench. Twenty-five days of that pairing teach the alarm that intimacy is not a threat — by repetition, never by argument.',
    opens:
      'The Breath shelf and the grounding practices from Day 1. The Pelvic Drop long practice, the down-training stretches, and the Jaw Release open across the first two weeks — and Day 14 brings the first re-measure: your first before and after.',
    done:
      'Done looks like: the drop is familiar ground, the daily reps run without negotiation, and the Day-14 reading is measured, not imagined.',
  },
  2: {
    mechanism:
      'Exposure — staying present as intensity rises. The held drops in the conditioning track train openness under sustained charge, which is the somatic skeleton of control. Attention practiced on sensation starves the spectator of its audience.',
    opens:
      'The Somatic Sandbox opens Day 26, with the deeper attention work — the Deep Drop, Noting, Mindful Touch, Pendulation, Leaves on a Stream — that needs Phase 1’s floor underneath it. The Day-40 re-measure lands mid-phase.',
    done:
      'Done looks like: charge without bracing, the pause used as a tool, and presence that stays in the moment instead of stepping out to watch it.',
  },
  3: {
    mechanism:
      'Consolidation — the skills stop being techniques and start being how you operate. The cues fade from the conditioning track on purpose, because intimacy has none; the identity language arrives now because fifty days of evidence have earned it.',
    opens:
      'Identity Rehearsal and the Evening Evidence Review open Day 51 — the most identity-focused practices in the Library. Day 75 closes the record, and graduation opens the Mastery Suite. Included.',
    done:
      'Done looks like: a baseline you keep, not a program you follow. The word becomes the baseline.',
  },
};

function DotGrid({ start, end, activeDay, completedToday, onReplay }: {
  start: number;
  end: number;
  activeDay: number;
  completedToday: boolean;
  /** Opens a completed day in read-only replay (session `replay=1`). */
  onReplay: (day: number) => void;
}) {
  const days: number[] = [];
  for (let d = start; d <= end; d++) days.push(d);
  return (
    <View className="flex-row flex-wrap mt-3.5" style={{ gap: 7 }}>
      {days.map((d) => {
        const done = d < activeDay || (d === activeDay && completedToday);
        const isToday = d === activeDay && !completedToday;
        const dot = (
          <View
            className={
              done
                ? 'w-2 h-2 rounded-full bg-accent opacity-80'
                : isToday
                  ? 'w-2 h-2 rounded-full border border-accent'
                  : 'w-2 h-2 rounded-full bg-line-soft'
            }
            style={
              isToday
                ? { shadowColor: '#5FD4C1', shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 }
                : undefined
            }
          />
        );
        // Only days strictly behind the active day replay — the same guard
        // the session enforces (replay never touches protocol state).
        if (d < activeDay) {
          return (
            <TouchableOpacity
              key={d}
              onPress={() => onReplay(d)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              accessibilityRole="button"
              accessibilityLabel={`Replay Day ${d}`}
            >
              {dot}
            </TouchableOpacity>
          );
        }
        return <View key={d}>{dot}</View>;
      })}
    </View>
  );
}

function SegmentBar({ activeDay }: { activeDay: number }) {
  return (
    <View className="flex-row mt-4" style={{ gap: 3 }}>
      {PHASES.map((p) => {
        const [start, end] = p.days;
        const span = end - start + 1;
        const done = Math.min(Math.max(activeDay - start, 0), span);
        const pct = (done / span) * 100;
        return (
          <View key={p.number} className="flex-1 h-1 rounded-sm bg-line-soft overflow-hidden">
            {pct > 0 && (
              <View className="h-1 rounded-sm bg-accent" style={{ width: `${pct}%` }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function ProtocolScreen() {
  const router = useRouter();
  const { activeDay, lastCompletedDate } = useProtocol();
  const completedToday = lastCompletedDate === localDateString();
  const phase = getPhaseForDay(activeDay);
  const daysDone = completedToday ? activeDay : activeDay - 1;
  const [detailPhase, setDetailPhase] = useState<1 | 2 | 3 | null>(null);

  const openReplay = (day: number) =>
    router.push({ pathname: '/session', params: { day: String(day), replay: '1' } });

  // The last three completed days, most recent first — replayable days are
  // strictly behind activeDay (the session's own replay guard).
  const revisitDays: number[] = [];
  for (let d = activeDay - 1; d >= 1 && revisitDays.length < 3; d--) revisitDays.push(d);

  return (
    <View className="flex-1 bg-ground">
    <TabContextBanner tab="protocol" />
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 72, paddingBottom: 120 }}
    >
      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        The Protocol
      </Text>
      <Text className="text-ink text-[27px] font-serif-regular mt-1.5">The Somatic 75</Text>
      <Text className="text-body text-[13px] mt-1">
        {daysDone} of 75 days{daysDone > 0 ? ' · in motion' : ' · begins today'}
      </Text>

      <SegmentBar activeDay={activeDay} />

      {PHASES.map((p) => {
        const [start, end] = p.days;
        const isActive = phase.number === p.number;
        const isPast = activeDay > end;
        if (isActive || isPast) {
          return (
            <React.Fragment key={p.number}>
              {/* Card taps open the phase detail sheet (build order 3.2);
                  the dot grid's own taps still win for replay. */}
              <TouchableOpacity
                onPress={() => setDetailPhase(p.number)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Phase ${p.number}, ${p.title} — open details`}
                className={`mt-4 rounded-2xl border px-4 py-4 ${
                  isActive ? 'bg-surface border-accent/25' : 'bg-surface-deep border-line-soft'
                }`}
              >
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Phase {p.number} · Days {start}–{end}
                  </Text>
                  <Text className="text-accent text-[10px] font-semibold uppercase tracking-[0.14em]">
                    {isPast ? 'Complete' : 'In progress'}
                  </Text>
                </View>
                <Text className="text-ink text-[17px] font-serif-regular mt-1.5">{p.title}</Text>
                <Text className="text-body text-[12px] leading-4.5 mt-1">{p.goal}</Text>
                <DotGrid
                  start={start}
                  end={end}
                  activeDay={activeDay}
                  completedToday={completedToday}
                  onReplay={openReplay}
                />
                {/* Replay discovery (build order 3.2): the feature existed
                    with no signpost — one quiet line is all it needs. */}
                {isActive && activeDay > start && (
                  <Text className="text-faint text-[10.5px] mt-2.5">
                    Tap any completed day to revisit it.
                  </Text>
                )}
              </TouchableOpacity>
              {/* Revisit a day — quiet replay access (no accent: replay is
                  never the next step, it is the record staying open). */}
              {isActive && revisitDays.length > 0 && (
                <View className="mt-2.5 bg-surface border border-line-soft rounded-2xl px-4 py-3 flex-row items-center">
                  <Text className="text-muted text-[11px] font-semibold flex-1">
                    Revisit a day
                  </Text>
                  <View className="flex-row" style={{ gap: 8 }}>
                    {revisitDays.map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => openReplay(d)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Replay Day ${d}`}
                        className="bg-surface-deep border border-line-soft rounded-full px-3 py-[5px]"
                      >
                        <Text className="text-muted text-[11px] font-semibold">Day {d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </React.Fragment>
          );
        }
        return (
          <TouchableOpacity
            key={p.number}
            onPress={() => setDetailPhase(p.number)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Phase ${p.number}, ${p.title} — opens Day ${start}. Open details.`}
            className="mt-4 rounded-2xl border border-line-soft bg-surface-deep px-4 py-3.5 opacity-60"
          >
            <View className="flex-row justify-between items-baseline">
              <Text className="text-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
                Phase {p.number} · Days {start}–{end}
              </Text>
              <Text className="text-faint text-[10px] uppercase tracking-[0.14em]">
                Opens Day {start}
              </Text>
            </View>
            <Text className="text-body text-[16px] font-serif-regular mt-1">{p.title}</Text>
          </TouchableOpacity>
        );
      })}

      {activeDay < 14 && (
        <View
          className="mt-4 rounded-2xl px-4 py-3.5 flex-row items-center border-line-soft bg-surface-deep"
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            gap: 10,
          }}
        >
          <Text className="text-muted text-[11px] font-semibold tracking-[0.06em]">DAY 14</Text>
          <Text className="text-body text-[12px] flex-1">
            Composure re-measure — your first before/after. Measured, not promised.
          </Text>
        </View>
      )}
    </ScrollView>

    {/* Phase detail sheet (build order 3.2) — one screen deep, dismissible,
        no accent spend: reading about a phase is never the next action. */}
    <BottomSheet
      visible={detailPhase !== null}
      onClose={() => setDetailPhase(null)}
      draggable
      scrimClass="bg-ground"
    >
      {detailPhase !== null && (
        <View className="bg-tab border-t border-line-soft rounded-t-3xl px-6 pt-5 pb-12">
          <View className="w-10 h-1 bg-line rounded-full self-center mb-5" />
          <Text className="text-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
            Phase {detailPhase} · Days {PHASES[detailPhase - 1].days[0]}–
            {PHASES[detailPhase - 1].days[1]}
          </Text>
          <Text className="text-ink text-[22px] font-serif-regular mt-1.5">
            {PHASES[detailPhase - 1].title}
          </Text>

          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.16em] mt-5 mb-1.5">
            The work
          </Text>
          <Text className="text-body text-[13px] leading-5">
            {PHASE_DETAILS[detailPhase].mechanism}
          </Text>

          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.16em] mt-5 mb-1.5">
            What opens
          </Text>
          <Text className="text-body text-[13px] leading-5">
            {PHASE_DETAILS[detailPhase].opens}
          </Text>

          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.16em] mt-5 mb-1.5">
            What done means
          </Text>
          <Text className="text-body text-[13px] leading-5">
            {PHASE_DETAILS[detailPhase].done}
          </Text>
        </View>
      )}
    </BottomSheet>
    </View>
  );
}

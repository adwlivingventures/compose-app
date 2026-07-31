import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getPhaseForDay, localDateString, useProtocol } from '../../context/ProtocolContext';

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

  const openReplay = (day: number) =>
    router.push({ pathname: '/session', params: { day: String(day), replay: '1' } });

  // The last three completed days, most recent first — replayable days are
  // strictly behind activeDay (the session's own replay guard).
  const revisitDays: number[] = [];
  for (let d = activeDay - 1; d >= 1 && revisitDays.length < 3; d--) revisitDays.push(d);

  return (
    <ScrollView
      className="flex-1 bg-ground"
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
              <View
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
              </View>
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
          <View
            key={p.number}
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
          </View>
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
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check, Play } from 'lucide-react-native';
import { useProtocol, localDateString } from '../context/ProtocolContext';
import { getProtocolDay } from '../content/ProtocolData';
import { getTonightLine } from '../content/tonightLines';
import TriageCenter from './TriageCenter';

/**
 * Today dashboard — E08 (session pending) and E13 (completed) states.
 *
 * E13 deliberately offers no next action: the completed state is closure,
 * not a hook. The only interactive element after completion is the
 * Steady-me pill, because anxiety doesn't check whether today's session
 * is done.
 */

const PHASE_NUMERALS = ['I', 'II', 'III'];

// ─── Progress Ring (250px, 6px stroke per E08) ────────────────────────────────

const RING_SIZE = 250;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ day, completedToday }: { day: number; completedToday: boolean }) {
  // Count today's session in the ring the moment it's done — the visible jump
  // in the arc is the completion reward.
  const daysDone = Math.min(day - 1 + (completedToday ? 1 : 0), 75);
  const progress = daysDone / 75;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#221F1B"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#C89B6D"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        {completedToday ? (
          <>
            <Check color="#C89B6D" size={26} style={{ marginBottom: 6 }} />
            <Text className="text-ink text-[56px] font-serif-light leading-[60px]">{day}</Text>
            <Text className="text-faint text-[13px] mt-0.5">
              {day === 1 ? 'day composed' : 'days composed'}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.24em]">
              Day
            </Text>
            <Text className="text-ink text-[64px] font-serif-light leading-[68px]">{day}</Text>
            <Text className="text-faint text-[13px]">of seventy-five</Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MainDashboard({ onStartSession }: { onStartSession: () => void }) {
  const { activeDay, streak, lastCompletedDate } = useProtocol();
  const [sosVisible, setSosVisible] = useState(false);

  const completedToday = lastCompletedDate === localDateString();
  // After today's completion the ring should show the day just finished,
  // not tomorrow's number — activeDay has already advanced.
  const displayDay = completedToday ? Math.max(activeDay - 1, 1) : activeDay;
  const todayMeta = getProtocolDay(displayDay);
  const focusLine = todayMeta.focus.replace(/\.$/, '');

  return (
    <View className="flex-1 bg-ground px-7 pt-[76px]">
      {/* Header: wordmark + the Steady-me pill (§6 — SOS one tap away,
          identical in both states) */}
      <View className="flex-row items-center justify-between">
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Compose
        </Text>
        <TouchableOpacity
          onPress={() => setSosVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Steady me — open calming support right now"
          className="flex-row items-center gap-1.5 bg-surface border border-line rounded-full px-3.5 py-[7px]"
        >
          <View className="w-1.5 h-1.5 rounded-full bg-accent" />
          <Text className="text-body text-xs font-semibold">Steady me</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center">
        <ProgressRing day={displayDay} completedToday={completedToday} />

        {completedToday ? (
          <>
            <Text className="text-ink text-xl font-serif-regular mt-7">Today is complete.</Text>
            <Text className="text-muted text-[13.5px] text-center leading-5 mt-2">
              Day {Math.min(displayDay + 1, 75)} unlocks at midnight.{'\n'}Rest is part of the
              work.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-accent text-[11px] font-bold uppercase tracking-[0.22em] mt-7">
              Phase {PHASE_NUMERALS[todayMeta.phase - 1]} · {todayMeta.phaseTitle}
            </Text>
            <Text className="text-ink text-[22px] font-serif-regular mt-1.5 text-center">
              {todayMeta.title}
            </Text>
            <Text className="text-muted text-[13px] mt-1.5 text-center leading-5">
              {focusLine}
            </Text>
          </>
        )}
      </View>

      <View className="pb-5">
        {completedToday ? (
          /* Tonight's line — the day's authored identity line read back as a
             quote (content/tonightLines.ts), focus string as the fallback.
             Closure, no next-action pressure. */
          <View className="bg-surface border border-line rounded-2xl px-[18px] py-4">
            <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
              Tonight's line
            </Text>
            <Text className="text-body text-sm leading-[22px] font-serif-italic mt-1.5">
              "{getTonightLine(displayDay) ?? todayMeta.focus}"
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={onStartSession}
              activeOpacity={0.85}
              className="bg-accent rounded-2xl py-[19px] items-center flex-row justify-center gap-2.5"
            >
              <Play color="#171310" size={16} fill="#171310" />
              <Text className="text-on-accent font-bold text-base">Begin today's session</Text>
            </TouchableOpacity>
            {streak > 1 && (
              <Text className="text-faint text-xs text-center mt-3">
                {streak} consecutive days · rest is part of the work
              </Text>
            )}
          </>
        )}
      </View>

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

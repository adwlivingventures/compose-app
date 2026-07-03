import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CheckCircle2, LifeBuoy, Play } from 'lucide-react-native';
import { useProtocol, localDateString } from '../context/ProtocolContext';
import { getProtocolDay } from '../content/ProtocolData';
import TriageCenter from './TriageCenter';

// ─── Progress Ring ────────────────────────────────────────────────────────────

const RING_SIZE = 240;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ day, completedToday }: { day: number; completedToday: boolean }) {
  const meta = getProtocolDay(day);
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
          stroke="#201D19"
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
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">Day</Text>
        <Text className="text-ink text-6xl font-serif-light">{day}</Text>
        <Text className="text-muted text-sm">of 75</Text>
        <Text className="text-accent/80 text-xs font-bold uppercase tracking-widest mt-2">
          Phase {meta.phase} · {meta.phaseTitle}
        </Text>
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

  return (
    <View className="flex-1 bg-ground">
      <View className="flex-1 items-center px-6 pt-20">
        <ProgressRing day={displayDay} completedToday={completedToday} />

        {streak > 1 && (
          <Text className="text-muted text-xs mt-4">
            {streak} consecutive days
          </Text>
        )}

        {/* Today's anchor — the manifest title tells him what today is about
            before he commits, without adding a single decision */}
        <View className="items-center mt-6">
          <Text className="text-faint text-[10px] font-bold uppercase tracking-[0.25em]">
            Today's Anchor
          </Text>
          <Text className="text-ink text-xl font-serif-regular mt-1 text-center">
            {todayMeta.title}
          </Text>
        </View>

        {/* The single primary action — no library, no choices */}
        <View className="w-full mt-10">
          {completedToday ? (
            <View className="bg-surface border border-line rounded-2xl py-5 items-center">
              <CheckCircle2 color="#C89B6D" size={26} />
              <Text className="text-ink font-serif-regular text-lg mt-2">Today Is Complete</Text>
              <Text className="text-muted text-xs mt-1">
                Day {Math.min(displayDay + 1, 75)} unlocks at midnight. Rest is part of the work.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onStartSession}
              activeOpacity={0.85}
              className="bg-accent rounded-2xl py-5 items-center flex-row justify-center gap-2.5"
            >
              <Play color="#171310" size={20} fill="#171310" />
              <Text className="text-on-accent font-bold text-lg">
                Listen to Today’s Anchor
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Persistent SOS — always one thumb-tap away, floating above the tab bar */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={() => setSosVisible(true)}
          activeOpacity={0.85}
          className="bg-surface border border-line rounded-2xl py-4 items-center flex-row justify-center gap-2"
        >
          <LifeBuoy color="#B9B2A6" size={18} />
          <Text className="text-body font-bold text-sm">Steady Me — Right Now</Text>
        </TouchableOpacity>
      </View>

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

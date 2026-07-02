import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CheckCircle2, LifeBuoy, Play } from 'lucide-react-native';
import {
  useProtocol,
  getPhaseForDay,
  localDateString,
} from '../context/ProtocolContext';
import TriageCenter from './TriageCenter';

// ─── Progress Ring ────────────────────────────────────────────────────────────

const RING_SIZE = 240;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ day, completedToday }: { day: number; completedToday: boolean }) {
  const phase = getPhaseForDay(day);
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
          stroke="#1e293b"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#34d399"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">Day</Text>
        <Text className="text-white text-6xl font-bold">{day}</Text>
        <Text className="text-slate-500 text-sm">of 75</Text>
        <Text className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mt-2">
          Phase {phase.number} · {phase.title}
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

  return (
    <View className="flex-1 bg-slate-950">
      <View className="flex-1 items-center px-6 pt-20">
        <ProgressRing day={displayDay} completedToday={completedToday} />

        {streak > 1 && (
          <Text className="text-slate-500 text-xs mt-4">
            {streak} consecutive days
          </Text>
        )}

        {/* The single primary action — no library, no choices */}
        <View className="w-full mt-10">
          {completedToday ? (
            <View className="bg-slate-900 border border-slate-800 rounded-2xl py-5 items-center">
              <CheckCircle2 color="#34d399" size={26} />
              <Text className="text-white font-bold text-base mt-2">Today Is Complete</Text>
              <Text className="text-slate-500 text-xs mt-1">
                Day {Math.min(displayDay + 1, 75)} unlocks at midnight. Rest is part of the work.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onStartSession}
              activeOpacity={0.85}
              className="bg-emerald-500 rounded-2xl py-5 items-center flex-row justify-center gap-2.5 shadow-lg shadow-emerald-500/20"
            >
              <Play color="#020617" size={20} fill="#020617" />
              <Text className="text-slate-950 font-bold text-lg">
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
          className="bg-slate-900 border border-slate-700 rounded-2xl py-4 items-center flex-row justify-center gap-2"
        >
          <LifeBuoy color="#94a3b8" size={18} />
          <Text className="text-slate-300 font-bold text-sm">Steady Me — Right Now</Text>
        </TouchableOpacity>
      </View>

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

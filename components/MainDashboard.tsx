import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CheckCircle2, ChevronRight, LifeBuoy, Play } from 'lucide-react-native';
import {
  useProtocol,
  getPhaseForDay,
  localDateString,
} from '../context/ProtocolContext';

// ─── SOS Triage Content (deterministic, versioned — never runtime-generated) ──
//
// Each protocol targets a distinct autonomic state, so the copy and mechanics
// differ deliberately:
//  - Pre-intimacy panic = anticipatory sympathetic spike → extended-exhale
//    breathing (exhale longer than inhale engages the vagal brake).
//  - Mid-encounter spectatoring = attention hijacked by self-evaluation →
//    sensory re-anchoring (attention on raw sensation starves the evaluative loop).
//  - Post-falter shame = dorsal shutdown / rumination → cognitive defusion and
//    a repair action (movement toward connection counters withdrawal).

interface TriageProtocol {
  id: string;
  title: string;
  situation: string;
  steps: string[];
}

const TRIAGE_PROTOCOLS: TriageProtocol[] = [
  {
    id: 'pre',
    title: 'Before Intimacy — Rising Pressure',
    situation: 'Your chest is tight and your mind is racing ahead to what might go wrong.',
    steps: [
      'Sit or stand still. Drop your shoulders away from your ears.',
      'Inhale through your nose for a count of 4.',
      'Exhale slowly through pursed lips for a count of 8 — longer out than in.',
      'Repeat 5 times. The extended exhale signals your nervous system that there is no emergency.',
      'Notice one point where your body contacts the ground or furniture. Stay with that weight.',
    ],
  },
  {
    id: 'mid',
    title: 'During — Watching Yourself',
    situation: 'You’ve stepped outside the moment and started evaluating your own performance.',
    steps: [
      'You don’t need to leave or explain. Simply slow down.',
      'Bring your full attention to one point of physical contact — warmth, pressure, texture.',
      'Name the raw sensation silently: warm, soft, steady. Sensation, not judgment.',
      'Let your breath drop low into your belly. One slow exhale.',
      'Attention on sensation and attention on self-evaluation cannot run at the same time. Choose sensation, as many times as it takes.',
    ],
  },
  {
    id: 'post',
    title: 'Afterward — The Shame Spiral',
    situation: 'Something didn’t go the way you wanted, and the self-critical replay has started.',
    steps: [
      'Notice the thought and label it: “I’m having the thought that I failed.” A thought — not a fact.',
      'One difficult moment is a data point, not an identity. Bodies fluctuate; that is physiology, not verdict.',
      'Unclench your jaw and hands. Take three slow exhales.',
      'If a partner is present, move toward connection, not away: a hand, a word, staying close.',
      'This moment is part of the retraining, not evidence against it. You are on the program for exactly this.',
    ],
  },
];

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

// ─── SOS Bottom Sheet ─────────────────────────────────────────────────────────

function SOSSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Dim backdrop — tap anywhere above the sheet to dismiss */}
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl px-6 pt-5 pb-10 max-h-[80%]">
        <View className="w-10 h-1 bg-slate-700 rounded-full self-center mb-5" />
        <Text className="text-white text-lg font-bold">Steady. You’re in the right place.</Text>
        <Text className="text-slate-500 text-sm mt-1 mb-4 leading-5">
          Pick the moment you’re in. Each sequence takes under two minutes.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-3 pb-4">
            {TRIAGE_PROTOCOLS.map((p) => {
              const open = openId === p.id;
              return (
                <View
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <TouchableOpacity
                    onPress={() => setOpenId(open ? null : p.id)}
                    activeOpacity={0.8}
                    className="p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-sm font-bold flex-1 pr-3">{p.title}</Text>
                      <ChevronRight
                        size={18}
                        color="#64748b"
                        style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
                      />
                    </View>
                    <Text className="text-slate-500 text-xs mt-1 leading-4">{p.situation}</Text>
                  </TouchableOpacity>

                  {open && (
                    <View className="px-4 pb-4 border-t border-slate-800">
                      {p.steps.map((step, i) => (
                        <View key={i} className="flex-row gap-3 mt-3">
                          <Text className="text-emerald-400 text-xs font-bold mt-0.5">{i + 1}</Text>
                          <Text className="text-slate-300 text-sm leading-5 flex-1">{step}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
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

      <SOSSheet visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

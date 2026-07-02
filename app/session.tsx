import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X, LifeBuoy } from 'lucide-react-native';
import { useProtocol, getPhaseForDay } from '../context/ProtocolContext';
import { getAnchorForDay } from '../content/anchors';
import AudioPlayer from '../components/AudioPlayer';
import TriageCenter from '../components/TriageCenter';

/**
 * Daily Session — the Auditory Anchor.
 *
 * Completion is driven by the audio finishing, not by a button: the habit
 * loop's reward (the progress ring advancing) is only dispensed for the real
 * behavior. The conditioning track and vitality checklist will extend this
 * flow in later milestones.
 */
export default function SessionScreen() {
  const router = useRouter();
  const { activeDay, markDayComplete } = useProtocol();
  // Pin the day at mount — if completion advances activeDay while this screen
  // is still up, the UI shouldn't flicker to tomorrow's number.
  const dayRef = useRef(activeDay);
  const [finishing, setFinishing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);

  const day = dayRef.current;
  const phase = getPhaseForDay(day);
  const anchor = getAnchorForDay(day);

  const handleComplete = async () => {
    if (finishing) return;
    setFinishing(true);
    await markDayComplete(day, {
      completed: true,
      pelvicRating: 0,
      habits: { presence: false, focus: false, vitality: false },
    });
    // Land back on the dashboard so the ring's advance is the closing image.
    router.back();
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="self-end bg-slate-900 border border-slate-800 rounded-full p-2.5"
      >
        <X color="#64748b" size={18} />
      </TouchableOpacity>

      <View className="items-center mt-6">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Day {day} · Phase {phase.number} — {phase.title}
        </Text>
        <Text className="text-slate-500 text-sm text-center mt-3 leading-5 px-4">
          Find a quiet place. Sit or lie down. You can lock your screen — the audio will
          continue.
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <AudioPlayer title={anchor.title} source={anchor.source} onComplete={handleComplete} />
      </View>

      {/* SOS — reachable mid-session too (§6: one tap from anywhere) */}
      <TouchableOpacity
        onPress={() => setSosVisible(true)}
        activeOpacity={0.85}
        className="bg-slate-900 border border-slate-700 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 mb-6"
      >
        <LifeBuoy color="#94a3b8" size={16} />
        <Text className="text-slate-300 font-bold text-sm">Steady Me — Right Now</Text>
      </TouchableOpacity>

      {__DEV__ && (
        <TouchableOpacity onPress={handleComplete} activeOpacity={0.7} className="items-center pb-10">
          <Text className="text-slate-700 text-xs">Skip &amp; complete (dev only)</Text>
        </TouchableOpacity>
      )}

      <TriageCenter visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

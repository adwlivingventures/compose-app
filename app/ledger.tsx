import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useProtocol, localDateString } from '../context/ProtocolContext';
import DailyCheckIn from '../components/DailyCheckIn';

/**
 * The Daily Check-In route — the check-anytime surface behind the Today-tab
 * row. Since the 2026-07-15 unification this is the SAME component the
 * session's final stage renders (components/DailyCheckIn.tsx): items get
 * checked here when they happen — morning light at 8am, the training slot
 * at noon — and the session reflects them instantly, because both surfaces
 * read and write the one ProtocolContext day record.
 *
 * No Complete CTA here: the day closes inside the session (the asks that
 * ride completion — reminders, ratings — live there). The check-in stays
 * open until midnight for evening items.
 */
export default function LedgerScreen() {
  const router = useRouter();
  const { activeDay, lastCompletedDate, loading } = useProtocol();

  if (loading) return <View className="flex-1 bg-ground" />;

  // After today's completion activeDay has advanced; the check-in still
  // belongs to the day that was just lived (evening items stay checkable).
  const completedToday = lastCompletedDate === localDateString();
  const day = completedToday ? Math.max(activeDay - 1, 1) : activeDay;

  return (
    <View className="flex-1 bg-ground px-6 pt-16">
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={16} color="#6B7280" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
          Day {day} · Check-In
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <DailyCheckIn day={day} />
    </View>
  );
}

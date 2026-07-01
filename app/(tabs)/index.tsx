import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useProtocol } from '../../context/ProtocolContext';

export default function DashboardScreen() {
  const { activeDay, streak, hasPurchased, loading } = useProtocol();

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-slate-400">Loading protocol...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 24, paddingTop: 72 }}>
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">75-Day Protocol</Text>
      <Text className="text-white text-3xl font-bold mt-1">Day {activeDay}</Text>

      <View className="flex-row mt-6 gap-3">
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <Text className="text-emerald-400 text-2xl font-bold">{streak}</Text>
          <Text className="text-slate-500 text-xs mt-1">Day Streak</Text>
        </View>
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <Text className="text-emerald-400 text-2xl font-bold">{hasPurchased ? 'Active' : 'Locked'}</Text>
          <Text className="text-slate-500 text-xs mt-1">Protocol Status</Text>
        </View>
      </View>
    </ScrollView>
  );
}


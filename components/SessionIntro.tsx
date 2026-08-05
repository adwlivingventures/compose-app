import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { STAGE_META, sessionIntroLead, totalSessionMinutes } from '../content/sessionGuide';
import { getProtocolDay } from '../content/ProtocolData';
import { getAnchorForDay } from '../content/anchors';

/**
 * Headspace-pattern session overview — shown once at session start when
 * no steps are complete. Names every step, estimates duration, one CTA.
 */

export default function SessionIntro({
  day,
  onBegin,
  onExit,
}: {
  day: number;
  onBegin: () => void;
  onExit: () => void;
}) {
  const protocol = getProtocolDay(day);
  const anchor = getAnchorForDay(day);
  const total = totalSessionMinutes();

  return (
    <View className="flex-1 bg-ground">
      <ScrollView
        className="flex-1 px-7"
        contentContainerStyle={{ paddingTop: 72, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close session"
          className="self-start mb-6"
        >
          <Text className="text-muted text-[13px] font-semibold">Close</Text>
        </TouchableOpacity>

        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Day {day} · Today&apos;s session
        </Text>
        <Text className="text-ink text-[26px] font-serif-regular leading-8 mt-2">
          {protocol.title}
        </Text>
        <Text className="text-muted text-[13.5px] leading-5 mt-2">{sessionIntroLead(day)}</Text>

        <View className="bg-surface border border-line rounded-2xl px-4 py-4 mt-6">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            The anchor
          </Text>
          <Text className="text-ink text-[15px] font-serif-regular mt-1">{anchor.title}</Text>
          {anchor.focus ? (
            <Text className="text-muted text-xs leading-4 mt-1">{anchor.focus}</Text>
          ) : null}
        </View>

        <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mt-6 mb-3">
          Your path · about {total} minutes
        </Text>
        <View className="bg-surface border border-line rounded-2xl px-4 py-1">
          {STAGE_META.map((meta, i) => (
            <View
              key={meta.key}
              className={`flex-row items-center py-3.5 ${
                i < STAGE_META.length - 1 ? 'border-b border-line-soft' : ''
              }`}
              style={{ gap: 12 }}
            >
              <View className="w-[26px] h-[26px] rounded-full border border-line-soft items-center justify-center">
                <Text className="text-faint text-[11px] font-semibold">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink text-[14px] font-semibold">{meta.label}</Text>
                <Text className="text-faint text-[11px] mt-0.5">{meta.durationMin} min</Text>
              </View>
            </View>
          ))}
        </View>

        <Text className="text-faint text-[11.5px] leading-4 mt-4 px-1">
          Jump between any step from the header — training and daily habits stay in sync.
        </Text>
      </ScrollView>

      <View className="px-7 pb-10 pt-2">
        <TouchableOpacity
          onPress={onBegin}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Begin session"
          className="bg-accent rounded-2xl py-[18px] items-center"
        >
          <Text className="text-on-accent font-bold text-base">Begin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

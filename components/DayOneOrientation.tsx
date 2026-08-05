import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from './BottomSheet';

/**
 * One-time Day 1 orientation — shown on first Today-tab mount after
 * purchase. Three sentences, one CTA; dismissed forever on tap.
 * Activation fix (2026-08): the dashboard is rich before the first session;
 * this names the contract before he has to decode it.
 */

interface DayOneOrientationProps {
  visible: boolean;
  onBegin: () => void;
  onDismiss: () => void;
}

export default function DayOneOrientation({ visible, onBegin, onDismiss }: DayOneOrientationProps) {
  return (
    <BottomSheet visible={visible} onClose={onDismiss} draggable scrimClass="bg-scrim/85">
      <View className="bg-surface border-t border-line rounded-t-[22px] px-7 pt-3 pb-10">
        <View className="w-9 h-1 rounded-full bg-line self-center mb-6" />
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Day one
        </Text>
        <Text className="text-ink text-[24px] font-serif-regular leading-8 mt-2">
          Here's how each day works
        </Text>
        <Text className="text-body text-[14px] leading-[22px] mt-4">
          One session, five steps, about fifteen minutes. Tap{' '}
          <Text className="text-ink font-semibold">Begin today&apos;s session</Text> — you&apos;ll
          see the full path before you start.
        </Text>
        <Text className="text-body text-[14px] leading-[22px] mt-3">
          The check-in below tracks habits through the day. You don't need any of them before
          you begin — session first, habits whenever they happen.
        </Text>
        <Text className="text-muted text-[13px] leading-5 mt-3">
          The other four tabs are here when you need them. Today is the only one that matters
          right now.
        </Text>
        <TouchableOpacity
          onPress={onBegin}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Begin today's session"
          className="bg-accent rounded-2xl py-[17px] items-center mt-7"
        >
          <Text className="text-on-accent font-bold text-base">Begin today's session</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

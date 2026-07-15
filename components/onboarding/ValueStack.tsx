import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { ValueStackScreen } from '../../content/onboarding/types';

/**
 * Pre-paywall value stack (types.ts ValueStackScreen) — grouped check rows
 * that make the purchase concrete before the price appears. Ember Dusk:
 * the rows absorb (muted checks, surface cards); copper stays on the CTA
 * alone (accent scarcity ≤4).
 */
export default function ValueStack({
  screen,
  onAdvance,
}: {
  screen: ValueStackScreen;
  onAdvance: () => void;
}) {
  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 72, paddingBottom: 48 }}
    >
      {screen.eyebrow && (
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          {screen.eyebrow}
        </Text>
      )}
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">{screen.headline}</Text>
      {screen.subhead && (
        <Text className="text-muted text-[13.5px] leading-5 mt-2">{screen.subhead}</Text>
      )}

      {screen.groups.map((group) => (
        <View key={group.label}>
          <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-7 mb-3">
            {group.label}
          </Text>
          <View className="bg-surface border border-line rounded-2xl px-4 py-1">
            {group.items.map((item, i) => (
              <View
                key={item}
                className={`flex-row items-start gap-3 py-[13px] ${
                  i === group.items.length - 1 ? '' : 'border-b border-line-soft'
                }`}
              >
                <View className="mt-[2px]">
                  <Check size={15} color="#6B7280" strokeWidth={2} />
                </View>
                <Text className="text-ink text-[13.5px] leading-5 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={onAdvance}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center mt-9"
      >
        <Text className="text-on-accent font-bold text-base">{screen.button}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

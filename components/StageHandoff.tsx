import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { metaForStage, nextStage, type SessionStage } from '../content/sessionGuide';

/**
 * Headspace-pattern stage handoff — brief beat between steps. Acknowledges
 * completion, names what's next, one tap to continue. No countdown, no hype.
 */

export default function StageHandoff({
  completedStage,
  onContinue,
}: {
  completedStage: SessionStage;
  onContinue: () => void;
}) {
  const meta = metaForStage(completedStage);
  const upcoming = nextStage(completedStage);

  return (
    <View className="flex-1 bg-ground px-7 justify-center">
      <View className="items-center mb-8">
        <View className="w-12 h-12 rounded-full bg-line items-center justify-center mb-5">
          <Check color="#93A4B0" size={22} strokeWidth={2.5} />
        </View>
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.24em]">
          Step complete
        </Text>
        <Text className="text-ink text-[24px] font-serif-regular text-center mt-2 leading-8">
          {meta.handoffDone}
        </Text>
        {upcoming && (
          <Text className="text-body text-[15px] text-center leading-6 mt-3 px-2">
            {meta.handoffNext}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={upcoming ? `Continue to ${metaForStage(upcoming).label}` : 'Continue'}
        className="bg-accent rounded-2xl py-[17px] items-center"
      >
        <Text className="text-on-accent font-bold text-base">
          {upcoming ? `Continue to ${metaForStage(upcoming).label}` : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

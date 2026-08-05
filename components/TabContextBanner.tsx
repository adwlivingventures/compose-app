import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useFirstVisitHint, type TabHintId } from '../hooks/useFirstVisitHint';

/**
 * One-line first-visit context for non-Today tabs during Days 1–3.
 * Reduces exploration confusion without a tutorial library.
 */
export default function TabContextBanner({ tab }: { tab: TabHintId }) {
  const { show, copy, dismiss } = useFirstVisitHint(tab);
  if (!show) return null;

  return (
    <View className="mx-6 mt-3 mb-1 bg-surface-deep border border-line rounded-xl px-4 py-3 flex-row items-start gap-2.5">
      <Text className="text-body text-[12.5px] leading-[18px] flex-1">{copy}</Text>
      <TouchableOpacity
        onPress={dismiss}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        activeOpacity={0.7}
      >
        <X color="#53626E" size={14} />
      </TouchableOpacity>
    </View>
  );
}

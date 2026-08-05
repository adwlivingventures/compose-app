import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { LocalStore } from '../services/storage';

export const ATTRIBUTION_KEY = '@attribution_source';
export const ATTRIBUTION_DISMISS_KEY = '@attribution_dismissed';

/**
 * Day 3+ inline attribution ask — moved out of the post-purchase chain
 * so activation reaches the first session faster.
 */

export function useAttributionPrompt(activeDay: number) {
  const [show, setShow] = React.useState(false);

  const refresh = useCallback(() => {
    if (activeDay < 3) {
      setShow(false);
      return;
    }
    Promise.all([
      LocalStore.getItem(ATTRIBUTION_KEY),
      LocalStore.getItem<boolean>(ATTRIBUTION_DISMISS_KEY),
    ]).then(([source, dismissed]) => {
      setShow(!source && !dismissed);
    });
  }, [activeDay]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const dismiss = async () => {
    await LocalStore.setItem(ATTRIBUTION_DISMISS_KEY, true);
    setShow(false);
  };

  return { show, dismiss };
}

export default function AttributionCard({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();

  return (
    <View className="bg-surface border border-line rounded-2xl px-[18px] py-4 mb-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            One question
          </Text>
          <Text className="text-ink text-[15px] font-serif-regular mt-1">
            How did you hear about Compose?
          </Text>
          <Text className="text-muted text-xs mt-1 leading-4">
            Helps us reach men like you. Skip it and nothing changes.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <X color="#53626E" size={14} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/attribution?standalone=1')}
        activeOpacity={0.85}
        className="bg-surface-deep border border-line rounded-xl py-3 items-center mt-3"
      >
        <Text className="text-ink text-[13px] font-semibold">Answer in ten seconds</Text>
      </TouchableOpacity>
    </View>
  );
}

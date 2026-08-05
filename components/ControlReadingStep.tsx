import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const NOTCHES = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * Session control reading — 1–10 release rating as one continuous scale
 * (notch bar), matching the onboarding release-scale language.
 */

export default function ControlReadingStep({
  onSelect,
  initialValue = 0,
}: {
  onSelect: (value: number) => void;
  initialValue?: number;
}) {
  const [value, setValue] = useState<number | null>(initialValue > 0 ? initialValue : null);

  const pick = (n: number) => {
    setValue(n);
    onSelect(n);
  };

  return (
    <View className="w-full px-1">
      <View className="items-center mb-8">
        <Text className="text-accent font-serif-light text-[52px] leading-[56px]">
          {value ?? '—'}
        </Text>
        <Text className="text-ink text-[22px] font-serif-regular text-center mt-1 leading-7 px-2">
          How fully did your floor release?
        </Text>
        <Text className="text-muted text-xs text-center mt-2 leading-4 px-3">
          A signal you are learning to read — not a grade.
        </Text>
      </View>

      <View className="rounded-2xl border border-line bg-surface px-4 py-5">
        <View className="flex-row" style={{ gap: 5 }}>
          {NOTCHES.map((n) => {
            const active = value !== null && n <= value;
            const selected = value === n;
            return (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`${n} of 10`}
                accessibilityState={{ selected }}
                onPress={() => pick(n)}
                className="flex-1 items-center"
                style={{ paddingVertical: 4 }}
              >
                <View
                  className={`w-full rounded-full ${active ? 'bg-accent' : 'bg-surface-deep'}`}
                  style={{
                    height: 28,
                    borderWidth: selected ? 0 : 1,
                    borderColor: '#223140',
                    opacity: active && !selected ? 0.5 : 1,
                  }}
                />
                <Text
                  className={selected ? 'font-serif-regular text-ink' : 'text-faint'}
                  style={{ fontSize: selected ? 16 : 10, marginTop: 10, fontWeight: selected ? '400' : '300' }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4 flex-row justify-between">
          <Text className="text-muted text-[11px] font-light flex-1">Stayed tight</Text>
          <Text className="text-muted text-[11px] font-light flex-1 text-right">
            Released completely
          </Text>
        </View>
      </View>
    </View>
  );
}

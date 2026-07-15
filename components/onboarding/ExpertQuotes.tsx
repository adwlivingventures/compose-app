import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { ExpertQuotesScreen } from '../../content/onboarding/types';

/**
 * Expert-consensus slide (types.ts ExpertQuotesScreen) — verbatim, sourced
 * clinician quotes. Newsreader italic carries the spoken register (the
 * mirror-sentence treatment); attribution stays quiet. No expert imagery,
 * no logos, nothing that could read as endorsement — the quotes describe
 * the mechanism and stop there. Copper on the CTA only.
 */
export default function ExpertQuotes({
  screen,
  onAdvance,
}: {
  screen: ExpertQuotesScreen;
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
      <Text className="text-ink text-[26px] font-serif-regular leading-9 mt-1.5">
        {screen.headline}
      </Text>
      {screen.subhead && (
        <Text className="text-muted text-[13.5px] leading-5 mt-2">{screen.subhead}</Text>
      )}

      <View className="mt-7" style={{ gap: 12 }}>
        {screen.quotes.map((quote) => (
          <View
            key={quote.name}
            className="bg-surface border border-line rounded-2xl px-5 py-[18px]"
          >
            <Text className="text-ink font-serif-italic text-[14.5px] leading-[22px]">
              “{quote.text}”
            </Text>
            <Text className="text-body text-[12.5px] font-semibold mt-3">{quote.name}</Text>
            <Text className="text-muted text-[11.5px] mt-0.5">{quote.credential}</Text>
          </View>
        ))}
      </View>

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

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { TestimonialsScreen } from '../../content/onboarding/types';

/**
 * Tester stories (types.ts TestimonialsScreen) — real, consented in-person
 * tester feedback (provenance in the claims gate). Builds directly off the
 * expert-consensus slide: clinicians named the mechanism, these voices
 * confirm it lived. Story text stays roman (their words, not liturgy);
 * the short tag gives a skimming thumb the arc without the paragraph.
 * Copper on the CTA only.
 */
export default function Testimonials({
  screen,
  onAdvance,
}: {
  screen: TestimonialsScreen;
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
        {screen.stories.map((story) => (
          <View
            key={story.name}
            className="bg-surface border border-line rounded-2xl px-5 py-[18px]"
          >
            <View className="flex-row items-baseline justify-between">
              <Text className="text-ink text-[14px] font-semibold">
                {story.name}
                <Text className="text-muted font-normal">{`  ${story.detail}`}</Text>
              </Text>
            </View>
            <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-1">
              {story.tag}
            </Text>
            <Text className="text-body text-[13px] leading-[20px] mt-2.5">
              “{story.text}”
            </Text>
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

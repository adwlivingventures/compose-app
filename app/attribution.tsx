// Post-purchase attribution ask (2026-08-03, build order 1.2) — deferred to
// Day 3+ on the Today tab so the post-purchase chain reaches the first
// session faster. Standalone mode (`?standalone=1`) returns to Today.

import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenFade } from '../components/onboarding/archetypes';
import { Eyebrow, SecondaryLink } from '../components/onboarding/chrome';
import { track, type AttributionSource } from '../services/analytics';
import { LocalStore } from '../services/storage';
import { ATTRIBUTION_DISMISS_KEY, ATTRIBUTION_KEY } from '../components/AttributionCard';

const OPTIONS: { value: AttributionSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'google', label: 'Google' },
  { value: 'app-store', label: 'App Store search' },
  { value: 'clinician', label: 'My doctor or therapist' },
  { value: 'friend', label: 'A friend' },
  { value: 'other', label: 'Other' },
];

export default function Attribution() {
  const router = useRouter();
  const { standalone } = useLocalSearchParams<{ standalone?: string }>();
  const isStandalone = standalone === '1';
  const [answered, setAnswered] = useState(false);

  const advance = () =>
    isStandalone ? router.back() : router.replace('/discretion?intro=1');

  const choose = async (source: AttributionSource) => {
    if (answered) return; // one tap decides; double-taps never double-fire
    setAnswered(true);
    await LocalStore.setItem(ATTRIBUTION_KEY, source);
    // Whitelisted closed-list event; a consent decline upstream makes this a
    // no-op inside track() — the answer then simply stays on-device.
    track('attribution', { source });
    advance();
  };

  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="px-7" style={{ paddingTop: isStandalone ? 72 : 84 }}>
          <Eyebrow>{isStandalone ? 'OPTIONAL' : 'ONE MORE'}</Eyebrow>
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 26, lineHeight: 34, marginTop: 14 }}
          >
            How did you hear about us?
          </Text>
          <Text
            className="mt-3 text-body"
            style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21 }}
          >
            Helps us reach men like you. Skip it and nothing changes.
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-7"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 12, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => choose(opt.value)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              className="rounded-xl bg-surface border border-line px-4"
              style={{ paddingVertical: 13 }}
            >
              <Text className="text-ink" style={{ fontSize: 14, fontWeight: '400' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="px-8 pb-[52px]" style={{ paddingTop: 8 }}>
          <SecondaryLink
            label="Skip"
            onPress={async () => {
              if (isStandalone) await LocalStore.setItem(ATTRIBUTION_DISMISS_KEY, true);
              advance();
            }}
          />
        </View>
      </View>
    </ScreenFade>
  );
}

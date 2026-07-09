// Telemetry consent — the single §7 exception, asked once, plainly.
// Rides directly behind the "Private by architecture" trust proof. Register
// stays sanctuary-calm: one question, three short facts, an equal-dignity
// decline. No dark patterns — the decline link is real, immediate, and the
// flow continues identically either way. (A consent screen that guilt-trips
// would spend the trust the previous screen just earned.)

import { Text, View } from 'react-native';
import type { ConsentScreen as ConsentDescriptor } from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { Eyebrow, SecondaryLink } from './chrome';

export default function ConsentScreen({
  screen,
  onDecision,
}: {
  screen: ConsentDescriptor;
  onDecision: (granted: boolean) => void;
}) {
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="flex-1 justify-center px-7">
          <Eyebrow>{screen.eyebrow}</Eyebrow>
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 26, lineHeight: 34, marginTop: 14 }}
          >
            {screen.headline}
          </Text>
          <Text
            className="mt-4 text-body"
            style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21 }}
          >
            {screen.body}
          </Text>

          <View className="mt-5 rounded-2xl bg-surface" style={{ padding: 16, gap: 10 }}>
            {screen.bullets.map((line) => (
              <View key={line} className="flex-row" style={{ gap: 10 }}>
                <Text className="text-muted" style={{ fontSize: 11.5, lineHeight: 17 }}>
                  —
                </Text>
                <Text
                  className="flex-1 text-body"
                  style={{ fontSize: 11.5, fontWeight: '300', lineHeight: 17 }}
                >
                  {line}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-8 pb-[52px]" style={{ gap: 6 }}>
          <EmissiveCTA label={screen.acceptButton} onPress={() => onDecision(true)} />
          <SecondaryLink label={screen.declineLink} onPress={() => onDecision(false)} />
        </View>
      </View>
    </ScreenFade>
  );
}

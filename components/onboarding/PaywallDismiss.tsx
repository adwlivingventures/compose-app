// B-40/A-40 — Paywall dismiss, "When you're ready". The anti-urgency close:
// never a discount, never a timer, at most once per session. Dimmed score +
// gauge, the user's own goal words, calm exit. A returning user lands here
// with the score intact — the honest win-back.

import { Text, View } from 'react-native';
import type { PaywallDismissScreen as DismissDescriptor } from '../../content/onboarding/types';
import type { ComposureResult } from '../../content/onboarding/composure';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { SecondaryLink } from './chrome';
import { BaselineGauge } from './MapScreen';

export default function PaywallDismiss({
  screen,
  result,
  goalEcho,
  onKeepGoing,
  onExit,
}: {
  screen: DismissDescriptor;
  result: ComposureResult;
  goalEcho: string | null;
  onKeepGoing: () => void;
  onExit: () => void;
}) {
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="flex-1 justify-center px-7">
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 27, lineHeight: 35 }}
          >
            {screen.headline}
          </Text>

          <View className="mt-7" style={{ opacity: 0.55 }}>
            <View className="flex-row items-baseline" style={{ gap: 4 }}>
              <Text className="font-serif-regular text-ink" style={{ fontSize: 44, lineHeight: 48 }}>
                {result.score}
              </Text>
              <Text className="font-serif-regular text-faint" style={{ fontSize: 20 }}>
                {' '}/ 100
              </Text>
            </View>
          </View>
          <View className="mt-3">
            <BaselineGauge score={result.score} calmZone={[80, 100]} dimmed />
          </View>

          {goalEcho && (
            <Text
              className="mt-6 font-serif-italic text-accent-deep"
              style={{ fontSize: 14, lineHeight: 21 }}
            >
              "{goalEcho}"
            </Text>
          )}

          <Text
            className="mt-5 text-body"
            style={{ fontSize: 14, fontWeight: '300', lineHeight: 22 }}
          >
            {screen.body}
          </Text>
        </View>

        <View className="px-8 pb-[52px]" style={{ gap: 6 }}>
          <EmissiveCTA label={screen.button} onPress={onKeepGoing} />
          <SecondaryLink label={screen.exitLink} onPress={onExit} />
        </View>
      </View>
    </ScreenFade>
  );
}

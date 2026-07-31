// QuestionShell — shared layout for every question-family archetype
// (single/multi-select, text, wheel, slider). Layout truth: 3a B-10.
// The flow runner mounts ProgressHeader above and PrivacyFooter below.

import { ScrollView, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScreenFade } from './archetypes';

export default function QuestionShell({
  question,
  subText,
  children,
}: {
  question: string;
  subText?: string;
  children: React.ReactNode;
}) {
  return (
    <ScreenFade>
      <View className="relative flex-1">
        {/* Scrollable: long option lists (attribution has 12) must never strand
            answers below the fold on small devices (founder review 2026-07-10). */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 38, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 26, lineHeight: 34.5 }}
          >
            {question}
          </Text>
          {subText ? (
            <Text
              className="text-body"
              style={{ fontSize: 13.5, fontWeight: '300', lineHeight: 21.5, marginTop: 14 }}
            >
              {subText}
            </Text>
          ) : null}
          <View style={{ marginTop: 32 }}>{children}</View>
        </ScrollView>
        {/* Overflowing options dissolve into ground instead of hard-clipping
            above the privacy footer (founder review 2026-07-10) — same
            fade-to-ground treatment as HeroImage. Invisible when content fits:
            ground-over-ground. */}
        <View pointerEvents="none" className="absolute inset-x-0 bottom-0" style={{ height: 42 }}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="questionFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0A0F16" stopOpacity="0" />
                <Stop offset="1" stopColor="#0A0F16" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#questionFade)" />
          </Svg>
        </View>
      </View>
    </ScreenFade>
  );
}

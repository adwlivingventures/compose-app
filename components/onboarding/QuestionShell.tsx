// QuestionShell — shared layout for every question-family archetype
// (single/multi-select, text, wheel, slider). Layout truth: 3a B-10.
// The flow runner mounts ProgressHeader above and PrivacyFooter below.

import { Text, View } from 'react-native';
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
      <View className="flex-1 px-6" style={{ paddingTop: 38 }}>
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
      </View>
    </ScreenFade>
  );
}

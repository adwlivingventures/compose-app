// B-35/A-35 — "Your Path to Freedom": two 1.5px curves diverging from Today.
// No numeric y-axis (hard rule: nothing here may imply measured data — the
// caption owns the honesty). Upper curve = accent-bright; lower = faint,
// dashed.

import { Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import type { DivergingGraphScreen as GraphDescriptor } from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';

const W = 330;
const H = 190;

export default function DivergingGraphScreen({
  screen,
  onAdvance,
}: {
  screen: GraphDescriptor;
  onAdvance: () => void;
}) {
  const startX = 26;
  const startY = H / 2;
  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <View className="flex-1 justify-center px-6">
          <Text
            className="font-serif-regular text-ink"
            style={{ fontSize: 26, lineHeight: 34 }}
          >
            {screen.headline}
          </Text>

          <View className="mt-7 items-center">
            <Svg width={W} height={H}>
              {/* Upper path — the retrained curve. */}
              <Path
                d={`M ${startX} ${startY} C ${W * 0.4} ${startY - 8}, ${W * 0.62} ${startY - 52}, ${W - 12} ${startY - 78}`}
                stroke="#D9B285"
                strokeWidth={1.5}
                fill="none"
              />
              {/* Lower path — avoidance compounding. */}
              <Path
                d={`M ${startX} ${startY} C ${W * 0.4} ${startY + 10}, ${W * 0.62} ${startY + 44}, ${W - 12} ${startY + 66}`}
                stroke="#4B5563"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                fill="none"
              />
              <Circle cx={startX} cy={startY} r={4} fill="#C89B6D" />
              <SvgText
                x={startX}
                y={startY + 20}
                fill="#6B7280"
                fontSize={10}
                fontWeight="300"
              >
                Today
              </SvgText>
              <SvgText
                x={10}
                y={16}
                fill="#4B5563"
                fontSize={9}
                fontWeight="300"
                letterSpacing={1}
              >
                COMPOSURE
              </SvgText>
            </Svg>
          </View>

          <View className="mt-4" style={{ gap: 8 }}>
            {screen.upperAnnotations.map((line) => (
              <Text
                key={line}
                className="text-accent-bright"
                style={{ fontSize: 12.5, fontWeight: '300' }}
              >
                {line}
              </Text>
            ))}
            <Text
              className="text-faint"
              style={{ fontSize: 12.5, fontWeight: '300', lineHeight: 19, marginTop: 6 }}
            >
              {screen.lowerAnnotation}
            </Text>
          </View>

          <Text
            className="mt-5 text-faint"
            style={{ fontSize: 10.5, fontWeight: '300' }}
          >
            {screen.caption}
          </Text>
        </View>
        <View className="px-8 pb-[52px]">
          <EmissiveCTA label={screen.button} onPress={onAdvance} />
        </View>
      </View>
    </ScreenFade>
  );
}

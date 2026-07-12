// B-35/A-35 — the fork. Two 1.5px curves diverging from "You · today"; each
// curve is labeled in place and the upper path carries its Day 25/50/75
// milestones as marked points ON the curve (founder review 2026-07-10: the
// abstract version did nothing — the graph must read as HIS two futures).
// No numeric y-axis (hard rule: nothing here may imply measured data — the
// caption owns the honesty). Upper curve = accent-bright; lower = faint,
// dashed.

import { Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import type { DivergingGraphScreen as GraphDescriptor } from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';

const W = 340;
const H = 230;

/** Cubic bezier point at t for (p0, c1, c2, p1). */
function bez(t: number, p0: number, c1: number, c2: number, p1: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
}

export default function DivergingGraphScreen({
  screen,
  onAdvance,
}: {
  screen: GraphDescriptor;
  onAdvance: () => void;
}) {
  const startX = 30;
  const startY = H / 2;
  const endX = W - 16;

  // Upper curve control points (mirrors the Path below for milestone math).
  const up = { c1x: W * 0.4, c1y: startY - 10, c2x: W * 0.62, c2y: startY - 62, p1y: startY - 92 };
  const lo = { c1x: W * 0.4, c1y: startY + 12, c2x: W * 0.62, c2y: startY + 52, p1y: startY + 76 };

  // Day 25/50/75 land at even thirds of the upper curve's span.
  const milestones = screen.upperAnnotations.map((label, i) => {
    const t = (i + 1) / screen.upperAnnotations.length;
    return {
      label,
      x: bez(t, startX, up.c1x, up.c2x, endX),
      y: bez(t, startY, up.c1y, up.c2y, up.p1y),
    };
  });

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

          <View className="mt-6 items-center">
            <Svg width={W} height={H}>
              <SvgText
                x={12}
                y={16}
                fill="#4B5563"
                fontSize={9}
                fontWeight="300"
                letterSpacing={1}
              >
                {screen.yAxisLabel.toUpperCase()}
              </SvgText>
              {/* Upper path — the retrained curve, with its milestones on it. */}
              <Path
                d={`M ${startX} ${startY} C ${up.c1x} ${up.c1y}, ${up.c2x} ${up.c2y}, ${endX} ${up.p1y}`}
                stroke="#D9B285"
                strokeWidth={1.5}
                fill="none"
              />
              {milestones.map((m) => (
                <Circle key={m.label} cx={m.x} cy={m.y} r={3} fill="#D9B285" />
              ))}
              {milestones.map((m, i) => (
                <SvgText
                  key={`label-${m.label}`}
                  x={Math.min(m.x, W - 8)}
                  y={m.y - 10}
                  fill="#D9B285"
                  fontSize={9.5}
                  fontWeight="300"
                  textAnchor={i === milestones.length - 1 ? 'end' : 'middle'}
                >
                  {m.label}
                </SvgText>
              ))}
              {/* +44 clears the Day-50 milestone label above it. */}
              <SvgText
                x={endX}
                y={up.p1y + 44}
                fill="#C89B6D"
                fontSize={10}
                fontWeight="400"
                textAnchor="end"
              >
                {screen.upperLabel}
              </SvgText>
              {/* Lower path — avoidance compounding. */}
              <Path
                d={`M ${startX} ${startY} C ${lo.c1x} ${lo.c1y}, ${lo.c2x} ${lo.c2y}, ${endX} ${lo.p1y}`}
                stroke="#4B5563"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                fill="none"
              />
              <SvgText
                x={endX}
                y={lo.p1y - 10}
                fill="#6B7280"
                fontSize={10}
                fontWeight="300"
                textAnchor="end"
              >
                {screen.lowerLabel}
              </SvgText>
              {/* The fork: him, tonight. */}
              <Circle cx={startX} cy={startY} r={5.5} fill="none" stroke="#C89B6D" strokeWidth={1} opacity={0.5} />
              <Circle cx={startX} cy={startY} r={3.5} fill="#C89B6D" />
              <SvgText
                x={startX - 4}
                y={startY + 22}
                fill="#D9B285"
                fontSize={10}
                fontWeight="400"
              >
                {screen.startLabel}
              </SvgText>
            </Svg>
          </View>

          <Text
            className="mt-4 text-faint"
            style={{ fontSize: 12.5, fontWeight: '300', lineHeight: 19 }}
          >
            {screen.lowerAnnotation}
          </Text>
          <Text
            className="mt-4 text-faint"
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

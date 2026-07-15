// B-35/A-35 — the fork. Rebuilt 2026-07-14 (founder: the old version read as
// clutter — labels crossed the curves). Now: centered headline, a filled
// upper curve with a lit endpoint (the future as emission), short milestone
// labels placed in the open wedge BETWEEN the curves (first below the line,
// later ones above-left) so nothing ever crosses a path. No numeric y-axis
// (hard rule: nothing here may imply measured data — the caption owns the
// honesty). Upper curve = accent-bright; lower = faint, dashed.

import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import type { DivergingGraphScreen as GraphDescriptor } from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import { EmphasizedText, ScreenFade } from './archetypes';

const W = 340;
const H = 240;

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

  const upperPath = `M ${startX} ${startY} C ${up.c1x} ${up.c1y}, ${up.c2x} ${up.c2y}, ${endX} ${up.p1y}`;

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
            className="text-center font-serif-regular text-ink"
            style={{ fontSize: 28, lineHeight: 37 }}
          >
            {screen.headline}
          </Text>

          <View className="mt-7 items-center">
            <Svg width={W} height={H}>
              <Defs>
                {/* The upper future, filled — light accumulating under the
                    retrained curve. */}
                <LinearGradient id="upperFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#C89B6D" stopOpacity="0.16" />
                  <Stop offset="1" stopColor="#C89B6D" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path d={`${upperPath} L ${endX} ${startY} Z`} fill="url(#upperFill)" />

              {/* Upper path — the retrained curve. */}
              <Path d={upperPath} stroke="#D9B285" strokeWidth={2} fill="none" />

              {/* Lower path — avoidance compounding. */}
              <Path
                d={`M ${startX} ${startY} C ${lo.c1x} ${lo.c1y}, ${lo.c2x} ${lo.c2y}, ${endX} ${lo.p1y}`}
                stroke="#4B5563"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                fill="none"
              />

              {/* Milestones: dots on the curve; labels live in open space —
                  the first sits in the wedge BELOW the upper curve, the later
                  two sit above-left of their dots. Nothing crosses a path. */}
              {milestones.map((m) => (
                <Circle key={m.label} cx={m.x} cy={m.y} r={3.2} fill="#D9B285" />
              ))}
              {milestones.map((m, i) =>
                i === 0 ? (
                  <SvgText
                    key={`label-${m.label}`}
                    x={m.x + 4}
                    y={m.y + 20}
                    fill="#D9B285"
                    fontSize={10}
                    fontWeight="300"
                    textAnchor="middle"
                  >
                    {m.label}
                  </SvgText>
                ) : (
                  <SvgText
                    key={`label-${m.label}`}
                    x={i === milestones.length - 1 ? m.x - 8 : m.x - 12}
                    y={i === milestones.length - 1 ? Math.max(m.y - 10, 12) : m.y - 12}
                    fill="#D9B285"
                    fontSize={10}
                    fontWeight="300"
                    textAnchor="end"
                  >
                    {m.label}
                  </SvgText>
                ),
              )}

              {/* The destination — lit. The one emission on this chart. */}
              <Circle cx={endX} cy={up.p1y} r={14} fill="#C89B6D" opacity={0.14} />
              <Circle cx={endX} cy={up.p1y} r={4.5} fill="#D9B285" />
              <SvgText
                x={endX}
                y={up.p1y + 24}
                fill="#C89B6D"
                fontSize={10.5}
                fontWeight="400"
                textAnchor="end"
              >
                {screen.upperLabel}
              </SvgText>

              {/* The lower end — matte, unlit, named. */}
              <SvgText
                x={endX}
                y={lo.p1y + 18}
                fill="#6B7280"
                fontSize={10.5}
                fontWeight="300"
                textAnchor="end"
              >
                {screen.lowerLabel}
              </SvgText>

              {/* The fork: him, tonight — label above the point, clear of both
                  curves. */}
              <Circle cx={startX} cy={startY} r={5.5} fill="none" stroke="#C89B6D" strokeWidth={1} opacity={0.5} />
              <Circle cx={startX} cy={startY} r={3.5} fill="#C89B6D" />
              <SvgText
                x={startX - 6}
                y={startY - 16}
                fill="#D9B285"
                fontSize={10.5}
                fontWeight="400"
              >
                {screen.startLabel}
              </SvgText>
            </Svg>
          </View>

          <EmphasizedText
            text={screen.lowerAnnotation}
            className="mt-4 text-center text-body"
            style={{ fontSize: 13, fontWeight: '300', lineHeight: 20 }}
          />
          <Text
            className="mt-3 text-center text-faint"
            style={{ fontSize: 10, fontWeight: '300' }}
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

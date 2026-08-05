// B-35/A-35 — the fork. Two paths diverge from tonight: retraining rises on
// the aqua current; avoidance slides on a matte dashed line. Labels live in
// RN Text over the SVG so typography matches the rest of onboarding; the chart
// sits in a surface card with a soft glow on the upper destination.

import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import type { DivergingGraphScreen as GraphDescriptor } from '../../content/onboarding/types';
import { DEEPWATER } from '../../theme/deepwater';
import EmissiveCTA from './EmissiveCTA';
import { EmphasizedText, ScreenFade } from './archetypes';

const W = 318;
const H = 268;

/** Cubic bezier point at t for (p0, c1, c2, p1). */
function bez(t: number, p0: number, c1: number, c2: number, p1: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
}

function ForkGraph({ screen }: { screen: GraphDescriptor }) {
  const startX = 42;
  const startY = H * 0.54;
  const endX = W - 18;

  const up = {
    c1x: W * 0.34,
    c1y: startY - 6,
    c2x: W * 0.66,
    c2y: startY - 74,
    p1y: startY - 98,
  };
  const lo = {
    c1x: W * 0.34,
    c1y: startY + 8,
    c2x: W * 0.66,
    c2y: startY + 56,
    p1y: startY + 84,
  };

  const upperPath = `M ${startX} ${startY} C ${up.c1x} ${up.c1y}, ${up.c2x} ${up.c2y}, ${endX} ${up.p1y}`;
  const lowerPath = `M ${startX} ${startY} C ${lo.c1x} ${lo.c1y}, ${lo.c2x} ${lo.c2y}, ${endX} ${lo.p1y}`;

  const milestones = screen.upperAnnotations.map((label, i) => {
    const t = (i + 1) / (screen.upperAnnotations.length + 0.35);
    return {
      label,
      x: bez(t, startX, up.c1x, up.c2x, endX),
      y: bez(t, startY, up.c1y, up.c2y, up.p1y),
    };
  });

  return (
    <View className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <View style={{ width: W, height: H, alignSelf: 'center' }}>
        <Svg width={W} height={H}>
          <Defs>
            <LinearGradient id="forkUpperFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={DEEPWATER.accent} stopOpacity="0.22" />
              <Stop offset="1" stopColor={DEEPWATER.accent} stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="forkLowerFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#E07A5F" stopOpacity="0" />
              <Stop offset="1" stopColor="#E07A5F" stopOpacity="0.09" />
            </LinearGradient>
            <RadialGradient id="forkUpperGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={DEEPWATER.accentBright} stopOpacity="0.45" />
              <Stop offset="0.55" stopColor={DEEPWATER.accent} stopOpacity="0.12" />
              <Stop offset="1" stopColor={DEEPWATER.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Tonight horizon — where both paths begin. */}
          <Path
            d={`M ${startX - 8} ${startY} L ${endX} ${startY}`}
            stroke={DEEPWATER.line}
            strokeWidth={1}
            strokeDasharray="3 6"
            opacity={0.55}
          />

          <Path d={`${lowerPath} L ${endX} ${startY} Z`} fill="url(#forkLowerFill)" />
          <Path
            d={lowerPath}
            stroke="#6E8090"
            strokeWidth={1.75}
            strokeDasharray="5 6"
            strokeLinecap="round"
            fill="none"
          />

          <Path d={`${upperPath} L ${endX} ${startY} Z`} fill="url(#forkUpperFill)" />
          <Path
            d={upperPath}
            stroke={DEEPWATER.accent}
            strokeWidth={2.75}
            strokeLinecap="round"
            fill="none"
          />

          {milestones.map((m) => (
            <Circle key={m.label} cx={m.x} cy={m.y} r={4} fill={DEEPWATER.accentBright} />
          ))}

          <Circle cx={endX} cy={lo.p1y} r={3.5} fill="#6E8090" opacity={0.85} />

          <Circle cx={endX} cy={up.p1y} r={28} fill="url(#forkUpperGlow)" />
          <Circle cx={endX} cy={up.p1y} r={6} fill={DEEPWATER.accentBright} />
          <Circle
            cx={endX}
            cy={up.p1y}
            r={10}
            fill="none"
            stroke={DEEPWATER.accent}
            strokeWidth={1}
            opacity={0.45}
          />

          {/* Him, tonight — identity register (ember). */}
          <Circle cx={startX} cy={startY} r={11} fill="none" stroke={DEEPWATER.ember} strokeWidth={1} opacity={0.45} />
          <Circle cx={startX} cy={startY} r={6} fill={DEEPWATER.ember} />
        </Svg>

        <Text
          className="absolute text-ember-bright"
          style={{
            left: startX - 4,
            top: startY - 34,
            fontSize: 10,
            fontWeight: '400',
            letterSpacing: 0.3,
          }}
        >
          {screen.startLabel}
        </Text>

        {milestones.map((m, i) => (
          <Text
            key={`milestone-${m.label}`}
            className="text-accent-bright text-center"
            style={{
              position: 'absolute',
              left: Math.max(4, Math.min(m.x - 36, W - 76)),
              top: i === 0 ? m.y + 10 : m.y - 28,
              width: 72,
              fontSize: 9,
              fontWeight: '300',
              lineHeight: 12,
            }}
          >
            {m.label}
          </Text>
        ))}

        <View
          className="absolute flex-row items-center rounded-full border border-accent/30 bg-surface px-2.5 py-1"
          style={{ right: 4, top: up.p1y - 14 }}
        >
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent-bright" />
          <Text className="text-accent text-[10px]" style={{ fontWeight: '400' }}>
            {screen.upperLabel}
          </Text>
        </View>

        <View
          className="absolute flex-row items-center rounded-full border border-line bg-surface px-2.5 py-1"
          style={{ right: 4, top: lo.p1y - 2 }}
        >
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-muted" />
          <Text className="text-muted text-[10px]" style={{ fontWeight: '300' }}>
            {screen.lowerLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between border-t border-line px-4 py-3">
        <Text className="text-faint text-[9px]" style={{ fontWeight: '300', letterSpacing: 1 }}>
          TONIGHT
        </Text>
        <Text className="text-accent-deep text-[9px]" style={{ fontWeight: '300', letterSpacing: 1 }}>
          DAY 75
        </Text>
      </View>
    </View>
  );
}

export default function DivergingGraphScreen({
  screen,
  onAdvance,
}: {
  screen: GraphDescriptor;
  onAdvance: () => void;
}) {
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

          <ForkGraph screen={screen} />

          <EmphasizedText
            text={screen.lowerAnnotation}
            className="mt-5 text-center text-body"
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

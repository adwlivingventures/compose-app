// B-33/A-33 — the Hopeful Arc: five encouraging sub-screens under one screen
// id, tapped through quickly to rebuild hope before the close. Image-forward
// per founder ruling 2026-07-14 (supersedes the earlier typographic-only
// imagery rule): each slide carries a bespoke SVG motif (aqua current —
// Deepwater default) + a short imperative headline + 1–2 sentences, with the
// wordmark up top and pagination dots — the QUITTR quick-tap register in
// Deepwater.

import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { HopefulArcScreen } from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import ClinicalHero from './ClinicalHero';
import { EmphasizedText, ScreenFade } from './archetypes';
import { DuskRadial, Eyebrow, Wordmark } from './chrome';

const PHASES = ['Reset', 'Exposure', 'Consolidation'] as const;

function PhasePath() {
  const width = 320;
  const y = 40;
  const xs = [20, 160, 300];
  const startDate = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return (
    <View className="mt-7 items-center">
      <Svg width={width} height={86}>
        <Line x1={xs[0]} y1={y} x2={xs[2]} y2={y} stroke="#223140" strokeWidth={2} />
        {/* Accent unification (2026-07-25): the "You" marker rides the aqua
            current; the unearned path stays matte. */}
        {xs.map((x, i) => (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={i === 0 ? 6 : 5}
            fill={i === 0 ? '#5FD4C1' : '#121A24'}
            stroke={i === 0 ? '#5FD4C1' : '#2A3A4A'}
            strokeWidth={1.5}
          />
        ))}
        {xs.map((x, i) => (
          <SvgText
            key={`label-${i}`}
            x={x}
            y={y + 26}
            fill="#6E8090"
            fontSize={10}
            fontWeight="300"
            textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
          >
            {PHASES[i]}
          </SvgText>
        ))}
        <SvgText
          x={xs[0]}
          y={y - 16}
          fill="#8CE6D8"
          fontSize={10}
          fontWeight="400"
          textAnchor="start"
        >
          {`You · ${startDate}`}
        </SvgText>
      </Svg>
    </View>
  );
}

export default function HopefulArc({
  screen,
  onComplete,
}: {
  screen: HopefulArcScreen;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const sub = screen.subScreens[index];
  const advance = () => {
    if (index + 1 < screen.subScreens.length) setIndex(index + 1);
    else onComplete();
  };

  return (
    <ScreenFade key={index}>
      <View className="flex-1 bg-ground">
        <DuskRadial />
        <View style={{ paddingTop: 76 }}>
          {sub.eyebrow === 'COMPOSE' ? (
            <Wordmark />
          ) : sub.eyebrow ? (
            <Eyebrow center>{sub.eyebrow}</Eyebrow>
          ) : null}
        </View>
        <View className="flex-1 items-center justify-center px-9">
          {sub.motif ? (
            <View style={{ marginBottom: 16 }}>
              <ClinicalHero motif={sub.motif} />
            </View>
          ) : null}
          <Text
            className="text-center font-serif-regular text-ink"
            style={{ fontSize: 28, lineHeight: 37 }}
          >
            {sub.headline}
          </Text>
          <EmphasizedText
            text={sub.body}
            className="text-center text-body"
            style={{ fontSize: 14.5, fontWeight: '300', lineHeight: 23.5, marginTop: 18 }}
          />
          {sub.visual === 'phase-path' && <PhasePath />}
        </View>
        {/* Pagination dots — the "quick section, almost there" cue. Deepwater
            role: the active dot is a progress marker → aqua current. */}
        <View className="flex-row justify-center" style={{ gap: 8, marginBottom: 20 }}>
          {screen.subScreens.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: i === index ? '#5FD4C1' : '#223140',
              }}
            />
          ))}
        </View>
        <View className="px-8 pb-[52px]">
          <EmissiveCTA label={sub.button} onPress={advance} />
        </View>
      </View>
    </ScreenFade>
  );
}

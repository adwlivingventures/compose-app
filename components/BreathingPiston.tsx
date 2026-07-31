import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { CONDITIONING_PHASES } from './BreathingOrb';

/**
 * BreathingPiston — the animated diagram for the Somatic Primer's step 2.
 *
 * The primer's cylinder metaphor, drawn and moving: torso walls in flat
 * line strokes, a copper diaphragm line that descends over the real
 * 4-second inhale and recoils over the 6-second exhale, and the pelvic
 * floor arc yielding downward beneath it. Words teach the concept; a
 * moving image teaches the *rate* — most men push the drop too fast, and
 * pacing is the part prose can't carry. Timings come from
 * CONDITIONING_PHASES so the diagram rehearses exactly the cycle the orb
 * will pace ninety seconds later.
 */

const INHALE_MS = CONDITIONING_PHASES[0].durationMs;
const EXHALE_MS = CONDITIONING_PHASES[1].durationMs;

const W = 220;
const H = 200;

export default function BreathingPiston() {
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drop, {
          toValue: 1,
          duration: INHALE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drop, {
          toValue: 0,
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const diaphragmShift = drop.interpolate({ inputRange: [0, 1], outputRange: [0, 36] });
  const pelvicShift = drop.interpolate({ inputRange: [0, 1], outputRange: [0, 11] });

  return (
    <View style={{ width: W, height: H }} className="self-center">
      {/* Torso cylinder — static walls and shoulder line, flat 1px-family
          strokes per the Ember no-shadow language. */}
      <Svg width={W} height={H} style={{ position: 'absolute' }}>
        <Path d={`M 56 26 Q ${W / 2} 12, ${W - 56} 26`} stroke="#223140" strokeWidth={2} fill="none" />
        <Line x1={56} y1={26} x2={56} y2={158} stroke="#223140" strokeWidth={2} />
        <Line x1={W - 56} y1={26} x2={W - 56} y2={158} stroke="#223140" strokeWidth={2} />
      </Svg>

      {/* Diaphragm — descends on the inhale, recoils on the exhale. */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 52,
          left: 0,
          right: 0,
          transform: [{ translateY: diaphragmShift }],
        }}
      >
        <Svg width={W} height={26}>
          <Path
            d={`M 62 6 Q ${W / 2} 22, ${W - 62} 6`}
            stroke="#5FD4C1"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Text
          className="text-faint text-[10px]"
          style={{ position: 'absolute', left: W - 52, top: 2 }}
        >
          diaphragm
        </Text>
      </Animated.View>

      {/* Pelvic floor — the arc yields downward as the breath presses. */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 148,
          left: 0,
          right: 0,
          transform: [{ translateY: pelvicShift }],
        }}
      >
        <Svg width={W} height={26}>
          <Path
            d={`M 62 6 Q ${W / 2} 20, ${W - 62} 6`}
            stroke="#5FD4C1"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
        </Svg>
        <Text
          className="text-faint text-[10px]"
          style={{ position: 'absolute', left: W - 52, top: 2 }}
        >
          pelvic floor
        </Text>
      </Animated.View>
    </View>
  );
}

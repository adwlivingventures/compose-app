// B-25/A-29 — Generating: the Ember gathers behind the progress ring as the
// staged checklist ticks (coherence ramps with progress). Tick cadence per
// spec: two fast, one slow, fast; the final item takes longest. Soft haptic
// per tick. Ending (founder review 2026-07-10): the old particle re-assembly
// finale read as a rendering error on device — replaced with the ring
// completing, a settled beat, and a clean whole-screen exhale into the
// results. No state where anything looks broken.

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import type { GeneratingScreen as GeneratingDescriptor } from '../../content/onboarding/types';
import { acknowledge, seal } from '../../services/haptics';
import { EASING } from '../../theme/emberDusk';
import Ember from '../ember/Ember';
import { ScreenFade } from './archetypes';

// Varied cadence (ms from mount): two fast, one slow, fast, final longest.
const TICK_AT = [700, 1300, 2700, 3300];
const COMPLETE_AT = 5300;
const SETTLE_MS = 700; // ring full + all ticks visible before the exhale
const FADE_MS = 500;

export default function Generating({
  screen,
  score,
  onComplete,
}: {
  screen: GeneratingDescriptor;
  /** Composure Score — drives the field's final coherence. */
  score: number;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [ticked, setTicked] = useState(0);
  const done = useRef(false);
  const exhale = useRef(new Animated.Value(1)).current;

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(exhale, {
      toValue: 0,
      duration: FADE_MS,
      easing: Easing.bezier(...EASING.breathOut),
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TICK_AT.forEach((at, i) => {
      timers.push(
        setTimeout(() => {
          setTicked(i + 1);
          acknowledge();
        }, at),
      );
    });
    timers.push(
      setTimeout(() => {
        setTicked(screen.checklist.length);
        seal(); // phase completion — the map is sequenced
      }, COMPLETE_AT),
    );
    timers.push(setTimeout(finish, COMPLETE_AT + SETTLE_MS));
    // ~60fps so the ring glides rather than stepping (founder review
    // 2026-07-13). Same total duration; smaller, more frequent increments.
    const TICK_MS = 16;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (COMPLETE_AT / TICK_MS), 100));
    }, TICK_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size = 190;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <ScreenFade>
      <Animated.View
        className="flex-1 items-center justify-center bg-ground px-8"
        style={{ opacity: exhale }}
      >
        {/* Status header (added 2026-07-13) — names what's happening while the
            ring fills, so the screen reads as active analysis, not just a
            number climbing. */}
        <Text
          className="font-serif-regular text-ink text-center"
          style={{ fontSize: 20, marginBottom: 26 }}
        >
          Analyzing your responses
        </Text>
        <View style={{ width: size, height: size }} className="items-center justify-center">
          {/* The Ember gathers as the map computes; coherence follows progress,
              settling toward the score's own coherence at the end. */}
          <View pointerEvents="none" style={{ position: 'absolute', alignSelf: 'center' }}>
            <Ember
              state="generating"
              coherence={0.25 + (progress / 100) * (0.35 + (score / 100) * 0.2)}
              size={300}
              opacity={0.55}
            />
          </View>
          <Svg
            width={size}
            height={size}
            style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
          >
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#182430"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Deepwater role: progress fill → aqua current. */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#5FD4C1"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </Svg>
          <Text className="font-serif-light text-ink" style={{ fontSize: 38 }}>
            {Math.round(progress)}%
          </Text>
        </View>

        <View className="mt-9 self-stretch" style={{ gap: 10 }}>
          {screen.checklist.map((item, i) => {
            const isTicked = i < ticked;
            const isLast = i === screen.checklist.length - 1;
            return (
              <View key={item} className="flex-row items-center" style={{ gap: 10 }}>
                <View style={{ width: 14, alignItems: 'center' }}>
                  {/* Deepwater role: checklist ticks are progress → aqua. */}
                  {isTicked && !isLast ? (
                    <Check size={13} color="#5FD4C1" strokeWidth={2.5} />
                  ) : (
                    <View
                      className="rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        backgroundColor: isTicked ? '#5FD4C1' : '#2A3A4A',
                      }}
                    />
                  )}
                </View>
                <Text
                  className={isTicked ? 'text-body' : 'text-faint'}
                  style={{ fontSize: 12.5, fontWeight: '300' }}
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </ScreenFade>
  );
}

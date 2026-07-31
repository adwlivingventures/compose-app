import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Anchor, Check, Map, Play, TrendingUp, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { localDateString, useProtocol } from '../context/ProtocolContext';
import { TRAINING_ITEMS } from '../content/training';
import { DEEPWATER, TODAY_RING } from '../theme/deepwater';

/**
 * Deepwater tab bar — five tabs, Today raised at center (founder ruling
 * 2026-07-25; concept: tabbar_concept.html; spec: claude/DEEPWATER-FLOW-MAP.md §3).
 *
 * Discipline rules encoded here, not left to taste:
 * - The center node is the ONLY luminous object in the bar; flanking tabs
 *   absorb (no active accent-tint — active state is ink, not color).
 * - The thin ring around the node is today's session: five segments, one per
 *   Training step. Mid-day it is a quiet open loop visible from any tab.
 * - Sealed day: the ring completes in ember and the glow turns OFF — the app
 *   stops asking. No badges, no red dots, ever.
 */

const NODE = 56;
const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
const SEGMENTS = 5;
/** Five segments with small gaps, QUITTR-legible at 56px. */
const SEG_DASH = `${RING_C / SEGMENTS - 3} 3`;

interface TabRoute {
  key: string;
  name: string;
}

/** Minimal structural typing of the react-navigation tabBar props we use —
 *  avoids a direct dependency on @react-navigation/bottom-tabs internals. */
export interface DeepwaterTabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (e: { type: string; target?: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
  };
}

const SIDE_TABS: Record<string, { label: string; Icon: typeof Map }> = {
  protocol: { label: 'Protocol', Icon: Map },
  cbst: { label: 'Steady', Icon: Anchor },
  progress: { label: 'Baseline', Icon: TrendingUp },
  profile: { label: 'You', Icon: UserRound },
};

function TodayNode({
  focused,
  sealed,
  stepsDone,
  onPress,
}: {
  focused: boolean;
  sealed: boolean;
  /** 0–5 Training steps completed today (ring fill). */
  stepsDone: number;
  onPress: () => void;
}) {
  const fill = Math.min(Math.max(stepsDone, 0), SEGMENTS) / SEGMENTS;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={
        sealed ? 'Today — complete. The day is sealed.' : "Today — begin today's session"
      }
      className="items-center w-16 -mt-5"
      hitSlop={8}
    >
      <View style={{ width: NODE, height: NODE }} className="items-center justify-center">
        <Svg width={NODE} height={NODE} style={{ position: 'absolute' }}>
          {/* segmented track */}
          <Circle
            cx={NODE / 2}
            cy={NODE / 2}
            r={RING_R}
            fill="none"
            stroke={sealed ? TODAY_RING.sealed : TODAY_RING.track}
            strokeWidth={2}
            strokeDasharray={SEG_DASH}
            transform={`rotate(-90 ${NODE / 2} ${NODE / 2})`}
          />
          {/* aqua progress arc — only while the day is open */}
          {!sealed && fill > 0 && (
            <Circle
              cx={NODE / 2}
              cy={NODE / 2}
              r={RING_R}
              fill="none"
              stroke={TODAY_RING.fill}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={`${RING_C * fill} ${RING_C * (1 - fill)}`}
              transform={`rotate(-90 ${NODE / 2} ${NODE / 2})`}
            />
          )}
        </Svg>
        {sealed ? (
          /* Sealed: matte dark core, ember hairline, no glow — the app rests. */
          <View
            className="items-center justify-center rounded-full bg-surface-deep"
            style={{ width: 44, height: 44, borderWidth: 1, borderColor: TODAY_RING.sealed }}
          >
            <Check size={19} color={DEEPWATER.ember} strokeWidth={2} />
          </View>
        ) : (
          /* Open day: the one luminous object in the bar. */
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: DEEPWATER.accent,
              shadowColor: DEEPWATER.accent,
              shadowOpacity: 0.55,
              shadowRadius: 11,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            }}
          >
            <Play size={19} color={DEEPWATER.onAccent} fill={DEEPWATER.onAccent} strokeWidth={0} />
          </View>
        )}
      </View>
      <Text
        className={`text-[10px] mt-1.5 tracking-wide ${sealed ? 'text-ember' : 'text-accent'}`}
      >
        Today
      </Text>
    </Pressable>
  );
}

export default function DeepwaterTabBar({ state, navigation }: DeepwaterTabBarProps) {
  const insets = useSafeAreaInsets();
  const { activeDay, lastCompletedDate, completedDays } = useProtocol();
  const sealed = lastCompletedDate === localDateString();
  // Ring fill = today's Training steps completed (persisted per-day by the
  // session via updateDailyTraining). Mid-session, the partial ring is the
  // open loop visible from any tab — the quiet pull back to the work.
  const training = completedDays[activeDay]?.training ?? {};
  const stepsDone = TRAINING_ITEMS.filter((item) => training[item.key]).length;

  const onPress = (route: TabRoute, focused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View
      className="flex-row items-end justify-between bg-tab border-t border-line-soft px-5"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10 }}
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        if (route.name === 'index') {
          return (
            <TodayNode
              key={route.key}
              focused={focused}
              sealed={sealed}
              stepsDone={stepsDone}
              onPress={() => onPress(route, focused)}
            />
          );
        }
        const side = SIDE_TABS[route.name];
        if (!side) return null;
        const { label, Icon } = side;
        return (
          <Pressable
            key={route.key}
            onPress={() => onPress(route, focused)}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            className="items-center w-14 pt-2"
            hitSlop={8}
          >
            {/* Flanking tabs absorb: active = ink, never accent. */}
            <Icon size={21} color={focused ? '#B9C6CF' : '#53626E'} strokeWidth={1.5} />
            <Text className={`text-[10px] mt-1.5 tracking-wide ${focused ? 'text-body' : 'text-faint'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

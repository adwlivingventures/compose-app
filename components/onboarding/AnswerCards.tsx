// Answer cards — the selection treatment of Ember Dusk v2.
// Selected cards look LIT, not highlighted: 1px warm border + interior glow
// rising from the bottom edge + soft outer bloom (Addendum §2). On single-
// select, the chosen card glows while the others dim to 60% over 250ms (the
// "decision made" cue — no checkmark animation), then the flow advances after
// the founder-ruled 450ms hold. Entrances stagger 40ms with a 12px rise.

import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import type { Option } from '../../content/onboarding/types';
import { DURATION, EASING, SELECTION } from '../../theme/emberDusk';
import { Easing } from 'react-native';

const breathOut = Easing.bezier(...EASING.breathOut);

/** Interior glow rising from the card's bottom edge (selected state). */
function InteriorGlow() {
  return (
    <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-1/2">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="cardGlow" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#C89B6D" stopOpacity="0.15" />
            <Stop offset="1" stopColor="#C89B6D" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#cardGlow)" />
      </Svg>
    </View>
  );
}

function StaggeredEntrance({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: DURATION.microMax,
      delay: index * DURATION.answerStagger,
      easing: breathOut,
      useNativeDriver: true,
    }).start();
  }, [t, index]);
  return (
    <Animated.View
      style={{
        opacity: t,
        transform: [
          {
            translateY: t.interpolate({
              inputRange: [0, 1],
              outputRange: [DURATION.answerRisePx, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function OptionCard({
  label,
  selected,
  dimmed,
  control,
  onPress,
  accessibilityRole,
}: {
  label: string;
  selected: boolean;
  dimmed: boolean;
  control: 'radio' | 'checkbox';
  onPress: () => void;
  accessibilityRole: 'radio' | 'checkbox';
}) {
  const dim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(dim, {
      toValue: dimmed ? SELECTION.dimOthersTo : 1,
      duration: SELECTION.dimMs,
      easing: breathOut,
      useNativeDriver: true,
    }).start();
  }, [dimmed, dim]);

  return (
    <Animated.View
      style={{
        opacity: dim,
        ...(selected
          ? {
              shadowColor: '#C89B6D',
              shadowOpacity: 0.18,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            }
          : null),
      }}
    >
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={label}
        accessibilityState={{ selected, checked: selected }}
        onPress={onPress}
        className="flex-row items-center overflow-hidden rounded-2xl bg-surface"
        style={{
          gap: 14,
          padding: selected ? 17 : 18,
          borderWidth: selected ? 1 : 0,
          borderColor: SELECTION.border,
        }}
      >
        {selected && <InteriorGlow />}
        {control === 'radio' ? (
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 18,
              height: 18,
              borderWidth: 1.5,
              borderColor: selected ? '#C89B6D' : '#2E3B5E',
            }}
          >
            {selected && <View className="h-2 w-2 rounded-full bg-accent" />}
          </View>
        ) : (
          <View
            className="items-center justify-center"
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              borderWidth: 1.5,
              borderColor: selected ? '#C89B6D' : '#2E3B5E',
              backgroundColor: selected ? '#C89B6D' : 'transparent',
            }}
          >
            {selected && <Check size={12} color="#0C0B09" strokeWidth={3} />}
          </View>
        )}
        <Text
          className="flex-1 text-ink"
          style={{ fontSize: 15, fontWeight: selected ? '400' : '300', lineHeight: 21 }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Single-select list. Auto-advances after the acknowledgment hold; a second
 * tap during the hold cannot queue a double advance.
 */
export function SingleSelectList({
  options,
  initialValue,
  onAdvance,
}: {
  options: Option[];
  /** Restores the prior answer when the user navigates back. */
  initialValue?: string;
  onAdvance: (value: string) => void;
}) {
  const [selected, setSelected] = useState<string | undefined>(initialValue);
  const committed = useRef(false);

  const choose = (value: string) => {
    if (committed.current) return;
    committed.current = true;
    setSelected(value);
    setTimeout(() => onAdvance(value), SELECTION.holdMs);
  };

  return (
    <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
      {options.map((opt, i) => (
        <StaggeredEntrance key={opt.value} index={i}>
          <OptionCard
            label={opt.label}
            selected={selected === opt.value}
            dimmed={committed.current && selected !== opt.value}
            control="radio"
            accessibilityRole="radio"
            onPress={() => choose(opt.value)}
          />
        </StaggeredEntrance>
      ))}
    </View>
  );
}

/** Multi-select list (flat or grouped). Parent owns state; Continue button required. */
export function MultiSelectList({
  options,
  groups,
  values,
  onToggle,
}: {
  options: Option[];
  groups?: { label: string; options: Option[] }[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  let cardIndex = 0;
  const renderOption = (opt: Option) => {
    const i = cardIndex++;
    return (
      <StaggeredEntrance key={opt.value} index={i}>
        <OptionCard
          label={opt.label}
          selected={values.includes(opt.value)}
          dimmed={false}
          control="checkbox"
          accessibilityRole="checkbox"
          onPress={() => onToggle(opt.value)}
        />
      </StaggeredEntrance>
    );
  };

  if (groups?.length) {
    return (
      <View style={{ gap: 18 }}>
        {groups.map((group) => (
          <View key={group.label} style={{ gap: 10 }}>
            <Text
              className="text-body"
              style={{ fontSize: 10, fontWeight: '300', letterSpacing: 2 }}
            >
              {group.label}
            </Text>
            {group.options.map(renderOption)}
          </View>
        ))}
      </View>
    );
  }
  return <View style={{ gap: 10 }}>{options.map(renderOption)}</View>;
}

// Input-family archetypes: text (name), wheel (age), discrete slider (libido),
// and the multi-select screen (flat, grouped, and goals-with-free-text).
// Layout: QuestionShell; primary action: EmissiveCTA.

import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  MultiSelectScreen as MultiSelectDescriptor,
  SliderInputScreen as SliderDescriptor,
  TextInputScreen as TextDescriptor,
  WheelInputScreen as WheelDescriptor,
} from '../../content/onboarding/types';
import EmissiveCTA from './EmissiveCTA';
import QuestionShell from './QuestionShell';
import { MultiSelectList } from './AnswerCards';

export function NameInput({
  screen,
  initialValue = '',
  onSubmit,
}: {
  screen: TextDescriptor;
  initialValue?: string;
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  return (
    <View className="flex-1">
      <QuestionShell question={screen.question} subText={screen.subText}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={screen.placeholder}
          placeholderTextColor="#4B5563"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => trimmed && onSubmit(trimmed)}
          accessibilityLabel={screen.question}
          className="rounded-2xl bg-surface px-5 text-ink"
          style={{ paddingVertical: 18, fontSize: 16, fontWeight: '300' }}
        />
      </QuestionShell>
      <View className="px-6 pb-4">
        <EmissiveCTA
          label={screen.button}
          disabled={trimmed.length === 0}
          onPress={() => onSubmit(trimmed)}
        />
      </View>
    </View>
  );
}

const ITEM_HEIGHT = 56;
const WHEEL_PADDING = ITEM_HEIGHT * 2;

export function AgeWheel({
  screen,
  initialValue = 30,
  onSubmit,
}: {
  screen: WheelDescriptor;
  initialValue?: number;
  onSubmit: (age: number) => void;
}) {
  const ages = Array.from(
    { length: screen.max - screen.min + 1 },
    (_, i) => screen.min + i,
  );
  const [selected, setSelected] = useState(initialValue);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelected(ages[Math.max(0, Math.min(index, ages.length - 1))]);
  };

  return (
    <View className="flex-1">
      <View className="flex-1">
        <QuestionShell question={screen.question}>
          <View style={{ height: ITEM_HEIGHT * 5 }} className="overflow-hidden">
            <View
              pointerEvents="none"
              style={{ top: WHEEL_PADDING, height: ITEM_HEIGHT }}
              className="absolute inset-x-0 z-10 rounded-lg border-y border-accent/40 bg-accent/5"
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentOffset={{ x: 0, y: (initialValue - screen.min) * ITEM_HEIGHT }}
              onMomentumScrollEnd={onMomentumEnd}
              contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
            >
              {ages.map((age) => (
                <View
                  key={age}
                  style={{ height: ITEM_HEIGHT }}
                  className="items-center justify-center"
                >
                  <Text
                    className={
                      age === selected
                        ? 'font-serif-light text-3xl text-ink'
                        : 'text-xl text-faint'
                    }
                  >
                    {age}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </QuestionShell>
      </View>
      <View className="px-6 pb-4">
        <EmissiveCTA label={screen.button} onPress={() => onSubmit(selected)} />
      </View>
    </View>
  );
}

/**
 * Discrete 1–10 scale (B-11 libido). Ten tappable notches (44px targets) with
 * anchor labels — a slider without a thumb-drag dependency, and every value an
 * explicit choice.
 */
export function ScaleSlider({
  screen,
  initialValue,
  onSubmit,
}: {
  screen: SliderDescriptor;
  initialValue?: number;
  onSubmit: (value: number) => void;
}) {
  const [value, setValue] = useState<number | null>(initialValue ?? null);
  const notches = Array.from(
    { length: screen.max - screen.min + 1 },
    (_, i) => screen.min + i,
  );
  return (
    <View className="flex-1">
      <QuestionShell question={screen.question}>
        <View className="flex-row" style={{ gap: 6 }}>
          {notches.map((n) => {
            const active = value !== null && n <= value;
            const isValue = value === n;
            return (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`${n} of ${screen.max}`}
                accessibilityState={{ selected: isValue }}
                onPress={() => setValue(n)}
                className="flex-1 items-center"
                style={{ paddingVertical: 10 }}
              >
                <View
                  className={`w-full rounded-full ${active ? 'bg-accent' : 'bg-surface'}`}
                  style={{
                    height: 24,
                    borderWidth: isValue ? 0 : 1,
                    borderColor: '#2E3B5E',
                    opacity: active && !isValue ? 0.55 : 1,
                  }}
                />
                <Text
                  className={isValue ? 'font-serif-regular text-ink' : 'text-faint'}
                  style={{ fontSize: isValue ? 15 : 11, marginTop: 8 }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-3 flex-row justify-between">
          <Text className="text-muted" style={{ fontSize: 11, fontWeight: '300', flex: 1 }}>
            {screen.anchorLow}
          </Text>
          <Text
            className="text-right text-muted"
            style={{ fontSize: 11, fontWeight: '300', flex: 1 }}
          >
            {screen.anchorHigh}
          </Text>
        </View>
      </QuestionShell>
      <View className="px-6 pb-4">
        <EmissiveCTA
          label={screen.button}
          disabled={value === null}
          onPress={() => value !== null && onSubmit(value)}
        />
      </View>
    </View>
  );
}

export function MultiSelect({
  screen,
  initialValues = [],
  initialFreeText = '',
  onSubmit,
}: {
  screen: MultiSelectDescriptor;
  initialValues?: string[];
  initialFreeText?: string;
  onSubmit: (values: string[], freeText?: string) => void;
}) {
  const [values, setValues] = useState<string[]>(initialValues);
  const [freeText, setFreeText] = useState(initialFreeText);
  const toggle = (v: string) =>
    setValues((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  // Goals feed the paywall echo, the dismiss screen, and Day 1 — an empty
  // lock-in would leave those surfaces mute.
  const requiresChoice = screen.id === 'goals';
  const canContinue = !requiresChoice || values.length > 0 || freeText.trim().length > 0;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <QuestionShell question={screen.question} subText={screen.subText}>
          {screen.tapPrompt ? (
            <Text
              className="text-ink"
              style={{ fontSize: 15, fontWeight: '300', marginBottom: 18 }}
            >
              {screen.tapPrompt}
            </Text>
          ) : null}
          <MultiSelectList
            options={screen.options}
            groups={screen.groups}
            values={values}
            onToggle={toggle}
          />
          {screen.freeText && (
            <TextInput
              value={freeText}
              onChangeText={setFreeText}
              placeholder={screen.freeText.prompt}
              placeholderTextColor="#4B5563"
              multiline
              accessibilityLabel={screen.freeText.prompt}
              className="mt-4 rounded-2xl bg-surface px-5 font-serif-italic text-ink"
              style={{ paddingVertical: 16, fontSize: 15, minHeight: 76, textAlignVertical: 'top' }}
            />
          )}
        </QuestionShell>
      </ScrollView>
      <View className="px-6 pb-4">
        <EmissiveCTA
          label={screen.button}
          disabled={!canContinue}
          onPress={() => onSubmit(values, freeText.trim() || undefined)}
        />
      </View>
    </View>
  );
}

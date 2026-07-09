// B-41/A-41 — Day Zero: signature + purchase. Layout truth: 3a reference
// (typographic — dusk radial, no hero). The CTA stays inert until the first
// name is typed (effort justification: the purchase completes a promise
// already made). Purchase fires HERE, never on the paywall. The signature is
// saved before purchase so an interrupted transaction never loses the oath.
// The ink-glow trail + SEAL haptic land with the craft layer (steps 5–6).

import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import type { SignatureScreen as DayZeroDescriptor } from '../../content/onboarding/types';
import type { PriceStrings } from './Paywall';
import EmissiveCTA from './EmissiveCTA';
import { ScreenFade } from './archetypes';
import { DuskRadial, Eyebrow } from './chrome';

export default function DayZero({
  screen,
  prices,
  purchasing,
  onSignAndBegin,
  onBack,
}: {
  screen: DayZeroDescriptor;
  prices: PriceStrings | null;
  purchasing: boolean;
  onSignAndBegin: (signedName: string) => void;
  onBack?: () => void;
}) {
  const [signature, setSignature] = useState('');
  const signed = signature.trim().length > 0;

  const buttonLabel = prices
    ? screen.button.replace('{price}', prices.price)
    : screen.button.replace(' — {price}', '');

  const chips = screen.chips
    .map((chip) =>
      chip.includes('{pricePerDay}')
        ? prices?.pricePerDay
          ? chip.replace('{pricePerDay}', prices.pricePerDay)
          : null
        : chip,
    )
    .filter((c): c is string => c !== null);

  return (
    <ScreenFade>
      <View className="flex-1 bg-ground">
        <DuskRadial intensity={0.14} />
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={14}
            className="absolute z-10"
            style={{ top: 58, left: 24 }}
          >
            <ChevronLeft size={17} color="#4B5563" strokeWidth={1.5} />
          </Pressable>
        )}
        <ScrollView
          className="flex-1 px-8"
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Eyebrow center>{screen.eyebrow}</Eyebrow>
          <Text
            className="text-center font-serif-regular text-ink"
            style={{ fontSize: 27, lineHeight: 35, marginTop: 18 }}
          >
            {screen.headline}
          </Text>

          <View className="mt-7 rounded-2xl bg-surface" style={{ paddingVertical: 24, paddingHorizontal: 22 }}>
            <Text
              className="text-center font-serif-italic text-ink"
              style={{ fontSize: 16.5, lineHeight: 26 }}
            >
              "{screen.oath}"
            </Text>
          </View>

          <View className="mt-6">
            <TextInput
              value={signature}
              onChangeText={setSignature}
              placeholder={screen.signaturePrompt}
              placeholderTextColor="#4B5563"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!purchasing}
              accessibilityLabel={screen.signaturePrompt}
              className="font-serif-italic text-accent-deep"
              style={{
                fontSize: 22,
                paddingVertical: 9,
                paddingHorizontal: 4,
                borderBottomWidth: 1,
                borderBottomColor: '#2E3B5E',
              }}
            />
            <Text
              className="text-center text-faint"
              style={{ fontSize: 10, fontWeight: '300', letterSpacing: 0.5, marginTop: 8 }}
            >
              {screen.signatureCaption.toUpperCase()}
            </Text>
          </View>

          <View className="mt-6 flex-row justify-center" style={{ gap: 8 }}>
            {chips.map((chip) => (
              <View
                key={chip}
                className="rounded-full bg-surface"
                style={{ paddingVertical: 6, paddingHorizontal: 13 }}
              >
                <Text className="text-body" style={{ fontSize: 11, fontWeight: '300' }}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="px-8 pb-[52px]">
          <EmissiveCTA
            label={buttonLabel}
            disabled={!signed}
            loading={purchasing}
            onPress={() => signed && onSignAndBegin(signature.trim())}
            accessibilityHint={signed ? undefined : 'Sign your first name above to enable'}
          />
          <Text
            className="text-center text-faint"
            style={{ fontSize: 10.5, fontWeight: '300', marginTop: 12 }}
          >
            {screen.subLine}
          </Text>
        </View>
      </View>
    </ScreenFade>
  );
}

import React from 'react';
import { Text, TextInput, View } from 'react-native';

/**
 * The Day Zero commitment card (E07) — italic oath + typed signature.
 *
 * Shared between the signature paywall arm (signs *before* purchase:
 * effort justification, the purchase completes a promise already made) and
 * the post-purchase /oath screen for the diagnosis arm (signs *after*
 * purchase: the signature converts the transaction into a promise). One
 * component so the oath copy can never drift between the two.
 */

export const OATH_TEXT =
  '"For the next 75 days I will give this fifteen minutes a day. Not to perform better — to stop performing at all."';

export default function CommitmentCard({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="bg-surface border border-line rounded-[18px] p-6">
      {/* Accent unification (2026-07-25): the oath is an identity line — the
          serif italic IS the register; it reads in ink, never accent. */}
      <Text className="text-ink text-[18px] leading-[30px] font-serif-italic">
        {OATH_TEXT}
      </Text>
      <TextInput
        className="text-ink text-2xl font-serif-italic mt-7 pb-1.5"
        style={{ borderBottomWidth: 1, borderBottomColor: '#2A3A4A' }}
        placeholder="Sign your first name"
        placeholderTextColor="#53626E"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />
      <Text className="text-dim text-[11px] mt-1.5">Signed on this device · seen by no one</Text>
    </View>
  );
}

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { OATH_TEXT } from './CommitmentCard';

/**
 * Phase-transition interstitials (Days 26 / 51) — shown once, on arrival,
 * before the dashboard.
 *
 * Two jobs. First, mark the threshold: 25 days of identical daily loops
 * blur, and an unmarked milestone is a wasted reinforcement — naming the
 * phase shift re-frames the same ten minutes as new work, which is
 * mid-program novelty landed exactly in the relapse window. Second, the
 * signature resurfacing: the Day Zero oath read back at Day 26/51 is
 * consistency leverage (he keeps a promise he can see himself making) —
 * this IS the planned Day-25/50 signature mechanic.
 *
 * Register: serif, three sentences, no stats, no hype. The user did the
 * work; the screen just says so.
 */

export interface SignatureData {
  name: string;
  signedAt: string;
}

const COPY: Record<2 | 3, { eyebrow: string; headline: string; body: string; note?: string }> = {
  2: {
    eyebrow: 'Day 26 · Phase II',
    headline: 'Phase I is complete. The reset is holding.',
    body:
      'Twenty-five days of down-regulation have built a floor. Phase II works higher — ' +
      'staying present as intensity rises, instead of stepping out to watch.',
    note: 'The Somatic Sandbox is now open in your Library.',
  },
  3: {
    eyebrow: 'Day 51 · Phase III',
    headline: 'Phase II is complete. Presence under intensity is holding.',
    body:
      'The last twenty-five days are consolidation — this stops being a program you follow ' +
      'and becomes how you operate. The fifteen minutes stay the same; what they anchor now is ' +
      'who you are.',
    // 2026-08-03 (build order 0.4): Day 51 opens the two most identity-relevant
    // practices in the product and previously announced neither — perceived
    // progression only works if it is perceived. Same absorb treatment as the
    // Day-26 Sandbox note (never a second aqua element on a ceremony).
    note: 'Two practices open in your Library today: Identity Rehearsal, and the Evening Evidence Review.',
  },
};

export default function PhaseTransition({
  phase,
  signature,
  onContinue,
}: {
  phase: 2 | 3;
  signature: SignatureData | null;
  onContinue: () => void;
}) {
  const copy = COPY[phase];
  const signedDate = signature
    ? new Date(signature.signedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 96,
        paddingBottom: 40,
      }}
    >
      {/* Deepwater role ruling: the phase name is an identity mark — ember,
          not accent. Ember use 1 of 2 on this ceremony surface. */}
      <Text className="text-ember text-[11px] font-semibold uppercase tracking-[0.28em]">
        {copy.eyebrow}
      </Text>
      <Text className="text-ink text-[27px] font-serif-regular leading-9 mt-2.5">
        {copy.headline}
      </Text>
      <Text className="text-body text-[14.5px] leading-6 mt-4">{copy.body}</Text>

      {signature && (
        <View className="bg-surface border border-line rounded-[18px] p-6 mt-8">
          {/* Deepwater role ruling: the oath read back is the identity line of
              this screen — ember-bright serif italic (ember use 2 of 2). The
              signature stays ink italic, per grammar. */}
          <Text className="text-ember-bright text-[15px] leading-[26px] font-serif-italic">
            {OATH_TEXT}
          </Text>
          <Text className="text-ink text-2xl font-serif-italic mt-6">{signature.name}</Text>
          <Text className="text-dim text-[11px] mt-1.5">
            You signed this on Day Zero — {signedDate}.
          </Text>
        </View>
      )}

      {copy.note && (
        // Deepwater role ruling: the unlock notice absorbs (body) — a ceremony
        // surface carries at most one aqua element, and that is the CTA below.
        <Text className="text-body text-[12.5px] mt-6">{copy.note}</Text>
      )}

      <View className="flex-1" />

      {/* Deepwater: the single aqua element on this ceremony — the forward action. */}
      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Continue"
        className="bg-accent rounded-2xl py-[17px] items-center mt-10"
      >
        <Text className="text-on-accent font-bold text-base">Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

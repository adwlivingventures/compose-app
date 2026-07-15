import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { requestRating } from '../services/rating';

/**
 * The rating ask — one restrained screen, reused post-purchase and after
 * the Day 2/14/30/40/75 completions (services/rating.ts owns the schedule).
 *
 * Voice rules apply hard here: no begging, no stars-emoji theater, no
 * "love the app?" chirp. The honest case is stated once — ratings decide
 * whether other men ever find this — and "Not now" carries zero guilt.
 * Tapping Rate fires the native prompt and retires every future ask.
 */
export default function RatingAsk({
  eyebrow,
  onDone,
}: {
  eyebrow: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const rate = async () => {
    if (busy) return;
    setBusy(true);
    await requestRating();
    onDone();
  };

  return (
    <View className="flex-1 bg-ground px-7 justify-center">
      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        {eyebrow}
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular leading-9 mt-2.5">
        A word from you carries further than anything we could say.
      </Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-3">
        Most men dealing with this never find a program like it. Ratings decide who does.
        If Compose has earned it, a rating takes ten seconds. If not yet, skip this.
      </Text>

      <TouchableOpacity
        onPress={rate}
        disabled={busy}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[17px] items-center mt-8"
      >
        <Text className="text-on-accent font-bold text-base">Rate Compose</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDone}
        disabled={busy}
        activeOpacity={0.7}
        className="items-center py-4"
      >
        <Text className="text-muted text-[13px] font-semibold">Not now</Text>
      </TouchableOpacity>
    </View>
  );
}

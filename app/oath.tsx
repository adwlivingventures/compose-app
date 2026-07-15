import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import CommitmentCard from '../components/CommitmentCard';
import { LocalStore } from '../services/storage';

/**
 * Day Zero oath — post-purchase, diagnosis-arm users only.
 *
 * Arm B signs at the paywall (E07). Arm A pays without the commitment
 * device, so this screen closes the gap immediately after purchase: 100%
 * of users hold `@signature_data`, which the Day-26/51 phase-transition
 * interstitials resurface ("You signed this on Day Zero."). Signing after
 * paying runs consistency the other direction — the signature converts a
 * transaction into a promise, which is what the resurfacing moments need
 * to point back at. No skip, no back, by design: an optional oath is a
 * form field; an unavoidable one is a threshold.
 *
 * Flow: purchase → here (only if no signature yet) → /discretion?intro=1.
 */
export default function OathScreen() {
  const router = useRouter();
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);
  const signed = signature.trim().length > 0;

  const handleContinue = async () => {
    if (!signed || saving) return;
    setSaving(true);
    await LocalStore.setItem('@signature_data', {
      name: signature.trim(),
      signedAt: new Date().toISOString(),
    });
    router.replace('/discretion?intro=1');
  };

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Day zero
      </Text>
      <Text className="text-ink text-[27px] font-serif-regular leading-9 mt-2.5">
        The program is yours. Now it needs your word.
      </Text>
      <Text className="text-muted text-[13px] leading-5 mt-3">
        Seventy-five days, fifteen minutes a day. The men who finish are the ones who signed on
        before Day 1 asked anything of them.
      </Text>

      <View className="mt-6">
        <CommitmentCard value={signature} onChangeText={setSignature} />
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={!signed || saving}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Sign and begin"
        accessibilityHint={signed ? undefined : 'Sign your first name above to enable'}
        accessibilityState={{ disabled: !signed || saving }}
        className={`rounded-2xl py-[19px] items-center mt-6 ${signed ? 'bg-accent' : 'bg-surface-deep'}`}
      >
        <Text className={`font-bold text-base ${signed ? 'text-on-accent' : 'text-faint'}`}>
          Sign & begin
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

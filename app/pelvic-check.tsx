import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import PelvicCheck from '../components/onboarding/PelvicCheck';
import { SCREENS } from '../content/onboarding/screens';
import { LocalStore } from '../services/storage';

/**
 * Pelvic Release Check — the onboarding tension test as a standing Library
 * tool (founder review 2026-07-10: a skipper — or anyone — must be able to
 * run it whenever he wants, not only once at intake). Reuses the exact
 * onboarding module so the measurement stays comparable, and keeps a small
 * local history so repeat checks show the trend. Local-only (§7).
 */

const HISTORY_KEY = '@pelvic_recheck_log';

interface CheckRecord {
  date: string; // ISO
  value: number; // 1–10 release rating
}

const descriptor = SCREENS.find((s) => s.id === 'pelvic-check');

export default function PelvicCheckScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<CheckRecord[]>([]);
  const [justScored, setJustScored] = useState<number | null>(null);

  useEffect(() => {
    LocalStore.getItem<CheckRecord[]>(HISTORY_KEY).then((h) => setHistory(h ?? []));
  }, []);

  const record = async (value: number) => {
    const updated = [{ date: new Date().toISOString(), value }, ...history];
    setHistory(updated);
    setJustScored(value);
    await LocalStore.setItem(HISTORY_KEY, updated);
  };

  if (descriptor?.archetype !== 'interactive-check') return null;

  if (justScored !== null) {
    const previous = history.slice(1, 6);
    return (
      <ScrollView
        className="flex-1 bg-ground"
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 72, paddingBottom: 48 }}
      >
        <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
          Pelvic Release Check
        </Text>
        <Text className="text-ink text-[26px] font-serif-light mt-1.5">
          Release: {justScored} / 10
        </Text>
        <Text className="text-muted text-[13.5px] leading-5 mt-2">
          {justScored >= 8
            ? 'A full release — the floor is doing its job. Keep the daily release work going.'
            : justScored >= 4
            ? 'A partial release. That held tension is trainable — the daily conditioning track works on exactly this.'
            : 'The floor didn’t want to let go. That’s the pattern the daily release work is built to unwind — measure again in a week or two.'}
        </Text>

        {previous.length > 0 && (
          <>
            <Text className="text-muted text-xs font-bold uppercase tracking-widest mt-8 mb-3">
              Earlier checks
            </Text>
            <View className="bg-surface border border-line rounded-2xl overflow-hidden">
              {previous.map((h, i) => (
                <View
                  key={h.date}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    i === previous.length - 1 ? '' : 'border-b border-line-soft'
                  }`}
                >
                  <Text className="text-muted text-xs">
                    {new Date(h.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text className="text-body text-sm">{h.value} / 10</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="bg-accent rounded-2xl py-[17px] items-center mt-9"
        >
          <Text className="text-on-accent font-bold text-base">Done</Text>
        </TouchableOpacity>
        <Text className="text-faint text-xs text-center mt-4">
          Stored on this device only.
        </Text>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-ground" style={{ paddingTop: 44 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 self-start px-6 pb-2"
      >
        <ChevronLeft size={16} color="#6B7280" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>
      <PelvicCheck screen={descriptor} onComplete={record} onSkip={() => router.back()} />
    </View>
  );
}

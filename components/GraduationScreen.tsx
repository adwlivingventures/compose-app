import React from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useDefusionLog } from '../hooks/useDefusionLog';

/**
 * Graduation (E19) — shown once, when Day 75 is complete and no continuation
 * choice has been made yet.
 *
 * The mechanism is endowment, not upsell: every number on this screen is
 * computed from the user's own logs, and his own vault quote is read back
 * to him — the evidence card proves the shift happened before any offer is
 * made. Both exits are framed as wins ("Both are wins." is design-final
 * copy) because a graduation that punishes leaving would convert the whole
 * 75-day identity arc into a subscription trap in the final frame. The
 * export path is a real, dignified exit: his record, his device, his call.
 */

interface GraduationScreenProps {
  /** Attempt the $4.99/mo purchase; resolve true if the entitlement landed. */
  onKeepToolkit: () => Promise<boolean>;
  /** Persist the export choice after a completed share. */
  onExported: () => Promise<void>;
  isProcessing: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GraduationScreen({
  onKeepToolkit,
  onExported,
  isProcessing,
}: GraduationScreenProps) {
  const { completedDays } = useProtocol();
  const { entries } = useDefusionLog();

  // ── Evidence, from the user's own logs ──────────────────────────────────
  const rated = Object.entries(completedDays)
    .filter(([, d]) => d.completed && d.pelvicRating > 0)
    .map(([day, d]) => ({ day: Number(day), rating: d.pelvicRating }))
    .sort((a, b) => a.day - b.day);
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
  const firstWeekAvg = avg(rated.slice(0, 7).map((r) => r.rating));
  const finalWeekAvg = avg(rated.slice(-7).map((r) => r.rating));
  const scoreShift =
    rated.length >= 2 ? `${firstWeekAvg.toFixed(1)}→${finalWeekAvg.toFixed(1)}` : '—';

  const daysCompleted = Object.values(completedDays).filter((d) => d.completed).length;
  const anchors = entries
    .filter((e) => e.ventralAnchor?.trim())
    .map((e) => ({ date: e.date, text: e.ventralAnchor!.trim() }));
  // The earliest anchor — the oldest written proof that the shift is his.
  const quote = [...anchors].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];

  const exportRecord = async () => {
    const lines = [
      'COMPOSE — Personal Record',
      '',
      `Days completed: ${daysCompleted} of 75`,
      `Control score: ${scoreShift === '—' ? 'not logged' : `${scoreShift} (first week → final week)`}`,
      `Anchors written: ${anchors.length}`,
    ];
    if (anchors.length) {
      lines.push('', 'Your anchors, in your own words:');
      for (const anchor of anchors) {
        lines.push(`  ${formatDate(anchor.date)} — "${anchor.text}"`);
      }
    }
    lines.push('', 'This record was generated on your device. Nothing was sent anywhere.');

    const result = await Share.share({ message: lines.join('\n') });
    // A dismissed share sheet is not a decision — only persist the choice
    // when the record actually left through the sheet.
    if (result.action === Share.sharedAction) {
      await onExported();
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 72, paddingBottom: 32, flexGrow: 1 }}
    >
      <Text className="text-accent text-[11px] font-bold uppercase tracking-[0.28em]">
        Day seventy-five
      </Text>
      <Text className="text-ink text-[30px] font-serif-light leading-[39px] mt-2.5">
        The protocol is over.{'\n'}The baseline is yours.
      </Text>

      {/* Evidence card — computed, never asserted */}
      <View className="bg-surface border border-line rounded-[18px] p-5 mt-6">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
          What you built · from your own logs
        </Text>
        <View className="flex-row gap-2.5 mt-3.5">
          {[
            [String(daysCompleted), 'days completed'],
            [scoreShift, 'control score'],
            [String(anchors.length), 'anchors written'],
          ].map(([stat, label]) => (
            <View key={label} className="flex-1 items-center">
              <Text className="text-ink text-[22px] font-serif-light">{stat}</Text>
              <Text className="text-dim text-[10.5px] mt-0.5">{label}</Text>
            </View>
          ))}
        </View>
        {quote && (
          <View className="border-t border-line-soft mt-4 pt-3.5">
            <Text className="text-body text-sm leading-[23px] font-serif-italic">
              "{quote.text}"
            </Text>
            <Text className="text-dim text-[11px] mt-1">— you, {formatDate(quote.date)}</Text>
          </View>
        )}
      </View>

      {/* The offer — both exits are wins, and the copy says so */}
      <View className="bg-surface-deep border border-line-soft rounded-2xl p-[18px] mt-3.5">
        <Text className="text-ink text-sm font-bold">Keep the toolkit within reach</Text>
        <Text className="text-muted text-[12.5px] leading-[18px] mt-1">
          Steady-Me tools, your vault, maintenance tracks, and the log that proves the shift —
          $4.99/mo. Or leave with everything you've learned. Both are wins.
        </Text>
        <View className="flex-row gap-2.5 mt-3.5">
          <TouchableOpacity
            onPress={onKeepToolkit}
            disabled={isProcessing}
            activeOpacity={0.85}
            className="flex-1 bg-accent rounded-xl py-[13px] items-center"
          >
            {isProcessing ? (
              <ActivityIndicator color="#0C0B09" size="small" />
            ) : (
              <Text className="text-on-accent font-bold text-[13.5px]">Keep the toolkit</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={exportRecord}
            disabled={isProcessing}
            activeOpacity={0.8}
            className="flex-1 border border-line rounded-xl py-[13px] items-center"
          >
            <Text className="text-muted font-semibold text-[13.5px]">
              I'm done — export my record
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1" />
      <Text className="text-dim text-xs text-center mt-6">
        Your data stays on this device either way.
      </Text>
    </ScrollView>
  );
}

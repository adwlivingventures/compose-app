import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useDefusionLog } from '../hooks/useDefusionLog';
import { getBaseline, getComposureHistory } from '../services/composureHistory';
import { LocalStore } from '../services/storage';
import { OATH_TEXT } from './CommitmentCard';
import WhyEcho from './WhyEcho';

/**
 * Graduation (E19) — shown once, when Day 75 is complete and no graduation
 * choice has been recorded yet.
 *
 * MODEL V2 NOTE: graduation is now a pure unlock ceremony — a graduating
 * member already owns the Mastery Suite, so no purchase decision belongs at
 * the moment of peak triumph. The full ceremony rewire is deliberately
 * deferred (BUSINESS-MODEL-V2 §4 runway: nobody reaches Day 75 for 75
 * days); until then this screen's purchase path exists only for the
 * lapsed-membership edge and compiles against the membership offering.
 *
 * The mechanism is endowment: every number on this screen is computed from
 * the user's own logs, and his own vault quote is read back to him — the
 * evidence card proves the shift happened. Both exits are framed as wins
 * ("Both are wins." is design-final copy) because a graduation that
 * punishes leaving would convert the whole 75-day identity arc into a
 * subscription trap in the final frame. The export path is a real,
 * dignified exit: his record, his device, his call — retained verbatim as
 * a trust artifact.
 */

interface GraduationScreenProps {
  /**
   * Attempt a membership purchase for the lapsed-membership edge
   * (annual-first per CLAUDE.md §2 Model V2); resolve true if the
   * `membership` entitlement landed.
   */
  onKeepMembership: (term: 'annual' | 'monthly') => Promise<boolean>;
  /** Active member: skip purchase and enter Mastery directly. */
  onEnterMastery: () => Promise<void>;
  /** Persist the export choice after a completed share. */
  onExported: () => Promise<void>;
  isProcessing: boolean;
  /** When true, graduation is unlock-only — no purchase UI. */
  hasMembership: boolean;
  /** Localized price strings from the RC offering — null until it loads. */
  annualPrice: string | null;
  monthlyPrice: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GraduationScreen({
  onKeepMembership,
  onEnterMastery,
  onExported,
  isProcessing,
  hasMembership,
  annualPrice,
  monthlyPrice,
}: GraduationScreenProps) {
  const { completedDays } = useProtocol();
  const { entries } = useDefusionLog();

  // 2026-08-03 (build order 4.1): the ceremony now carries the three things
  // it inexplicably lacked — his Day Zero signature (the consistency loop's
  // final close: nothing the app could say has the authority of what he
  // said), the Composure before/after (the number the product was SOLD on,
  // previously absent from its own finale), and his Day-0 why (WhyEcho's
  // terminal placement). Peak-end: this screen is what the year is
  // remembered as — which makes it the renewal decision's real paywall,
  // eleven months early, with zero sales copy on it.
  const [signature, setSignature] = useState<{ name: string; signedAt: string } | null>(null);
  const [composure, setComposure] = useState<{ baseline: number; latest: number } | null>(null);
  useEffect(() => {
    LocalStore.getItem<{ name: string; signedAt: string }>('@signature_data').then((s) => {
      if (s?.name) setSignature(s);
    });
    getComposureHistory().then((history) => {
      const baseline = getBaseline(history);
      const latest = history.length > 0 ? history[history.length - 1] : null;
      // Two distinct readings or nothing — a single number is not a shift,
      // and this card never invents data.
      if (baseline && latest && latest.day !== 0) {
        setComposure({ baseline: baseline.score, latest: latest.score });
      }
    });
  }, []);

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
    const lines = ['COMPOSE — Personal Record', ''];
    // The record opens with his own oath and name — the artifact is kept
    // because it is HIS, not because it is data (build order 4.1).
    if (signature) {
      lines.push(`"${OATH_TEXT}"`, `— signed ${signature.name}, Day Zero`, '');
    }
    lines.push(
      `Days completed: ${daysCompleted} of 75`,
      `Control score: ${scoreShift === '—' ? 'not logged' : `${scoreShift} (first week → final week)`}`,
    );
    if (composure) {
      lines.push(`Composure: Day 0: ${composure.baseline} → ${composure.latest}`);
    }
    lines.push(`Anchors written: ${anchors.length}`);
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
      {/* Deepwater role ruling: the milestone eyebrow absorbs (muted) — this
          ceremony's ember budget is spent on the two identity lines below. */}
      <Text className="text-muted text-[11px] font-bold uppercase tracking-[0.28em]">
        Day seventy-five
      </Text>
      <Text className="text-ink text-[28px] font-serif-regular leading-9 mt-2.5">
        The protocol is over.
      </Text>
      {/* Deepwater role ruling: identity line — serif italic, ember-bright
          (ember use 1 of 2). Quiet gravity, no celebration graphics. */}
      <Text className="text-ember-bright text-[20px] font-serif-italic leading-7 mt-1.5">
        The baseline is yours.
      </Text>

      {/* The oath, read back for the last time (build order 4.1). Ink serif
          italic — identity register carried by TYPE, not color: this
          ceremony's two ember uses stay where they were (the headline line
          above, his vault quote below). His own handwriting-equivalent from
          75 days ago, next to the evidence — the emotional peak this screen
          previously left unfired. */}
      {signature && (
        <View className="bg-surface border border-line rounded-[18px] p-5 mt-6">
          <Text className="text-ink text-[14px] leading-[24px] font-serif-italic">
            {OATH_TEXT}
          </Text>
          <Text className="text-ink text-xl font-serif-italic mt-4">{signature.name}</Text>
          <Text className="text-dim text-[11px] mt-1">
            You signed this on Day Zero — 75 days of work ago.
          </Text>
        </View>
      )}

      {/* Evidence card — computed, never asserted */}
      <View className={`bg-surface border border-line rounded-[18px] p-5 ${signature ? 'mt-3.5' : 'mt-6'}`}>
        <Text className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
          What you built · from your own logs
        </Text>
        {/* The number the product was sold on, closed out (build order 4.1):
            same instrument, Day 0 → Day 75. Rendered only when two real
            readings exist — this card never invents data. */}
        {composure && (
          <View className="flex-row items-baseline gap-2 mt-3.5">
            <Text className="text-ink text-[26px] font-serif-medium">
              {composure.baseline} → {composure.latest}
            </Text>
            <Text className="text-dim text-[10.5px]">composure · Day 0 → now</Text>
          </View>
        )}
        <View className="flex-row gap-2.5 mt-3.5">
          {[
            [String(daysCompleted), 'days completed'],
            [scoreShift, 'control score'],
            [String(anchors.length), 'anchors written'],
          ].map(([stat, label]) => (
            <View key={label} className="flex-1 items-center">
              {/* Deepwater grammar: serif-light is 40px+ numerals only — these
                  scores sit at 22px, so serif-medium. */}
              <Text className="text-ink text-[22px] font-serif-medium">{stat}</Text>
              <Text className="text-dim text-[10.5px] mt-0.5">{label}</Text>
            </View>
          ))}
        </View>
        {quote && (
          <View className="border-t border-line-soft mt-4 pt-3.5">
            {/* Deepwater role ruling: his own words read back are the mirror
                line — ember-bright serif italic (ember use 2 of 2). */}
            <Text className="text-ember-bright text-sm leading-[23px] font-serif-italic">
              "{quote.text}"
            </Text>
            <Text className="text-dim text-[11px] mt-1">— you, {formatDate(quote.date)}</Text>
          </View>
        )}
        {/* His Day-0 why — WhyEcho's terminal placement (build order 2.2/4.1):
            the reason he wrote before Day 1, read back beside what he built. */}
        <WhyEcho compact />
      </View>

      {/* Act II unlock — included membership content opening, not an offer. */}
      <View className="bg-surface border border-line rounded-[18px] p-5 mt-3.5">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
          Act II · included in your membership
        </Text>
        <Text className="text-ink text-[17px] font-serif-regular mt-2">
          The Mastery Suite is open.
        </Text>
        <Text className="text-body text-[13px] leading-5 mt-1.5">
          The Somatic Copilot, Sensate Mastery, the Refractory Window Guide, and the Anxious
          Partner De-escalator — included content, open from today.
        </Text>
      </View>

      {hasMembership ? (
        <TouchableOpacity
          onPress={() => onEnterMastery()}
          disabled={isProcessing}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Enter the Mastery Suite"
          className="border border-line rounded-2xl py-[15px] items-center mt-3.5"
        >
          <Text className="text-ink font-semibold text-[15px]">Enter the Mastery Suite</Text>
        </TouchableOpacity>
      ) : (
        /* Lapsed-membership edge — annual-first, both exits are wins. */
        <View className="bg-surface-deep border border-line-soft rounded-2xl p-[18px] mt-3.5">
          <Text className="text-ink text-sm font-bold">Where it goes from here</Text>
          <Text className="text-muted text-[12.5px] leading-[18px] mt-1">
            Keep the suite, your vault, and the log that proves the shift within reach
            {annualPrice ? ` (${annualPrice} a year)` : ''} — or leave with everything you've
            learned. Both are wins.
          </Text>
          <View className="flex-row gap-2.5 mt-3.5">
            <TouchableOpacity
              onPress={() => onKeepMembership('annual')}
              disabled={isProcessing}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Keep access"
              className="flex-1 border border-line rounded-xl py-[13px] items-center"
            >
              {isProcessing ? (
                <ActivityIndicator color="#93A4B0" size="small" />
              ) : (
                <Text className="text-ink font-semibold text-[13.5px]">Keep access</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportRecord}
              disabled={isProcessing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Export my record"
              className="flex-1 border border-line rounded-xl py-[13px] items-center"
            >
              <Text className="text-ink font-semibold text-[13.5px]">
                I'm done — export my record
              </Text>
            </TouchableOpacity>
          </View>
          {monthlyPrice && (
            <TouchableOpacity
              onPress={() => onKeepMembership('monthly')}
              disabled={isProcessing}
              activeOpacity={0.7}
              className="items-center mt-3"
            >
              <Text className="text-faint text-xs">or {monthlyPrice}/month instead</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View className="flex-1" />
      <Text className="text-dim text-xs text-center mt-6">
        Your data stays on this device either way.
      </Text>
    </ScrollView>
  );
}

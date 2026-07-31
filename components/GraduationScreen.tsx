import React from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useProtocol } from '../context/ProtocolContext';
import { useDefusionLog } from '../hooks/useDefusionLog';

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
  /** Persist the export choice after a completed share. */
  onExported: () => Promise<void>;
  isProcessing: boolean;
  /** Localized price strings from the RC offering — null until it loads. */
  annualPrice: string | null;
  monthlyPrice: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GraduationScreen({
  onKeepMembership,
  onExported,
  isProcessing,
  annualPrice,
  monthlyPrice,
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
      </View>

      {/* Act II unlock — included membership content opening, not an offer.
          No price, no CTA styling: the suite simply opens. */}
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

      {/* Membership continuation (lapsed-edge only) — annual-first, both exits are wins.
          Deepwater role ruling: ZERO aqua on this ceremony. "Both are wins." means
          no privileged forward action exists, and an accent-lit price button would
          restyle the unlock ceremony into an offer (CLAUDE.md §2: never a sales
          moment). Both exits are equal-weight, matte, bordered. */}
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
            <Text className="text-faint text-xs">
              or {monthlyPrice}/month instead
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1" />
      <Text className="text-dim text-xs text-center mt-6">
        Your data stays on this device either way.
      </Text>
    </ScrollView>
  );
}

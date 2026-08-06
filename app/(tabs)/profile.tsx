import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Lock,
  ShieldCheck,
  EyeOff,
  Sun,
  ArrowDown,
  Crown,
  BookOpen,
  RotateCcw,
  ChevronRight,
  Wind,
  Activity,
  MessageSquare,
  X,
} from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { useDefusionLog, FALLACY_META } from '../../hooks/useDefusionLog';
import { LocalStore } from '../../services/storage';
import BottomSheet from '../../components/BottomSheet';
import TabContextBanner from '../../components/TabContextBanner';

/**
 * Profile — the CBT Vault, Partner Guide, and account utilities.
 *
 * The Vault is a read-only ledger of the user's own Ventral Vagal Anchors:
 * every entry is a moment he out-argued the Spectator in his own words.
 * Rendered as a secure local record (Phase 3 identity consolidation — the
 * accumulating file IS the evidence of the new identity). Editing and
 * deleting live in the Restructure tab; this surface is for reading back
 * who he is becoming.
 */

// Compact navigation row for the grouped sections — one tap, minimal read.
function NavRow({
  icon,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`p-4 flex-row items-center gap-3 ${last ? '' : 'border-b border-line'}`}
    >
      {icon}
      <View className="flex-1">
        <Text className="text-ink text-sm font-bold">{title}</Text>
        {subtitle && <Text className="text-muted text-xs mt-0.5 leading-4">{subtitle}</Text>}
      </View>
      <ChevronRight color="#53626E" size={16} />
    </TouchableOpacity>
  );
}

// Deepwater ROLE: the You tab is a quiet surface — row icons are muted, not
// accent (nothing here is the next action; nothing here is earned progress).
const ICON_MUTED = '#6E8090';

export default function ProfileScreen() {
  const router = useRouter();
  const { activeDay, completedDays, resetProtocol, devJumpToDay } = useProtocol();
  const sandboxUnlocked = activeDay >= 26 || completedDays[75]?.completed === true;
  const { hasMembership, restorePurchases, isProcessing } = useRevenueCat();
  const { entries, reload } = useDefusionLog();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    LocalStore.getItem<string>('@user_first_name').then(setFirstName);
  }, []);

  // Vault entries are written from the Triage Center while this tab stays
  // mounted — refresh on focus.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const confirmReset = () => {
    Alert.alert(
      'Reset Protocol Baseline',
      `This will erase all 75-day progress — you are on Day ${activeDay}. Your purchase and your vault entries are not affected. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Progress',
          style: 'destructive',
          onPress: () => resetProtocol(),
        },
      ],
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      <TabContextBanner tab="you" />
      {/* Header */}
      <View className="flex-row items-start justify-between mb-6">
        <View>
          <Text className="text-muted text-xs font-bold uppercase tracking-widest">
            Profile
          </Text>
          <Text className="text-ink text-3xl font-serif-light mt-1">
            {firstName ?? 'Your Record'}
          </Text>
        </View>
        {/* Deepwater ROLE: membership is status, not an action — the chip
            stays matte (discretion doctrine: nothing here asks to be seen). */}
        {hasMembership && (
          <View className="flex-row items-center gap-1.5 bg-surface border border-line rounded-full px-3 py-1.5 mt-1">
            <ShieldCheck color={ICON_MUTED} size={13} />
            <Text className="text-body text-xs font-bold">Membership active</Text>
          </View>
        )}
      </View>

      {/* Library — reading material as a table of contents, not a feed.
          Six icon-cards with subtitles was approaching the library-of-
          choices §6 warns about; compact rows keep every destination one
          tap away without asking the eye to process six paragraphs. */}
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
        Library
      </Text>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden mb-6">
        {/* Somatic Sandbox — Day-26 opening (Phase 2 milestone reward;
            sequenced through Phase 1 to protect single-ratio habituation).
            The sequenced row is inert and quiet, same discipline as the
            Mastery cards. Deepwater grammar: "Opens Day N" with an ember
            day-number — never a lock icon. */}
        {sandboxUnlocked ? (
          <NavRow
            icon={<Wind color={ICON_MUTED} size={18} />}
            title="Somatic Sandbox"
            subtitle="Your pacer, your ratio — on demand."
            onPress={() => router.push('/sandbox')}
          />
        ) : (
          <View
            style={{ opacity: 0.55 }}
            className="p-4 flex-row items-center gap-3 border-b border-line"
          >
            <Wind color="#53626E" size={18} />
            <View className="flex-1">
              <Text className="text-ink text-sm font-bold">Somatic Sandbox</Text>
              <Text className="text-muted text-xs mt-0.5 leading-4">
                Opens <Text className="text-muted">Day 26</Text>
              </Text>
            </View>
          </View>
        )}
        <NavRow
          icon={<ArrowDown color={ICON_MUTED} size={18} />}
          title="The Somatic Drop"
          onPress={() => router.push('/technique')}
        />
        {/* The onboarding tension test as a standing tool — a skipper (or
            anyone) can re-measure whenever he wants (founder review
            2026-07-10). */}
        <NavRow
          icon={<Activity color={ICON_MUTED} size={18} />}
          title="Pelvic Release Check"
          subtitle="The 15-second tension test — re-measure any time."
          onPress={() => router.push('/pelvic-check')}
        />
        <NavRow
          icon={<Sun color={ICON_MUTED} size={18} />}
          title="The Vitality Baseline"
          onPress={() => router.push('/vitality')}
        />
        <NavRow
          icon={<BookOpen color={ICON_MUTED} size={18} />}
          title="Others Who Walked It"
          subtitle="Stories from men and partners who did this."
          onPress={() => router.push('/success-vault')}
        />
        {/* Partner Guide CUT (founder ruling 2026-08-06): the guide was a
            document written for HER that the founder would have to author
            and stand behind; the Partner Scripts below are the part that
            serves HIM (word-for-word sentences, nothing required from the
            partner) and carry the clinical value. Launch blocker #4 closed
            by removal. Partner lane continues post-Day-75 via the Anxious
            Partner De-escalator (Mastery Suite). */}
        <NavRow
          icon={<MessageSquare color={ICON_MUTED} size={18} />}
          title="Partner Scripts"
          subtitle="Word-for-word openers, check-ins, and repairs."
          onPress={() => router.push('/partner-scripts')}
          last
        />
      </View>

      {/* The Mastery Suite — kept apart from the Library: it's a progression
          of unlocks, not reading, and separation preserves its pull. */}
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
        The Mastery Suite
      </Text>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden mb-6">
        <NavRow
          icon={<Crown color={ICON_MUTED} size={18} />}
          title="Mastery Suite"
          subtitle="Tools that open as you progress."
          onPress={() => router.push('/mastery')}
          last
        />
      </View>

      {/* CBT Vault */}
      <View className="flex-row items-center gap-2 mb-3">
        <Lock color={ICON_MUTED} size={13} />
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          The Vault · Local Record Only
        </Text>
      </View>

      {entries.length === 0 ? (
        <View className="bg-surface border border-line rounded-2xl p-5">
          <Text className="text-muted text-sm leading-5">
            Every time you take the Spectator's story apart in the Triage Center, the
            anchor you write is filed here — a record, in your own words, of who you
            are becoming.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {entries.map((entry) => (
            <View
              key={entry.id}
              // Accent unification (2026-07-25): vault anchors are identity in
              // his own words — quiet line spine, quote in ink italic. One
              // repeated motif, not per-row accents.
              className="bg-surface border border-line rounded-2xl p-4 border-l-2 border-l-line"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-muted text-xs font-mono">{formatDate(entry.date)}</Text>
                <View className="bg-surface-deep rounded-full px-2.5 py-0.5">
                  <Text className="text-body text-[10px] font-bold uppercase tracking-wider">
                    {FALLACY_META[entry.fallacy].label}
                  </Text>
                </View>
              </View>
              {entry.ventralAnchor ? (
                <Text className="text-ink text-sm leading-6 font-serif-italic">
                  “{entry.ventralAnchor}”
                </Text>
              ) : (
                <Text className="text-muted text-sm leading-5 italic">
                  Logged before anchors existed — the reframe was read, not written.
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Settings — Discretion lives here now: it's configuration, not
          content, and always was. */}
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mt-8 mb-3">
        Settings
      </Text>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={() => router.push('/discretion')}
          activeOpacity={0.7}
          className="p-4 flex-row items-center justify-between border-b border-line"
        >
          <View className="flex-row items-center gap-2">
            <EyeOff color="#93A4B0" size={14} />
            <Text className="text-body text-sm">Discretion</Text>
          </View>
          <ChevronRight color="#53626E" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={restorePurchases}
          disabled={isProcessing}
          activeOpacity={0.7}
          className="p-4 flex-row items-center justify-between border-b border-line"
        >
          <Text className="text-body text-sm">Restore Purchases</Text>
          <ChevronRight color="#53626E" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmReset}
          activeOpacity={0.7}
          className={`p-4 flex-row items-center justify-between ${
            __DEV__ ? 'border-b border-line' : ''
          }`}
        >
          <View className="flex-row items-center gap-2">
            <RotateCcw color="#93A4B0" size={14} />
            <Text className="text-body text-sm">Reset Protocol Baseline</Text>
          </View>
          <ChevronRight color="#53626E" size={16} />
        </TouchableOpacity>
        {__DEV__ && (
          <>
            <TouchableOpacity
              onPress={async () => {
                // Clear the saved onboarding progress so replay starts at the
                // very first screen — otherwise the flow resumes from wherever
                // it was last left (its resume-state behavior). Dev-only.
                await LocalStore.setItem('@onboarding_flow_v1', null);
                await LocalStore.setItem('@paywall_dismissed', null);
                router.push('/onboarding');
              }}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between border-b border-line"
            >
              <Text className="text-dim text-sm">Replay Onboarding from start (dev only)</Text>
              <ChevronRight color="#53626E" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const message = `Currently on Day ${activeDay}. Enter 1–75; the midnight lock is released so the day plays immediately.`;
                // Alert.prompt is iOS-only — dev browsing on Expo web needs
                // the DOM prompt instead.
                if (Platform.OS === 'web') {
                  // eslint-disable-next-line no-alert
                  const value = window.prompt(message, String(activeDay));
                  const day = parseInt(value ?? '', 10);
                  if (!Number.isNaN(day)) devJumpToDay(day);
                  return;
                }
                Alert.prompt(
                  'Jump to Day (dev only)',
                  message,
                  (value) => {
                    const day = parseInt(value ?? '', 10);
                    if (!Number.isNaN(day)) devJumpToDay(day);
                  },
                  'plain-text',
                  '',
                  'number-pad',
                );
              }}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between"
            >
              <Text className="text-dim text-sm">Jump to Day (dev only)</Text>
              <ChevronRight color="#53626E" size={16} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text className="text-faint text-xs text-center mt-6 leading-4">
        Everything on this screen is stored only on this device.
      </Text>

    </ScrollView>
  );
}

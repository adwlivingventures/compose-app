import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Lock,
  ShieldCheck,
  Users,
  EyeOff,
  Sun,
  ArrowDown,
  Crown,
  BookOpen,
  RotateCcw,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { useProtocol } from '../../context/ProtocolContext';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { useDefusionLog, FALLACY_META } from '../../hooks/useDefusionLog';
import { LocalStore } from '../../services/storage';
import {
  PARTNER_GUIDE_TITLE,
  PARTNER_GUIDE_INTRO,
  PARTNER_GUIDE_SECTIONS,
} from '../../content/partnerGuide';
import BottomSheet from '../../components/BottomSheet';

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
      <ChevronRight color="#6E675D" size={16} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { activeDay, resetProtocol } = useProtocol();
  const { hasProAccess, hasMaintenanceAccess, restorePurchases, isProcessing } = useRevenueCat();
  const { entries, reload } = useDefusionLog();
  const [guideVisible, setGuideVisible] = useState(false);
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
        {hasProAccess && (
          <View className="flex-row items-center gap-1.5 bg-accent/10 border border-accent/30 rounded-full px-3 py-1.5 mt-1">
            <ShieldCheck color="#C89B6D" size={13} />
            <Text className="text-accent text-xs font-bold">
              {hasMaintenanceAccess ? 'Membership Active' : 'Pro Access Active'}
            </Text>
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
        <NavRow
          icon={<ArrowDown color="#C89B6D" size={18} />}
          title="The Somatic Drop"
          onPress={() => router.push('/technique')}
        />
        <NavRow
          icon={<Sun color="#C89B6D" size={18} />}
          title="The Vitality Baseline"
          onPress={() => router.push('/vitality')}
        />
        <NavRow
          icon={<BookOpen color="#C89B6D" size={18} />}
          title="The Success Vault"
          onPress={() => router.push('/success-vault')}
        />
        <NavRow
          icon={<Users color="#C89B6D" size={18} />}
          title="Partner Guide"
          onPress={() => setGuideVisible(true)}
          last
        />
      </View>

      {/* Phase IV — kept apart from the Library: it's a tier, not reading,
          and separation preserves its future-pacing job. */}
      <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
        Phase IV
      </Text>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden mb-6">
        <NavRow
          icon={<Crown color="#C89B6D" size={18} />}
          title="Mastery Suite"
          subtitle="What unlocks on Day 76."
          onPress={() => router.push('/mastery')}
          last
        />
      </View>

      {/* CBT Vault */}
      <View className="flex-row items-center gap-2 mb-3">
        <Lock color="#8A8378" size={13} />
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
              className="bg-surface border border-line rounded-2xl p-4 border-l-2 border-l-accent/40"
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
            <EyeOff color="#B9B2A6" size={14} />
            <Text className="text-body text-sm">Discretion</Text>
          </View>
          <ChevronRight color="#6E675D" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={restorePurchases}
          disabled={isProcessing}
          activeOpacity={0.7}
          className="p-4 flex-row items-center justify-between border-b border-line"
        >
          <Text className="text-body text-sm">Restore Purchases</Text>
          <ChevronRight color="#6E675D" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmReset}
          activeOpacity={0.7}
          className={`p-4 flex-row items-center justify-between ${
            __DEV__ ? 'border-b border-line' : ''
          }`}
        >
          <View className="flex-row items-center gap-2">
            <RotateCcw color="#B9B2A6" size={14} />
            <Text className="text-body text-sm">Reset Protocol Baseline</Text>
          </View>
          <ChevronRight color="#6E675D" size={16} />
        </TouchableOpacity>
        {__DEV__ && (
          <TouchableOpacity
            onPress={() => router.push('/onboarding')}
            activeOpacity={0.7}
            className="p-4 flex-row items-center justify-between"
          >
            <Text className="text-dim text-sm">Replay Onboarding (dev only)</Text>
            <ChevronRight color="#57534B" size={16} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-faint text-xs text-center mt-6 leading-4">
        Everything on this screen is stored only on this device.
      </Text>

      {/* Partner Guide sheet */}
      <BottomSheet visible={guideVisible} onClose={() => setGuideVisible(false)}>
        <View className="bg-tab border-t border-line-soft rounded-t-3xl max-h-[88%]">
          <View className="px-6 pt-5 pb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-accent text-xs font-bold uppercase tracking-widest">
                For Your Partner
              </Text>
              <Text className="text-ink text-xl font-serif-regular mt-1">{PARTNER_GUIDE_TITLE}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setGuideVisible(false)}
              activeOpacity={0.7}
              className="bg-surface-deep rounded-full p-2"
            >
              <X color="#8A8378" size={16} />
            </TouchableOpacity>
          </View>
          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-body text-sm leading-6 italic mb-5">
              {PARTNER_GUIDE_INTRO}
            </Text>
            {PARTNER_GUIDE_SECTIONS.map((section) => (
              <View key={section.heading} className="mb-5">
                <Text className="text-ink text-base font-bold mb-1.5">{section.heading}</Text>
                <Text className="text-body text-sm leading-6">{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

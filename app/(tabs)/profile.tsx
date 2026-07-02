import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  Lock,
  ShieldCheck,
  Users,
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

export default function ProfileScreen() {
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
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 48 }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-6">
        <View>
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Profile
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {firstName ?? 'Your Record'}
          </Text>
        </View>
        {hasProAccess && (
          <View className="flex-row items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 mt-1">
            <ShieldCheck color="#34d399" size={13} />
            <Text className="text-emerald-400 text-xs font-bold">
              {hasMaintenanceAccess ? 'Membership Active' : 'Pro Access Active'}
            </Text>
          </View>
        )}
      </View>

      {/* Partner Guide */}
      <TouchableOpacity
        onPress={() => setGuideVisible(true)}
        activeOpacity={0.85}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-row items-center gap-4 mb-6"
      >
        <View className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
          <Users color="#34d399" size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-bold">
            Partner Guide: The Autonomic Reset
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5 leading-4">
            Hand them your phone. Two minutes of reading replaces the hardest
            conversation.
          </Text>
        </View>
        <ChevronRight color="#64748b" size={18} />
      </TouchableOpacity>

      {/* CBT Vault */}
      <View className="flex-row items-center gap-2 mb-3">
        <Lock color="#64748b" size={13} />
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          The Vault · Local Record Only
        </Text>
      </View>

      {entries.length === 0 ? (
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Text className="text-slate-500 text-sm leading-5">
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
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-l-2 border-l-emerald-500/40"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-500 text-xs font-mono">{formatDate(entry.date)}</Text>
                <View className="bg-slate-800 rounded-full px-2.5 py-0.5">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {FALLACY_META[entry.fallacy].label}
                  </Text>
                </View>
              </View>
              {entry.ventralAnchor ? (
                <Text className="text-slate-200 text-sm leading-6">
                  “{entry.ventralAnchor}”
                </Text>
              ) : (
                <Text className="text-slate-500 text-sm leading-5 italic">
                  Logged before anchors existed — the reframe was read, not written.
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Account */}
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-8 mb-3">
        Account
      </Text>
      <View className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={restorePurchases}
          disabled={isProcessing}
          activeOpacity={0.7}
          className="p-4 flex-row items-center justify-between border-b border-slate-800"
        >
          <Text className="text-slate-300 text-sm">Restore Purchases</Text>
          <ChevronRight color="#475569" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmReset}
          activeOpacity={0.7}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <RotateCcw color="#94a3b8" size={14} />
            <Text className="text-slate-300 text-sm">Reset Protocol Baseline</Text>
          </View>
          <ChevronRight color="#475569" size={16} />
        </TouchableOpacity>
      </View>

      <Text className="text-slate-600 text-xs text-center mt-6 leading-4">
        Everything on this screen is stored only on this device.
      </Text>

      {/* Partner Guide modal */}
      <Modal
        visible={guideVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setGuideVisible(false)}
      >
        <Pressable className="flex-1 bg-black/60" onPress={() => setGuideVisible(false)} />
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[88%]">
          <View className="px-6 pt-5 pb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                For Your Partner
              </Text>
              <Text className="text-white text-xl font-bold mt-1">{PARTNER_GUIDE_TITLE}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setGuideVisible(false)}
              activeOpacity={0.7}
              className="bg-slate-800 rounded-full p-2"
            >
              <X color="#64748b" size={16} />
            </TouchableOpacity>
          </View>
          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-slate-400 text-sm leading-6 italic mb-5">
              {PARTNER_GUIDE_INTRO}
            </Text>
            {PARTNER_GUIDE_SECTIONS.map((section) => (
              <View key={section.heading} className="mb-5">
                <Text className="text-white text-base font-bold mb-1.5">{section.heading}</Text>
                <Text className="text-slate-400 text-sm leading-6">{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

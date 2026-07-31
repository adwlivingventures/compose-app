import React, { useState } from 'react';
import { Platform, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, ChevronRight, Copy } from 'lucide-react-native';
import { PARTNER_SCRIPTS, PartnerScript } from '../content/partnerScripts';

/**
 * Partner Scripts — You-tab Library reference (moved from the Restructure
 * tab, founder review 2026-07-10: scripts are things he looks up before a
 * conversation, not a daily cognitive practice; shelving them beside the
 * Partner Guide puts both partner-facing tools in one place).
 */

async function shareText(text: string, title: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback — nothing to do without a toast library
    }
    return;
  }
  await Share.share({ message: text, title });
}

export default function PartnerScriptsScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (script: PartnerScript) => {
    await shareText(script.body, script.title);
    setCopied(script.title);
    setTimeout(() => setCopied(null), 2500);
  };

  const grouped = PARTNER_SCRIPTS.reduce<Record<string, PartnerScript[]>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {},
  );

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 48 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 mb-5 self-start"
      >
        <ChevronLeft size={16} color="#6E8090" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Library
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">Partner Scripts</Text>
      <Text className="text-muted text-sm leading-5 mt-2 mb-6">
        Scripts for opening conversations with your partner, adapted from Sensate Focus
        and CBST communication frameworks.
      </Text>

      {Object.entries(grouped).map(([category, scripts]) => (
        <View key={category} className="mb-6">
          <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
            {category}
          </Text>
          <View className="gap-3">
            {scripts.map((script) => (
              <PartnerScriptCard
                key={script.title}
                script={script}
                isCopied={copied === script.title}
                onCopy={() => handleCopy(script)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function PartnerScriptCard({
  script,
  isCopied,
  onCopy,
}: {
  script: PartnerScript;
  isCopied: boolean;
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-surface border border-line rounded-2xl overflow-hidden">
      {/* Header row */}
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1 pr-3">
          <Text className="text-ink text-sm font-bold">{script.title}</Text>
        </View>
        <ChevronRight
          size={18}
          color="#6E8090"
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-line">
          <Text className="text-body text-sm leading-6 mt-3">{script.body}</Text>

          <TouchableOpacity
            onPress={onCopy}
            activeOpacity={0.8}
            className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3 border ${
              isCopied
                ? 'bg-accent/10 border-accent/40'
                : 'bg-surface-deep border-line'
            }`}
          >
            {/* Deepwater role ruling: the copied confirmation is action
                feedback, not identity — aqua, matching the text-accent label. */}
            {isCopied ? (
              <CheckCircle2 size={16} color="#5FD4C1" />
            ) : (
              <Copy size={16} color="#93A4B0" />
            )}
            <Text
              className={`text-xs font-bold ${
                isCopied ? 'text-accent' : 'text-body'
              }`}
            >
              {isCopied
                ? Platform.OS === 'web'
                  ? 'Copied'
                  : 'Shared'
                : Platform.OS === 'web'
                ? 'Copy script'
                : 'Share or copy script'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

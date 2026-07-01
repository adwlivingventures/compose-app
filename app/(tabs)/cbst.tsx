import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  Brain,
  MessageSquare,
  Plus,
  Copy,
  ChevronRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import { LocalStore } from '../../services/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type CBSTTab = 'log' | 'scripts';

interface CBSTEntry {
  id: string;
  date: string;
  trigger: string;
  automaticThought: string;
  reframe: string;
}

type LogStep = 0 | 1 | 2 | 3; // 0-2 form, 3 = saved confirmation

// ─── Partner Script Data ──────────────────────────────────────────────────────

interface PartnerScript {
  title: string;
  category: string;
  body: string;
}

const PARTNER_SCRIPTS: PartnerScript[] = [
  {
    title: 'Sensate Focus Introduction',
    category: 'Opening the Conversation',
    body: `I've been working on something personal — a somatic program to help me be more present during intimacy. Part of it involves a technique called sensate focus: touch that's purely about sensation and connection, with no pressure or goal attached. I'd love to try it together when you're open to it. It's helped a lot of couples slow down and reconnect.`,
  },
  {
    title: 'Pacing & Slowing Down',
    category: 'In-the-Moment',
    body: `I want to pause for a second — not because anything is wrong, but because I'm practicing something. I'm learning to stay grounded by slowing down and breathing rather than rushing ahead. If I check in or ask to take a breath together, that's why. It's actually helping me feel more connected, not less.`,
  },
  {
    title: 'Reassurance Request',
    category: 'Vulnerability',
    body: `I want to be honest with you: I sometimes get stuck in my head during intimacy — watching myself instead of just being with you. I'm actively working on it. The most helpful thing you can do is remind me you're here and that there's no pressure. Just being calm with me matters more than you might realise.`,
  },
  {
    title: 'After a Difficult Moment',
    category: 'Repair',
    body: `I want to talk about what happened earlier — not to overthink it, but so we can stay close. Sometimes my body doesn't cooperate with what I want, and that's not about you or how attracted I am. I'm working through some nervous system stuff. Thank you for being patient. Can we just be close right now?`,
  },
  {
    title: 'Sharing Your Progress',
    category: 'Check-In',
    body: `I wanted to let you know I've been consistent with my program and it's making a real difference — not just physically, but in how present I feel with you. I'm more aware of my body, less anxious, and I genuinely feel more connected. I appreciate your support while I've been working through this.`,
  },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = '@cbst_log_entries';

async function loadEntries(): Promise<CBSTEntry[]> {
  const data = await LocalStore.getItem<CBSTEntry[]>(STORAGE_KEY);
  return data ?? [];
}

async function saveEntries(entries: CBSTEntry[]): Promise<void> {
  await LocalStore.setItem(STORAGE_KEY, entries);
}

// ─── Clipboard / Share Helper ─────────────────────────────────────────────────

async function shareText(text: string, title: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      // web: silently succeeds
    } catch {
      // Fallback — nothing to do without a toast library
    }
    return;
  }
  await Share.share({ message: text, title });
}

// ─── Root Screen ──────────────────────────────────────────────────────────────

export default function CBSTScreen() {
  const [activeTab, setActiveTab] = useState<CBSTTab>('log');

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 border-b border-slate-800/60">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          COMPOSE
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">
          Cognitive Restructuring
        </Text>
      </View>

      {/* Tab Bar */}
      <View className="flex-row px-6 pt-4 pb-0 gap-3">
        <TabChip
          label="CBST Log"
          icon={<Brain size={14} color={activeTab === 'log' ? '#020617' : '#64748b'} />}
          active={activeTab === 'log'}
          onPress={() => setActiveTab('log')}
        />
        <TabChip
          label="Partner Scripts"
          icon={
            <MessageSquare
              size={14}
              color={activeTab === 'scripts' ? '#020617' : '#64748b'}
            />
          }
          active={activeTab === 'scripts'}
          onPress={() => setActiveTab('scripts')}
        />
      </View>

      {/* Content */}
      {activeTab === 'log' ? <CBSTLogTab /> : <PartnerScriptsTab />}
    </View>
  );
}

function TabChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
        active
          ? 'bg-emerald-500 border-emerald-500'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {icon}
      <Text
        className={`text-xs font-bold ${active ? 'text-slate-950' : 'text-slate-400'}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── CBST Log Tab ─────────────────────────────────────────────────────────────

const STEP_META = [
  {
    label: 'Step 1 of 3 — Identify the Trigger',
    placeholder:
      'Describe the moment or situation that triggered anxiety or disconnection...',
    hint: 'Be specific: time, context, what was happening just before.',
  },
  {
    label: 'Step 2 of 3 — Automatic Thought',
    placeholder: 'What thought or belief showed up automatically? (e.g. "I\'m going to fail her")',
    hint: 'Capture the raw, uncensored thought — not the rational version.',
  },
  {
    label: 'Step 3 of 3 — Rational Reframe',
    placeholder:
      'What\'s a more balanced, evidence-based perspective on this situation?',
    hint: 'What would you tell a close friend who had this same thought?',
  },
];

function CBSTLogTab() {
  const [logStep, setLogStep] = useState<LogStep>(0);
  const [trigger, setTrigger] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [reframe, setReframe] = useState('');
  const [entries, setEntries] = useState<CBSTEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const currentValues = [trigger, automaticThought, reframe];
  const currentSetters = [setTrigger, setAutomaticThought, setReframe];

  useEffect(() => {
    loadEntries().then((data) => {
      setEntries(data);
      setLoadingEntries(false);
    });
  }, []);

  const canAdvance = currentValues[logStep]?.trim().length > 0;

  const handleNext = async () => {
    if (logStep < 2) {
      setLogStep(((logStep + 1) as LogStep));
      return;
    }
    // Step 2 → save
    const entry: CBSTEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      trigger: trigger.trim(),
      automaticThought: automaticThought.trim(),
      reframe: reframe.trim(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await saveEntries(updated);
    setLogStep(3);
  };

  const resetForm = () => {
    setTrigger('');
    setAutomaticThought('');
    setReframe('');
    setLogStep(0);
  };

  const deleteEntry = useCallback(
    async (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      await saveEntries(updated);
    },
    [entries],
  );

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this log entry permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Card */}
        {logStep < 3 ? (
          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                {STEP_META[logStep].label}
              </Text>
              {/* Step dots */}
              <View className="flex-row gap-1.5">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= logStep ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </View>
            </View>

            <TextInput
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm leading-5 min-h-[100px]"
              multiline
              textAlignVertical="top"
              placeholder={STEP_META[logStep].placeholder}
              placeholderTextColor="#475569"
              value={currentValues[logStep]}
              onChangeText={currentSetters[logStep]}
            />

            <Text className="text-slate-600 text-xs mt-2 leading-4">
              {STEP_META[logStep].hint}
            </Text>

            <View className="flex-row gap-3 mt-4">
              {logStep > 0 && (
                <TouchableOpacity
                  onPress={() => setLogStep(((logStep - 1) as LogStep))}
                  activeOpacity={0.8}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-3 items-center"
                >
                  <Text className="text-slate-400 font-bold text-sm">Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                disabled={!canAdvance}
                activeOpacity={0.85}
                className={`flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2 ${
                  canAdvance ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    canAdvance ? 'text-slate-950' : 'text-slate-600'
                  }`}
                >
                  {logStep < 2 ? 'Continue' : 'Save Entry'}
                </Text>
                <ChevronRight
                  size={16}
                  color={canAdvance ? '#020617' : '#475569'}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Saved confirmation */
          <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 items-center">
            <CheckCircle2 color="#34d399" size={32} />
            <Text className="text-emerald-400 font-bold text-base mt-3">Entry Saved</Text>
            <Text className="text-slate-500 text-sm text-center mt-1 leading-5">
              Your reframe has been logged. Consistent restructuring rewires the
              automatic thought pathway over time.
            </Text>
            <TouchableOpacity
              onPress={resetForm}
              activeOpacity={0.85}
              className="mt-4 flex-row items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3"
            >
              <Plus size={16} color="#34d399" />
              <Text className="text-emerald-400 font-bold text-sm">New Entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Past Entries */}
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
          Past Entries
        </Text>

        {loadingEntries ? (
          <Text className="text-slate-600 text-sm">Loading...</Text>
        ) : entries.length === 0 ? (
          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 items-center">
            <Text className="text-slate-500 text-sm text-center leading-5">
              No entries yet. Complete your first restructuring log above.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {entries.map((entry) => (
              <CBSTEntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => confirmDelete(entry.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CBSTEntryCard({
  entry,
  onDelete,
}: {
  entry: CBSTEntry;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1">
          <Text className="text-slate-500 text-xs font-mono">{entry.date}</Text>
          <Text className="text-white text-sm font-medium mt-0.5" numberOfLines={1}>
            {entry.trigger}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color="#475569" />
          </TouchableOpacity>
          <ChevronRight
            size={18}
            color="#475569"
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 gap-3 border-t border-slate-800">
          <EntryField label="Trigger" value={entry.trigger} />
          <EntryField label="Automatic Thought" value={entry.automaticThought} />
          <EntryField label="Rational Reframe" value={entry.reframe} highlight />
        </View>
      )}
    </View>
  );
}

function EntryField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="mt-3">
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text
        className={`text-sm leading-5 ${highlight ? 'text-emerald-300' : 'text-slate-300'}`}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Partner Scripts Tab ──────────────────────────────────────────────────────

function PartnerScriptsTab() {
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
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
    >
      <Text className="text-slate-500 text-sm leading-5 mb-5">
        Research-backed scripts for opening conversations with your partner — adapted
        from Sensate Focus and CBST communication frameworks.
      </Text>

      {Object.entries(grouped).map(([category, scripts]) => (
        <View key={category} className="mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
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
    <View className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header row */}
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-1 pr-3">
          <Text className="text-white text-sm font-bold">{script.title}</Text>
        </View>
        <ChevronRight
          size={18}
          color="#64748b"
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-slate-800">
          <Text className="text-slate-400 text-sm leading-6 mt-3">{script.body}</Text>

          <TouchableOpacity
            onPress={onCopy}
            activeOpacity={0.8}
            className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3 border ${
              isCopied
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            {isCopied ? (
              <CheckCircle2 size={16} color="#34d399" />
            ) : (
              <Copy size={16} color="#94a3b8" />
            )}
            <Text
              className={`text-xs font-bold ${
                isCopied ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isCopied
                ? Platform.OS === 'web'
                  ? 'Copied!'
                  : 'Shared!'
                : Platform.OS === 'web'
                ? 'Copy Script'
                : 'Share / Copy Script'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

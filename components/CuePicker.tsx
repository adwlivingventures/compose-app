import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { LedgerItem, LedgerKey } from '../content/ledger';
import {
  ChosenCue,
  ChosenCues,
  CUE_OPTIONS,
  CUE_PICKER_INTROS,
} from '../content/cues';

/**
 * Phase-transition cue picker (Days 26 and 51) — gates the session the same
 * way SomaticPrimer gates Day 1. One linear pass: an intro that frames the
 * mechanism, then one decision per screen (Hick's Law — the choice is the
 * feature, so nothing competes with it). Continue stays inert until a cue
 * is chosen: the act of choosing is what makes the cue his.
 *
 * Steps walk the ledger items active for the day (5 at Day 26, 6 at Day
 * 51), so a newly introduced item gets its cue chosen the same day it
 * joins the ledger.
 *
 * The free-text variant is optional and local-only — it is stored via
 * LocalStore by the caller and is never telemetered (CLAUDE.md §7).
 */

interface CuePickerProps {
  phase: 2 | 3;
  /** Ledger items active for the day — defines the steps, in ledger order. */
  items: LedgerItem[];
  /** Prior choices (Day 51 re-pick preselects what he chose at Day 26). */
  initial: ChosenCues;
  onComplete: (cues: ChosenCues) => void;
  onExit: () => void;
}

const CUSTOM_MAX_LENGTH = 90;

export default function CuePicker({ phase, items, initial, onComplete, onExit }: CuePickerProps) {
  // Step -1 is the intro; 0..items.length-1 are the ledger items.
  const [step, setStep] = useState(-1);
  const [chosen, setChosen] = useState<ChosenCues>(initial);
  const [customDrafts, setCustomDrafts] = useState<Partial<Record<LedgerKey, string>>>(() => {
    const drafts: Partial<Record<LedgerKey, string>> = {};
    for (const item of items) {
      const prior = initial[item.key];
      if (prior?.id === 'custom') drafts[item.key] = prior.text;
    }
    return drafts;
  });
  const [customOpen, setCustomOpen] = useState<Partial<Record<LedgerKey, boolean>>>(() => {
    const open: Partial<Record<LedgerKey, boolean>> = {};
    for (const item of items) {
      if (initial[item.key]?.id === 'custom') open[item.key] = true;
    }
    return open;
  });
  const [finishing, setFinishing] = useState(false);

  const intro = CUE_PICKER_INTROS[phase];

  const resolveSelection = (key: LedgerKey): ChosenCue | null => {
    const current = chosen[key];
    if (!current) return null;
    if (current.id === 'custom') {
      const draft = (customDrafts[key] ?? '').trim();
      return draft.length > 0 ? { id: 'custom', text: draft } : null;
    }
    return current;
  };

  const advance = () => {
    if (step < items.length - 1) {
      setStep(step + 1);
      return;
    }
    if (finishing) return;
    setFinishing(true);
    const result: ChosenCues = {};
    for (const item of items) {
      const selection = resolveSelection(item.key);
      if (selection) result[item.key] = selection;
    }
    onComplete(result);
  };

  const header = (
    <View className="flex-row items-center justify-between">
      {/* Step dots mirror the session's orientation pattern — not tappable. */}
      <View className="flex-row items-center gap-1.5">
        {items.map((it, i) => (
          <View
            key={it.key}
            className={`h-1.5 rounded-full ${
              i < step ? 'bg-accent w-3' : i === step ? 'bg-accent w-7' : 'bg-surface-deep w-3'
            }`}
          />
        ))}
      </View>
      <TouchableOpacity
        onPress={onExit}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Close — you can choose your cues next time you open the session"
        className="bg-surface border border-line rounded-full p-2.5"
      >
        <X color="#6B7280" size={18} />
      </TouchableOpacity>
    </View>
  );

  if (step === -1) {
    return (
      <View className="flex-1 bg-ground px-7 pt-16">
        {header}
        <View className="flex-1 justify-center">
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
            {intro.eyebrow}
          </Text>
          <Text className="text-ink text-[26px] font-serif-regular leading-9 mt-2.5">
            {intro.headline}
          </Text>
          <Text className="text-body text-[13.5px] leading-5 mt-4">{intro.body}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setStep(0)}
          activeOpacity={0.85}
          className="bg-accent rounded-2xl py-[17px] items-center mb-12"
        >
          <Text className="text-on-accent font-bold text-base">Choose my moments</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const item = items[step];
  const key = item.key;
  const options = CUE_OPTIONS[key];
  const selection = resolveSelection(key);
  const customSelected = chosen[key]?.id === 'custom';

  return (
    <View className="flex-1 bg-ground px-6 pt-16">
      {header}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em] mt-6">
          Cue {step + 1} of {items.length}
        </Text>
        <Text className="text-ink text-[22px] font-serif-regular mt-1.5">{item.title}</Text>
        <Text className="text-muted text-[13px] leading-5 mt-1.5">
          Pick the moment this lives in — a part of your day that already happens on its own.
        </Text>

        <View className="gap-3 mt-6">
          {options.map((option) => {
            const on = chosen[key]?.id === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  setChosen((c) => ({ ...c, [key]: { id: option.id, text: option.text } }));
                  setCustomOpen((o) => ({ ...o, [key]: false }));
                }}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={option.text}
                className={`rounded-2xl p-4 flex-row items-center gap-3 border ${
                  on ? 'bg-accent/10 border-accent/40' : 'bg-surface border-line'
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    on ? 'border-accent' : 'border-radio'
                  }`}
                >
                  {on && <View className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </View>
                <Text
                  className={`flex-1 text-[13.5px] leading-5 ${on ? 'text-ink' : 'text-body'}`}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Optional self-written cue — stays on device, never telemetered. */}
          <TouchableOpacity
            onPress={() => {
              setChosen((c) => ({
                ...c,
                [key]: { id: 'custom', text: (customDrafts[key] ?? '').trim() },
              }));
              setCustomOpen((o) => ({ ...o, [key]: true }));
            }}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: customSelected }}
            accessibilityLabel="Write your own moment"
            className={`rounded-2xl p-4 border ${
              customSelected ? 'bg-accent/10 border-accent/40' : 'bg-surface border-line'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  customSelected ? 'border-accent' : 'border-radio'
                }`}
              >
                {customSelected && <View className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </View>
              <Text
                className={`flex-1 text-[13.5px] leading-5 ${
                  customSelected ? 'text-ink' : 'text-body'
                }`}
              >
                A moment of my own
              </Text>
            </View>
            {customOpen[key] && (
              <View className="mt-3">
                <TextInput
                  value={customDrafts[key] ?? ''}
                  onChangeText={(text) =>
                    setCustomDrafts((d) => ({ ...d, [key]: text.slice(0, CUSTOM_MAX_LENGTH) }))
                  }
                  placeholder="After I …, I …"
                  placeholderTextColor="#4B5563"
                  multiline
                  autoFocus
                  className="bg-surface-deep border border-line rounded-[14px] px-4 py-3 text-ink text-[13.5px] leading-5 min-h-[64px]"
                  style={{ textAlignVertical: 'top' }}
                />
                <Text className="text-faint text-[11.5px] leading-4 mt-2">
                  Yours stays on this device. Nothing you write here leaves it.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={advance}
        disabled={!selection || finishing}
        activeOpacity={0.85}
        className={`bg-accent rounded-2xl py-4 items-center mb-12 ${
          !selection || finishing ? 'opacity-30' : ''
        }`}
      >
        {finishing ? (
          <ActivityIndicator color="#0C0B09" />
        ) : (
          <Text className="text-on-accent font-bold text-base">
            {step < items.length - 1 ? 'Continue' : 'Set my moments'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

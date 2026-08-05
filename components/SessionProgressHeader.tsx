import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import type { TrainingKey } from '../content/training';
import {
  SESSION_STAGE_ORDER,
  metaForStage,
  stageCompleted,
  stageIndex,
  type SessionStage,
} from '../content/sessionGuide';

/**
 * Session chrome — named step progress with free navigation: prev/next,
 * tappable segment bar, and an expandable step list (training + check-in).
 */

export default function SessionProgressHeader({
  day,
  stage,
  isReplay,
  training,
  onGoToStage,
  onExit,
}: {
  day: number;
  stage: SessionStage;
  isReplay: boolean;
  training: Partial<Record<TrainingKey, boolean>>;
  onGoToStage: (index: number) => void;
  onExit: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const index = stageIndex(stage);
  const meta = metaForStage(stage);
  const lastIndex = SESSION_STAGE_ORDER.length - 1;
  const upcoming =
    index < lastIndex ? metaForStage(SESSION_STAGE_ORDER[index + 1]) : null;

  const go = (i: number) => {
    setPickerOpen(false);
    onGoToStage(i);
  };

  return (
    <View className="px-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
          {isReplay ? `Replay · Day ${day}` : `Day ${day}`}
        </Text>
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close session"
          className="bg-surface border border-line rounded-full p-2"
        >
          <X color="#6E8090" size={16} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setPickerOpen((o) => !o)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded: pickerOpen }}
        accessibilityLabel={`Step ${index + 1} of ${SESSION_STAGE_ORDER.length}, ${meta.label}. ${pickerOpen ? 'Collapse' : 'Expand'} step list.`}
        className="mt-3 flex-row items-center justify-between"
      >
        <Text className="text-ink text-[17px] font-serif-regular flex-1">
          Step {index + 1} of {SESSION_STAGE_ORDER.length} · {meta.label}
        </Text>
        <ChevronDown
          size={16}
          color="#6E8090"
          style={{ transform: [{ rotate: pickerOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      <View className="flex-row mt-3" style={{ gap: 4 }}>
        {SESSION_STAGE_ORDER.map((s, i) => {
          const done = stageCompleted(s, training);
          const current = i === index;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => go(i)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${metaForStage(s).label}${done ? ', complete' : ''}`}
              className="flex-1 h-1 rounded-full overflow-hidden bg-surface-deep"
            >
              <View
                className={`h-1 rounded-full ${done || current ? 'bg-accent' : 'bg-transparent'}`}
                style={{ width: done || current ? '100%' : '0%' }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {pickerOpen && (
        <View className="mt-3 rounded-xl border border-line bg-surface overflow-hidden">
          {SESSION_STAGE_ORDER.map((s, i) => {
            const m = metaForStage(s);
            const done = stageCompleted(s, training);
            const current = i === index;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => go(i)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${m.label}${done ? ', complete' : ''}${current ? ', current step' : ''}`}
                className={`flex-row items-center px-3.5 py-3 ${
                  i < lastIndex ? 'border-b border-line-soft' : ''
                } ${current ? 'bg-surface-deep' : ''}`}
                style={{ gap: 10 }}
              >
                <View
                  className={`h-[26px] w-[26px] items-center justify-center rounded-full border ${
                    done ? 'border-line bg-line' : current ? 'border-accent' : 'border-line-soft'
                  }`}
                >
                  {done ? (
                    <Check color="#EDF2F5" size={12} strokeWidth={2.5} />
                  ) : (
                    <Text className={`text-[11px] ${current ? 'text-accent' : 'text-faint'}`}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-[14px] ${current ? 'text-ink font-semibold' : 'text-body'}`}
                  >
                    {m.label}
                  </Text>
                  <Text className="text-faint text-[10px] mt-0.5">
                    {s === 'checkin' ? 'Training + daily habits' : `~${m.durationMin} min`}
                  </Text>
                </View>
                {current && (
                  <Text className="text-accent text-[10px] font-bold uppercase tracking-[0.12em]">
                    Here
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View className="mt-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => go(index - 1)}
          disabled={index === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          className="flex-row items-center py-1"
          style={{ gap: 2, opacity: index === 0 ? 0.35 : 1 }}
        >
          <ChevronLeft size={16} color="#6E8090" />
          <Text className="text-muted text-[12px] font-semibold">Previous</Text>
        </TouchableOpacity>

        {stage !== 'checkin' ? (
          <TouchableOpacity
            onPress={() => go(lastIndex)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go to daily check-in"
            className="py-1 px-2"
          >
            <Text className="text-accent text-[12px] font-semibold">Check-In</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 64 }} />
        )}

        <TouchableOpacity
          onPress={() => go(index + 1)}
          disabled={index === lastIndex}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next step"
          className="flex-row items-center py-1"
          style={{ gap: 2, opacity: index === lastIndex ? 0.35 : 1 }}
        >
          <Text className="text-muted text-[12px] font-semibold">Next</Text>
          <ChevronRight size={16} color="#6E8090" />
        </TouchableOpacity>
      </View>

      {upcoming && !pickerOpen && (
        <Text className="text-faint text-[11px] mt-2">
          Up next · {upcoming.label} · ~{upcoming.durationMin} min
        </Text>
      )}
    </View>
  );
}

/** Stage opener — one orienting line above the work. */
export function StageOpener({ stage }: { stage: SessionStage }) {
  const { opener } = metaForStage(stage);
  return (
    <Text className="text-muted text-[13.5px] text-center leading-5 px-3 mb-5">{opener}</Text>
  );
}

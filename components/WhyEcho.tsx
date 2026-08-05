import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { LocalStore } from '../services/storage';

/**
 * WhyEcho — his own onboarding reason, delivered back at the moments of
 * maximum doubt (2026-08-03, build order 2.2).
 *
 * The mechanism: self-authored motivation is the one churn intervention
 * immune to the counter-thought "the app is manipulating me" — he cannot
 * argue with his own words, written at maximum optimism, and the goals
 * screen explicitly told him why he was writing them ("A hard night will
 * come. When it does, what reminds you why you started…"). This component
 * is that promise being kept.
 *
 * Source: '@user_why', persisted once at purchase (free text first, else
 * his first selected goal — resolveGoalEcho's chain). Renders NOTHING when
 * absent: a placeholder or a "add your why" prompt on a repair surface
 * would convert a repair moment into a task.
 *
 * Placement discipline (hard rule): repair surfaces and the terminal
 * ceremony ONLY — the Return state, a flat/dip re-measure result, and
 * graduation. Never on wins (evidence is doing that job), never on ordinary
 * days. Scarcity is what keeps his own sentence potent on the fourth lapse
 * instead of wallpaper by the second.
 */

const WHY_KEY = '@user_why';
const MAX_CHARS = 200;

/** Truncate at the last full word inside the cap — never mid-word. */
function clip(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  const cut = text.slice(0, MAX_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : MAX_CHARS).trimEnd()}…`;
}

export default function WhyEcho({ compact = false }: { compact?: boolean }) {
  const [why, setWhy] = useState<string | null>(null);

  useEffect(() => {
    LocalStore.getItem<string>(WHY_KEY).then((stored) => {
      const trimmed = typeof stored === 'string' ? stored.trim() : '';
      if (trimmed) setWhy(clip(trimmed));
    });
  }, []);

  if (!why) return null;

  return (
    <View className={compact ? 'mt-4' : 'mt-5'}>
      {/* Serif italic, quoted, attributed — the same grammar as the
          graduation anchor quote: his words, on the record. Ink, not
          accent: identity register spends no accent budget. */}
      <Text
        className="text-ink font-serif-italic"
        style={{ fontSize: compact ? 14 : 15, lineHeight: compact ? 22 : 24 }}
      >
        “{why}”
      </Text>
      <Text className="text-dim text-[11px] mt-1.5">— you, Day 0</Text>
    </View>
  );
}

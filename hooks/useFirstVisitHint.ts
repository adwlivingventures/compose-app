import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { LocalStore } from '../services/storage';
import { useProtocol } from '../context/ProtocolContext';

/** Storage keys — one per tab, set on first focus during Days 1–3. */
const HINT_KEYS = {
  protocol: '@tab_hint_seen_protocol',
  steady: '@tab_hint_seen_steady',
  baseline: '@tab_hint_seen_baseline',
  you: '@tab_hint_seen_you',
} as const;

export type TabHintId = keyof typeof HINT_KEYS;

export const TAB_HINT_COPY: Record<TabHintId, string> = {
  protocol:
    "Your map — revisit any day you've earned by tapping a completed dot.",
  steady: 'For spikes between sessions — four doors, one answer each.',
  baseline: 'Evidence of change — meaningful after Day 14, worth watching from Day 1.',
  you: 'Library and settings — most tools open as you progress through the protocol.',
};

/**
 * Shows a one-line context banner on a tab's first visit during Days 1–3.
 * Dismisses permanently for that tab once seen (or on explicit dismiss).
 */
export function useFirstVisitHint(tab: TabHintId) {
  const { activeDay } = useProtocol();
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (activeDay > 3) {
        setVisible(false);
        return;
      }
      let alive = true;
      LocalStore.getItem<boolean>(HINT_KEYS[tab]).then((seen) => {
        if (alive && !seen) setVisible(true);
      });
      return () => {
        alive = false;
      };
    }, [activeDay, tab]),
  );

  const dismiss = useCallback(async () => {
    await LocalStore.setItem(HINT_KEYS[tab], true);
    setVisible(false);
  }, [tab]);

  return {
    show: visible && activeDay <= 3,
    copy: TAB_HINT_COPY[tab],
    dismiss,
  };
}

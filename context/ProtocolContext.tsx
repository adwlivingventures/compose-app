import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { LocalStore } from '../services/storage';
import { disableDailyReminder } from '../services/notifications';
import { hasMembershipEntitlement } from '../hooks/useRevenueCat';
import { track } from '../services/analytics';

import { LedgerState } from '../content/ledger';

export interface DayData {
  completed: boolean;
  pelvicRating: number;
  /** The Vitality Ledger — phase-gated, unbundled daily votes
   *  (content/ledger.ts; supersedes the bundled 3-item HabitState —
   *  clean break, founder ruling 2026-07-12). */
  ledger: LedgerState;
}

export interface PhaseInfo {
  number: 1 | 2 | 3;
  title: string;
}

/**
 * Phase is always derived from the day — never stored — so it can never
 * drift out of sync with activeDay.
 */
export function getPhaseForDay(day: number): PhaseInfo {
  if (day <= 25) return { number: 1, title: 'Autonomic Reset' };
  if (day <= 50) return { number: 2, title: 'Exposure & Mastery' };
  return { number: 3, title: 'Identity Consolidation' };
}

/** Local calendar date as YYYY-MM-DD — the unit of the one-session-per-day lock. */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole calendar days between two YYYY-MM-DD strings (b - a). */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const start = new Date(ay, am - 1, ad).getTime();
  const end = new Date(by, bm - 1, bd).getTime();
  return Math.round((end - start) / 86_400_000);
}

interface ProtocolContextType {
  activeDay: number;
  streak: number;
  hasPurchased: boolean;
  completedDays: Record<number, DayData>;
  /** Local date (YYYY-MM-DD) of the last completed session — drives the midnight pacing lock. */
  lastCompletedDate: string | null;
  markDayComplete: (day: number, data: DayData) => Promise<void>;
  /** Check-anytime ledger writes: items can be marked when they HAPPEN
   *  (morning light at 8am), not recalled at 9pm — the session checklist
   *  becomes reconciliation, not a memory test. */
  updateDailyLedger: (day: number, ledger: LedgerState) => Promise<void>;
  unlockProtocol: () => Promise<void>;
  /** Wipes protocol progress (day, streak, completions) back to Day 1.
   *  Deliberately does NOT touch the purchase entitlement flag. */
  resetProtocol: () => Promise<void>;
  /** DEV ONLY: jump to an arbitrary protocol day for content testing.
   *  Releases the midnight pacing lock so the target day plays
   *  immediately. No-ops in production builds. */
  devJumpToDay: (day: number) => Promise<void>;
  loading: boolean;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

/**
 * Ledger-era day data (v2). Clean break from '@completed_days_data'
 * (bundled 3-item HabitState): the old key is neither read nor migrated —
 * approved 2026-07-12, pre-launch, no live users mid-protocol.
 */
const DAYS_KEY = '@completed_days_data_v2';

/**
 * ProtocolProvider acts as the operational nervous system for COMPOSE.
 * It tracks active days of the 75-day protocol, streaks, paywall unlock entitlements,
 * and daily habit checkmark sets. It automatically synchronizes states with secure local caches.
 */
export const ProtocolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [completedDays, setCompletedDays] = useState<Record<number, DayData>>({});
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load saved state from secure storage
  useEffect(() => {
    const initializeSession = async () => {
      // Cold-start cache: the keychain flag renders the app instantly and
      // offline. It is a CACHE of the `membership` entitlement, not the
      // authority — the RC sync effect below reconciles it, because a
      // subscription (unlike the retired one-time purchase) can lapse.
      const receipt = await LocalStore.secureGet('secure_purchase_receipt');
      if (receipt) setHasPurchased(true);

      // Restore baseline program statistics from Async storage
      const savedProgress = await LocalStore.getItem<{
        activeDay: number;
        streak: number;
        lastCompletedDate?: string;
      }>('@user_protocol_state');
      const savedDays = await LocalStore.getItem<Record<number, DayData>>(DAYS_KEY);

      if (savedProgress) {
        setActiveDay(savedProgress.activeDay);
        setStreak(savedProgress.streak);
        setLastCompletedDate(savedProgress.lastCompletedDate ?? null);
      }
      if (savedDays) {
        setCompletedDays(savedDays);
      }
      setLoading(false);
    };
    initializeSession();
  }, []);

  // hasPurchased maps to the `membership` entitlement (CLAUDE.md §2 Model
  // V2). Runs after hydration — RootLayout's configure effect fires before
  // this second-pass effect, and isConfigured() guards the race anyway.
  // The listener catches renewals, restores, and lapses while the app runs;
  // every change is written back to the keychain cache so the next cold
  // start reflects it. A lapsed member is downgraded here and nowhere else.
  useEffect(() => {
    if (loading) return;

    const applyMembership = async (active: boolean) => {
      setHasPurchased(active);
      if (active) {
        await LocalStore.secureSave('secure_purchase_receipt', 'membership_active');
      } else {
        await LocalStore.secureDelete('secure_purchase_receipt');
      }
    };

    let listener: any;
    (async () => {
      try {
        if (!(await Purchases.isConfigured())) return;
        listener = Purchases.addCustomerInfoUpdateListener((info) => {
          applyMembership(hasMembershipEntitlement(info));
        });
        const info = await Purchases.getCustomerInfo();
        await applyMembership(hasMembershipEntitlement(info));
      } catch {
        // Offline or RC unreachable: keep the cached flag. RC's own cached
        // CustomerInfo heals this on the next successful fetch.
      }
    })();

    return () => {
      if (listener && typeof listener.remove === 'function') listener.remove();
    };
  }, [loading]);

  /**
   * Marks membership active immediately after a successful purchase or
   * restore and caches it to the Keychain for the next cold start.
   */
  const unlockProtocol = async () => {
    await LocalStore.secureSave('secure_purchase_receipt', 'membership_active');
    setHasPurchased(true);
  };

  const resetProtocol = async () => {
    setActiveDay(1);
    setStreak(0);
    setCompletedDays({});
    setLastCompletedDate(null);
    await LocalStore.setItem('@user_protocol_state', {
      activeDay: 1,
      streak: 0,
      lastCompletedDate: null,
    });
    await LocalStore.setItem(DAYS_KEY, {});
  };

  const devJumpToDay = async (day: number) => {
    if (!__DEV__) return;
    const clamped = Math.max(1, Math.min(75, Math.round(day)));
    setActiveDay(clamped);
    // Release the one-session-per-day lock so the jumped-to day is playable now.
    setLastCompletedDate(null);
    await LocalStore.setItem('@user_protocol_state', {
      activeDay: clamped,
      streak,
      lastCompletedDate: null,
    });
  };

  /**
   * Check-anytime writes for the day's Vitality Ledger. Works before the
   * session completes (the Today-tab ledger row) and is merged — never
   * replaced — so a morning check and an evening reconciliation coexist.
   */
  const updateDailyLedger = async (day: number, updatedLedger: LedgerState) => {
    const currentDayData =
      completedDays[day] || { completed: false, pelvicRating: 0, ledger: {} };
    const newDays = {
      ...completedDays,
      [day]: {
        ...currentDayData,
        ledger: { ...currentDayData.ledger, ...updatedLedger },
      },
    };
    setCompletedDays(newDays);
    await LocalStore.setItem(DAYS_KEY, newDays);
  };

  /**
   * Commits the absolute completion of a single day�s somatic workout tracks.
   * Increments the user's active progress day and recalculates completion streaks.
   */
  const markDayComplete = async (day: number, data: DayData) => {
    // Pacing lock: one session per local calendar day. Rejecting a second
    // completion here (not just hiding the button) means the constraint holds
    // even if a future screen forgets to gate itself.
    const today = localDateString();
    if (lastCompletedDate === today) return;

    const newDays = {
      ...completedDays,
      [day]: { ...data, completed: true }
    };
    setCompletedDays(newDays);
    setLastCompletedDate(today);

    // Cohort telemetry (§7): the retention curve's raw material — day number
    // and the 1–5 self-rated control score, nothing else. Consent-gated and
    // whitelisted inside track().
    track('day_completed', { day });
    if (data.pelvicRating > 0) {
      track('control_score', { value: data.pelvicRating, day });
    }

    let newStreak = streak;
    if (day === activeDay) {
      // Streak with repair semantics (mirrors Day 24: "a falter is not a
      // relapse; it is data"). Completing the day after a single missed
      // calendar day quietly continues the streak — only a multi-day
      // walk-away restarts it. A hard reset on one miss turns the counter
      // into a shame trigger, which is the exact loop this app treats.
      const gap = lastCompletedDate ? daysBetween(lastCompletedDate, today) : 1;
      newStreak = gap <= 2 ? streak + 1 : 1;
      setStreak(newStreak);
      setActiveDay(prev => Math.min(prev + 1, 75));
    }

    await LocalStore.setItem(DAYS_KEY, newDays);
    await LocalStore.setItem('@user_protocol_state', {
      activeDay: Math.min(day + 1, 75),
      streak: newStreak,
      lastCompletedDate: today,
    });

    // Protocol complete: the daily reminder's job is over. A "session is
    // ready" line after Day 75 is a broken promise — the graduation flow
    // owns what comes next. Flag written straight to storage; the E18
    // toggle re-syncs on next hydration.
    if (day === 75) {
      track('graduated');
      await disableDailyReminder();
      await LocalStore.setItem('@discreet_notifications', false);
    }
  };

  return (
    <ProtocolContext.Provider value={{
      activeDay,
      streak,
      hasPurchased,
      completedDays,
      lastCompletedDate,
      markDayComplete,
      updateDailyLedger,
      unlockProtocol,
      resetProtocol,
      devJumpToDay,
      loading
    }}>
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error('useProtocol must be used within a ProtocolProvider');
  return context;
};

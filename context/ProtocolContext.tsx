import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStore } from '../services/storage';
import { disableDailyReminder } from '../services/notifications';

export interface HabitState {
  presence: boolean;
  focus: boolean;
  vitality: boolean;
}

export interface DayData {
  completed: boolean;
  pelvicRating: number;
  habits: HabitState;
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
  updateDailyHabits: (day: number, habits: HabitState) => Promise<void>;
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
      // Restore premium validation flag from secure keychain
      const receipt = await LocalStore.secureGet('secure_purchase_receipt');
      if (receipt) setHasPurchased(true);

      // Restore baseline program statistics from Async storage
      const savedProgress = await LocalStore.getItem<{
        activeDay: number;
        streak: number;
        lastCompletedDate?: string;
      }>('@user_protocol_state');
      const savedDays = await LocalStore.getItem<Record<number, DayData>>('@completed_days_data');

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

  /**
   * Unlocks full access to the 75-Day program and writes validation securely to device Keychain.
   */
  const unlockProtocol = async () => {
    await LocalStore.secureSave('secure_purchase_receipt', 'activated_75day_token');
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
    await LocalStore.setItem('@completed_days_data', {});
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
   * Real-time toggling for the daily presence, focus, and vitality checklist habits.
   */
  const updateDailyHabits = async (day: number, updatedHabits: HabitState) => {
    const currentDayData = completedDays[day] || { completed: false, pelvicRating: 0, habits: updatedHabits };
    const newDays = {
      ...completedDays,
      [day]: { ...currentDayData, habits: updatedHabits }
    };
    setCompletedDays(newDays);
    await LocalStore.setItem('@completed_days_data', newDays);
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

    await LocalStore.setItem('@completed_days_data', newDays);
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
      updateDailyHabits,
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

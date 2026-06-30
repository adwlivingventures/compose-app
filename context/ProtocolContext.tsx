import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStore } from '../services/storage';

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

interface ProtocolContextType {
  activeDay: number;
  streak: number;
  hasPurchased: boolean;
  completedDays: Record<number, DayData>;
  markDayComplete: (day: number, data: DayData) => Promise<void>;
  updateDailyHabits: (day: number, habits: HabitState) => Promise<void>;
  unlockProtocol: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load saved state from secure storage
  useEffect(() => {
    const initializeSession = async () => {
      // Restore premium validation flag from secure keychain
      const receipt = await LocalStore.secureGet('secure_purchase_receipt');
      if (receipt) setHasPurchased(true);

      // Restore baseline program statistics from Async storage
      const savedProgress = await LocalStore.getItem<{ activeDay: number; streak: number }>('@user_protocol_state');
      const savedDays = await LocalStore.getItem<Record<number, DayData>>('@completed_days_data');

      if (savedProgress) {
        setActiveDay(savedProgress.activeDay);
        setStreak(savedProgress.streak);
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
   * Commits the absolute completion of a single day’s somatic workout tracks.
   * Increments the user's active progress day and recalculates completion streaks.
   */
  const markDayComplete = async (day: number, data: DayData) => {
    const newDays = {
      ...completedDays,
      [day]: { ...data, completed: true }
    };
    setCompletedDays(newDays);
    
    let newStreak = streak;
    if (day === activeDay) {
      newStreak += 1;
      setStreak(newStreak);
      setActiveDay(prev => Math.min(prev + 1, 75));
    }

    await LocalStore.setItem('@completed_days_data', newDays);
    await LocalStore.setItem('@user_protocol_state', { activeDay: Math.min(day + 1, 75), streak: newStreak });
  };

  return (
    <ProtocolContext.Provider value={{
      activeDay,
      streak,
      hasPurchased,
      completedDays,
      markDayComplete,
      updateDailyHabits,
      unlockProtocol,
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

import type * as NotificationsTypes from 'expo-notifications';
import { LocalStore } from './storage';

/**
 * Guarded loader for expo-notifications (same contract as biometrics.ts:
 * requireNativeModule throws on a client binary that predates the module,
 * so the require lives in a try/catch and consumers use fail-soft wrappers).
 *
 * One notification COPY exists in this app — the daily reminder line fixed
 * by CLAUDE.md §6 (stranger test); there is deliberately no API here that
 * accepts notification text. Founder ruling 2026-07-15: the user chooses
 * the delivery time(s), one or several per day, so the SCHEDULE is his
 * while the copy stays ours.
 */

let notifications: typeof NotificationsTypes | null = null;
try {
  notifications = require('expo-notifications');
} catch {
  notifications = null;
}

/** False when the client binary was built without the native module. */
export const notificationsPresent = notifications !== null;

const REMINDER_TIME_KEY = '@notification_time'; // legacy single-time key
const REMINDER_TIMES_KEY = '@notification_times';

export interface ReminderTime {
  hour: number;
  minute: number;
}

/** The times last scheduled — re-enabling reuses them. Migrates the
 *  pre-multi-time single value in place. */
export async function getReminderTimes(): Promise<ReminderTime[] | null> {
  const times = await LocalStore.getItem<ReminderTime[]>(REMINDER_TIMES_KEY);
  if (times && times.length > 0) return times;
  const legacy = await LocalStore.getItem<ReminderTime>(REMINDER_TIME_KEY);
  return legacy ? [legacy] : null;
}

/**
 * Request permission and schedule one daily reminder per chosen time.
 * Replaces any previous schedule wholesale — the queue only ever holds
 * this app's reminders.
 */
export async function enableDailyReminder(
  times: ReminderTime[],
): Promise<'scheduled' | 'denied' | 'unavailable'> {
  if (!notifications || times.length === 0) return 'unavailable';
  try {
    const { granted } = await notifications.requestPermissionsAsync();
    if (!granted) return 'denied';
    await notifications.cancelAllScheduledNotificationsAsync();
    for (const time of times) {
      await notifications.scheduleNotificationAsync({
        content: {
          // Binding copy (CLAUDE.md §6): unremarkable to a stranger, no
          // urgency, no domain vocabulary, no emoji, no name. Sound off —
          // a nervous-system product does not startle its user.
          title: 'Compose',
          body: "Today's session is ready.",
          sound: false,
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
        },
      });
    }
    await LocalStore.setItem(REMINDER_TIMES_KEY, times);
    return 'scheduled';
  } catch {
    return 'unavailable';
  }
}

/** Cancels all daily reminders (toggle off, or protocol completion). */
export async function disableDailyReminder(): Promise<void> {
  if (!notifications) return;
  try {
    await notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

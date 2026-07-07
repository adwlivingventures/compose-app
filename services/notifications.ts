import type * as NotificationsTypes from 'expo-notifications';
import { LocalStore } from './storage';

/**
 * Guarded loader for expo-notifications (same contract as biometrics.ts:
 * requireNativeModule throws on a client binary that predates the module,
 * so the require lives in a try/catch and consumers use fail-soft wrappers).
 *
 * One notification exists in this app: the daily local reminder, scheduled
 * at the hour the user completed Day 1. Its copy is fixed by CLAUDE.md §6
 * (stranger test) and is not parameterized — there is deliberately no API
 * here that accepts notification text.
 */

let notifications: typeof NotificationsTypes | null = null;
try {
  notifications = require('expo-notifications');
} catch {
  notifications = null;
}

/** False when the client binary was built without the native module. */
export const notificationsPresent = notifications !== null;

const REMINDER_TIME_KEY = '@notification_time';

export interface ReminderTime {
  hour: number;
  minute: number;
}

/** The hour the reminder was first scheduled at — re-enabling reuses it. */
export async function getReminderTime(): Promise<ReminderTime | null> {
  return LocalStore.getItem<ReminderTime>(REMINDER_TIME_KEY);
}

/**
 * Request permission and schedule the single daily reminder. Replaces any
 * previous schedule (there is only ever one notification in the queue).
 */
export async function enableDailyReminder(
  time: ReminderTime,
): Promise<'scheduled' | 'denied' | 'unavailable'> {
  if (!notifications) return 'unavailable';
  try {
    const { granted } = await notifications.requestPermissionsAsync();
    if (!granted) return 'denied';
    await notifications.cancelAllScheduledNotificationsAsync();
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
    await LocalStore.setItem(REMINDER_TIME_KEY, time);
    return 'scheduled';
  } catch {
    return 'unavailable';
  }
}

/** Cancels the daily reminder (toggle off, or protocol completion). */
export async function disableDailyReminder(): Promise<void> {
  if (!notifications) return;
  try {
    await notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

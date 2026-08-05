import type * as NotificationsTypes from 'expo-notifications';
import { LocalStore } from './storage';

/**
 * Guarded loader for expo-notifications (same contract as biometrics.ts:
 * requireNativeModule throws on a client binary that predates the module,
 * so the require lives in a try/catch and consumers use fail-soft wrappers).
 *
 * Notification COPY is composed HERE and only here — there is deliberately
 * no API that accepts notification text from a caller. Founder ruling
 * 2026-07-15: the user chooses the delivery time(s); the copy stays ours.
 *
 * The discretion level (2026-08-03, build order 1.3 — CLAUDE.md §6 rewrite):
 * this module reads the user-chosen level from disk at (re)schedule time.
 *  - SHIELDED (and the never-chosen null): the pre-2026-07-25 behavior,
 *    byte-identical — "Compose / Today's session is ready.", stranger-test
 *    neutral, nameless. Never silently upgraded.
 *  - PERSONAL: a reviewed, authored line from PERSONAL_LINES below (rotating
 *    by weekday — deterministic, no runtime generation, §7), with his first
 *    name when one is stored. The bar is NON-DIAGNOSTIC, not "anything
 *    goes": every line must read clean to a stranger who knows nothing
 *    about what this app addresses. New lines are added ONLY to this
 *    reviewed set — that review is the §6 enforcement point.
 *
 * ABSOLUTE at every level (clinical rule, outranks discretion entirely):
 * no urgency, no loss framing, no streak language, no countdowns, no emoji.
 * Urgency framing is sympathetic activation — the exact state the product
 * exists to down-regulate.
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
// Read-only mirrors of keys owned elsewhere (DiscreetContext / onboarding):
// this module reads them at schedule time so call sites never thread copy-
// affecting state through their signatures.
const DISCRETION_LEVEL_KEY = '@discretion_level';
const FIRST_NAME_KEY = '@user_first_name';

export interface ReminderTime {
  hour: number;
  minute: number;
}

/**
 * The Personal-level reviewed set — one line per weekday, rotation keyed to
 * the weekday (deterministic; identical schedule every week). Register:
 * calm authority, identity/practice content, zero urgency, zero domain
 * vocabulary a stranger could diagnose from. Each line is a daily identity
 * rep delivered at a moment the app is closed — which is exactly why the
 * Personal level exists.
 */
// Founder review 2026-08-05: lines 1–3 rewritten (originals read as clever;
// the approved register is plain, declarative, work-focused — like 4–7).
const PERSONAL_LINES = [
  'Today’s session is ready. Fifteen minutes, start to finish.', // Sunday
  'Tonight’s fifteen minutes are ready when you are.',
  'The daily rep is what changes the baseline. Tonight’s is ready.',
  'Presence is a practice, and tonight’s session is ready.',
  'Steady is built daily. Today’s work is waiting.',
  'The work is quiet, and it is working. Tonight continues it.',
  'One session tonight. The baseline you keep is built from these.', // Saturday
] as const;

/** The times last scheduled — re-enabling reuses them. Migrates the
 *  pre-multi-time single value in place. */
export async function getReminderTimes(): Promise<ReminderTime[] | null> {
  const times = await LocalStore.getItem<ReminderTime[]>(REMINDER_TIMES_KEY);
  if (times && times.length > 0) return times;
  const legacy = await LocalStore.getItem<ReminderTime>(REMINDER_TIME_KEY);
  return legacy ? [legacy] : null;
}

/** The Personal-level body for a given weekday (1–7, Sunday = 1 — the
 *  expo/iOS convention) and optional first name. Exported for the live
 *  preview on the Discretion screen, so preview and delivery can never
 *  drift apart. */
export function personalReminderBody(weekday: number, firstName: string | null): string {
  const line = PERSONAL_LINES[(((weekday - 1) % 7) + 7) % 7];
  return firstName ? `${firstName} — ${line.charAt(0).toLowerCase()}${line.slice(1)}` : line;
}

/** The Shielded-level body — the binding §6 neutral pattern, verbatim. */
export const SHIELDED_REMINDER_BODY = "Today's session is ready.";

/**
 * Request permission and schedule the daily reminder(s) at the chosen times.
 * Replaces any previous schedule wholesale — the queue only ever holds this
 * app's reminders. Copy is decided HERE from the stored discretion level:
 * Shielded (or never-chosen) schedules one DAILY trigger per time with the
 * neutral line; Personal schedules seven WEEKLY triggers per time, one per
 * weekday, rotating through the reviewed set (deterministic — §7).
 */
export async function enableDailyReminder(
  times: ReminderTime[],
): Promise<'scheduled' | 'denied' | 'unavailable'> {
  if (!notifications || times.length === 0) return 'unavailable';
  try {
    const { granted } = await notifications.requestPermissionsAsync();
    if (!granted) return 'denied';

    // Null level = Shielded. The level only changes copy after an explicit
    // choice on the Discretion screen (never silently defaulted, §6).
    const level = await LocalStore.getItem<string>(DISCRETION_LEVEL_KEY);
    const personal = level === 'personal';
    const firstName = personal ? await LocalStore.getItem<string>(FIRST_NAME_KEY) : null;

    await notifications.cancelAllScheduledNotificationsAsync();
    for (const time of times) {
      if (personal) {
        // 7 weekly triggers per chosen time (well inside iOS's 64-slot cap
        // for any realistic time count). Weekday-keyed rotation: the same
        // authored line on the same weekday, every week — versioned content,
        // zero runtime generation.
        for (let weekday = 1; weekday <= 7; weekday++) {
          await notifications.scheduleNotificationAsync({
            content: {
              title: 'Compose',
              body: personalReminderBody(weekday, firstName ?? null),
              sound: false, // a nervous-system product does not startle its user
            },
            trigger: {
              type: notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday,
              hour: time.hour,
              minute: time.minute,
            },
          });
        }
      } else {
        await notifications.scheduleNotificationAsync({
          content: {
            // Binding copy (CLAUDE.md §6): unremarkable to a stranger, no
            // urgency, no domain vocabulary, no emoji, no name.
            title: 'Compose',
            body: SHIELDED_REMINDER_BODY,
            sound: false,
          },
          trigger: {
            type: notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
          },
        });
      }
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

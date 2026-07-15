import type * as StoreReviewTypes from 'expo-store-review';
import { LocalStore } from './storage';

/**
 * App Store rating asks — same guarded-loader contract as notifications.ts
 * (the module ships in the NEXT dev-client build; on older binaries every
 * surface gates on `ratingPresent` and simply never shows an ask).
 *
 * Platform constraint (founder flagged 2026-07-15): Apple caps the native
 * in-app review prompt at 3 per rolling 365 days and never reports whether
 * the user actually rated. So the schedule below is OUR ask screen; its
 * "Rate" button spends one native prompt. Once the user taps Rate we mark
 * him engaged and never ask again — the only honest signal we can get.
 *
 * Ask schedule (founder ruling 2026-07-15): once post-purchase, then after
 * completing Days 2, 14, 30, 40, 75 — each only while not yet engaged.
 * Never a modal interrupt mid-session; the ask rides a completion high.
 */

let storeReview: typeof StoreReviewTypes | null = null;
try {
  storeReview = require('expo-store-review');
} catch {
  storeReview = null;
}

export const RATING_ASK_DAYS = [2, 14, 30, 40, 75] as const;

const RATING_STATE_KEY = '@rating_state';

interface RatingState {
  /** He tapped "Rate" once — stop asking forever. */
  engaged: boolean;
  /** Native prompts spent (Apple allows ~3/365d; we never exceed 3). */
  nativeAsks: number;
  /** Days whose ask has been shown (each fires at most once). */
  askedDays: number[];
  postPurchaseAsked: boolean;
}

const DEFAULT_STATE: RatingState = {
  engaged: false,
  nativeAsks: 0,
  askedDays: [],
  postPurchaseAsked: false,
};

async function getState(): Promise<RatingState> {
  return (await LocalStore.getItem<RatingState>(RATING_STATE_KEY)) ?? DEFAULT_STATE;
}

/** False when the client binary was built without the native module. */
export async function ratingAvailable(): Promise<boolean> {
  if (!storeReview) return false;
  try {
    return await storeReview.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Should the post-purchase ask screen render? */
export async function shouldAskPostPurchase(): Promise<boolean> {
  const state = await getState();
  return !state.engaged && !state.postPurchaseAsked && (await ratingAvailable());
}

/** Should the ask render after completing `day`? */
export async function shouldAskForDay(day: number): Promise<boolean> {
  if (!RATING_ASK_DAYS.includes(day as (typeof RATING_ASK_DAYS)[number])) return false;
  const state = await getState();
  if (state.engaged || state.askedDays.includes(day)) return false;
  return ratingAvailable();
}

/** Record that an ask was shown (post-purchase or a given day). */
export async function markAsked(day?: number): Promise<void> {
  const state = await getState();
  await LocalStore.setItem(RATING_STATE_KEY, {
    ...state,
    postPurchaseAsked: day === undefined ? true : state.postPurchaseAsked,
    askedDays: day === undefined ? state.askedDays : [...state.askedDays, day],
  });
}

/**
 * He tapped Rate: fire the native prompt (if quota remains) and mark him
 * engaged so no surface ever asks again.
 */
export async function requestRating(): Promise<void> {
  const state = await getState();
  await LocalStore.setItem(RATING_STATE_KEY, { ...state, engaged: true });
  if (!storeReview || state.nativeAsks >= 3) return;
  try {
    await storeReview.requestReview();
    await LocalStore.setItem(RATING_STATE_KEY, {
      ...state,
      engaged: true,
      nativeAsks: state.nativeAsks + 1,
    });
  } catch {
    // Silent — a failed review prompt must never surface as an error.
  }
}

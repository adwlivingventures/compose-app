// Onboarding A/B variant assignment (BUILD_PROMPT §4.2): one 50/50 draw at
// first launch, persisted, never reassigned. Dev menu may force/reset.
// The tag rides on analytics events (step 6) — never on answer content.

import { LocalStore } from './storage';
import type { Variant } from '../content/onboarding/types';

const KEY = '@onboarding_variant';

export async function getOrAssignVariant(): Promise<Variant> {
  const existing = await LocalStore.getItem<Variant>(KEY);
  if (existing === 'A' || existing === 'B') return existing;
  const assigned: Variant = Math.random() < 0.5 ? 'A' : 'B';
  await LocalStore.setItem(KEY, assigned);
  return assigned;
}

/** Dev-only override (force A / force B). */
export async function devForceVariant(variant: Variant): Promise<void> {
  if (!__DEV__) return;
  await LocalStore.setItem(KEY, variant);
}

/** Dev-only reset — next launch re-draws. (LocalStore has no remove; null re-draws.) */
export async function devResetVariant(): Promise<void> {
  if (!__DEV__) return;
  await LocalStore.setItem(KEY, null);
}

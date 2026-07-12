// Runtime flow logic — pure, unit-tested (see __tests__/logic.test.ts).
// Evaluates the declarative displayLogic conditions from screens.ts against
// the user's answers. Answers NEVER leave this module's callers' local state
// + AsyncStorage (§7).

import type { AnswerKey, Condition, ResolvedScreen, Screen } from './types';

export type Answers = Partial<Record<AnswerKey, string | number | string[]>>;

export interface FlowFlags {
  /** Testimonial slots ship dark until real, consented quotes exist. */
  testimonials: boolean;
}

export const DEFAULT_FLAGS: FlowFlags = { testimonials: false };

export function evalCondition(cond: Condition, answers: Answers): boolean {
  if ('all' in cond) return cond.all.every((c) => evalCondition(c, answers));
  const value = answers[cond.key];
  if ('equals' in cond) return value === cond.equals;
  if ('oneOf' in cond) return typeof value === 'string' && cond.oneOf.includes(value);
  if ('lte' in cond) return typeof value === 'number' && value <= cond.lte;
  return false;
}

/**
 * Whether a screen renders for this user right now. The paywall-dismiss
 * screen is interceptor-only — it never appears in sequential advance.
 */
export function isScreenVisible(
  screen: Screen,
  answers: Answers,
  flags: FlowFlags = DEFAULT_FLAGS,
): boolean {
  if (screen.archetype === 'paywall-dismiss') return false;
  if (screen.gate === 'testimonials' && !flags.testimonials) return false;
  if (screen.displayLogic?.showIf) return evalCondition(screen.displayLogic.showIf, answers);
  if (screen.displayLogic?.skipIf) return !evalCondition(screen.displayLogic.skipIf, answers);
  return true;
}

/** Index of the next visible screen after `from`, or -1 at flow end. */
export function nextVisibleIndex(
  flow: ResolvedScreen[],
  from: number,
  answers: Answers,
  flags: FlowFlags = DEFAULT_FLAGS,
): number {
  for (let i = from + 1; i < flow.length; i++) {
    if (isScreenVisible(flow[i], answers, flags)) return i;
  }
  return -1;
}

// ── Progress header ("MAPPING · X OF Y · ~N MIN") ─────────────────────────
// Layout truth (3a reference frame shows "10 OF 24"): Y is the LAST ASSESSMENT
// SCREEN's number — spillover (24). X is the screen's static spec number;
// runtime-skipped conditionals keep their numbers (the bar simply advances
// past them). Clinical cards are numbered but render full-bleed without the
// header, per the reference.

const HEADERED: Screen['archetype'][] = [
  'single-select',
  'multi-select',
  'text-input',
  'wheel-input',
  'slider-input',
  'interactive-check',
  'note-card',
];

export interface ProgressMeta {
  step: number;
  total: number;
  minutesLeft: number;
}

/** ≈9s per remaining screen (calibrated to the reference: 14 remaining → ~2 min). */
const SECONDS_PER_SCREEN = 9;

export function progressMeta(
  flow: ResolvedScreen[],
  index: number,
): ProgressMeta | null {
  const screen = flow[index];
  if (!screen?.specId || !HEADERED.includes(screen.archetype)) return null;
  const total = specNumber(flow.find((s) => s.id === 'spillover'));
  const step = specNumber(screen);
  if (!total || !step || step < 3 || step > total) return null;
  const minutesLeft = Math.max(1, Math.ceil(((total - step) * SECONDS_PER_SCREEN) / 60));
  return { step, total, minutesLeft };
}

/** Question-family screens carry the privacy footer; Map has its own. */
export function hasPrivacyFooter(screen: Screen): boolean {
  return HEADERED.includes(screen.archetype) && screen.archetype !== 'note-card';
}

function specNumber(screen: ResolvedScreen | undefined): number | null {
  if (!screen?.specId) return null;
  const n = Number(screen.specId); // plain "01"–"43" since the A/B retirement
  return Number.isFinite(n) ? n : null;
}

/** Replace the {name} token in Map headline copy. */
export function withName(template: string, answers: Answers): string {
  const name = typeof answers.name === 'string' && answers.name.trim().length > 0
    ? answers.name.trim()
    : null;
  // Grammar survives a missing name: "{name}, here is…" → "Here is…"
  if (!name) {
    const stripped = template.replace(/^\{name\},\s*/, '');
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return template.replace('{name}', name);
}

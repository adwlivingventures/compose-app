// The Vitality Check-In — the daily discipline layer (v3, founder feature
// batch 2026-07-15; supersedes the phase-gated six-item ledger v2).
//
// What changed in v3: the founder's full daily stack ships from Day 1 —
// nine verifiable behaviors plus one optional supplements line. Phase
// gating is retired (the man sees the whole standard he is training
// toward); the in-app training work now lives in content/training.ts and
// renders as its own section above these.
//
// Every item carries three registers of text:
//   question  — the daily ask, one line, unambiguous.
//   evaluate  — exactly what counts, so the honest man can answer honestly
//               (an unfalsifiable checkbox trains "yeah sure" tapping).
//   rationale — ≤35 words of mechanism for the "Why are these helpful?"
//               resource page (app/vitality.tsx). One page, one link — the
//               per-item (i) buttons are retired.
//
// Doctrine constraints honored here (PSYCHOLOGICAL-FOUNDATIONS §4):
// - Votes, not verdicts: the check-in counts; it never grades, percentages,
//   or pass/fails the man. Consumers must not render % bars from this data.
// - No cure/treatment claims in any rationale (CLAUDE.md §1/§9) — the
//   research notes behind these are rewritten into wellness-lane mechanism.
// - Deterministic, authored, versioned (§7).

export type LedgerKey =
  | 'cleanFocus'
  | 'hydrate'
  | 'training'
  | 'presenceRep'
  | 'breathwork'
  | 'morningLight'
  | 'autonomicPreservation'
  | 'screenSunset'
  | 'supplements';

export type LedgerState = Partial<Record<LedgerKey, boolean>>;

export interface LedgerItem {
  key: LedgerKey;
  title: string;
  /** The daily question — one verifiable behavior, plainly asked. */
  question: string;
  /** What counts, exactly — the standard behind the checkbox. */
  evaluate: string;
  /** ≤35-word mechanism for the resource page. */
  rationale: string;
  /** Habit-stacking cue suggestion (implementation intention). */
  cue: string;
  /** Where the behavior lives in the day — drives grouping in UI. */
  timing: 'morning' | 'day' | 'evening';
  /** Optional items render tagged and never gate anything. */
  optional?: boolean;
}

export const LEDGER_ITEMS: LedgerItem[] = [
  {
    key: 'morningLight',
    title: 'Sunlight',
    question: 'Did your eyes get 10–15 minutes of outdoor light within an hour of waking?',
    evaluate:
      'Outside, within the first hour awake, without sunglasses — 10 to 15 minutes, or about 20 if overcast. A second 10 minutes in the low afternoon sun deepens the anchor.',
    rationale:
      'Early natural light anchors the circadian clock, raising cortisol at the right hour and supporting overnight testosterone synthesis. Afternoon low-sun light reinforces the same anchor and steadies daytime dopaminergic focus.',
    cue: 'Anchor it to your first coffee — take the cup outside.',
    timing: 'morning',
  },
  {
    key: 'cleanFocus',
    title: 'No Porn',
    question: 'Did you keep today free of all artificial sexual stimulation?',
    evaluate:
      'No pornography, no high-speed explicit content, no novel explicit imagery, no compulsive searching. Artificial stimulation of any kind means the box stays open.',
    rationale:
      'Hyper-stimulating digital arousal downregulates striatal D2 dopamine receptors, so real intimacy stops carrying enough reward signal. Abstinence resensitizes those receptors and restores the natural arousal response this program trains.',
    cue: 'The rule is decided once, in daylight — it is already decided tonight.',
    timing: 'day',
  },
  {
    key: 'hydrate',
    title: 'Hydrate',
    question: 'Did you drink at least 3 liters of water today?',
    evaluate: 'Three liters of water across the day. Coffee and alcohol count against it, not toward it.',
    rationale:
      'Hydration protects the vascular endothelium — the cells that release the nitric oxide penile arteries need to dilate and hold. A constricted, under-watered system works against everything else you do here.',
    cue: 'A full bottle sits on your desk before the day starts.',
    timing: 'day',
  },
  {
    key: 'training',
    title: 'Exercise',
    question: 'Did you get at least 20 minutes of deliberate movement today?',
    evaluate:
      'Twenty minutes minimum of cardiovascular movement — a brisk walk, weights, anything that raises the heart rate on purpose.',
    rationale:
      'Exercise keeps endothelial cells healthy, and healthy endothelium releases the nitric oxide that produces rigid, stable erections. Blood flow is trained daily, and it gives sympathetic charge a clean exit.',
    cue: 'Book it like a meeting — the same slot every day.',
    timing: 'day',
  },
  {
    key: 'presenceRep',
    title: 'Somatic Presence',
    question: 'Did you spend two unbroken minutes inside your body today?',
    evaluate:
      'Two consecutive minutes of attention on physical sensation — fabric on skin, warmth of your hands, the rise of your belly — while analytical and planning thoughts are let go.',
    rationale:
      'Performance anxiety runs on spectatoring — a fight-or-flight pattern that halts erectile blood flow. Redirecting attention to raw physical sensation engages the parasympathetic vagal brake and restores natural vascular responsiveness.',
    cue: 'Attach it to a daily constant — the shower, the last minute of a commute.',
    timing: 'day',
  },
  {
    key: 'breathwork',
    title: 'Breathwork / Meditation',
    question: 'Did you give ten minutes to breathwork or meditation today?',
    evaluate: 'Ten or more minutes of either — seated breathwork, guided meditation, or silent practice.',
    rationale:
      'Ten slow minutes a day lowers baseline stress hormones and trains the state every other part of this program builds on: a regulated nervous system, grounded and present rather than braced.',
    cue: 'Ten quiet minutes after you park, before you go inside.',
    timing: 'day',
  },
  {
    key: 'autonomicPreservation',
    // Renamed 2026-08-03 (build order 0.7): the one item titled in jargon on a
    // list where every neighbor is plain ("Sunlight", "Hydrate", "Sleep").
    // The storage key is unchanged — renames never migrate data.
    title: 'Clean Baseline',
    question: 'Did you protect your baseline today — alcohol-free, substance-free, caffeine done by 2 PM?',
    evaluate:
      'Zero alcohol, zero recreational substances, zero high-dose synthetic stimulants — and the last caffeine of the day lands before 2 PM.',
    rationale:
      'Alcohol and stimulant excess damage the endothelium and raise sympathetic tone. A protected baseline keeps cortisol low and prevents the vasoconstriction that physically works against healthy sexual function.',
    cue: 'The last coffee lands before 2 PM; evenings run on water.',
    timing: 'day',
  },
  {
    key: 'screenSunset',
    title: 'Sleep',
    // Rescoped 2026-08-03 (build order 0.7): the compound question ("curfew
    // AND 7+ hours") was unanswerable honestly on a night when one held and
    // one didn't — and a checkbox that punishes truth collapses self-report.
    // Doctrinal basis: a vote is a behavior he CHOSE (dartboard rule); hours
    // slept is an outcome only partly in his control. The 7+ hours guidance
    // lives on in the rationale below.
    question: 'Did screens end 30 minutes before bed last night?',
    evaluate:
      'No screens for at least the last 30 minutes before sleep. That is the vote — the seven-plus hours it protects are the payoff, not the test.',
    rationale:
      'Evening blue light suppresses melatonin and cuts into deep and REM sleep — where testosterone is synthesized and the endothelium repairs itself. Restorative sleep is the foundation the rest stands on.',
    cue: 'Charge the phone across the room at a fixed hour.',
    timing: 'evening',
  },
  {
    key: 'supplements',
    title: 'Supplements',
    question: 'Optional: did you take your chosen supports today?',
    evaluate:
      'Common supports for this program: Vitamin D3+K2, Ashwagandha, Magnesium Glycinate, Zinc, L-Citrulline. Entirely optional — choose with your physician.',
    rationale:
      'These supports are commonly chosen for endocrine health and nitric-oxide production — the same systems the daily work trains. Optional by design, and worth clearing with your physician first.',
    cue: 'The supplements live next to your toothbrush.',
    timing: 'morning',
    optional: true,
  },
];

/** Core trio for Days 1–7 — session habit first; the full stack opens Day 8. */
export const CORE_LEDGER_KEYS: LedgerKey[] = ['presenceRep', 'cleanFocus', 'morningLight'];

/** Days 1–7: three core habits. Day 8+: the full nine-item stack. */
export function ledgerItemsForDay(day: number): LedgerItem[] {
  if (day <= 7) {
    return LEDGER_ITEMS.filter((item) => CORE_LEDGER_KEYS.includes(item.key));
  }
  return LEDGER_ITEMS;
}

export function emptyLedger(day: number): LedgerState {
  const state: LedgerState = {};
  for (const item of ledgerItemsForDay(day)) state[item.key] = false;
  return state;
}

/** Votes kept on a day — a count, never a percentage (votes, not verdicts). */
export function ledgerVotes(state: LedgerState | undefined): number {
  if (!state) return 0;
  return Object.values(state).filter(Boolean).length;
}

/**
 * The check-in section framing (founder ruling 2026-07-15): concise, and
 * about the man he is becoming — discipline overflowing into everything,
 * carrying an energy a partner feels. Toward-framed, no hustle vocabulary.
 */
export const VITALITY_SECTION_INTRO =
  'Every check is a vote for the man you are becoming. Discipline here overflows into everything — and it carries an energy she can feel.';

/**
 * Async framing (2026-08): the check-in is through the day, not part of
 * the session block — stated on Today and in the session check-in stage.
 */
export const VITALITY_ASYNC_LINE =
  'Through the day, not during your session — check items off whenever they happen.';

/**
 * Shown once when the full nine-item stack opens on Day 8.
 */
export const VITALITY_FULL_STACK_LINE =
  'The full daily stack opens today — nine habits that support the work.';

/**
 * Early-days framing (2026-08-03, build order 0.6) — shown Days 1–7 only.
 * Three core items land first so Day 1 reads as approachable; the risk is a
 * low count feeling like a failing grade — a verdict, the one thing the
 * ledger must never produce.
 */
export const VITALITY_EARLY_DAYS_LINE =
  'Three habits to start. Most men check one or two today — the list is the standard, not the requirement.';

/**
 * The falter line for No Porn — shown, quietly, when the item closes
 * unchecked. Relapse-normalization at the exact abstinence-violation moment:
 * the man who catastrophizes one slip is the man who deletes the app to
 * delete the witness. Register: capability; externalized; next-vote-facing.
 */
export const CLEAN_FOCUS_FALTER_LINE =
  'A falter is one data point, and you logged it honestly — that is the discipline working. The next vote opens with tomorrow’s light.';

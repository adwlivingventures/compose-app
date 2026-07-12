// The Vitality Ledger — the daily discipline layer (supersedes the three
// bundled Vitality Checklist booleans; founder review 2026-07-12).
//
// Why unbundled: "sleep, light, movement" in one binary is unfalsifiable —
// the honest user can't answer it and the tired user taps yes (checkbox
// theater). Identity updates on EVIDENCE OF BEHAVIOR (Atomic Habits: every
// action is a vote), and evidence must be specific enough to be true. Each
// item below is one verifiable behavior with a clock attached.
//
// Why phase-gated: four items on Day 1 keeps activation energy low
// (canon §8 — the loop must be too small to lose to friction); one added
// item per phase is progression the user can feel — the antidote to
// hedonic adaptation without touching the invariant ritual skeleton.
//
// Doctrine constraints honored here (PSYCHOLOGICAL-FOUNDATIONS §4):
// - Questions are toward-framed (protect/give/catch), never negation-framed.
// - Votes, not verdicts: the ledger counts; it never grades, percentages,
//   or pass/fails the man. Consumers must not render % bars from this data.
// - Deterministic, authored, versioned (§7).

export type LedgerKey =
  | 'morningLight'
  | 'presenceRep'
  | 'cleanFocus'
  | 'screenSunset'
  | 'training'
  | 'tensionAudit';

export type LedgerState = Partial<Record<LedgerKey, boolean>>;

export interface LedgerItem {
  key: LedgerKey;
  /** Pillar linkage into the Vitality Baseline reference (app/vitality.tsx). */
  pillar: string;
  title: string;
  /** The daily question — toward-framed, one verifiable behavior. */
  question: string;
  /** Habit-stacking cue suggestion (implementation intention — cue-bound
   *  habits form; floating ones churn). */
  cue: string;
  /** One-line mechanism (iceberg: behavior on the surface, why one tap deep). */
  mechanism: string;
  /** Protocol phase (1–3) in which this item enters the ledger. */
  phaseIntroduced: 1 | 2 | 3;
  /** Where the behavior lives in the day — drives grouping in UI. */
  timing: 'morning' | 'day' | 'evening';
}

export const LEDGER_ITEMS: LedgerItem[] = [
  {
    key: 'morningLight',
    pillar: 'Chemical Vitality',
    title: 'Morning Light',
    question: 'Did your eyes get 15 minutes of outdoor light this morning?',
    cue: 'Anchor it to your first coffee — take the cup outside.',
    mechanism:
      'Morning light anchors the circadian rhythm that times the overnight release of testosterone and sets the cortisol curve for the day.',
    phaseIntroduced: 1,
    timing: 'morning',
  },
  {
    key: 'presenceRep',
    pillar: 'Somatic Presence',
    title: 'Presence Rep',
    question: 'Did you spend two deliberate minutes inside your body today?',
    cue: 'Attach it to a daily constant — the shower, the last minute of a commute.',
    mechanism:
      'Interoceptive awareness is the direct antidote to spectatoring. The reps you take in daylight are the ones available under pressure.',
    phaseIntroduced: 1,
    timing: 'day',
  },
  {
    key: 'cleanFocus',
    pillar: 'Dopaminergic Baseline',
    title: 'Clean Focus',
    question: 'Did you protect your focus from pornographic input today?',
    cue: 'The rule is decided once, in daylight — it is already decided tonight.',
    mechanism:
      'Starving the artificial pathway resensitizes D2 receptors, so real-life touch carries enough signal to hold arousal.',
    phaseIntroduced: 1,
    timing: 'day',
  },
  {
    key: 'screenSunset',
    pillar: 'Restoration Vitality',
    title: 'Screen Sunset',
    question: 'Did the screens go dark an hour before you did?',
    cue: 'Charge the phone across the room at a fixed hour.',
    mechanism:
      'Melatonin needs darkness to rise. Deep and REM sleep are where the endocrine system synthesizes most of its testosterone.',
    phaseIntroduced: 1,
    timing: 'evening',
  },
  {
    key: 'training',
    pillar: 'Vascular Vitality',
    title: 'Deliberate Movement',
    question: 'Did you train or move with intent today?',
    cue: 'Book it like a meeting — the same slot every day.',
    mechanism:
      'Training keeps the endothelium releasing nitric oxide — the mediator of erectile blood flow — and gives sympathetic charge a clean exit.',
    phaseIntroduced: 2,
    timing: 'day',
  },
  {
    key: 'tensionAudit',
    pillar: 'Pelvic Baseline',
    title: 'The Unclench',
    question: 'Did you catch the clench today — jaw, glutes, floor — and let it go?',
    cue: 'Tie the check to every red light and every elevator.',
    mechanism:
      'Hypertonicity is built in daylight posture, one unnoticed clench at a time. Releasing it where it forms lowers the resting tone the pacer trains against.',
    phaseIntroduced: 3,
    timing: 'day',
  },
];

/** Items active on a given protocol day (phase-gated). */
export function ledgerItemsForDay(day: number): LedgerItem[] {
  const phase = day <= 25 ? 1 : day <= 50 ? 2 : 3;
  return LEDGER_ITEMS.filter((i) => i.phaseIntroduced <= phase);
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
 * The falter line for Clean Focus — shown, quietly, when the item closes
 * unchecked. Relapse-normalization at the exact abstinence-violation moment:
 * the man who catastrophizes one slip is the man who deletes the app to
 * delete the witness. Register: capability; externalized; next-vote-facing.
 */
export const CLEAN_FOCUS_FALTER_LINE =
  'A falter is one data point, and you logged it honestly — that is the discipline working. The next vote opens with tomorrow’s light.';

/** New-item introduction lines, shown once when a phase adds its item. */
export const LEDGER_INTRO_LINES: Partial<Record<LedgerKey, string>> = {
  training:
    'Phase 2 adds a fifth vote: Deliberate Movement. The exposure work ahead runs on healthy blood flow — this is where it comes from.',
  tensionAudit:
    'Phase 3 adds the final vote: The Unclench. Pelvic awareness leaves the session and enters the day — this is the habit that outlives the protocol.',
};

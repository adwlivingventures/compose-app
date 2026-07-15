// Today's Training — the five in-app steps of the daily session (founder
// feature batch 2026-07-15). This is the companion to content/ledger.ts:
// the session drives these automatically as each stage completes, and the
// unified Daily Check-In renders them as the first section, manually
// toggleable (trust-based — the man can check or uncheck any item).
//
// Deterministic, authored, versioned (§7). Rationales are ≤35 words for
// the "Why are these helpful?" resource page and stay inside the
// wellness/conditioning vocabulary (no cure/treatment claims).

export type TrainingKey = 'anchor' | 'conditioning' | 'control' | 'release' | 'rewire';

export type TrainingState = Partial<Record<TrainingKey, boolean>>;

export interface TrainingItem {
  key: TrainingKey;
  title: string;
  /** One-line description for the check-in row. */
  line: string;
  /** ≤35-word mechanism for the resource page. */
  rationale: string;
}

export const TRAINING_ITEMS: TrainingItem[] = [
  {
    key: 'anchor',
    title: 'Audio Script',
    line: 'The Anchor — today’s guided track, start to finish.',
    rationale:
      'The daily track trains present-moment attention on body sensation — the direct antidote to spectatoring. Surrendering to its pacing is itself the practice: a parasympathetic rhythm you don’t control.',
  },
  {
    key: 'conditioning',
    title: 'Pelvic Training',
    line: 'Conditioning — the breath-paced drop-and-release sequence.',
    rationale:
      'Chronic pelvic tension acts as a hair-trigger for early climax and restricts erectile blood flow. Intentionally dropping and lengthening the pelvic floor restores autonomic muscular balance and builds physical control.',
  },
  {
    key: 'control',
    title: 'Control Score',
    line: 'Rate how fully the floor released, 1–10.',
    rationale:
      'The score trains you to read the signal your body sends during release — interoceptive awareness under a number. Tracked over weeks, it is the evidence line of the whole protocol.',
  },
  {
    key: 'release',
    title: 'Somatic Pelvic-Hip Release',
    line: '90 seconds in a deep hip position, breathing into the pelvis.',
    rationale:
      'Chronic pelvic tension acts as a hair-trigger for early climax and restricts erectile blood flow. Ninety slow seconds of supported stretch lets the floor lengthen without bracing — release the pacer builds on.',
  },
  {
    key: 'rewire',
    title: 'Daily Rewire',
    line: 'Cross out the old script. Read the truth once, slowly.',
    rationale:
      'Anxious beliefs replay automatically, and every replay wires deeper. Crossing out the old script externalizes it; reading the authored truth daily is the spaced repetition that consolidates the new belief.',
  },
];

/** All five training items are checked → the day's work is done. */
export function trainingComplete(state: TrainingState | undefined): boolean {
  if (!state) return false;
  return TRAINING_ITEMS.every((item) => state[item.key]);
}

/** Count of completed training items (votes, not verdicts — a count only). */
export function trainingCount(state: TrainingState | undefined): number {
  if (!state) return 0;
  return TRAINING_ITEMS.filter((item) => state?.[item.key]).length;
}

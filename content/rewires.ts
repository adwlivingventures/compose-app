// The Daily Rewire — one authored belief-flip per day (founder review
// 2026-07-10: the Restructure tab needed a daily ACTIVITY, not just an
// incident log). Deterministic and versioned (§7): the day's pair is indexed
// by protocol day, cycling through the set.
//
// Mechanism: cognitive defusion + the generation effect. Reading the old
// script OUT of his own voice (it's printed, labeled, externalized) breaks
// fusion with it; deliberately reading the replacement once per day is a
// spaced-repetition rep on the identity-level belief — the same
// consolidation loop the anchors train, but scheduled rather than
// incident-driven. Thirty seconds, tap to complete, no writing required.

export interface Rewire {
  /** The old script, verbatim — named for what it is. */
  oldScript: string;
  /** The replacement — identity-level, present tense, clinically honest. */
  truth: string;
}

export const REWIRES: Rewire[] = [
  {
    oldScript: 'My body is broken.',
    truth: 'My body works. It has been following a threat signal — and I am retraining the signal.',
  },
  {
    oldScript: 'I have to perform tonight.',
    truth: 'There is nothing to perform. There is only a moment to be in.',
  },
  {
    oldScript: 'If it happens again, it proves I can’t be fixed.',
    truth: 'One night is one data point. Conditioning changes on the average, not the exception.',
  },
  {
    oldScript: 'She’s already decided something is wrong with me.',
    truth: 'I don’t read minds. I know what was said and done — the rest is my fear, narrating.',
  },
  {
    oldScript: 'I need to stay alert in bed or I’ll lose control.',
    truth: 'Vigilance IS the problem. Control returns when my attention is on sensation, not surveillance.',
  },
  {
    oldScript: 'Real men don’t have this problem.',
    truth: 'This is the most common sexual complaint men report. Working on it directly is the uncommon part.',
  },
  {
    oldScript: 'I should avoid intimacy until I’m fixed.',
    truth: 'Avoidance trains the alarm deeper. Calm exposure retrains it. I don’t skip the field I’m training on.',
  },
  {
    oldScript: 'My worth in bed is measured in minutes.',
    truth: 'Presence, warmth, and attention are what she remembers. A stopwatch measures none of them.',
  },
  {
    oldScript: 'The anxiety means something is wrong with me.',
    truth: 'The anxiety is adrenaline — a body process I can down-regulate, not a verdict I have to accept.',
  },
  {
    oldScript: 'I can’t do this without a pill.',
    truth: 'Pills move blood; they never touched the alarm. I am retraining the thing they couldn’t reach.',
  },
  {
    oldScript: 'If I think hard enough mid-moment, I can manage it.',
    truth: 'Managing is spectatoring with a clipboard. My job mid-moment is breath and sensation — nothing else.',
  },
  {
    oldScript: 'A bad night ruins everything we have.',
    truth: 'Our connection is not scored pass/fail. The closeness that was real stays real.',
  },
  {
    oldScript: 'I am someone who struggles with sex.',
    truth: 'I am someone who trains composure daily. The struggle was a pattern, not a person.',
  },
  {
    oldScript: 'My progress should be faster by now.',
    truth: 'Rewiring is quiet for weeks before it is visible. I judge by the trend I measure, not the day I feel.',
  },
  {
    oldScript: 'Tonight has to go well.',
    truth: 'Nothing has to happen tonight. That is exactly what lets things happen.',
  },
];

/**
 * S22 onboarding script ticks → the rewire whose oldScript names the same
 * belief (2026-08-03, build order 2.1). A static lookup — content-level,
 * versioned, no runtime cleverness (§7).
 */
export const SCRIPT_REWIRE_INDEX: Record<string, number> = {
  broken: 0, // "I am broken" → "My body is broken."
  disappointed: 3, // "She is disappointed in me" → "She's already decided something is wrong with me."
  'she-leaves': 11, // "She'll leave me for someone else" → "A bad night ruins everything we have."
  'never-fix': 2, // "I will never fix this" → "If it happens again, it proves I can't be fixed."
  'less-of-a-man': 5, // "I'm less of a man" → "Real men don't have this problem."
};

/**
 * The user's rewire order: a STABLE PARTITION of the set — the rewires
 * matching his ticked S22 scripts move to the front (in S22's canonical
 * order), everything else keeps its relative order behind them. The
 * 5-repetition spaced cadence across 75 days is unchanged; only the
 * sequence within each 15-day cycle moves.
 *
 * Why: the first identity rep of the protocol — Day 1, session 1 — should
 * land against the belief HE named on the scripts screen, not item 1 of a
 * generic list (self-referential encoding; "this program was built from my
 * intake" is the belief that carries him through the Days 10–20 plateau).
 *
 * Register note: REWIRES is one flat cycle with no phase-keyed register (the
 * phase register arc lives in the I-am triads, untouched here), so the
 * partition cannot pull later-phase language forward — the §3 arc holds by
 * construction. Zero ticks (or an unmapped tick) → the default order,
 * byte-identical to the pre-personalization behavior.
 */
export function orderedRewires(tickedScripts: readonly string[] | null | undefined): Rewire[] {
  if (!tickedScripts || tickedScripts.length === 0) return REWIRES;
  const matched: number[] = [];
  for (const key of Object.keys(SCRIPT_REWIRE_INDEX)) {
    // Canonical S22 order, filtered to his ticks — deterministic regardless
    // of the order the answer array stored them in.
    if (tickedScripts.includes(key)) matched.push(SCRIPT_REWIRE_INDEX[key]);
  }
  if (matched.length === 0) return REWIRES;
  const matchedSet = new Set(matched);
  return [
    ...matched.map((i) => REWIRES[i]),
    ...REWIRES.filter((_, i) => !matchedSet.has(i)),
  ];
}

/** Deterministic pick for a protocol day (1-based), cycling the set —
 *  personalized by his S22 ticks when provided (build order 2.1). */
export function rewireForDay(day: number, tickedScripts?: readonly string[] | null): Rewire {
  const cycle = orderedRewires(tickedScripts);
  const index = Math.max(0, (day - 1) % cycle.length);
  return cycle[index];
}

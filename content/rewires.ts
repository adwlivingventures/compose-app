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

/** Deterministic pick for a protocol day (1-based), cycling the set. */
export function rewireForDay(day: number): Rewire {
  const index = Math.max(0, (day - 1) % REWIRES.length);
  return REWIRES[index];
}

// The Daily Focus layer — Stage 2's variety mechanism (founder ruling
// 2026-08-05, walkthrough build).
//
// THE RULE THIS FILE EXISTS TO PROTECT: the conditioning rep NEVER varies.
// The 4-in/6-out with the pelvic drop is the one reflex the protocol
// installs, and the basal ganglia consolidate whichever pattern actually
// fires — a different breathing exercise every day would feel fresher and
// train nothing. What varies is ATTENTION: one authored lens per protocol
// day, shown before the track starts. Same reps every night; a different
// session every night. (The same trick the anchors play with audio,
// applied to the body.)
//
// Register: calm authority, one line, ≤ ~14 words, observational or gently
// imperative. Never hustle vocabulary, never a grade, never "try harder."
// Phase arc: Days 1–25 mechanics of softening · 26–50 openness under
// charge (the holds) · 51–75 automaticity and ownership. Deterministic and
// versioned (§7); founder-reviewed like every impression surface.

export const DAILY_FOCUS: string[] = [
  // ── Phase 1 · Days 1–25 — the mechanics of softening ──
  'The first rep counts double. Arrive slowly.',
  'Follow the exhale all the way to its floor.',
  'The jaw — let it hang a little tonight.',
  'Notice the half-second where the drop begins.',
  'Shoulders. They have nothing to do tonight.',
  'Let the belly be soft before the breath arrives.',
  'The pause after the exhale — don’t rush past it.',
  'Warmth moves down on the inhale. Track it.',
  'Let the orb hold the count. You hold the softness.',
  'The floor drops further the less you help it.',
  'Notice the difference between rep one and rep ten.',
  'Hands. Uncurl them.',
  'The exhale is longer than it feels. Ride all of it.',
  'Tongue off the roof of the mouth.',
  'Listen for the recoil — it happens on its own.',
  'Where does the breath stop? Invite it one inch lower.',
  'The chest stays quiet; the belly does the moving.',
  'Softness is a direction, not a place. Keep going.',
  'Notice what your face does on the drop.',
  'Let the floor stay heavy between reps.',
  'The breath opens the floor. You only allow it.',
  'Eyes soft behind the lids.',
  'One rep at a time. This one.',
  'The last five reps are where the floor learns.',
  'Nothing to improve tonight. Just attendance.',
  // ── Phase 2 · Days 26–50 — openness under charge ──
  'New tonight: the held drop. Stay open while the count waits.',
  'In the hold, the urge to grip is the rep.',
  'Charge rises; the floor stays down. That is the skill.',
  'Notice the first flicker of bracing — soften exactly there.',
  'The hold is not effort. It is permission, extended.',
  'The breath keeps moving even when the count doesn’t.',
  'Let the hold feel long. Long is the point.',
  'Intensity and softness in the same body, same moment.',
  'The glutes will volunteer. Decline.',
  'Watch the wave settle after each hold.',
  'The second hold is easier than the first. Verify that.',
  'Openness under charge — tonight’s only assignment.',
  'What happens to the jaw inside the hold?',
  'The exhale carries the hold. Lean on it.',
  'Halfway. The floor knows this rhythm — let it lead.',
  'Bracing is a thought arriving in the body. Let it pass.',
  'Drop one layer past where you usually stop.',
  'The hold ends; the openness doesn’t have to.',
  'Speed nothing. Especially not the release.',
  'Notice how quickly settling comes now, after charge.',
  'The body practices for nights that matter. This is one.',
  'Hold steady; let the mind be the one that softens.',
  'Charge is weather. The floor is ground.',
  'Two holds, one long calm — connect them.',
  'Last reps of this phase. Notice what changed since Day 26.',
  // ── Phase 3 · Days 51–75 — automaticity and ownership ──
  'The cues fade tonight. The skill won’t.',
  'When the words go quiet, follow the rhythm you own.',
  'No instructions is the point. Breathe like it’s yours.',
  'The drop now starts before you ask. Watch for it.',
  'Practice trusting the recoil completely.',
  'The body leads; you accompany.',
  'Notice: you no longer prepare to soften. You soften.',
  'Let the session feel ordinary. Ordinary is the skill arriving.',
  'The floor’s default is changing. Feel for the new baseline.',
  'Fewer thoughts per rep. Count them if you doubt it.',
  'This rhythm lives in you now, not the orb.',
  'Run one rep with eyes open. Same softness?',
  'Imagine no phone tonight — the skill without the app.',
  'What used to take ten reps happens in two. Notice.',
  'Softness on demand is composure. This is the demand.',
  'Let the last rep be the softest of the night.',
  'The pause is yours now. It works in any room.',
  'Notice the quiet where vigilance used to be.',
  'The body remembers this anywhere, in any company.',
  'Pick one breath tonight and give it everything.',
  'Automatic doesn’t mean asleep. Stay curious.',
  'The floor drops; the mind follows. In that order now.',
  'Three nights left of practice. The skill is already yours.',
  'Every rep tonight is a rehearsal for every room after it.',
  'Final night: just breathe, and witness what you built.',
];

/** The day's focus line (1-based); out-of-range days clamp into the 75-day
 *  window so Act II/III surfaces reuse cleanly. */
export function focusForDay(day: number): string {
  const index = Math.min(Math.max(Math.round(day), 1), DAILY_FOCUS.length) - 1;
  return DAILY_FOCUS[index];
}

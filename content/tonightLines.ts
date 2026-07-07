/**
 * Tonight's lines — one quiet, identity-register sentence per protocol day,
 * shown on the E13 day-complete dashboard card as the closing image of the
 * evening. Keyed to that day's anchor theme (content/ProtocolData.ts).
 *
 * Register rules: present tense, no hype, no urgency, no instruction — the
 * work is done for the day; the line is a mirror, not a coach. Authored,
 * versioned content (§7).
 */

// Index 0 = Day 1.
const LINES: string[] = [
  // ── Phase 1: The Autonomic Reset (Days 1–25) ──────────────────────────────
  'The watcher steps down; the man stays in the room.',
  'Nothing about tonight needs a grade.',
  'The floor of the body learns that letting go is also a skill.',
  'There is no clock in the body — only rhythm.',
  'The system has its seasons, and none of them are wrong.',
  'Skin has no opinions; it only reports warmth.',
  'Touch with nowhere to get to arrives everywhere.',
  'A spoken sentence weighs less than a held one.',
  "The wave passes through a body that isn't bracing.",
  'What can be named can be watched without fear.',
  'Her mind is not yours to write; the pen goes down.',
  "Attention drops from the mind's commentary into the slow warmth of circulation.",
  'Every exhale is a hand resting on the switch.',
  'Two weeks of practice settle quietly into the bones.',
  'What is planned can still catch fire.',
  'Five things in the room, and the room returns.',
  'The tide goes out; the ocean is not broken.',
  'The jaw unclenches, and the body follows its lead.',
  'A hand can rest without asking for anything.',
  'The body feels more than the eyes can imagine.',
  'Control is a settled thing, not a game of brinkmanship.',
  'A pause spoken plainly is a kind of strength.',
  'The encounter succeeded the moment both of you were in it.',
  'The falter is forgiven; the practice is intact.',
  'The floor is quiet now — strong enough to build on.',
  // ── Phase 2: Somatic Exposure & Mastery (Days 26–50) ──────────────────────
  'What was avoided becomes, tonight, a place to stand.',
  'The pause is a tool now, not an escape.',
  'A technique is only a handhold; the calm is yours.',
  'The whole body is the instrument, not one string.',
  'Closeness itself becomes ordinary, and ordinary is safe.',
  'Nothing tonight is running out.',
  'It is possible to burn and be still at the same time.',
  'Rhythm is chosen, not chased.',
  'A thought about failing is a thought, watched from the shore.',
  "The long breath out is the body's oldest brake.",
  'The body adapts; it always has.',
  'Starting is not a promise; you owe the moment nothing.',
  'Two eyes meeting put both people back in the room.',
  'Arousal breathes too — in, and out, and in again.',
  'The machinery hums along quietly, asking for no audience.',
  'Small adjustments, made calmly, are mastery in motion.',
  'A quiet word mid-stream steers better than any effort.',
  'Surrender and panic are different rooms, and you know the doors apart.',
  'Between one stage and the next, the breath keeps the thread.',
  'Intensity has a dial, and your hand is on it.',
  'The night is not over because one wave broke early.',
  'What you practice alone is what shows up accompanied.',
  'Her pleasure is a landscape, not a scoreboard.',
  'The plateau is not a waiting room; it is the address.',
  'What used to be faced is now simply done.',
  // ── Phase 3: Identity Consolidation (Days 51–75) ──────────────────────────
  'Safety is a signal the body sends itself, and yours is sending it.',
  'Every repetition lays down another quiet layer of the new road.',
  'Connection is a slower chemical, and it lasts longer.',
  'The balcony is empty; everyone is on the floor now.',
  'What needed effort is beginning to happen on its own.',
  'Intensity rises, and you remain — mind and body in the same room.',
  'The room itself is an ally; you arranged it that way.',
  'The window after is rest, not a report card.',
  'Not a man managing a problem — a man practicing his craft.',
  'Two nervous systems, one steady signal — and it starts with yours.',
  'The old story was never a diagnosis; tonight it is just old.',
  'Every sensation gets a chair; none of them get the gavel.',
  'There is more where tonight came from — no need to rush any of it.',
  'A held gaze settles two heartbeats at once.',
  'The breath knows the way down from any spike.',
  'Sixty-six days, and the habit stands on its own.',
  'An echo of the old alarm may visit; it no longer runs the house.',
  'Sixty-eight evenings of showing up — that is what self-trust is made of.',
  'What was once the goal is now something that happens along the way.',
  'The new baseline speaks for itself, in your voice.',
  'The soft jaw in traffic and the soft floor at night are the same practice.',
  'The grip loosens, and nothing falls.',
  'The alarm rings in the old wing; the office stays lit.',
  'Look back once, gently — the distance is real.',
  'This is not something you did for seventy-five days; it is who you are at rest.',
];

/** Line for a protocol day (1–75); null outside the range (caller falls back
 *  to the day's focus string). */
export function getTonightLine(day: number): string | null {
  return LINES[day - 1] ?? null;
}

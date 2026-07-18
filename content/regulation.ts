import { AudioSource } from 'expo-audio';
import { OrbPhase, FULL_BREATH } from '../components/BreathingOrb';

/**
 * The Steady Library — deterministic practice registry (§7: authored,
 * versioned; no runtime generation). Spec: docs/STEADY-TAB-SPEC.md.
 *
 * Architecture: route by state at the surface (the Steady tab's four doors),
 * endow the full collection one level down (the Library shelves), sequence
 * access by protocol phase (opensOnDay). Every practice is VISIBLE from
 * Day 1; sequenced items show an honest clinical reason, never "locked" —
 * he paid for all of it, the app is ordering it for his benefit.
 *
 * Library use casts no protocol votes: no streaks, no completion records.
 * The 75-Day Blueprint stays the sole source of identity evidence, so this
 * layer can only reinforce the main loop, never compete with it.
 */

export type PracticeKind = 'audio' | 'orb' | 'steps' | 'tool';
export type Shelf = 'breath' | 'meditation' | 'somatic' | 'mind';

export interface PracticeStep {
  /** Short imperative headline on the card. */
  title: string;
  body: string;
  /** Optional pacing hint rendered under the body (e.g. "Tense 5 · release 15"). */
  hint?: string;
}

export interface Practice {
  id: string;
  shelf: Shelf;
  kind: PracticeKind;
  title: string;
  /** One-line library copy — what it does, in his language. */
  purpose: string;
  minutes: number;
  /** Protocol day this practice opens (1 = live from the start). */
  opensOnDay: number;
  /** Honest clinical reason shown while sequenced. */
  sequencedReason?: string;
  /** Focus line on the runner screen before starting. */
  intro?: string;
  /** Quiet line on the close screen. Ends the practice in stillness. */
  closing: string;
  orb?: { phases: OrbPhase[]; labels: string[]; sub: string };
  steps?: PracticeStep[];
  audioKey?: RegulationAudioKey;
}

// ─── Audio sources ────────────────────────────────────────────────────────────
// Metro needs static require() calls. The five regulation renders follow the
// anchor pipeline (docs/elevenlabs/regulation_*.txt → ElevenLabs, day_1.mp3
// voice → assets/audio/). Until a render lands, its key resolves to the
// anchor placeholder — swap each line as files arrive.

export type RegulationAudioKey =
  | 'reset_breath'
  | 'steady_square'
  | 'body_scan'
  | 'deep_drop'
  | 'pelvic_drop'
  | 'identity_rehearsal';

const PLACEHOLDER_SOURCE = require('../assets/audio/anchor_placeholder.wav');

export const REGULATION_AUDIO: Record<RegulationAudioKey, AudioSource> = {
  // Rendered in the day_1.mp3 voice; re-paced to the scripted pause totals
  // and re-encoded mono 64k per the anchor pipeline convention.
  reset_breath: require('../assets/audio/regulation_reset_breath.mp3'),
  steady_square: require('../assets/audio/regulation_steady_square.mp3'),
  body_scan: require('../assets/audio/regulation_body_scan.mp3'),
  deep_drop: require('../assets/audio/regulation_deep_drop.mp3'),
  pelvic_drop: require('../assets/audio/regulation_pelvic_drop.mp3'),
  identity_rehearsal: PLACEHOLDER_SOURCE, // script not yet authored (Phase 3 content)
};

// ─── Orb phase sets (shape mirrors BreathingOrb's canonical arrays) ──────────

const BOX_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: 1, durationMs: 4000 },
  { toScale: 1, durationMs: 4000 },
];
const BOX_LABELS = ['Breathe in', 'Hold', 'Breathe out', 'Hold empty'];

const FOUR78_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: FULL_BREATH, durationMs: 7000 },
  { toScale: 1, durationMs: 8000 },
];
const FOUR78_LABELS = ['Inhale through your nose', 'Hold', 'Exhale slowly through your lips'];

const EXTENDED_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 4000 },
  { toScale: 1, durationMs: 8000 },
];
const EXTENDED_LABELS = ['Breathe in, low and slow', 'Long exhale — twice the inhale'];

// ─── The collection ──────────────────────────────────────────────────────────

export const PRACTICES: Practice[] = [
  // ── Breath ──
  {
    id: 'reset_breath',
    shelf: 'breath',
    kind: 'audio',
    title: 'The Reset Breath',
    purpose: 'The fastest way to settle — two inhales, one long sigh.',
    minutes: 3,
    opensOnDay: 1,
    intro: 'Two inhales through the nose, one slow sigh out. Your body already knows this move.',
    closing: 'The lever is in your hands, any hour of the day.',
    audioKey: 'reset_breath',
  },
  {
    id: 'steady_square',
    shelf: 'breath',
    kind: 'audio',
    title: 'The Steady Square',
    purpose: 'Guided box breathing — four sides, laid by hand.',
    minutes: 4,
    opensOnDay: 1,
    intro: 'Four counts a side. While your mind counts, it has one job.',
    closing: 'Steady built. Carry it with you.',
    audioKey: 'steady_square',
  },
  {
    id: 'box_orb',
    shelf: 'breath',
    kind: 'orb',
    title: 'Box Breathing',
    purpose: 'The silent pacer — follow the glow, four counts a side.',
    minutes: 4,
    opensOnDay: 1,
    closing: 'Four sides. A quiet mind has one job at a time.',
    orb: { phases: BOX_PHASES, labels: BOX_LABELS, sub: 'Six rounds is usually enough.' },
  },
  {
    id: 'four_seven_eight',
    shelf: 'breath',
    kind: 'orb',
    title: '4-7-8 Breath',
    purpose: 'The long-hold pattern — strongest before sleep.',
    minutes: 3,
    opensOnDay: 1,
    closing: 'The exhale did the work. Let the night have the rest.',
    orb: { phases: FOUR78_PHASES, labels: FOUR78_LABELS, sub: 'Four rounds is usually enough to feel the shift.' },
  },
  {
    id: 'extended_exhale',
    shelf: 'breath',
    kind: 'orb',
    title: 'Extended Exhale',
    purpose: 'In for four, out for eight — the purest form of the brake.',
    minutes: 5,
    opensOnDay: 1,
    closing: 'The long exhale is the half that calms the whole system.',
    orb: { phases: EXTENDED_PHASES, labels: EXTENDED_LABELS, sub: 'Let the exhale stay soft — twice the inhale, no forcing.' },
  },
  {
    id: 'humming_breath',
    shelf: 'breath',
    kind: 'steps',
    title: 'Humming Breath',
    purpose: 'A low hum on the exhale — vibration the nervous system reads as safety.',
    minutes: 4,
    opensOnDay: 14,
    sequencedReason: 'Opens Day 14 — two weeks of exhale training first; the hum rides on it.',
    closing: 'The vibration settles the throat, the chest, the whole channel.',
    steps: [
      {
        title: 'Settle',
        body: 'Sit tall but easy. Lips together, jaw loose, teeth slightly apart.',
      },
      {
        title: 'Breathe in',
        body: 'A slow, full breath through the nose, down into the belly.',
      },
      {
        title: 'Hum it out',
        body: 'Exhale on a low, steady hum — deep in pitch, like a far-off engine. Feel the vibration in your chest and throat.',
        hint: 'Let the hum last the whole exhale',
      },
      {
        title: 'Repeat',
        body: 'Eight to ten rounds. With each one, let the hum sink a little lower and the shoulders a little heavier.',
      },
    ],
  },

  // ── Meditation ──
  {
    id: 'body_scan',
    shelf: 'meditation',
    kind: 'audio',
    title: 'Back Into the Body',
    purpose: 'A guided walk home — attention into sensation, feet to crown.',
    minutes: 5,
    opensOnDay: 1,
    intro: 'Attention lives wherever you place it. For the next few minutes, you place it here.',
    closing: 'Presence is a place. You know the way in.',
    audioKey: 'body_scan',
  },
  {
    id: 'deep_drop',
    shelf: 'meditation',
    kind: 'audio',
    title: 'The Deep Drop',
    purpose: 'Complete rest while remaining awake — the trained kind.',
    minutes: 5,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — deep rest lands best on the foundation Phase 1 builds.',
    intro: 'Lie down, palms up. Deep rest is a skill, and it responds to training.',
    closing: 'Your nervous system produced this state on request. Yours.',
    audioKey: 'deep_drop',
  },
  {
    id: 'noting',
    shelf: 'meditation',
    kind: 'steps',
    title: 'Noting Practice',
    purpose: 'Name the thought, return to the breath — the skill under every reframe.',
    minutes: 6,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — naming thoughts is Phase 2 work; it needs a settled baseline.',
    closing: 'Named and released. That is the whole skill.',
    steps: [
      {
        title: 'Anchor',
        body: 'Eyes closed or soft. Rest attention on the breath at the belly — its rise, its fall.',
      },
      {
        title: 'When a thought arrives',
        body: 'Give it a one-word name, quietly: "planning." "replaying." "judging." One word is enough.',
      },
      {
        title: 'Return',
        body: 'The moment it is named, walk attention back to the breath. The naming is the release.',
      },
      {
        title: 'Continue',
        body: 'Five quiet minutes. Every return is one repetition of the only skill this trains.',
        hint: 'Wandering is the material, returning is the work',
      },
    ],
  },
  {
    id: 'self_compassion',
    shelf: 'meditation',
    kind: 'steps',
    title: 'The Self-Compassion Break',
    purpose: 'Three moves that take the charge out of a hard moment.',
    minutes: 5,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — it pairs with Phase 2 exposure training.',
    closing: 'Spoken like a man you respect. Because that is who was listening.',
    steps: [
      {
        title: 'Name the moment',
        body: 'Hand on your chest if it helps. Say inwardly: "This is a hard moment." Naming it is standing on it.',
      },
      {
        title: 'Place it among men',
        body: '"Hard moments are part of every man\'s training. I am far from the only one here." This is fact, not comfort.',
      },
      {
        title: 'Speak as your own coach',
        body: 'The words you would give a friend in this exact spot — give them to yourself, in your own voice, slowly.',
      },
      {
        title: 'One breath to close',
        body: 'A long exhale. Let the moment be over when the breath is.',
      },
    ],
  },

  // ── Somatic & Pelvic ──
  {
    id: 'pelvic_drop',
    shelf: 'somatic',
    kind: 'audio',
    title: 'The Pelvic Drop — Long Practice',
    purpose: 'The guided version of the daily pacer — build the drop properly.',
    minutes: 5,
    opensOnDay: 3,
    sequencedReason: 'Opens Day 3, with the anchor that introduces the drop.',
    intro: 'The daily pacer runs this pattern with you. Here, we slow it down and build it.',
    closing: 'Trained. Released. Composed.',
    audioKey: 'pelvic_drop',
  },
  {
    id: 'grounding_321',
    shelf: 'somatic',
    kind: 'steps',
    title: 'Sensory Grounding',
    purpose: 'Three senses, eyes open — presence you can run anywhere, silently.',
    minutes: 2,
    opensOnDay: 1,
    closing: 'Anxiety lives in the future. Your senses only work in the present.',
    steps: [
      {
        title: '3 — See',
        body: 'Three things you can see, one at a time. The shadow on the wall. The texture of the fabric. The light on your hands.',
      },
      {
        title: '2 — Feel',
        body: 'Two things you can feel. The weight of your body where it rests. The temperature of the air on your skin.',
      },
      {
        title: '1 — Hear',
        body: 'One thing you can hear. The hum of the room. Your own breath.',
      },
      {
        title: 'Arrive',
        body: 'See it. Feel it. Hear it. You are exactly where your feet are.',
      },
    ],
  },
  {
    id: 'downtraining_stretches',
    shelf: 'somatic',
    kind: 'steps',
    title: 'Down-Training Stretches',
    purpose: 'Five breath-paced positions that open what the breathing softens.',
    minutes: 10,
    opensOnDay: 5,
    sequencedReason: 'Opens Day 5 — the breath-pelvis link comes first; the stretches amplify it.',
    closing: 'Opened by position, released by breath. Let the body keep what it learned.',
    steps: [
      {
        title: 'Child\'s pose',
        body: 'Knees wide, big toes together, chest toward the floor, arms long. Breathe low into the back of the belly and let the floor of the pelvis soften with every inhale.',
        hint: 'About 8 slow breaths',
      },
      {
        title: 'Happy baby',
        body: 'On your back, knees toward armpits, hold feet or shins. Tailbone stays heavy. Breathe into the space between the sit bones.',
        hint: 'About 8 slow breaths',
      },
      {
        title: 'Butterfly',
        body: 'Seated or lying back, soles of the feet together, knees falling open. Everything below the navel stays soft.',
        hint: 'About 8 slow breaths',
      },
      {
        title: 'Alternating pelvic tilts',
        body: 'On your back, knees bent. Slow, small tilts of the pelvis with the breath — glutes and abs stay quiet; the movement is the breath\'s, not the muscles\'.',
        hint: 'About 10 slow tilts',
      },
      {
        title: 'Bridge — soft descent',
        body: 'Lift the hips gently on an inhale, and lower one vertebra at a time on a long exhale. The descent is the practice.',
        hint: '4 slow lifts',
      },
    ],
  },
  {
    id: 'pmr',
    shelf: 'somatic',
    kind: 'steps',
    title: 'Progressive Muscle Release',
    purpose: 'Tense, then release — teach the whole body the difference.',
    minutes: 12,
    opensOnDay: 10,
    sequencedReason: 'Opens Day 10 — learn the pelvic drop first, then generalize it body-wide.',
    closing: 'The body now knows both states by name. Choose the second.',
    steps: [
      {
        title: 'Hands and forearms',
        body: 'Make two fists, squeeze to about 70 percent for five seconds... and release completely. Feel the warmth flood in where the tension was.',
        hint: 'Tense 5 · release 15',
      },
      {
        title: 'Upper arms and shoulders',
        body: 'Draw the shoulders toward the ears, arms tight... and let them pour down. Twice the release time, always.',
        hint: 'Tense 5 · release 15',
      },
      {
        title: 'Face and jaw',
        body: 'Scrunch the face toward the nose, clench the jaw lightly... and let it all unhinge. Teeth apart, tongue loose.',
        hint: 'Tense 5 · release 15',
      },
      {
        title: 'Chest and belly',
        body: 'A deep breath in, hold, tighten the belly gently... and release breath and belly together, long and slow.',
        hint: 'Tense 5 · release 15',
      },
      {
        title: 'Hips and seat',
        body: 'Squeeze the glutes and the floor of the pelvis for five seconds... and release into the longest, softest drop of the session. This is the contrast that matters most.',
        hint: 'Tense 5 · release 20',
      },
      {
        title: 'Legs and feet',
        body: 'Press the heels down, curl the toes... and let both legs go heavy, all the way through the floor.',
        hint: 'Tense 5 · release 15',
      },
      {
        title: 'The whole field',
        body: 'One pass of attention from feet to face. Anywhere still holding, exhale into it. Rest a minute in the released state — this is the state you are training toward.',
      },
    ],
  },

  // ── Mind ──
  {
    id: 'spike_flow',
    shelf: 'mind',
    kind: 'tool',
    title: 'The Spike Flow',
    purpose: 'A thought is spiking — name it, counter it, close it.',
    minutes: 2,
    opensOnDay: 1,
    closing: 'Named, countered, closed.',
  },
  {
    id: 'leaves_on_stream',
    shelf: 'mind',
    kind: 'steps',
    title: 'Leaves on a Stream',
    purpose: 'Watch thoughts float past instead of boarding them.',
    minutes: 6,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — defusion is Phase 2\'s skill; it opens with it.',
    closing: 'You are the stream\'s bank, and the water moves on its own.',
    steps: [
      {
        title: 'The stream',
        body: 'Eyes closed. Picture a slow stream, leaves drifting past on the surface. You are seated on the bank — through your own eyes, watching the water go by.',
      },
      {
        title: 'Place the thoughts',
        body: 'Each time a thought arrives, set it on a leaf — a word, a phrase, an image — and let the current take it.',
      },
      {
        title: 'All of them',
        body: 'Pleasant thoughts ride leaves too. So does "this is silly." So does "am I doing this right." On the leaf, into the current.',
      },
      {
        title: 'When you drift',
        body: 'You will find yourself downstream, inside a thought. The practice is the moment you notice — return to the bank, place it on a leaf, resume.',
        hint: 'Five quiet minutes',
      },
    ],
  },
  {
    id: 'identity_rehearsal',
    shelf: 'mind',
    kind: 'audio',
    title: 'Identity Rehearsal',
    purpose: 'A guided first-person rehearsal of the man you are becoming.',
    minutes: 7,
    opensOnDay: 51,
    sequencedReason: 'Opens Day 51 — identity lands on fifty days of evidence.',
    intro: 'Through your own eyes, in your own skin. Rehearsal on a settled system.',
    closing: 'Not imagined. Rehearsed.',
    audioKey: 'identity_rehearsal',
  },
  {
    id: 'evening_review',
    shelf: 'mind',
    kind: 'steps',
    title: 'Evening Evidence Review',
    purpose: 'Count the day\'s votes. Close the day settled.',
    minutes: 3,
    opensOnDay: 51,
    sequencedReason: 'Opens Day 51 — Phase 3 work: votes counted at day\'s end.',
    closing: 'The day is counted and closed. Sleep on the evidence.',
    steps: [
      {
        title: 'Settle',
        body: 'Sitting or lying down, one long exhale. The day is over; this is the counting.',
      },
      {
        title: 'Count the votes',
        body: 'Name what you did today, plainly: the session completed. A moment you stayed present. A breath you took instead of a spiral. Small is fine — votes are small by design.',
      },
      {
        title: 'Say the tally',
        body: 'Inwardly, in your own voice: "Today I voted for the man I am becoming." Once, slowly.',
      },
      {
        title: 'Close',
        body: 'One more long exhale, and let the day be finished. Whatever it held, it is counted.',
      },
    ],
  },
];

// ─── Lookups ─────────────────────────────────────────────────────────────────

export const SHELF_META: Record<Shelf, { title: string; sub: string }> = {
  breath: { title: 'Breath', sub: 'The fastest levers you own.' },
  meditation: { title: 'Meditation', sub: 'Attention, trained into the body.' },
  somatic: { title: 'Somatic & Pelvic', sub: 'Release, from the floor up.' },
  mind: { title: 'Mind', sub: 'The thought work, on demand.' },
};

export const SHELF_ORDER: Shelf[] = ['breath', 'meditation', 'somatic', 'mind'];

export function practiceById(id: string): Practice | undefined {
  return PRACTICES.find((p) => p.id === id);
}

export function isOpen(p: Practice, day: number): boolean {
  return day >= p.opensOnDay;
}

export function openCount(day: number): { open: number; total: number } {
  const open = PRACTICES.filter((p) => isOpen(p, day)).length;
  return { open, total: PRACTICES.length };
}

/** Router doors: each resolves to the highest-priority OPEN practice. */
export const DOOR_PRIORITIES: Record<'settle' | 'drop_in' | 'release', string[]> = {
  settle: ['reset_breath', 'extended_exhale', 'box_orb'],
  drop_in: ['body_scan', 'deep_drop', 'noting'],
  release: ['pelvic_drop', 'downtraining_stretches', 'grounding_321'],
};

export function resolveDoor(door: keyof typeof DOOR_PRIORITIES, day: number): Practice {
  const ids = DOOR_PRIORITIES[door];
  for (const id of ids) {
    const p = practiceById(id);
    if (p && isOpen(p, day)) return p;
  }
  // Day 1 always has an open practice in every door's list.
  return practiceById(ids[ids.length - 1])!;
}

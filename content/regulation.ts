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

// Resonance frequency: ~5.5 breaths/min maximizes heart-rate variability and
// baroreflex gain — the trainable substrate of vagal tone. The sigh is the
// acute lever; THIS is the chronic one (raises the baseline).
const COHERENT_PHASES: OrbPhase[] = [
  { toScale: FULL_BREATH, durationMs: 5500 },
  { toScale: 1, durationMs: 5500 },
];
const COHERENT_LABELS = ['Breathe in, smooth and even', 'Breathe out, same pace'];

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
    id: 'coherent_breathing',
    shelf: 'breath',
    kind: 'orb',
    title: 'Coherent Breathing',
    purpose: 'Five and a half counts in, five and a half out — the practice that raises your baseline.',
    minutes: 10,
    opensOnDay: 1,
    closing: 'The rhythm trains the system that carries you. Daily minutes compound.',
    orb: {
      phases: COHERENT_PHASES,
      labels: COHERENT_LABELS,
      sub: 'No holds, no forcing — one smooth wave. Ten minutes trains the baseline.',
    },
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
    id: 'sound_anchor',
    shelf: 'meditation',
    kind: 'steps',
    title: 'Anchored in Sound',
    purpose: 'Attention rested in hearing — effortless, anywhere, eyes open or closed.',
    minutes: 5,
    opensOnDay: 1,
    closing: 'The world was holding an anchor the whole time. Now you know where.',
    steps: [
      {
        title: 'Settle',
        body: 'Sitting or standing, anywhere. Let the eyes close or soften. One slow exhale.',
      },
      {
        title: 'Open to sound',
        body: 'Let hearing widen. Sounds arrive on their own — the room, the street, your own breath. Receiving them is the whole practice.',
      },
      {
        title: 'Near and far',
        body: 'Notice the farthest sound you can find... then the nearest. Let attention travel between them, unhurried.',
      },
      {
        title: 'Rest in the field',
        body: 'Now hold all of it at once — one field of sound, changing on its own. When the mind drifts into thought, the next sound is the way back.',
        hint: 'Three quiet minutes',
      },
    ],
  },
  {
    id: 'breath_counting',
    shelf: 'meditation',
    kind: 'steps',
    title: 'Counting the Breath',
    purpose: 'One to ten on the exhales — the oldest concentration drill there is.',
    minutes: 6,
    opensOnDay: 5,
    sequencedReason: 'Opens Day 5 — a few days of breath work first; then the count has something to hold.',
    closing: 'Every restart was a repetition. That is how the muscle grows.',
    steps: [
      {
        title: 'Take your seat',
        body: 'Spine tall but easy, hands at rest. Breathe naturally — the count adapts to the breath, never the other way around.',
      },
      {
        title: 'Count the exhales',
        body: 'One on the first exhale... two on the next... up to ten. Then begin again at one.',
      },
      {
        title: 'When you lose the count',
        body: 'You will — everyone does, at three or at seven. The moment you notice, begin again at one. The restart is the repetition; losing count is the machine working, being caught.',
      },
      {
        title: 'Continue',
        body: 'Five minutes of counting. The score is not how high you get — it is how quickly you notice you\'ve drifted.',
        hint: 'Noticing fast beats counting far',
      },
    ],
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
    opensOnDay: 14,
    sequencedReason: 'Opens Day 14 — the counter for hard days, installed before the hard work starts.',
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
    id: 'mindful_touch',
    shelf: 'meditation',
    kind: 'steps',
    title: 'Mindful Touch',
    purpose: 'Raw sensation, fully attended — the drill behind sensation over evaluation.',
    minutes: 6,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — Phase 2 trains sensation over evaluation; this is the drill.',
    closing: 'Sensation, received in full. This is the channel presence runs on.',
    steps: [
      {
        title: 'One hand, one forearm',
        body: 'Rest the fingertips of one hand on the opposite forearm. Eyes closed. This is a practice of receiving, and skin is the instrument.',
      },
      {
        title: 'Move slowly',
        body: 'Draw the fingertips along the forearm, slower than feels natural. Attend to what is actually there — temperature... pressure... texture... the trail the touch leaves behind.',
      },
      {
        title: 'Both directions',
        body: 'Feel it from both sides at once: the fingers touching, the arm being touched. Two streams of the same moment.',
      },
      {
        title: 'When the mind narrates',
        body: 'Thoughts about the practice will arrive — reviews, questions, plans. Let raw sensation be louder. Return to temperature, pressure, texture — the signal under the story.',
        hint: 'A few quiet minutes',
      },
    ],
  },
  {
    id: 'orienting',
    shelf: 'somatic',
    kind: 'steps',
    title: 'Orienting',
    purpose: 'A slow look around the room — the oldest all-clear signal the body knows.',
    minutes: 3,
    opensOnDay: 1,
    closing: 'The room was already safe. Now the body has read it for itself.',
    steps: [
      {
        title: 'Soften the gaze',
        body: 'Seated or standing. Let the eyes go soft — wide-angle, receiving instead of searching.',
      },
      {
        title: 'Turn slowly',
        body: 'Let the head and neck turn, unhurried, and let the eyes drift across the room. Follow curiosity, at one-quarter speed.',
      },
      {
        title: 'Land and linger',
        body: 'When the eyes find something neutral or pleasant — a color, a shape, the light on a surface — let them rest there a while. Take it in fully.',
        hint: 'Linger longer than feels normal',
      },
      {
        title: 'Notice the settle',
        body: 'Somewhere in the slow looking, the breath deepened and the shoulders dropped on their own. That is the body reading the room and finding it safe — a signal older than words.',
      },
    ],
  },
  {
    id: 'jaw_release',
    shelf: 'somatic',
    kind: 'steps',
    title: 'The Jaw Release',
    purpose: 'The jaw and the floor of the pelvis move together — soften one, find the other.',
    minutes: 4,
    opensOnDay: 8,
    sequencedReason: 'Opens Day 8 — once the drop is familiar, the jaw becomes a second handle on it.',
    closing: 'Two floors, one release. The body keeps the connection.',
    steps: [
      {
        title: 'Find the hinge',
        body: 'Fingertips at the jaw hinge, just below the ears. Teeth apart, lips soft. Notice how much holding lives here on an ordinary day.',
      },
      {
        title: 'Unhinge',
        body: 'Let the jaw hang slightly open. Tongue resting loose on the floor of the mouth, wide and heavy. Breathe through the nose, low and slow.',
      },
      {
        title: 'The echo below',
        body: 'On the next slow exhale, keep the jaw loose and drop attention to the floor of the pelvis. The two soften together — the body wires them as a pair. Let the lower floor follow the upper one down.',
        hint: '4–5 slow breaths',
      },
      {
        title: 'Alternate',
        body: 'A few rounds: soften the jaw... feel the pelvis answer... soften the pelvis... feel the jaw answer. One release, two doors.',
      },
    ],
  },
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

  {
    id: 'pendulation',
    shelf: 'somatic',
    kind: 'steps',
    title: 'Pendulation',
    purpose: 'Swing attention between calm and activation — build tolerance for both.',
    minutes: 6,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — this is Phase 2\'s skill: staying present as activation rises.',
    closing: 'You visited the activation and returned on your own power. That is the skill.',
    steps: [
      {
        title: 'Find the settled place',
        body: 'Eyes closed or soft. Scan for one place in your body that feels calm, neutral, or simply okay right now — feet on the floor, the weight of your hands, the breath at the belly. Rest attention there until it feels familiar.',
      },
      {
        title: 'Find the activation',
        body: 'Now locate where the tension or unease lives — a tight chest, a held jaw, a buzzing stomach. Visit it briefly, through your own senses. Just enough to feel its edge.',
        hint: 'A few seconds is enough',
      },
      {
        title: 'Return to the settled place',
        body: 'Walk attention back to the calm place and let it refill — the body remembers the way. Stay until the settling is real again.',
      },
      {
        title: 'Swing between them',
        body: 'Move between the two — a few breaths at the activation, a few breaths at the settled place. Each round, the swing gets easier and the activation softens at the edges.',
        hint: '4–6 rounds',
      },
      {
        title: 'Close at the settled place',
        body: 'End where the calm lives. One long exhale. You chose where attention went, the whole time.',
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
    id: 'setback_rehearsal',
    shelf: 'mind',
    kind: 'steps',
    title: 'The If-Then Install',
    purpose: 'A response, chosen in calm, installed before it\'s ever needed.',
    minutes: 4,
    opensOnDay: 14,
    sequencedReason: 'Opens Day 14 — two weeks in, the plan gets installed before it\'s ever needed.',
    closing: 'The plan is installed. If the moment comes, it fires on its own.',
    steps: [
      {
        title: 'Why this works',
        body: 'A decision made during a spike costs willpower you won\'t have. A decision made now, in calm, and rehearsed, fires automatically later. Psychologists call these if-then plans — among the most reliably effective tools in behavior science.',
      },
      {
        title: 'The plan',
        body: 'Here is yours: "If my body softens or a wave passes through — then I take one long exhale, and return my attention to touch." That\'s the whole plan. One exhale, back to sensation.',
      },
      {
        title: 'Rehearse it',
        body: 'Through your own eyes, picture the moment arriving — calmly, like weather. Feel yourself take the long exhale. Feel attention land back on skin and warmth. Run it three times, slowly.',
        hint: 'Field of view: your own — always',
      },
      {
        title: 'Seal it',
        body: 'Say it once, inwardly, in your own voice: "One exhale, back to sensation." Installed.',
      },
    ],
  },
  {
    id: 'wearing_it_out',
    shelf: 'mind',
    kind: 'steps',
    title: 'Wearing It Out',
    purpose: 'Repeat the Spectator\'s word until it\'s only a sound.',
    minutes: 3,
    opensOnDay: 26,
    sequencedReason: 'Opens Day 26 — a defusion drill for words that have earned too much weight.',
    closing: 'A word is a sound the mind dresses up. You just undressed one.',
    steps: [
      {
        title: 'Pick the word',
        body: 'The Spectator has a favorite word for you — the one-word verdict it stamps on a hard moment. Bring it to mind. You know the one.',
      },
      {
        title: 'Say it fast',
        body: 'Now repeat it — aloud if you\'re alone, inwardly if not — as fast as you can, over and over, for thirty seconds. Faster than meaning can keep up.',
        hint: '30 seconds, full speed',
      },
      {
        title: 'Notice what\'s left',
        body: 'Somewhere around the twentieth repetition it stopped being a verdict and became a noise — syllables, mouth-sounds, static. The word didn\'t change. Its grip did.',
      },
      {
        title: 'Keep the lesson',
        body: 'That\'s what the Spectator\'s vocabulary is made of: sounds with borrowed authority. Next time the word arrives stamped on a moment, you\'ve already heard it as static.',
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

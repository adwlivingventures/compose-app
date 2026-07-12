// Restructure content — the extended distortion taxonomy and its authored
// clinical counters (founder review 2026-07-12: Rewire v2).
//
// Spec correction: CLAUDE.md §5 promises "an immediate, pre-written reframe."
// The previous tab asked the user to WRITE his own rational reframe — asking
// for prefrontal authorship at the exact moment sympathetic activation has
// taken the prefrontal offline. v2: he only RECOGNIZES (taps the pattern);
// the counter is delivered, authored and versioned (§7). Optional one-line
// capture comes after, once down-regulated (generation effect, optional-only,
// local-only).
//
// Taxonomy: the three core keys are shared verbatim with the Triage Center's
// Spectator Disassembly (hooks/useDefusionLog.ts — same key space, same
// stored history). Three more are added here for the full tab; the SOS flow
// deliberately keeps only three (an acutely anxious man gets three cards,
// not six — Hick's Law is a clinical tool in this product).
//
// Voice law: the distortion is always externalized ("the Spectator," "the
// alarm," "the forecast") and never fused with the man. No first-person
// deficit lines. Counters direct attention TOWARD the replacement, never
// away from the problem (never impress the negative).

import { Fallacy, FALLACY_META } from '../hooks/useDefusionLog';

export type Distortion =
  | Fallacy
  | 'fortune_telling'
  | 'overgeneralization'
  | 'spectatoring';

export interface DistortionMeta {
  label: string;
  /** One-line card definition — how the pattern sounds from inside. */
  definition: string;
  /** The pre-written clinical counter (§5): delivered, read, never authored live. */
  counter: string;
}

export const DISTORTION_META: Record<Distortion, DistortionMeta> = {
  catastrophizing: {
    label: 'Catastrophizing',
    definition: 'One hard moment becomes the forecast for every moment after it.',
    counter: FALLACY_META.catastrophizing.reframe,
  },
  mind_reading: {
    label: 'Mind-Reading',
    definition: 'Her thoughts, reported as fact — by your fear.',
    counter: FALLACY_META.mind_reading.reframe,
  },
  all_or_nothing: {
    label: 'All-or-Nothing',
    definition: 'Anything under perfect scores itself as zero.',
    counter: FALLACY_META.all_or_nothing.reframe,
  },
  fortune_telling: {
    label: 'Fortune-Telling',
    definition: 'The prediction feels like a memory of the future.',
    counter:
      'A forecast is not a memory. What feels like certainty is adrenaline rehearsing a threat that has not happened. Your body answers tonight’s actual signals — breath, warmth, contact — and those are the only signals it has ever answered.',
  },
  overgeneralization: {
    label: 'Overgeneralizing',
    definition: '“Always.” “Every time.” “Never.”',
    counter:
      'Absolutes are the alarm talking, and alarms only count the fires. Put the word to the evidence: there have been steady moments — they were real, and they count. Conditioning changes on the average, and the average includes them.',
  },
  spectatoring: {
    label: 'Spectatoring',
    definition: 'You’ve left your body to watch and grade the man in it.',
    counter:
      'The commentary has pulled you out of your own skin to run surveillance. There is no audience — there is one body, and you live in it. Return to a single sensation — weight, warmth, breath — and give it your full attention. Presence and surveillance cannot run at once.',
  },
};

export const DISTORTION_ORDER: Distortion[] = [
  'catastrophizing',
  'mind_reading',
  'all_or_nothing',
  'fortune_telling',
  'overgeneralization',
  'spectatoring',
];

// ─── Flow copy ────────────────────────────────────────────────────────────────

export const SPIKE_FLOW_COPY = {
  cta: 'Restructure a thought',
  ctaSub: 'Sixty seconds. Name the pattern, take the counter, close the loop with one long exhale.',
  step1Title: 'Which pattern is speaking?',
  counterLabel: 'The clinical counter',
  counterInstruction: 'Read it once, slowly — out loud if you can.',
  captureaPlaceholder: 'What exactly did the thought say? (optional — one line)',
  closeCta: 'Close the loop',
  /** The exhale close pairs the cognitive counter with the vagal brake —
   *  polyvagal state change, so every use ends calmer than it began. */
  exhaleCue: 'One long exhale — twice the length of your inhale.',
  exhaleSub: 'The counter is in. Let the body file it.',
  closedTitle: 'Loop closed.',
  closedBody:
    'Named, countered, down-regulated. That is the entire mechanism — and you just ran it in under a minute.',
} as const;

// ─── Daily Rewire copy ────────────────────────────────────────────────────────

export const REWIRE_COPY = {
  holdHint: 'Press and hold the sentence to cross it out.',
  crossedOut: 'Crossed out.',
  truthLabel: 'The truth',
  readInstruction: 'Now read it once more — at the pace of this line.',
  doneLine: 'Rewired for today. A new script tomorrow.',
} as const;

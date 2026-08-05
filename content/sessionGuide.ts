/**
 * Session guide copy — Headspace-pattern guidance for the daily loop.
 * Deterministic, authored, versioned (§7). Rotates by phase/day where noted.
 */

function phaseForDay(day: number): 1 | 2 | 3 {
  if (day <= 25) return 1;
  if (day <= 50) return 2;
  return 3;
}

import type { TrainingKey } from './training';
import { trainingComplete } from './training';

export type SessionStage =
  | 'anchor'
  | 'conditioning'
  | 'score'
  | 'release'
  | 'rewire'
  | 'checkin';

export const SESSION_STAGE_ORDER: SessionStage[] = [
  'anchor',
  'conditioning',
  'score',
  'release',
  'rewire',
  'checkin',
];

export interface StageMeta {
  key: SessionStage;
  /** User-facing ritual name (Headspace: named steps, not internal labels). */
  label: string;
  durationMin: number;
  /** One line when the stage opens — orients before the work. */
  opener: string;
  /** Handoff after completion — acknowledges, previews next. */
  handoffDone: string;
  handoffNext: string;
  trainingKey?: TrainingKey;
}

export const STAGE_META: StageMeta[] = [
  {
    key: 'anchor',
    label: 'The Anchor',
    durationMin: 4,
    opener: 'Listen start to finish. Let the track set the pace — nothing to optimize.',
    handoffDone: 'The anchor is complete.',
    handoffNext: 'Next: move with the breath.',
    trainingKey: 'anchor',
  },
  {
    key: 'conditioning',
    label: 'Conditioning',
    durationMin: 5,
    opener: 'Follow the orb — soften on the inhale, release on the exhale.',
    handoffDone: 'The reps are done.',
    handoffNext: 'Next: one reading of how the floor responded.',
    trainingKey: 'conditioning',
  },
  {
    key: 'score',
    label: 'Control reading',
    durationMin: 1,
    opener: 'A signal you are learning to read — not a grade.',
    handoffDone: 'Logged.',
    handoffNext: 'Next: ninety seconds in a deep hip position.',
    trainingKey: 'control',
  },
  {
    key: 'release',
    label: 'Release',
    durationMin: 2,
    opener: 'Pick a pose. Breathe into the pelvis — no forcing, ever.',
    handoffDone: 'The floor had room to lengthen.',
    handoffNext: 'Next: cross out the old script, read the truth.',
    trainingKey: 'release',
  },
  {
    key: 'rewire',
    label: 'Rewire',
    durationMin: 2,
    opener: 'One deliberate rep — hold to cross out, then read each line.',
    handoffDone: 'The rewire is sealed.',
    handoffNext: 'Last: close today’s training and seal the day.',
    trainingKey: 'rewire',
  },
  {
    key: 'checkin',
    label: 'Close the day',
    durationMin: 2,
    opener: 'Confirm today’s five steps — habits through the day are separate.',
    handoffDone: 'Day sealed.',
    handoffNext: 'Rest is part of the work.',
  },
];

export function metaForStage(stage: SessionStage): StageMeta {
  return STAGE_META.find((m) => m.key === stage)!;
}

export function totalSessionMinutes(): number {
  return STAGE_META.reduce((sum, m) => sum + m.durationMin, 0);
}

const SESSION_INTRO_LEAD: Record<1 | 2 | 3, string[]> = {
  1: [
    'Six steps, about fifteen minutes. One at a time — the app will guide you through each.',
    'Fifteen minutes, six steps. Follow the pace; there is nothing to rush.',
  ],
  2: [
    'Same structure, deeper work inside it. About fifteen minutes, step by step.',
    'Six familiar steps — the reps inside them are harder now. Let the app lead.',
  ],
  3: [
    'The daily practice of a composed man. Six steps, about fifteen minutes.',
    'Fifteen minutes that anchor who you are becoming. One step at a time.',
  ],
};

function pick(variants: string[], day: number): string {
  return variants[(day - 1) % variants.length];
}

export function sessionIntroLead(day: number): string {
  return pick(SESSION_INTRO_LEAD[phaseForDay(day)], day);
}

/** First incomplete stage from training state — for resume. */
export function firstIncompleteStage(
  training: Partial<Record<TrainingKey, boolean>>,
): SessionStage {
  for (const meta of STAGE_META) {
    if (meta.trainingKey && !training[meta.trainingKey]) return meta.key;
  }
  return 'checkin';
}

export function stageIndex(stage: SessionStage): number {
  return SESSION_STAGE_ORDER.indexOf(stage);
}

/** Whether a session stage's work is marked done in today's training state. */
export function stageCompleted(
  stage: SessionStage,
  training: Partial<Record<TrainingKey, boolean>>,
): boolean {
  const meta = metaForStage(stage);
  if (stage === 'checkin') return trainingComplete(training);
  return meta.trainingKey ? !!training[meta.trainingKey] : false;
}

export function nextStage(stage: SessionStage): SessionStage | null {
  const i = stageIndex(stage);
  return i < SESSION_STAGE_ORDER.length - 1 ? SESSION_STAGE_ORDER[i + 1] : null;
}

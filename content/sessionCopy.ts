// Session shell copy — rotating, deterministic variants (founder review
// 2026-07-12: the ritual skeleton stays invariant; the shell copy stops
// being literally identical 75 times).
//
// Why: structural repetition builds basal-ganglia automaticity (good);
// verbatim copy repetition reads as copy-paste and feeds hedonic adaptation
// (bad). Variants rotate by day index — authored, versioned, zero runtime
// generation (§7).
//
// Register law (PSYCHOLOGICAL-FOUNDATIONS §3): Phase 1 = capability,
// Phase 2 = evidence, Phase 3 = identity. Never a later register earlier.
// The control-score question does NOT rotate: it is a measurement, and a
// measurement's wording is part of its calibration.

import { getPhaseForDay } from '../context/ProtocolContext';

const ANCHOR_INTRO: Record<1 | 2 | 3, string[]> = {
  1: [
    'Find a quiet place. Sit or lie down. You can lock your screen — the audio will continue.',
    'Somewhere quiet. Let the seat take your weight. The audio keeps going if the screen locks.',
    'Settle in where nothing needs you for four minutes. Lock the screen if you like — the track carries on.',
    'Sit or lie down. There is nothing to do here but listen.',
  ],
  2: [
    'You know this room now. Settle in, and let the track set the pace.',
    'The seat, the breath, the track — the same three moves that built the last four weeks.',
    'Find your spot. Your body already knows what comes next; let it lead.',
    'Quiet place, screen locked if you like. Follow the pace the track sets.',
  ],
  3: [
    'Take your seat. This is what training composure daily looks like.',
    'Settle in. The ritual is yours now — the track just keeps time.',
    'A quiet place, four minutes, full attention. The daily practice of a composed man.',
    'Sit down and arrive. The session begins when your weight settles.',
  ],
};

const CHECKLIST_HEADER: Record<1 | 2 | 3, string[]> = {
  1: ['Before the day closes', 'The day’s ledger', 'Close out the day'],
  2: ['Count today’s votes', 'The evidence, counted', 'Today’s ledger'],
  3: ['A composed man keeps his ledger', 'The day’s votes', 'Close the ledger'],
};

const CHECKLIST_FOOTER: Record<1 | 2 | 3, string[]> = {
  1: [
    'Answer honestly — an unchecked box is information, not failure.',
    'Honest answers train the system. The ledger records; it never judges.',
  ],
  2: [
    'Every checked line is a vote already cast today — this is just the count.',
    'The ledger is evidence, gathered daily. Answer it straight.',
  ],
  3: [
    'You keep this ledger because of who keeps it — count the day and close it.',
    'Honest count, quiet close. The votes speak for themselves.',
  ],
};

function pick(variants: string[], day: number): string {
  return variants[(day - 1) % variants.length];
}

export function anchorIntroForDay(day: number): string {
  return pick(ANCHOR_INTRO[getPhaseForDay(day).number], day);
}

export function checklistHeaderForDay(day: number): string {
  return pick(CHECKLIST_HEADER[getPhaseForDay(day).number], day);
}

export function checklistFooterForDay(day: number): string {
  return pick(CHECKLIST_FOOTER[getPhaseForDay(day).number], day);
}

// Conditioning protocols — phase-progressive pacer configuration
// (founder review 2026-07-12: the track was one static sequence for 75 days;
// perceived progression is the antidote to perceived repetition).
//
// The clinical base NEVER changes: 4s inhale + pelvic drop / 6s exhale +
// recoil (canon §2.1 — the prolonged exhale is the vagal lever). What
// progresses is what the man does INSIDE that rhythm:
//
//   Phase 1 — Foundation: pure down-training reps. Learn the drop.
//   Phase 2 — Exposure: stillness holds are inserted — sustained drops held
//     through full breath cycles. This is the arousal-plateau rep (canon §5,
//     PONR training): tolerance of sustained activation without the clench,
//     the somatic skeleton of stop-start control.
//   Phase 3 — Autonomy: text cues fade partway in. The orb keeps time; he
//     paces himself. Basal-ganglia handover made literal — by Day 75 the
//     skill must run without instructions, because intimacy has none.
//
// Deterministic, authored, versioned (§7).

export interface ConditioningHold {
  /** Hold begins after this counted rep completes. */
  afterRep: number;
  /** Held-drop duration in breath cycles (count pauses; the orb keeps breathing). */
  cycles: number;
  cue: string;
}

export interface ConditioningProtocol {
  phase: 1 | 2 | 3;
  name: string;
  totalReps: number;
  cueInhale: string;
  cueExhale: string;
  /** Pre-start framing line (register-correct per phase). */
  intro: string;
  holds: ConditioningHold[];
  /** After this rep, running text cues fade to the minimal form (Phase 3). */
  cueFadeAfterRep?: number;
  /** Minimal cue shown once text fades. */
  fadedCue?: string;
}

const PROTOCOLS: Record<1 | 2 | 3, ConditioningProtocol> = {
  1: {
    phase: 1,
    name: 'Foundation',
    totalReps: 30,
    cueInhale: 'Inhale — belly out, push the floor down and away',
    cueExhale: 'Exhale — let it recoil. Soft everywhere.',
    intro: 'Five minutes. Follow the orb — nothing forced.',
    holds: [],
  },
  2: {
    phase: 2,
    name: 'Exposure',
    totalReps: 28,
    cueInhale: 'Inhale — belly out, floor down and away',
    cueExhale: 'Exhale — recoil. Stay soft.',
    intro:
      'Five minutes, with two held drops. The holds train what the reps built: staying open under sustained charge.',
    holds: [
      {
        afterRep: 10,
        cycles: 2,
        cue: 'Hold the drop — floor open, breath low. Stay.',
      },
      {
        afterRep: 20,
        cycles: 2,
        cue: 'Hold again — longer this time. Open is the position.',
      },
    ],
  },
  3: {
    phase: 3,
    name: 'Autonomy',
    totalReps: 28,
    cueInhale: 'Inhale — the drop you know',
    cueExhale: 'Exhale — recoil',
    intro:
      'Five minutes. The cues step back partway through — the pace is yours, because it always was.',
    holds: [
      {
        afterRep: 14,
        cycles: 3,
        cue: 'Hold the drop. No cue needed — you know this position.',
      },
    ],
    cueFadeAfterRep: 8,
    fadedCue: 'Your pace.',
  },
};

export function conditioningProtocolForDay(day: number): ConditioningProtocol {
  return PROTOCOLS[day <= 25 ? 1 : day <= 50 ? 2 : 3];
}

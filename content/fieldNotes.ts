// Field Notes — authored milestone texture for the completed-day dashboard
// (founder review 2026-07-12). Shown once, under Tonight's Line, only on the
// days keyed below.
//
// Mechanism: milestone reinforcement against hedonic adaptation. The daily
// ritual must stay invariant; these notes make the ARC visible at authored
// thresholds so a rising day-count reads as a trajectory, not a treadmill.
// Sparse by design — a note every day would decay into wallpaper
// (reward-prediction error needs occasional, not constant, surprise).
//
// Register law honored per phase (capability → evidence → identity).
// Mechanism claims trace to the canon (§4: Lally automaticity curve,
// prefrontal→basal-ganglia handover; §8: Days 10–20 doubt window).

export const FIELD_NOTES: Record<number, string> = {
  7: 'Seven sessions in the system. This week ran on effort — prefrontal, deliberate, supervised. Every skill that later runs itself begins exactly this way.',
  14: 'Two weeks. This is the stretch where feeling lags evidence — the work lands before it shows. Your Baseline tab holds the trend; read the line, and let the line answer the day.',
  21: 'Three weeks of votes. Notice what happens at your cue now — the reach for the session is starting to happen before the decision to reach. That is the handover beginning.',
  25: 'Phase 1 closes tonight. Twenty-five days of teaching the alarm it had nothing to announce. The system is quieter because you retrained it — the next phase asks it to stay quiet under load.',
  33: 'A third of the protocol behind you. The pause, the drop, the exhale — count how many of them your body now offers before you ask.',
  40: 'Day 40 — past the midpoint. Somewhere in these weeks the sequence stopped needing supervision. That handover, effort to automaticity, is the entire architecture doing its work.',
  50: 'Phase 2 closes. You have held high activation and kept your attention where you placed it — that tolerance is built, and it is yours. Phase 3 makes it permanent.',
  60: 'Fifteen days remain. The practice has outlived every version of the doubt that said it wouldn’t. You are not managing a problem anymore; you are maintaining a baseline.',
  66: 'Day 66 — the clinical average for a habit reaching automaticity. Everything from tonight forward is buffer: deepening a pathway that already runs on its own.',
  70: 'Five days out. The man who opened this app on Day 1 was gathering evidence against an old verdict. The evidence is in. You know how the ruling reads.',
};

export function fieldNoteForDay(day: number): string | null {
  return FIELD_NOTES[day] ?? null;
}

// Composure Score v2 — pure function over the answer set; every weight lives
// in COMPOSURE_WEIGHTS so tuning never touches code (BUILD_PROMPT §4.5).
//
// The instrument is IDENTICAL at Day 0 and every re-measurement (Days 14/40/75
// and the quarterly Act III reads). Same questions, same weights, same gate —
// that comparability is the whole "measured, not promised" claim (remeasure.ts).
//
// v2 design (founder ruling 2026-07-15) — three coupled changes:
//  1. The 80–100 "trained calm" zone is now REACHABLE (ceiling raised 76→100).
//     v1 clamped every reading below 80, which made the promise the product
//     sells — "you can reach trained calm" — impossible to fulfil at any day,
//     including graduation. That was the bug.
//  2. The calm zone is GATED ON ANSWERS, not the calendar (calmZoneUnlocked):
//     80+ is only reachable when the trait cluster — avoidance, aftermath,
//     scripts, spillover — is at its resolved best. Those patterns realistically
//     only quiet in Phase 2–3, so 80–100 lands at Day 40/75 *because the answers
//     earned it*, not via a day-gate. Same answers always yield the same score,
//     so comparability holds. A man whose physical reflexes improved but whose
//     avoidance/scripts persist tops out at 79 ("steadier, not yet trained calm").
//  3. Early-mover items (adrenaline, breath, spectatoring, pelvic release) carry
//     MORE of the deduction budget, so the real physiological gains a compliant
//     man makes by Day 14 register as a clear score increase over his baseline.
//
// The Day-0 gap is preserved automatically: a real customer's honest onboarding
// answers (active problem) land well below 80. No clamp forces it — his answers do.
//
// Honesty rules (unchanged): severity labels only, no invented percentiles or
// population averages, every bar traces to a question he answered.

import type { Answers } from './logic';

// The floor of the trained-calm zone. Scores can only enter it when the trait
// cluster is resolved (calmZoneUnlocked); otherwise they cap one point below.
export const CALM_ZONE_FLOOR = 80;

// Tuning anchors under v2 weights (see composure.test.ts):
//  • all-worst answers  → the clamp floor, 12
//  • all-best answers   → 100 (trait cluster resolved → calm zone open)
//  • the reference persona (push-through adrenaline, breath-hold, spectatoring
//    most sessions, partial release, moderate traits) → ~33: mid-low, clear gap
//  • early-movers resolved but traits still active → high-70s, gated below 80
export const COMPOSURE_WEIGHTS: {
  base: number;
  clamp: [number, number];
  perScriptPenalty: number;
  maxScriptsPenalty: number;
  deductions: Record<string, Record<string, number>>;
} = {
  base: 100,
  clamp: [12, 100], // ceiling now reachable; the calm-zone GATE, not the clamp,
  perScriptPenalty: 3, // is what keeps 80+ honest (see calmZoneUnlocked)
  maxScriptsPenalty: 10,
  deductions: {
    // Early-movers — up-weighted so genuine Day-14 gains move the number.
    adrenalineSpike: { panic: 16, 'push-through': 11, occasionally: 6, calm: 0 },
    breathEdge: { 'shallow-hold': 10, 'speeds-up': 8, 'never-noticed': 4, 'slow-deep': 0 },
    spectatoring: { 'almost-every-time': 14, sometimes: 9, rarely: 3, never: 0 },
    // Numeric 1–10 release ratings (founder review 2026-07-10) map onto the
    // same three severity levels; 'skipped' is the only string value left.
    pelvicCheck: { skipped: 4 },
    morningArousal: { rarely: 4, unsure: 2, sometimes: 1, most: 0 },
    // Trait cluster — the four that gate the calm zone. Value keys describe the
    // underlying construct (avoidance level, post-setback outcome); screens.ts
    // frames them forward for the user. The 'best' value of each (rarely /
    // recover-fast / bedroom-only, and zero scripts) is what unlocks 80+.
    avoidance: { stopped: 12, frequently: 9, sometimes: 5, rarely: 0 },
    aftermath: { spirals: 6, lingers: 4, 'recover-day': 2, 'recover-fast': 0 },
    spillover: { everything: 8, confidence: 5, sometimes: 3, 'bedroom-only': 0 },
    // Habit items — weighted, but not part of the calm gate (founder's four).
    contentFrequency: { daily: 6, '3-5': 4, '1-2': 2, rarely: 0 },
    escalation: { yes: 6, somewhat: 3, no: 0, 'no-say': 2 },
  },
};

/**
 * The calm zone (80+) opens only when the trait cluster is at its resolved
 * best: freely initiating, fast post-setback recovery, no life spillover, and
 * no cognitive scripts still firing. A trait counts as "active" only when it
 * was ANSWERED and is not at its best value — an unanswered item never blocks.
 * This is the honest, answer-based gate that reserves trained calm for the
 * men who have genuinely done the Phase 2–3 work.
 */
export function calmZoneUnlocked(answers: Answers, scriptCount: number): boolean {
  const avoidance = str(answers.avoidance);
  const aftermath = str(answers.aftermath);
  const spillover = str(answers.spillover);
  const active =
    (avoidance !== null && avoidance !== 'rarely') ||
    (aftermath !== null && aftermath !== 'recover-fast') ||
    (spillover !== null && spillover !== 'bedroom-only') ||
    scriptCount >= 1;
  return !active;
}

/** 1–10 pelvic release rating → the same three severity levels the old
 *  categorical options carried (8+ full, 4–7 partial, 1–3 limited). */
export function pelvicLevel(value: number): 'full' | 'partial' | 'limited' {
  if (value >= 8) return 'full';
  if (value >= 4) return 'partial';
  return 'limited';
}

const PELVIC_DEDUCTION: Record<'full' | 'partial' | 'limited', number> = {
  full: 0,
  partial: 6,
  limited: 10,
};

export interface SeverityBar {
  label: string;
  grade: string;
  /** red = High; amber = active problem; neutral = healthy/unmeasured reads
   *  (founder review 2026-07-10: a good reading must not look like a warning). */
  tone: 'amber' | 'red' | 'neutral';
  /** One plain-English line: what this bar means, traced to his answer.
   *  Rendered on the Map behind tap-to-expand (restored 2026-08-03, build
   *  order 1.1): the depth-seeker gets the plain-English read, the
   *  headline-reader is undisturbed, and nobody decodes "Moderate" alone. */
  detail: string;
}

export interface ComposureResult {
  score: number;
  bars: SeverityBar[];
  mirror: string;
  /** Map screen: verdict + reported markers in one line. */
  summary: string;
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

/** The score verdict — one plain sentence that tells him whether this is bad
 *  and what it means. Deterministic bands over the 12–100 scale. */
export function verdictFor(score: number): string {
  if (score <= 35) {
    return 'Adrenaline is running the show — intimacy reads as a threat to your body.';
  }
  if (score < 60) {
    return 'Under pressure, your nervous system fires before you can stay present.';
  }
  if (score < CALM_ZONE_FLOOR) {
    return 'Steadier than most — but the interference still shows up when it matters.';
  }
  return 'Trained calm — your nervous system holds steady under pressure.';
}

/** Reported markers that feed the mirror line — shared with buildMirror. */
function mirrorSegments(answers: Answers): string[] {
  const segments: string[] = [];
  if (str(answers.breathEdge) === 'shallow-hold') segments.push('breath-holding at the edge');
  const spect = str(answers.spectatoring);
  if (spect === 'almost-every-time') segments.push('spectatoring most sessions');
  else if (spect === 'sometimes') segments.push('spectatoring some sessions');
  const pelvicRating = num(answers.pelvicCheck);
  const pelvic = pelvicRating !== null ? pelvicLevel(pelvicRating) : null;
  if (pelvic === 'partial') segments.push('partial pelvic release');
  else if (pelvic === 'limited') segments.push('a pelvic floor that would not let go');
  return segments;
}

/** One Map read: score-band verdict woven with his reported markers. */
export function mapSummaryFor(score: number, answers: Answers): string {
  const verdict = verdictFor(score);
  const segments = mirrorSegments(answers);
  if (segments.length === 0) return verdict;
  const list = segments.join(', ');
  const conditioned = conditionedPhrase(answers);
  const stem = verdict.replace(/\.$/, '');
  return `${stem} — ${list}, conditioned ${conditioned}.`;
}

export function computeComposure(answers: Answers): ComposureResult {
  const { base, clamp, deductions, perScriptPenalty, maxScriptsPenalty } = COMPOSURE_WEIGHTS;

  let score = base;
  for (const [key, table] of Object.entries(deductions)) {
    const v = str(answers[key as keyof Answers]);
    if (v && table[v] !== undefined) score -= table[v];
  }
  const pelvicRating = num(answers.pelvicCheck);
  if (pelvicRating !== null) score -= PELVIC_DEDUCTION[pelvicLevel(pelvicRating)];
  const scripts = Array.isArray(answers.scripts) ? answers.scripts : [];
  score -= Math.min(scripts.length * perScriptPenalty, maxScriptsPenalty);
  score = Math.round(Math.min(Math.max(score, clamp[0]), clamp[1]));

  // The calm-zone gate: trained calm (80+) is reserved for a resolved trait
  // cluster. If any trait is still active, hold the score one point below the
  // floor — "steadier, but not yet trained calm." Never lifts a score, only caps.
  if (score >= CALM_ZONE_FLOOR && !calmZoneUnlocked(answers, scripts.length)) {
    score = CALM_ZONE_FLOOR - 1;
  }

  return {
    score,
    bars: buildBars(answers, scripts.length),
    mirror: buildMirror(answers),
    summary: mapSummaryFor(score, answers),
  };
}

// Each bar's grade vocabulary is its own (spec: Moderate/High/Partial/
// Elevated/Active/Present). Every grade AND detail line traces to one answer
// (founder review 2026-07-10: no reading may need decoding).
function buildBars(answers: Answers, scriptCount: number): SeverityBar[] {
  const bars: SeverityBar[] = [];
  // Healthy reads go neutral — never amber; a good result must look like one.
  const tone = (grade: string): SeverityBar['tone'] =>
    grade === 'High' ? 'red'
    : ['Low', 'Full', 'Quiet', 'Unmeasured'].includes(grade) ? 'neutral'
    : 'amber';

  const push = (label: string, grade: string, detail: string) =>
    bars.push({ label, grade, tone: tone(grade), detail });

  const adrenaline = str(answers.adrenalineSpike);
  if (adrenaline) {
    const grade =
      adrenaline === 'panic' ? 'High'
      : adrenaline === 'push-through' ? 'Moderate'
      : adrenaline === 'occasionally' ? 'Moderate'
      : 'Low';
    push(
      'Sympathetic override',
      grade,
      grade === 'Low'
        ? 'You reported staying calm when intimacy starts — the alarm is quiet here.'
        : 'Adrenaline hits when intimacy starts — the stress reflex that ends erections and rushes finishes.',
    );
  }

  const spect = str(answers.spectatoring);
  if (spect) {
    const grade =
      spect === 'almost-every-time' ? 'High' : spect === 'sometimes' ? 'Moderate' : 'Low';
    push(
      'Spectatoring loop',
      grade,
      grade === 'Low'
        ? 'You mostly stay in the experience rather than watching yourself — a real strength.'
        : 'You leave the moment to watch and grade yourself — attention your arousal needs and doesn’t get.',
    );
  }

  const pelvicRating = num(answers.pelvicCheck);
  const pelvicSkipped = str(answers.pelvicCheck) === 'skipped';
  if (pelvicRating !== null || pelvicSkipped) {
    const level = pelvicRating !== null ? pelvicLevel(pelvicRating) : null;
    const grade =
      level === 'full' ? 'Full'
      : level === 'partial' ? 'Partial'
      : level === 'limited' ? 'Limited'
      : 'Unmeasured';
    push(
      'Pelvic release capacity',
      grade,
      grade === 'Full'
        ? 'Your pelvic floor released fully on cue — the physical base is in good shape.'
        : grade === 'Unmeasured'
        ? 'You skipped the check — it will open your Day 1, and you can run it any time from your Library.'
        : `You rated your release ${pelvicRating}/10 — a floor that can’t fully let go works against control and blood flow.`,
    );
  }

  const avoid = str(answers.avoidance);
  if (avoid) {
    const grade =
      avoid === 'stopped' ? 'High'
      : avoid === 'frequently' ? 'Elevated'
      : avoid === 'sometimes' ? 'Moderate'
      : 'Low';
    push(
      'Avoidance pattern',
      grade,
      grade === 'Low'
        ? 'You still initiate despite the difficulty — that keeps the retraining ground open.'
        : 'You’ve started dodging intimacy to dodge the outcome — each skip confirms the alarm.',
    );
  }

  push(
    'Cognitive scripts',
    scriptCount >= 2 ? 'Active' : scriptCount === 1 ? 'Present' : 'Quiet',
    scriptCount >= 2
      ? `${scriptCount} failure scripts run after hard nights — each replay trains the anxiety deeper.`
      : scriptCount === 1
      ? 'One failure script runs after hard nights — it rehearses the problem, not the fix.'
      : 'No failure scripts reported — your self-talk isn’t feeding the loop.',
  );

  const escalation = str(answers.escalation);
  if (escalation === 'yes' || escalation === 'somewhat') {
    push(
      'Conditioning drift',
      'Present',
      'You need more extreme content for the same arousal — your threshold has been trained upward.',
    );
  }

  return bars;
}

// The mirror sentence: built ONLY from markers the user actually reported.
// Restored to the Map (2026-08-03, build order 1.1) — under the gauge, above
// the bars: a composed clinical sentence assembled from HIS answers is the
// strongest personalization receipt in the funnel (the "how did they know"
// jolt is self-relevance processing — proof the analysis was rendered for
// him, not looked up). Returns '' only in the true zero-answer edge, so the
// Map renders nothing rather than a stub.
function buildMirror(answers: Answers): string {
  const segments = mirrorSegments(answers);

  // True zero-answer edge: no markers AND no duration reported — render
  // nothing rather than a generic stub (a mirror that reflects nothing of
  // his is worse than no mirror).
  if (segments.length === 0 && str(answers.duration) === null) return '';

  const conditioned = conditionedPhrase(answers);
  if (segments.length >= 2) {
    const list = segments.join(', ');
    const noun = segments.length === 3 ? 'triad' : 'pattern';
    const first = list.charAt(0).toUpperCase() + list.slice(1);
    return `${first} — that ${noun} is the adrenaline trap, and yours has been conditioned ${conditioned}.`;
  }
  if (segments.length === 1) {
    const first = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    return `${first} — conditioned ${conditioned}.`;
  }
  return `This is a conditioned adrenaline response — trained into your nervous system ${conditioned}.`;
}

function conditionedPhrase(answers: Answers): string {
  const duration = str(answers.duration);
  const age = typeof answers.age === 'number' ? answers.age : null;
  switch (duration) {
    case 'under-6m':
      return 'over the last six months';
    case '6m-2y':
      return 'over the last couple of years';
    case '2-5y':
      return 'over roughly three years';
    case 'over-5y':
      return 'over more than five years';
    case 'always':
      return age && age > 20
        ? `over roughly ${age - 18} years`
        : 'for as long as you have been sexually active';
    default:
      return 'over years of repetition';
  }
}

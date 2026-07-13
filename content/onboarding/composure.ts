// Composure Score v1 — pure function over the answer set; every weight lives
// in COMPOSURE_WEIGHTS so tuning never touches code (BUILD_PROMPT §4.5).
//
// STEP-5 NOTE: this is the working v1 pulled forward so Your Map can render
// in step 4. Step 5 adds the unit-test suite and any weight tuning, plus the
// Ember particle assembly that builds these bars.
//
// Hard rules (spec design note, B-26): severity labels only — no invented
// percentiles or population averages; every bar traces to a question the
// user answered; the gauge compares the user to the trained calm baseline
// (80–100), never to a fabricated "average man". The score is clamped BELOW
// the calm zone: the gap is the product's honest premise.

import type { Answers } from './logic';

// Tuning anchor (step 5): the spec's example persona (B-26 — push-through
// adrenaline, breath-holding, spectatoring most sessions, partial release,
// moderate everything else) must land near the reference's 41. With these
// weights he scores 37; the full-severity floor is the clamp's 12 and the
// all-calm ceiling is the clamp's 76 (best-possible answers compute to ~91
// pre-clamp) — the score always leaves a visible gap to the 80–100 calm
// zone, because the gap IS the honest premise.
export const COMPOSURE_WEIGHTS: {
  base: number;
  clamp: [number, number];
  perScriptPenalty: number;
  maxScriptsPenalty: number;
  deductions: Record<string, Record<string, number>>;
} = {
  base: 96,
  clamp: [12, 76], // never inside the 80–100 calm zone pre-program
  perScriptPenalty: 3,
  maxScriptsPenalty: 8,
  deductions: {
    adrenalineSpike: { panic: 14, 'push-through': 9, occasionally: 5, calm: 0 },
    breathEdge: { 'shallow-hold': 7, 'speeds-up': 6, 'never-noticed': 3, 'slow-deep': 0 },
    spectatoring: { 'almost-every-time': 12, sometimes: 8, rarely: 3, never: 0 },
    // Numeric 1–10 release ratings (founder review 2026-07-10) map onto the
    // same three severity levels; 'skipped' is the only string value left.
    pelvicCheck: { skipped: 4 },
    avoidance: { frequently: 8, sometimes: 4, rarely: 2, stopped: 10 },
    aftermath: { shame: 4, anger: 3, numbness: 3, 'fear-next': 5 },
    spillover: { everything: 6, confidence: 4, sometimes: 3, 'bedroom-only': 0 },
    contentFrequency: { daily: 5, '3-5': 3, '1-2': 2, rarely: 0 },
    escalation: { yes: 5, somewhat: 3, no: 0, 'no-say': 2 },
    morningArousal: { rarely: 3, unsure: 2, sometimes: 1, most: 0 },
  },
};

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
  /** One plain-English line: what this bar means, traced to his answer. */
  detail: string;
}

export interface ComposureResult {
  score: number;
  bars: SeverityBar[];
  mirror: string;
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

/** The score verdict — one plain sentence that tells him whether this is bad
 *  and what it means. Deterministic bands over the 12–76 clamp. */
export function verdictFor(score: number): string {
  if (score <= 35) {
    return 'Right now, adrenaline is running the show: your nervous system treats intimacy as a threat, and your body obeys it every time.';
  }
  if (score <= 55) {
    return 'Your nervous system is working against you — under intimate pressure it fires a stress response your body then has to fight.';
  }
  return 'Steadier than most — but the interference is real, and it shows up exactly when it costs the most.';
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

  return { score, bars: buildBars(answers, scripts.length), mirror: buildMirror(answers) };
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
// (No longer rendered on the Map after the 2026-07-10 revamp; retained for
// the paywall family and future surfaces.)
function buildMirror(answers: Answers): string {
  const segments: string[] = [];
  if (str(answers.breathEdge) === 'shallow-hold') segments.push('Breath-holding at the edge');
  const spect = str(answers.spectatoring);
  if (spect === 'almost-every-time') segments.push('spectatoring most sessions');
  else if (spect === 'sometimes') segments.push('spectatoring some sessions');
  const pelvicRating = num(answers.pelvicCheck);
  const pelvic = pelvicRating !== null ? pelvicLevel(pelvicRating) : null;
  if (pelvic === 'partial') segments.push('partial pelvic release');
  else if (pelvic === 'limited') segments.push('a pelvic floor that would not let go');

  const conditioned = conditionedPhrase(answers);
  if (segments.length >= 2) {
    const list = segments.join(', ');
    const noun = segments.length === 3 ? 'triad' : 'pattern';
    const first = list.charAt(0).toUpperCase() + list.slice(1);
    return `${first} — that ${noun} is the adrenaline trap, and yours has been conditioned ${conditioned}.`;
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

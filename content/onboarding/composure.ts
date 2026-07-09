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
// all-calm ceiling is 70 — the score always leaves a visible gap to the
// 80–100 calm zone, because the gap IS the honest premise.
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
    breathEdge: { 'shallow-hold': 7, 'never-noticed': 3, 'slow-deep': 0 },
    spectatoring: { 'almost-every-time': 12, sometimes: 8, rarely: 3, never: 0 },
    pelvicCheck: { complete: 0, partial: 6, difficulty: 10, skipped: 4 },
    avoidance: { frequently: 8, sometimes: 4, rarely: 2, stopped: 10 },
    aftermath: { shame: 4, anger: 3, numbness: 3, 'fear-next': 5 },
    spillover: { everything: 6, sometimes: 3, 'bedroom-only': 0 },
    contentFrequency: { daily: 5, '3-5': 3, '1-2': 2, rarely: 0 },
    escalation: { yes: 5, somewhat: 3, no: 0, 'no-say': 2 },
    morningArousal: { rarely: 3, unsure: 2, sometimes: 1, most: 0 },
  },
};

export interface SeverityBar {
  label: string;
  grade: string;
  /** red only for High; everything else amber (reference 3a B-26). */
  tone: 'amber' | 'red';
}

export interface ComposureResult {
  score: number;
  bars: SeverityBar[];
  mirror: string;
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);

export function computeComposure(answers: Answers): ComposureResult {
  const { base, clamp, deductions, perScriptPenalty, maxScriptsPenalty } = COMPOSURE_WEIGHTS;

  let score = base;
  for (const [key, table] of Object.entries(deductions)) {
    const v = str(answers[key as keyof Answers]);
    if (v && table[v] !== undefined) score -= table[v];
  }
  const scripts = Array.isArray(answers.scripts) ? answers.scripts : [];
  score -= Math.min(scripts.length * perScriptPenalty, maxScriptsPenalty);
  score = Math.round(Math.min(Math.max(score, clamp[0]), clamp[1]));

  return { score, bars: buildBars(answers, scripts.length), mirror: buildMirror(answers) };
}

// Each bar's grade vocabulary is its own (spec: Moderate/High/Partial/
// Elevated/Active/Present). Every grade traces to one answer.
function buildBars(answers: Answers, scriptCount: number): SeverityBar[] {
  const bars: SeverityBar[] = [];
  const tone = (grade: string): 'amber' | 'red' => (grade === 'High' ? 'red' : 'amber');

  const adrenaline = str(answers.adrenalineSpike);
  if (adrenaline) {
    const grade =
      adrenaline === 'panic' ? 'High'
      : adrenaline === 'push-through' ? 'Moderate'
      : adrenaline === 'occasionally' ? 'Moderate'
      : 'Low';
    bars.push({ label: 'Sympathetic override', grade, tone: tone(grade) });
  }

  const spect = str(answers.spectatoring);
  if (spect) {
    const grade =
      spect === 'almost-every-time' ? 'High' : spect === 'sometimes' ? 'Moderate' : 'Low';
    bars.push({ label: 'Spectatoring loop', grade, tone: tone(grade) });
  }

  const pelvic = str(answers.pelvicCheck);
  if (pelvic) {
    const grade =
      pelvic === 'complete' ? 'Full'
      : pelvic === 'partial' ? 'Partial'
      : pelvic === 'difficulty' ? 'Limited'
      : 'Unmeasured';
    bars.push({ label: 'Pelvic release capacity', grade, tone: 'amber' });
  }

  const avoid = str(answers.avoidance);
  if (avoid) {
    const grade =
      avoid === 'stopped' ? 'High'
      : avoid === 'frequently' ? 'Elevated'
      : avoid === 'sometimes' ? 'Moderate'
      : 'Low';
    bars.push({ label: 'Avoidance pattern', grade, tone: tone(grade) });
  }

  bars.push({
    label: 'Cognitive scripts',
    grade: scriptCount >= 2 ? 'Active' : scriptCount === 1 ? 'Present' : 'Quiet',
    tone: 'amber',
  });

  const escalation = str(answers.escalation);
  if (escalation === 'yes' || escalation === 'somewhat') {
    bars.push({ label: 'Conditioning drift', grade: 'Present', tone: 'amber' });
  }

  return bars;
}

// The mirror sentence: built ONLY from markers the user actually reported.
function buildMirror(answers: Answers): string {
  const segments: string[] = [];
  if (str(answers.breathEdge) === 'shallow-hold') segments.push('Breath-holding at the edge');
  const spect = str(answers.spectatoring);
  if (spect === 'almost-every-time') segments.push('spectatoring most sessions');
  else if (spect === 'sometimes') segments.push('spectatoring some sessions');
  const pelvic = str(answers.pelvicCheck);
  if (pelvic === 'partial') segments.push('partial pelvic release');
  else if (pelvic === 'difficulty') segments.push('a pelvic floor that would not let go');

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

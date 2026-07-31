// Ember Dusk v2 — material spec that NativeWind can't express.
// Companion to tailwind.config.js (colors/fonts). Sources: Design Authority
// Ruling (design/design_handoff_twilight_v1/BUILD_PROMPT.md §1) + the Craft
// Layer Addendum ("Ember Alive") §§2–4.
//
// Governing rule: if it is interactive or it is the Ember, it may EMIT
// (gradient core + bloom). Everything else absorbs. Severity chips are matte.

// Deepwater v1 (founder-approved 2026-07-25): the field cools to match the
// post-paywall reskin (tailwind.config.js) so onboarding and app share one
// ground. Founder ruling 2026-07-25 (second pass): onboarding's ACTION accents
// (CTA, SELECTION, DUSK_RADIAL) now run the aqua "current" too — the whole
// funnel is one guided stream. The warm family survives in exactly two places,
// both deliberate: the ember-rust DIAGNOSTIC section (warm diagnosis inside a
// cool funnel — the contrast is the point) and the `ember` identity register
// (oaths, mirror lines, the user's own marker). New post-paywall material
// constants live in theme/deepwater.ts.
export const DUSK = {
  ground: '#0A0F16',
  surface: '#121A24',
  line: '#223140',
  radio: '#2A3A4A',
  accent: '#C89B6D',
  accentBright: '#D9B285',
  accentDeep: '#A87F58',
  ink: '#EDF2F5',
} as const;

/** Emissive CTA: radial core (lighter center) + outer bloom + 1px inner border.
 *  Deepwater: the aqua current — the one emissive next action per screen. */
export const CTA = {
  coreCenter: '#8CE6D8', // lighter aqua center
  coreEdge: '#5FD4C1',
  bloomColor: 'rgba(95,212,193,0.30)',
  bloomRadius: 14, // 12–16px per ruling
  innerBorder: 'rgba(190,240,232,0.50)', // brighter aqua hairline
  /** Press: bloom expands 20%, luminance dips, settles — an exhale, not a click. */
  pressBloomScale: 1.2,
  pressDimOpacity: 0.88,
} as const;

/** Diagnostic accent — the four "What your answers show" cards run in a hotter
 *  ember-rust instead of copper (founder ruling 2026-07-14). The diagnosis
 *  section gets its own colour temperature: noticeably warmer and more urgent
 *  than the rest of onboarding, still unmistakably Ember Dusk (same warm
 *  family, not a new hue). Applied to the card arrow, hero emission, stat
 *  figure and eyebrow. Deliberate deviation flagged to founder: severity
 *  amber/red stay matte; THIS accent is allowed to emit because it is the
 *  section's primary action colour, not a severity signal. */
export const DIAGNOSTIC = {
  accent: '#CE7A50', // ember-rust — the section's copper substitute
  arrow: {
    coreLight: '#F0A876',
    core: '#E4986A',
    coreDeep: '#C56A3D',
    glow: '#CE7A50',
    border: 'rgba(240,168,118,0.70)',
    halo: 'rgba(206,122,80,0.40)',
  },
} as const;

export type ArrowAccent = {
  coreLight: string;
  core: string;
  coreDeep: string;
  glow: string;
  border: string;
  halo: string;
};

/** Legacy copper arrow accent. Deepwater: no longer the default onboarding
 *  tone — kept as a warm ArrowAccent variant (values unchanged on purpose). */
export const COPPER_ARROW: ArrowAccent = {
  coreLight: '#E4C193',
  core: '#D9B285',
  coreDeep: '#C08C57',
  glow: '#C89B6D',
  border: 'rgba(233,196,152,0.70)',
  halo: 'rgba(200,155,109,0.35)',
};

/** Selected answer cards: aqua 1px border + interior glow rising from the
 *  bottom edge (Deepwater — selection is an action state, so it rides the
 *  current). */
export const SELECTION = {
  border: '#5FD4C1',
  glow: 'rgba(95,212,193,0.16)',
  /** Interior bottom-edge gradient — chosen cards look lit, not highlighted. */
  interiorGlow: 'rgba(95,212,193,0.13)',
  /** Unchosen cards dim to 60% over 250ms — the "decision made" cue. */
  dimOthersTo: 0.6,
  dimMs: 250,
  /** Founder-ruled hold before auto-advance (supersedes spec's 250ms; 2026-07-06 ruling kept). */
  holdMs: 450,
} as const;

/** Cool aqua radial bleeding off the top of chapter screens (Deepwater —
 *  ambience follows the current; the diagnosis cards override it ember-rust). */
export const DUSK_RADIAL = {
  color: 'rgba(95,212,193,0.10)', // 0.10–0.14 band
  fadeStop: 0.65, // → transparent at 65%
} as const;

/** Severity — semantic ONLY, matte, never glows. Map bars + paywall recap only. */
export const SEVERITY = {
  amber: '#D9A756',
  amberBg: 'rgba(217,167,86,0.10)',
  red: '#E07A5F',
  redBg: 'rgba(224,122,95,0.10)',
} as const;

/** Gauge: calm zone stays COOL — the user's warm marker moves toward cool calm. */
export const GAUGE = {
  calmZone: 'rgba(93,114,168,0.25)',
} as const;

/** Motion — every easing derives from a respiratory rhythm. No bounce, no snap. */
export const EASING = {
  /** Breath-out curve for all entrances/settles. */
  breathOut: [0.22, 0.61, 0.36, 1] as const,
} as const;

export const DURATION = {
  microMin: 220,
  microMax: 280,
  transitionMin: 380,
  transitionMax: 450,
  ceremonialMin: 600,
  ceremonialMax: 900,
  answerStagger: 40,
  answerRisePx: 12,
} as const;

/** The Ember's master clock: 4-2-6 idle breath. All ambient animation phase-locks to it. */
export const EMBER_BREATH = { inhaleMs: 4000, holdMs: 2000, exhaleMs: 6000 } as const;

// ── Dusk-to-dawn arc ──────────────────────────────────────────────────────
// Ground/surface interpolate by protocol day: Day 0/1 midnight → Day 75 first
// light. HARD CEILING: ground never exceeds ~8% luminance — Day 75 is first
// light, never daylight (discretion + warm-dark physiology both depend on it).
// Onboarding renders at day 0 (midnight values). Phase transitions (26, 51)
// step slightly more than daily drift. One function, no per-screen overrides.

const DAWN_TARGET = { ground: '#10131D', surface: '#1B2130' } as const; // ≈8% luminance

function lerpHex(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16);
  const g = parseInt(to.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((f >> shift) & 0xff) + (((g >> shift) & 0xff) - ((f >> shift) & 0xff)) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

/**
 * Token overrides for a protocol day (0–75+, clamped). Small phase-boundary
 * steps at Days 26 and 51 make returning users feel a season change.
 */
export function dawnArc(day: number): { ground: string; surface: string } {
  const d = Math.min(Math.max(day, 0), 75);
  const phaseStep = (d >= 26 ? 0.04 : 0) + (d >= 51 ? 0.04 : 0);
  const t = Math.min((d / 75) * 0.92 + phaseStep, 1);
  return {
    ground: lerpHex(DUSK.ground, DAWN_TARGET.ground, t),
    surface: lerpHex(DUSK.surface, DAWN_TARGET.surface, t),
  };
}

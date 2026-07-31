// Deepwater v1 — material spec for the post-paywall reskin (founder-approved
// 2026-07-25). Companion to tailwind.config.js (which holds the class tokens);
// this file holds what NativeWind can't express: glow values, ring states,
// and the accent-discipline constants new components import.
//
// Governing rules (project doc claude/DEEPWATER-FLOW-MAP.md §1):
// - `accent` (the aqua "current") marks the NEXT STEP and EARNED PROGRESS
//   only — ≤4 uses per screen. It is the only thing that emits.
// - `ember` marks IDENTITY MOMENTS only (phase names, milestone marks,
//   italic mirror lines) — ≤2 per screen. Never a CTA.
// - SOS stays matte (#C96A55 family) and never glows or animates.
// - No badges, no red dots, no counts on any chrome, ever.

export const DEEPWATER = {
  ground: '#0A0F16',
  surface: '#121A24',
  line: '#223140',
  ink: '#EDF2F5',
  accent: '#5FD4C1',
  accentBright: '#8CE6D8',
  accentDeep: '#3E9BD6',
  onAccent: '#06232A',
  ember: '#C89B6D',
  emberBright: '#D9B285',
  gain: '#78C99A',
} as const;

/** Emissive primary action: aqua core + soft bloom. Press = exhale, not click. */
export const CURRENT_CTA = {
  coreCenter: '#8CE6D8',
  coreEdge: '#5FD4C1',
  bloomColor: 'rgba(95,212,193,0.30)',
  bloomRadius: 14,
  innerBorder: 'rgba(190,240,232,0.50)',
  pressBloomScale: 1.2,
  pressDimOpacity: 0.88,
} as const;

/** The center Today node's session ring (5 segments, one per Training step). */
export const TODAY_RING = {
  track: 'rgba(255,255,255,0.10)',
  fill: '#5FD4C1',
  /** Sealed: ring completes in ember and the glow turns OFF — the app stops asking. */
  sealed: 'rgba(200,155,109,0.55)',
  glow: 'rgba(95,212,193,0.35)',
} as const;

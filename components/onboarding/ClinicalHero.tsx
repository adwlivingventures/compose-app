// ClinicalHero — per-concept emissive line motifs for the four reveal cards
// (founder ruling 2026-07-14). Replaces the generic PNG renders: each card
// gets a bespoke motif that names its idea at a glance (QUITTR's icon-first
// legibility) while staying inside Ember Dusk — matte ink line-work on the
// dusk ground with a single disciplined emission at the focal point (the
// hero's one allowed sand emission; the arrow CTA is the other). No playful
// mascots, no bright per-screen colours. The diagnosis section runs the hotter
// ember-rust accent (passed in) rather than copper.

import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ClinicalMotif } from '../../content/onboarding/types';

const INK = '#5B6478'; // muted structural line-work (absorbs)
const STROKE = '#232D42'; // the frame ring
const DEFAULT_ACCENT = '#C89B6D'; // copper fallback; cards pass ember-rust

const SIZE = 190;
const MID = SIZE / 2;

/** Soft emission behind the focal point — the hero's one sand/ember bloom. */
function Glow({ cx, cy, r = 58, accent }: { cx: number; cy: number; r?: number; accent: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={accent} stopOpacity={0.3} />
          <Stop offset="0.6" stopColor={accent} stopOpacity={0.09} />
          <Stop offset="1" stopColor={accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#heroGlow)" />
    </>
  );
}

function Ring() {
  return <Circle cx={MID} cy={MID} r={80} stroke={STROKE} strokeWidth={1} fill="none" />;
}

const stroke = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

/** The Adrenaline Trap (enemy) — a resting cardiac line that erupts into one
 *  violent spike: the surge fired at the wrong moment. */
function Adrenaline({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={92} cy={92} r={60} accent={accent} />
      <Ring />
      <Path d="M28 95 L78 95" stroke={INK} strokeWidth={2} {...stroke} />
      <Path d="M118 95 L162 95" stroke={INK} strokeWidth={2} {...stroke} />
      <Path d="M78 95 L86 95 L96 48 L106 140 L114 82 L118 95" stroke={accent} strokeWidth={2.4} {...stroke} />
      <Circle cx={96} cy={48} r={4.5} fill={accent} />
    </Svg>
  );
}

/** The Spectator (you) — a single open eye, watching. The iris is the emission:
 *  you have stepped outside to observe yourself. */
function Spectator({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={95} r={46} accent={accent} />
      <Ring />
      {/* Almond lids. */}
      <Path d="M48 95 Q95 60 142 95" stroke={INK} strokeWidth={2} {...stroke} />
      <Path d="M48 95 Q95 130 142 95" stroke={INK} strokeWidth={2} {...stroke} />
      {/* Iris + pupil — the focal emission. */}
      <Circle cx={95} cy={95} r={18} stroke={accent} strokeWidth={2.4} fill="none" />
      <Circle cx={95} cy={95} r={7.5} fill={accent} />
    </Svg>
  );
}

/** The Default Mode Network (you) — a thought circling back on itself: the
 *  replay loop, running the same tape again and again. */
function Replay({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={95} r={44} accent={accent} />
      <Ring />
      {/* Loop (ink) — near-full circle with a gap at the top. */}
      <Path d="M113 55 A44 44 0 1 1 74 52" stroke={INK} strokeWidth={2.4} {...stroke} />
      {/* Arrowhead (accent) — the loop feeding back on itself. */}
      <Path d="M113 55 L110 39 M113 55 L97 59" stroke={accent} strokeWidth={2.4} {...stroke} />
      {/* Fixation point at the centre. */}
      <Circle cx={95} cy={95} r={4} fill={accent} />
    </Svg>
  );
}

/** The Dopamine Loop (enemy) — a fast-forward skipping to the end: arousal
 *  trained to race, digital novelty always rushing to the finish. */
function Novelty({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={95} r={44} accent={accent} />
      <Ring />
      <Path d="M64 78 L86 95 L64 112 Z" fill={accent} />
      <Path d="M88 78 L110 95 L88 112 Z" fill={accent} />
      <Rect x="114" y="79" width="5.5" height="32" rx="2.5" fill={accent} />
    </Svg>
  );
}

/** The Crutch (you) — a single pill, split. It works on the plumbing and
 *  teaches dependency; the seam is the emission. */
function Crutch({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={95} r={48} accent={accent} />
      <Ring />
      <Rect
        x="52"
        y="79"
        width="86"
        height="32"
        rx="16"
        stroke={INK}
        strokeWidth={2}
        fill="none"
        transform="rotate(-32 95 95)"
      />
      {/* The dividing seam — accent. */}
      <Path d="M86 79 L104 111" stroke={accent} strokeWidth={2.4} {...stroke} transform="rotate(-32 95 95)" />
      <Circle cx={95} cy={95} r={3.6} fill={accent} />
    </Svg>
  );
}

export default function ClinicalHero({
  motif,
  accent = DEFAULT_ACCENT,
}: {
  motif: ClinicalMotif;
  accent?: string;
}) {
  switch (motif) {
    case 'adrenaline':
      return <Adrenaline accent={accent} />;
    case 'replay':
      return <Replay accent={accent} />;
    case 'spectator':
      return <Spectator accent={accent} />;
    case 'novelty':
      return <Novelty accent={accent} />;
    case 'bandaid':
      return <Crutch accent={accent} />;
    default:
      return (
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Glow cx={MID} cy={MID} accent={accent} />
          <Ring />
        </Svg>
      );
  }
}

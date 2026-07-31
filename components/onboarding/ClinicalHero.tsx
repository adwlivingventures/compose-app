// ClinicalHero — per-concept emissive line motifs for the four reveal cards
// (founder ruling 2026-07-14). Replaces the generic PNG renders: each card
// gets a bespoke motif that names its idea at a glance (QUITTR's icon-first
// legibility) while staying inside Deepwater — matte ink line-work on the
// deep ground with a single disciplined emission at the focal point (the
// hero's one allowed accent emission; the arrow CTA is the other). No playful
// mascots, no bright per-screen colours. Deepwater role: forward-looking
// motifs (chapters, hopeful arc) default to the aqua current; the diagnosis
// section passes its ember-rust accent in explicitly.

import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ClinicalMotif } from '../../content/onboarding/types';

const INK = '#5B6478'; // muted structural line-work (absorbs)
const STROKE = '#223140'; // the frame ring
// Deepwater role: the default emission is the aqua current (forward motion);
// diagnosis cards pass DIAGNOSTIC ember-rust instead.
const DEFAULT_ACCENT = '#5FD4C1';

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

/** Growth (the turn) — a sprout rising from a ground line, the new leaf lit:
 *  recovery as something that grows, not something you win. */
function Growth({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={62} r={46} accent={accent} />
      <Ring />
      {/* Ground line. */}
      <Path d="M58 132 L132 132" stroke={INK} strokeWidth={2} {...stroke} />
      {/* Stem — one continuous rise. */}
      <Path d="M95 132 C95 110 95 92 95 74" stroke={INK} strokeWidth={2.4} {...stroke} />
      {/* Lower leaf pair (ink — the past growth, absorbed). */}
      <Path d="M95 112 C84 110 74 102 72 90 C84 92 93 100 95 112" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M95 104 C106 102 116 94 118 82 C106 84 97 92 95 104" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {/* The new leaf at the tip — the one accent emission. */}
      <Path d="M95 74 C93 60 98 48 110 42 C112 56 106 68 95 74" fill="none" stroke={accent} strokeWidth={2.4} strokeLinejoin="round" />
      <Circle cx={95} cy={74} r={3.6} fill={accent} />
    </Svg>
  );
}

// ── Hopeful-arc motifs (founder ruling 2026-07-14: the arc went image-forward,
// QUITTR-style). Same line-work language, but the emission marks the GOAL —
// these five encourage; they never diagnose. Aqua current (Deepwater default).

/** Ascent — a path climbing to a lit summit: 75 days, sequenced upward. */
function Ascent({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={134} cy={64} r={46} accent={accent} />
      <Ring />
      <Path d="M50 130 L82 112 L108 90 L128 70" stroke={INK} strokeWidth={2.4} {...stroke} />
      <Circle cx={50} cy={130} r={3.5} fill={INK} />
      <Circle cx={82} cy={112} r={3.5} fill={INK} />
      <Circle cx={108} cy={90} r={3.5} fill={INK} />
      {/* The summit — lit. */}
      <Circle cx={134} cy={64} r={5.5} fill={accent} />
    </Svg>
  );
}

/** Measure — bars rising to a lit final reading: the score you watch move. */
function Measure({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={124} cy={72} r={46} accent={accent} />
      <Ring />
      <Path d="M56 134 L134 134" stroke={INK} strokeWidth={2} {...stroke} />
      <Path d="M66 134 L66 112" stroke={INK} strokeWidth={5} {...stroke} />
      <Path d="M95 134 L95 94" stroke={INK} strokeWidth={5} {...stroke} />
      <Path d="M124 134 L124 66" stroke={accent} strokeWidth={5} {...stroke} />
      <Circle cx={124} cy={62} r={4} fill={accent} />
    </Svg>
  );
}

/** Headphones — the daily anchor: band + cups, the audio itself lit. */
function Headphones({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={104} r={40} accent={accent} />
      <Ring />
      {/* Band. */}
      <Path d="M60 104 L60 92 C60 70 76 56 95 56 C114 56 130 70 130 92 L130 104" stroke={INK} strokeWidth={2.4} {...stroke} />
      {/* Cups. */}
      <Path d="M60 100 L66 100 C69 100 71 102 71 105 L71 121 C71 124 69 126 66 126 L60 126 Z" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M130 100 L124 100 C121 100 119 102 119 105 L119 121 C119 124 121 126 124 126 L130 126 Z" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {/* The audio between the cups — lit. */}
      <Path d="M87 106 L87 120" stroke={accent} strokeWidth={2.4} {...stroke} />
      <Path d="M95 100 L95 126" stroke={accent} strokeWidth={2.4} {...stroke} />
      <Path d="M103 106 L103 120" stroke={accent} strokeWidth={2.4} {...stroke} />
    </Svg>
  );
}

/** Shield — the SOS guarantee: steady ground in the hard moment. */
function Shield({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={94} r={42} accent={accent} />
      <Ring />
      <Path
        d="M95 52 L128 63 C128 96 116 121 95 136 C74 121 62 96 62 63 Z"
        fill="none"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* The steady core — lit. */}
      <Circle cx={95} cy={92} r={9} fill="none" stroke={accent} strokeWidth={2.4} />
      <Circle cx={95} cy={92} r={3.2} fill={accent} />
    </Svg>
  );
}

/** Lock — private by architecture: sealed body, the keyhole lit (yours). */
function Lock({ accent }: { accent: string }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Glow cx={95} cy={106} r={40} accent={accent} />
      <Ring />
      {/* Shackle. */}
      <Path d="M77 86 L77 74 C77 62 85 54 95 54 C105 54 113 62 113 74 L113 86" stroke={INK} strokeWidth={2.4} {...stroke} />
      {/* Body. */}
      <Rect x="66" y="86" width="58" height="46" rx="10" fill="none" stroke={INK} strokeWidth={2.4} />
      {/* Keyhole — lit. */}
      <Circle cx={95} cy={104} r={5} fill="none" stroke={accent} strokeWidth={2.4} />
      <Path d="M95 109 L95 120" stroke={accent} strokeWidth={2.4} {...stroke} />
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
    case 'growth':
      return <Growth accent={accent} />;
    case 'ascent':
      return <Ascent accent={accent} />;
    case 'measure':
      return <Measure accent={accent} />;
    case 'headphones':
      return <Headphones accent={accent} />;
    case 'shield':
      return <Shield accent={accent} />;
    case 'lock':
      return <Lock accent={accent} />;
    default:
      return (
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Glow cx={MID} cy={MID} accent={accent} />
          <Ring />
        </Svg>
      );
  }
}

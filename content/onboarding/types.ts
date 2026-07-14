// Onboarding flow — typed screen descriptors.
// Spec: design/design_handoff_twilight_v1/ (batched spec, formerly "Version B"),
// as amended by the Design Authority Ruling in BUILD_PROMPT.md (Ember Dusk v2).
// Single flow (founder ruling 2026-07-10): the interleaved variant and the
// onboarding A/B test are retired. buildFlow() resolves order and numbering.

export type SectionId =
  | 'opening'
  | 'part1' // Your Situation
  | 'part2' // The Body
  | 'part3' // The Mind
  | 'analysis'
  | 'turn' // Hope and Desire
  | 'close'; // Commitment and Close

/** Answer keys — the ONLY identifiers analytics may never see values for (§7 privacy). */
export type AnswerKey =
  | 'relationship'
  | 'reasons'
  | 'duration'
  | 'attribution'
  | 'name'
  | 'age'
  | 'bandaidHistory'
  | 'morningArousal'
  | 'libido'
  | 'adrenalineSpike'
  | 'breathEdge'
  | 'pelvicCheck'
  | 'contentFrequency'
  | 'escalation'
  | 'spectatoring'
  | 'partnerImpact'
  | 'aftermath'
  | 'avoidance'
  | 'scripts'
  | 'spillover'
  | 'symptoms'
  | 'goals'
  | 'goalFreeText';

export type Condition =
  | { key: AnswerKey; equals: string }
  | { key: AnswerKey; oneOf: string[] }
  | { key: AnswerKey; lte: number }
  /** For multi-select answers (string[]): true if the answer contains any of
   *  these values. Used to gate the band-aids card on prior pill/cream use. */
  | { key: AnswerKey; includesAny: string[] }
  | { all: Condition[] };

export interface Option {
  value: string;
  label: string;
}

interface ScreenBase {
  id: string;
  section: SectionId;
  /** Runtime skip/show logic (evaluated by the flow runner, not by buildFlow). */
  displayLogic?: { showIf?: Condition; skipIf?: Condition };
  /** Screens gated behind a config flag ship dark and are skipped while the flag is off. */
  gate?: 'testimonials';
}

export interface ChapterScreen extends ScreenBase {
  archetype: 'chapter';
  /** Warm-welcome treatment: stronger dusk radial + settled headline entrance
   *  (welcome-roadmap, turn-welcome). */
  welcome?: boolean;
  eyebrow?: string;
  headline: string;
  bodyBlocks?: string[];
  /** Filename in design/design_handoff_twilight_v1/assets/ — chapter moments only. */
  hero?: string;
  /** contain for square luminous renders that would crop badly under cover. */
  heroMode?: 'cover' | 'contain';
  /** Override the 300px default when the copy below needs the room. */
  heroHeight?: number;
  privacyLine?: string;
  microText?: string;
  statCards?: string[];
  /** Foundations advisor line — render ONLY when a signed advisor exists. Never a placeholder. */
  advisorLine?: string | null;
  closingLine?: string;
  button: string;
}

export interface HopefulArcScreen extends ScreenBase {
  archetype: 'hopeful-arc';
  subScreens: {
    eyebrow?: string;
    headline: string;
    body: string;
    visual?: 'phase-path';
    button: string;
  }[];
}

export interface SectionTransitionScreen extends ScreenBase {
  archetype: 'section-transition';
  label: string; // e.g. "PART 1 OF 3 · YOUR SITUATION"
  autoAdvanceMs: number;
}

export interface SingleSelectScreen extends ScreenBase {
  archetype: 'single-select';
  question: string;
  subText?: string;
  answerKey: AnswerKey;
  options: Option[];
}

export interface MultiSelectScreen extends ScreenBase {
  archetype: 'multi-select';
  question: string;
  subText?: string;
  /** Standalone instruction line, rendered below the subtext with a gap and
   *  more presence than the paragraph (e.g. Symptoms' "Tap anything you've
   *  noticed lately"). Keeps the reason-for-asking and the do-this separate. */
  tapPrompt?: string;
  answerKey: AnswerKey;
  options: Option[];
  /** Grouped checklist (Symptoms): group label → options. Order preserved. */
  groups?: { label: string; options: Option[] }[];
  freeText?: { answerKey: AnswerKey; prompt: string };
  button: string;
}

export interface TextInputScreen extends ScreenBase {
  archetype: 'text-input';
  question: string;
  subText?: string;
  answerKey: AnswerKey;
  placeholder: string;
  button: string;
}

export interface WheelInputScreen extends ScreenBase {
  archetype: 'wheel-input';
  question: string;
  answerKey: AnswerKey;
  min: number;
  max: number;
  button: string;
}

export interface SliderInputScreen extends ScreenBase {
  archetype: 'slider-input';
  question: string;
  answerKey: AnswerKey;
  min: number;
  max: number;
  anchorLow: string;
  anchorHigh: string;
  button: string;
}

export interface NoteCardScreen extends ScreenBase {
  archetype: 'note-card';
  eyebrow: string;
  title: string;
  body: string;
  button: string;
  /** The exact answers that triggered this card, shown as labelled rows so the
   *  "why am I seeing this" is legible in a glance. Deterministic: the card only
   *  renders for one fixed answer combination, so the values can be hardcoded. */
  triggers?: { label: string; value: string }[];
  /** Optional secondary link (e.g. "change an answer") — wired to go back. */
  secondaryLabel?: string;
}

export interface InteractiveCheckScreen extends ScreenBase {
  archetype: 'interactive-check';
  answerKey: AnswerKey;
  intro: {
    headline: string;
    subText: string;
    reassurance: string;
    steps: string[];
    button: string;
    skipLink: string;
  };
  phases: { seconds: number; ringLabel: string; instruction: string }[];
  resultQuestion: string;
  /** 1–10 release rating (founder review 2026-07-10) — anchors must make the
   *  scale self-explanatory. Stored as the number itself. */
  resultScale: {
    min: number;
    max: number;
    anchorLow: string;
    anchorHigh: string;
    button: string;
  };
}

export interface TestimonialSlotScreen extends ScreenBase {
  archetype: 'testimonial-slot';
  gate: 'testimonials';
  // No quote content lives in code, ever. Populated from gated config when real,
  // consented quotes exist. While empty/off the screen is skipped entirely.
}

export interface GeneratingScreen extends ScreenBase {
  archetype: 'generating';
  checklist: string[];
  durationMs: [number, number]; // min–max total
}

export interface MapScreen extends ScreenBase {
  archetype: 'map';
  eyebrow: string;
  headline: string; // {name} token
  scoreLabel: string;
  /** Axis end labels make the gauge self-explanatory (founder review 2026-07-10). */
  gauge: { calmZone: [number, number]; calmLabel: string; axisLow: string; axisHigh: string };
  barsHeading: string;
  bars: { label: string; showIf?: Condition }[];
  button: string;
  footer: string;
}

/** Bespoke SVG hero motifs for the four reveal cards (founder ruling
 *  2026-07-14: the generic PNG renders are replaced with per-concept emissive
 *  line motifs — code, not raster assets, so they sidestep the 5-render cap in
 *  heroes.ts and stay inside Ember Dusk instead of importing playful art). */
export type ClinicalMotif = 'adrenaline' | 'replay' | 'spectator' | 'novelty' | 'bandaid';

export interface ClinicalCardScreen extends ScreenBase {
  archetype: 'clinical-card';
  title: string;
  /** Body copy; `**word**` spans render as ink-weight emphasis. */
  body: string;
  /** Legacy PNG render (heroes.ts). Optional now that `motif` supersedes it. */
  render?: string;
  /** Bespoke SVG hero — takes precedence over `render` when present. */
  motif?: ClinicalMotif;
  /** The "scary data" callout: one large Newsreader figure + a plain caption.
   *  Every figure is a real, citable prevalence stat — audited in the claims
   *  gate before launch, never a fabricated number. */
  stat?: { figure: string; caption: string };
  renderMode?: 'contain' | 'cover';
  conditionalLines?: { text: string; showIf: Condition }[];
  /** Accessibility label for the arrow CTA (cards render an unlabeled arrow). */
  button: string;
}

export interface DivergingGraphScreen extends ScreenBase {
  archetype: 'diverging-graph';
  headline: string;
  yAxisLabel: string;
  startLabel: string;
  upperLabel: string;
  lowerLabel: string;
  lowerAnnotation: string;
  upperAnnotations: string[];
  caption: string;
  button: string;
}

export interface CommitScreen extends ScreenBase {
  archetype: 'commit';
  headline: string;
  body: string;
  question: string;
  button: string;
  doubtLink: string;
  doubt: { body: string; button: string };
}

export interface BeatScreen extends ScreenBase {
  archetype: 'beat';
  text: string;
  maxMs: number;
}

export interface PaywallScreen extends ScreenBase {
  archetype: 'paywall';
  goalEchoPrefix: string; // "Your goal:"
  profileRecap: { title: string; caption: string };
  headline: string;
  priceAnchor: { label: string; struck: true };
  /**
   * Membership terms (Model V2): annual pre-selected, monthly secondary.
   * {price} tokens resolve from the RevenueCat offering — never hardcoded;
   * the RC Experiment decides which annual product the offering serves.
   */
  offer: {
    annual: { eyebrow: string; unit: string; caption: string };
    monthly: { eyebrow: string; unit: string; caption: string };
  };
  termSelector: { annual: string; monthly: string };
  /** Plain auto-renew disclosure rendered near the CTA (App Review requirement). {price} token. */
  autoRenew: { annual: string; monthly: string };
  riskReversal: { title: string; body: string };
  lockedBlock: {
    heading: string;
    body: string;
    features: { title: string; description: string }[];
    footer: string;
  };
  positioningLine: string;
  trustCard: string;
  button: string;
  links: string[];
}

export interface PaywallDismissScreen extends ScreenBase {
  archetype: 'paywall-dismiss';
  headline: string;
  body: string;
  button: string;
  exitLink: string;
}

export interface SignatureScreen extends ScreenBase {
  archetype: 'signature';
  eyebrow: string;
  headline: string;
  oath: string;
  signaturePrompt: string;
  signatureCaption: string;
  chips: string[]; // {pricePerDay} token allowed
  /** {price} resolves from the RevenueCat offering. */
  button: string;
  /** Auto-renew disclosure under the purchase button — the purchase fires on
   *  this screen, so App Review's disclosure requirement lands here too. */
  autoRenew: { annual: string; monthly: string };
}

/**
 * Telemetry consent (Model V2 — the single §7 exception). Unnumbered, like
 * section transitions: it is a 2026-07 insertion into the flow, not part of
 * the design handoff's 42-screen numbering. Declinable; decline changes
 * nothing about the app.
 */
export interface ConsentScreen extends ScreenBase {
  archetype: 'consent';
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  acceptButton: string;
  declineLink: string;
}

export interface DiscretionScreen extends ScreenBase {
  archetype: 'discretion';
  eyebrow: string;
  headline: string;
  subText: string;
  toggles: { title: string; description: string }[];
  footer: string;
  button: string;
}

export type Screen =
  | ChapterScreen
  | HopefulArcScreen
  | SectionTransitionScreen
  | SingleSelectScreen
  | MultiSelectScreen
  | TextInputScreen
  | WheelInputScreen
  | SliderInputScreen
  | NoteCardScreen
  | InteractiveCheckScreen
  | TestimonialSlotScreen
  | GeneratingScreen
  | MapScreen
  | ClinicalCardScreen
  | DivergingGraphScreen
  | CommitScreen
  | BeatScreen
  | PaywallScreen
  | PaywallDismissScreen
  | SignatureScreen
  | ConsentScreen
  | DiscretionScreen;

/** A screen with its spec position assigned. */
export type ResolvedScreen = Screen & {
  /** "07" / "31" — 1-based position among numbered screens; transitions carry none. */
  specId: string | null;
  /** For the four dark cards: 1–4 in encounter order ("CLINICAL CONTEXT · N OF 4"). */
  clinicalIndex?: number;
};

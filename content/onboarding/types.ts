// Onboarding flow — typed screen descriptors.
// Spec: design/design_handoff_twilight_v1/ (Version A docx + Version B pdf),
// as amended by the Design Authority Ruling in BUILD_PROMPT.md (Ember Dusk v2).
// One config drives BOTH variants; buildFlow(variant) resolves the order.
// No variant conditionals belong in screen components.

export type Variant = 'A' | 'B';

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
  eyebrow?: string;
  headline: string;
  bodyBlocks?: string[];
  /** Filename in design/design_handoff_twilight_v1/assets/ — chapter moments only. */
  hero?: string;
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

/** Partner impact — question/options branch on relationship status. */
export interface BranchedSelectScreen extends ScreenBase {
  archetype: 'branched-select';
  answerKey: AnswerKey;
  branchOn: { key: AnswerKey; oneOf: string[] }; // matches → variant P, else S
  variants: Record<
    'P' | 'S',
    { question: string; subText?: string; options: Option[] }
  >;
}

export interface MultiSelectScreen extends ScreenBase {
  archetype: 'multi-select';
  question: string;
  subText?: string;
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
  resultOptions: Option[];
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
  gauge: { calmZone: [number, number]; calmLabel: string; caption: string };
  bars: { label: string; showIf?: Condition }[];
  body: string;
  button: string;
  footer: string;
}

export interface ClinicalCardScreen extends ScreenBase {
  archetype: 'clinical-card';
  title: string;
  body: string;
  /** Render asset per design-rules.md "Clinical card visual" — never a line-icon. */
  render: string;
  renderMode?: 'contain' | 'cover';
  conditionalLines?: { text: string; showIf: Condition }[];
  /** THE variant mechanism (BUILD_PROMPT §4.1). */
  placement: { A: { inlineAfter: string }; B: 'batched' };
  tease: { A: string; B: null };
  button: { A: string; B: string };
}

export interface DivergingGraphScreen extends ScreenBase {
  archetype: 'diverging-graph';
  headline: string;
  yAxisLabel: string;
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
  /** {price} resolves from the RevenueCat offering — never hardcoded. */
  offer: { label: string };
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
  subLine: string;
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
  | BranchedSelectScreen
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
  | DiscretionScreen;

/** A screen with its variant-specific strings resolved and its spec position assigned. */
export type ResolvedScreen = Screen & {
  /** "A-07" / "B-31" — 1-based position among numbered screens; transitions carry none. */
  specId: string | null;
  /** For the four dark cards: 1–4 in this variant's encounter order ("CLINICAL CONTEXT · N OF 4"). */
  clinicalIndex?: number;
  /** Variant-resolved card strings (clinical cards only). */
  resolvedTease?: string | null;
  resolvedButton?: string;
};

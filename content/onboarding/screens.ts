// Onboarding screen config — copy VERBATIM from the spec (punctuation and
// em-dashes included). Source:
//   spec/COMPOSE_Onboarding_-_Version_B__Batched__No_Hope_.pdf
// (Founder ruling 2026-07-10: the interleaved "Version A" flow and the
// onboarding A/B test are retired; the batched spec is the flow.)
//
// {price} and {pricePerDay} tokens resolve from the RevenueCat offering at
// render time. No purchasable price is ever hardcoded here ("$1,800+" is the
// therapy comparator, not our price).

import type { ConsentScreen, Screen } from './types';
import { TESTIMONIALS } from '../testimonials';

/**
 * The full flow, in final (batched) order: the four clinical cards follow the
 * Map — diagnosis reveal, then its four drivers, one tension arc resolving at
 * turn-welcome. buildFlow() assigns numbering only; it never reorders.
 *
 * Imagery reconciliation (BUILD_PROMPT §6 hard rule wins over design-rules.md
 * archetype table): renders appear ONLY on welcome-opening, the four clinical
 * cards, blueprint, and day-zero (per reference screen). Hopeful arc and
 * Foundations stay typographic.
 */
export const SCREENS: Screen[] = [
  // ── Opening ────────────────────────────────────────────────────────────
  {
    id: 'welcome-opening',
    section: 'opening',
    archetype: 'chapter',
    eyebrow: 'COMPOSE',
    // Founder review 2026-07-10: hard break — first sentence one full line,
    // second sentence directly below it.
    headline: 'Your body isn’t failing you.\nIt’s following orders.',
    // Founder review 2026-07-10: two short, balanced lines instead of one long
    // paragraph — centered text only reads centered when the lines are even.
    bodyBlocks: [
      'In the next few minutes, we’ll map exactly where those orders come from.',
      'Every answer stays on this phone.',
    ],
    hero: 'fig-hero-somatic.png',
    heroMode: 'contain',
    privacyLine: 'Private by design. No account, no sync, no lock-screen tells',
    microText: 'Takes about 5 minutes',
    button: 'Find my baseline',
  },
  {
    id: 'welcome-roadmap',
    section: 'opening',
    archetype: 'chapter',
    eyebrow: 'COMPOSE',
    welcome: true,
    headline: 'Welcome to Compose.',
    // Founder review 2026-07-10: the "credit for" affirmation read as cheesy.
    // Replaced with a direct legitimacy line — what this is and what it's
    // built on — so the first impression is "structured and clinical," not
    // "motivational." Names CBST specifically (it survives the skeptic's
    // google search). "subconscious identity retraining" stays LOWERCASE by
    // ruling: as a description it's a defensible mechanism claim (habituated
    // patterns run below conscious willpower); Title-Cased it would read as
    // an invented framework — a fake credential next to a real one poisons
    // both, and pseudo-clinical branding is an App Store review liability.
    bodyBlocks: [
      // "daily" (not "retraining") in the first clause: avoids the double
      // word, seeds the daily-practice expectation from the first sentence,
      // and counters the passive misread of "subconscious."
      'Compose is a structured daily program built on Cognitive Behavioral Sex Therapy (CBST) and subconscious identity retraining.',
      'Before we suggest anything, we listen: first to the body, then to the mind. Then we build your protocol around what we find.',
    ],
    button: 'Let’s begin',
  },

  // ── Part 1 of 3 — Your Situation ───────────────────────────────────────
  {
    id: 'transition-part1',
    section: 'part1',
    archetype: 'section-transition',
    label: 'PART 1 OF 3 · YOUR SITUATION',
    // Founder review 2026-07-10: long enough to actually read; a tap anywhere
    // advances early (no button — a decision point would break the breath).
    autoAdvanceMs: 2200,
  },
  {
    id: 'relationship',
    section: 'part1',
    archetype: 'single-select',
    question: 'What is your current relationship status?',
    answerKey: 'relationship',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'casual', label: 'Casual dating' },
      { value: 'committed', label: 'Committed relationship' },
      { value: 'married', label: 'Married' },
      { value: 'recently-out', label: 'Recently out of a relationship' },
    ],
  },
  {
    id: 'reasons',
    section: 'part1',
    archetype: 'multi-select',
    question: 'What brings you here? Tap everything that applies.',
    answerKey: 'reasons',
    options: [
      { value: 'finish-quickly', label: 'I finish too quickly' },
      { value: 'maintain', label: 'I struggle to maintain my erection' },
      { value: 'in-my-head', label: 'I get trapped in my own head (performance anxiety)' },
      { value: 'avoiding', label: 'I’ve started avoiding intimacy altogether' },
      { value: 'deepen', label: 'I want to deepen the intimacy in my relationship' },
    ],
    button: 'Continue',
  },
  {
    id: 'duration',
    section: 'part1',
    archetype: 'single-select',
    question: 'How long has this been affecting your intimate life?',
    subText:
      'Whatever the answer, the mechanism is the same: a conditioned response. Conditioning can be retrained.',
    answerKey: 'duration',
    options: [
      { value: 'under-6m', label: 'Less than 6 months' },
      { value: '6m-2y', label: '6 months to 2 years' },
      { value: '2-5y', label: '2 to 5 years' },
      { value: 'over-5y', label: 'More than 5 years' },
      { value: 'always', label: 'As long as I’ve been sexually active' },
    ],
  },
  {
    id: 'attribution',
    section: 'part1',
    archetype: 'single-select',
    question: 'How did you hear about us?',
    subText: 'Helps us reach men like you.',
    answerKey: 'attribution',
    options: [
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'x', label: 'X' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'reddit', label: 'Reddit' },
      { value: 'podcast', label: 'Podcast' },
      { value: 'google', label: 'Google' },
      { value: 'app-store', label: 'App Store search' },
      { value: 'clinician', label: 'My doctor or therapist' },
      { value: 'friend', label: 'A friend' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'name',
    section: 'part1',
    archetype: 'text-input',
    question: 'What is your name?',
    subText: 'First name only. Like every answer here, it never leaves this device.',
    answerKey: 'name',
    placeholder: 'Your first name',
    button: 'Continue',
  },
  {
    id: 'age',
    section: 'part1',
    archetype: 'wheel-input',
    question: 'How old are you?',
    answerKey: 'age',
    min: 18,
    max: 70,
    button: 'Continue',
  },

  // ── Part 2 of 3 — The Body ─────────────────────────────────────────────
  {
    id: 'transition-part2',
    section: 'part2',
    archetype: 'section-transition',
    label: 'PART 2 OF 3 · THE BODY',
    autoAdvanceMs: 2200,
  },
  {
    id: 'bandaid-history',
    section: 'part2',
    archetype: 'multi-select',
    question:
      'Have you tried pills, sprays, creams, or supplements to fix this?',
    subText:
      'Most men start here. Pills work on blood flow. Creams dull sensation. Neither reaches the signal underneath.',
    answerKey: 'bandaidHistory',
    options: [
      { value: 'pills', label: 'Pills (Viagra/Cialis)' },
      { value: 'sprays-creams', label: 'Sprays or numbing creams' },
      { value: 'supplements', label: 'Supplements or testosterone boosters' },
      { value: 'none', label: 'None of these' },
    ],
    button: 'Continue',
  },
  {
    id: 'morning-arousal',
    section: 'part2',
    archetype: 'single-select',
    question: 'Do you wake up with morning erections?',
    subText:
      'Clinicians screen this first. It separates the wiring from the signal.',
    answerKey: 'morningArousal',
    options: [
      { value: 'most', label: 'Most mornings' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'rarely', label: 'Rarely or never' },
      { value: 'unsure', label: 'Not sure, I’ve never paid attention' },
    ],
  },
  {
    id: 'libido',
    section: 'part2',
    archetype: 'slider-input',
    question: 'Rate your libido over the past month.',
    answerKey: 'libido',
    min: 1,
    max: 10,
    anchorLow: '1 = I rarely think about sex',
    anchorHigh: '10 = Strong desire most days',
    button: 'Continue',
  },
  {
    id: 'physician-note',
    section: 'part2',
    archetype: 'note-card',
    // Founder ruling 2026-07-14: threshold tightened to the extreme corner only
    // — "Rarely or never" morning arousal AND libido at the floor (1/10). The
    // card leads with the two triggering answers (shown as rows) so the "why am
    // I seeing this" reads in a glance; the secondary link lets a man who was
    // being dramatic revise his answer instead of taking the flag.
    displayLogic: {
      showIf: {
        all: [
          { key: 'morningArousal', equals: 'rarely' },
          { key: 'libido', lte: 1 },
        ],
      },
    },
    eyebrow: 'WHY YOU’RE SEEING THIS',
    title: 'Worth checking with a doctor.',
    triggers: [
      { label: 'Morning erections', value: 'Rarely or never' },
      { label: 'Libido', value: '1 / 10' },
    ],
    body:
      'Together, these two can point to a physical cause, not just a mental one. Worth ruling out first.',
    button: 'Understood',
    secondaryLabel: 'Let me change an answer',
  },
  {
    id: 'adrenaline-spike',
    section: 'part2',
    archetype: 'single-select',
    question: 'When intimacy starts, do you feel a rush of adrenaline?',
    answerKey: 'adrenalineSpike',
    options: [
      { value: 'panic', label: 'Yes, it feels close to panic' },
      { value: 'push-through', label: 'Yes, a strong surge I push through' },
      { value: 'occasionally', label: 'Sometimes, depending on the night' },
      { value: 'calm', label: 'No, I stay calm' },
    ],
  },
  {
    id: 'breath-edge',
    section: 'part2',
    archetype: 'single-select',
    question: 'At the peak of arousal, what happens to your breathing?',
    subText:
      'Breath under arousal is the clearest window into your nervous system.',
    answerKey: 'breathEdge',
    options: [
      { value: 'shallow-hold', label: 'It gets shallow, or I hold my breath' },
      { value: 'speeds-up', label: 'It speeds up, short and fast' },
      { value: 'slow-deep', label: 'It stays slow and deep' },
      { value: 'never-noticed', label: 'I’ve never noticed' },
    ],
  },
  {
    id: 'pelvic-check',
    section: 'part2',
    archetype: 'interactive-check',
    answerKey: 'pelvicCheck',
    intro: {
      headline: 'A 20-second tension check.',
      // Founder review 2026-07-10: say WHAT we test and WHY it matters, plainly.
      subText:
        'Men who carry performance anxiety often hold the pelvic floor chronically tight without knowing it.',
      reassurance:
        'Completely invisible. No movement, no sound, nothing anyone could notice. You can do this in a waiting room.',
      steps: [
        'Sit comfortably, feet flat on the floor.',
        'On Begin, clench your pelvic floor, as if stopping urine flow.',
        'Hold five seconds, then release fully. Notice what the release feels like.',
      ],
      button: 'Begin the 20-second check',
      skipLink: 'Skip for now',
    },
    phases: [
      {
        seconds: 5,
        ringLabel: 'CLENCH',
        instruction: 'Squeeze your pelvic floor firmly upward and inward. Hold.',
      },
      {
        seconds: 10,
        ringLabel: 'RELEASE',
        instruction: 'Let go completely. Notice how fully the muscles relax.',
      },
    ],
    resultQuestion: 'When you released, how fully did the tension let go?',
    resultScale: {
      min: 1,
      max: 10,
      anchorLow: '1 = It wouldn’t release, stayed tight',
      anchorHigh: '10 = Let go completely',
      button: 'Continue',
    },
  },
  {
    id: 'testimonial-somatic',
    section: 'part2',
    archetype: 'testimonial-slot',
    gate: 'testimonials',
  },

  // ── Part 3 of 3 — The Mind ─────────────────────────────────────────────
  {
    id: 'transition-part3',
    section: 'part3',
    archetype: 'section-transition',
    label: 'PART 3 OF 3 · THE MIND',
    autoAdvanceMs: 2200,
  },
  {
    id: 'content-frequency',
    section: 'part3',
    archetype: 'single-select',
    question: 'In an average week, how often do you watch porn?',
    subText:
      'Our dopamine reward system calibrates to its most frequent inputs.',
    answerKey: 'contentFrequency',
    options: [
      { value: 'rarely', label: 'Rarely or never' },
      { value: '1-2', label: '1–2 times' },
      { value: '3-5', label: '3–5 times' },
      { value: 'daily', label: 'Daily or more' },
    ],
  },
  {
    id: 'escalation',
    section: 'part3',
    archetype: 'single-select',
    displayLogic: { skipIf: { key: 'contentFrequency', equals: 'rarely' } },
    question:
      'Over time, has it taken more extreme or more novel content to feel the same arousal?',
    answerKey: 'escalation',
    options: [
      { value: 'yes', label: 'Yes, noticeably' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'no', label: 'No' },
      { value: 'no-say', label: 'I’d rather not say' },
    ],
  },
  {
    id: 'spectatoring',
    section: 'part3',
    archetype: 'single-select',
    question:
      'During intimacy, do you watch and grade yourself instead of being present?',
    subText: 'Clinicians call this "spectatoring." It has a name because it’s common.',
    answerKey: 'spectatoring',
    options: [
      { value: 'almost-every-time', label: 'Yes, almost every time' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' },
    ],
  },
  {
    id: 'partner-impact',
    section: 'part3',
    archetype: 'multi-select',
    // Founder ruling 2026-07-10: ONE question for everyone — the partnered
    // phrasing is the more powerful one, and "your partner" reads fine for a
    // single man (the partner of that night). The old single/casual branch
    // is retired.
    // 2026-07-13: multi-select — these facets co-occur (relational strain,
    // reduced frequency, and his own withdrawal can all be true at once).
    // Added the lone inward option ("I get distant") among the outward ones;
    // it names his reaction's effect on closeness without stepping on the
    // aftermath screen (which owns his private feelings: shame/anger/etc.).
    question:
      'When things don’t go as planned in the bedroom, how does it affect the connection with your partner?',
    subText: 'Select all that apply.',
    answerKey: 'partnerImpact',
    options: [
      { value: 'partner-blames-self', label: 'My partner blames themselves' },
      { value: 'unspoken-tension', label: 'There’s tension we don’t talk about' },
      { value: 'i-get-distant', label: 'I get distant' },
      { value: 'less-intimacy', label: 'We’ve stopped being intimate as often' },
      { value: 'working-together', label: 'We’re working through it together' },
    ],
    button: 'Continue',
  },
  {
    // Reframed 2026-07-15 (founder): measures post-setback RESILIENCE, not the
    // size of the damage. Same instrument at Day 0 and every re-measurement, so
    // an improving man isn't re-asked to rank his shame. Value keys map to the
    // aftermath deduction table (composure.ts); 'recover-fast' is the resolved
    // best that helps unlock the calm zone.
    id: 'aftermath',
    section: 'part3',
    archetype: 'single-select',
    question: 'When a night doesn’t go the way you wanted, how quickly do you find your footing again?',
    answerKey: 'aftermath',
    options: [
      { value: 'recover-fast', label: 'Fast — it barely lands anymore' },
      { value: 'recover-day', label: 'Within a day, then I’m steady' },
      { value: 'lingers', label: 'It lingers for a few days' },
      { value: 'spirals', label: 'It spirals — shame, or dread of the next time' },
    ],
  },
  {
    // Reframed 2026-07-15 (founder): asks about initiation freedom instead of
    // presupposing avoidance. Value keys are unchanged (avoidance level:
    // rarely=best … stopped=worst) so the bar grades and Day-0/re-measurement
    // comparability don't move; only the framing the user reads is positive.
    id: 'avoidance',
    section: 'part3',
    archetype: 'single-select',
    question: 'When you want intimacy, how freely do you initiate it?',
    answerKey: 'avoidance',
    options: [
      { value: 'rarely', label: 'Freely — I don’t hold back' },
      { value: 'sometimes', label: 'Usually, with a little hesitation' },
      { value: 'frequently', label: 'I often hold back' },
      { value: 'stopped', label: 'I’ve mostly stopped initiating' },
    ],
  },
  {
    id: 'scripts',
    section: 'part3',
    archetype: 'multi-select',
    question:
      'When a session doesn’t go as planned, which of these run through your mind?',
    subText:
      'Select all that apply. These are scripts, not facts. Your subconscious replays them after a setback.',
    answerKey: 'scripts',
    options: [
      { value: 'broken', label: '"I am broken"' },
      { value: 'disappointed', label: '"She is disappointed in me"' },
      { value: 'she-leaves', label: '"She’ll leave me for someone else"' },
      { value: 'never-fix', label: '"I will never fix this"' },
      { value: 'less-of-a-man', label: '"I’m less of a man"' },
    ],
    button: 'Continue',
  },
  {
    id: 'spillover',
    section: 'part3',
    archetype: 'single-select',
    question: 'Does this follow you out of the bedroom?',
    subText: 'Into your work, your confidence, how you carry yourself?',
    answerKey: 'spillover',
    options: [
      { value: 'everything', label: 'Yes, it touches everything' },
      { value: 'confidence', label: 'It shows in my confidence and mood' },
      { value: 'sometimes', label: 'Sometimes, in waves' },
      { value: 'bedroom-only', label: 'No, it stays in the bedroom' },
    ],
  },

  // ── Analysis ───────────────────────────────────────────────────────────
  {
    id: 'generating',
    section: 'analysis',
    archetype: 'generating',
    checklist: [
      'Autonomic profile',
      'Pelvic baseline',
      'Arousal conditioning map',
      'Cognitive script index',
      'Sequencing your 75-day protocol…',
    ],
    durationMs: [4000, 6000],
  },
  // Founder review 2026-07-10: the Map's job is a clear, unflinching read of
  // his problem — not a preview of the protocol. Verdict + graded bars
  // (label + grade only since 2026-07-14); the CTA widens into the whole-
  // life cost inventory, then the four cards explain the mechanism.
  {
    id: 'map',
    section: 'analysis',
    archetype: 'map',
    eyebrow: 'YOUR RESULTS',
    headline: '{name}, here is what your answers show.',
    scoreLabel:
      'Your Composure Score: how steady your body stays under intimate pressure.',
    gauge: {
      // "Composed zone" (founder ruling 2026-07-13) ties the target band to
      // the product name and the Composure Score. Only the destination band is
      // named — the lower ranges stay unlabeled on purpose (a named low zone
      // would stamp a shame label the moment he opens up). Field keys stay
      // `calm*` internally; the user only ever sees the strings below.
      calmZone: [80, 100],
      calmLabel: 'COMPOSED ZONE · 80–100',
      axisLow: '0 · adrenaline runs it',
      axisHigh: '100 · calm & present',
    },
    barsHeading: 'Your biggest drivers',
    bars: [
      { label: 'Sympathetic override' },
      { label: 'Spectatoring loop' },
      { label: 'Pelvic release capacity' },
      { label: 'Avoidance pattern' },
      { label: 'Cognitive scripts' },
      {
        label: 'Conditioning drift',
        showIf: { key: 'escalation', oneOf: ['yes', 'somewhat'] },
      },
    ],
    button: 'Where else is this showing up?',
    footer: 'Stored on this device only',
  },

  // Founder ruling 2026-07-14: Symptoms moved AFTER the Map (supersedes the
  // 2026-07-10 before-Generating placement). The whole-life cost inventory is
  // now the Map's widening step — the reveal names the pattern, then "Where
  // else is this showing up?" lets him tag its reach before the four cards
  // explain the mechanism. (Symptoms never fed the Composure weights, so the
  // analysis loses no input.)
  {
    id: 'symptoms',
    section: 'analysis',
    archetype: 'multi-select',
    question: 'The cost isn’t only in the bedroom.',
    subText:
      'These are not separate problems. They are one stress response showing up in different places. We map each to see the full picture.',
    tapPrompt: 'Tap anything you’ve noticed lately.',
    answerKey: 'symptoms',
    options: [],
    groups: [
      {
        label: 'MIND',
        options: [
          { value: 'concentrate', label: 'Hard to concentrate' },
          { value: 'irritable', label: 'Irritability or a short fuse' },
          { value: 'anxiety-hum', label: 'A background hum of anxiety' },
          { value: 'low-drive', label: 'Low drive to pursue goals' },
        ],
      },
      {
        label: 'BODY',
        options: [
          { value: 'low-sex-drive', label: 'Low sex drive' },
          { value: 'tired', label: 'Tired for no clear reason' },
          { value: 'restless-sleep', label: 'Restless sleep' },
        ],
      },
      {
        label: 'CONNECTION',
        options: [
          { value: 'avoiding-partner', label: 'Avoiding intimacy with my partner' },
          { value: 'avoiding-dating', label: 'Avoiding dating or new partners' },
          { value: 'pulling-away', label: 'Pulling away from people and going out less' },
        ],
      },
      {
        label: 'SELF-IMAGE',
        options: [
          { value: 'low-confidence', label: 'Low confidence' },
          { value: 'unattractive', label: 'Feeling unattractive or unworthy' },
          { value: 'less-of-myself', label: 'Feeling like less of myself' },
        ],
      },
    ],
    button: 'Rewire my brain',
  },

  // ── The reveal cards (batched after the Map) ──────────────────────────
  // Revamp 2026-07-14 (QUITTR-inspired punch; Ember Dusk spine). Structure
  // (founder ruling, second pass): every man sees exactly FOUR cards —
  //   1. The Adrenaline Trap   (always · enemy)
  //   2. The Dopamine Loop     (always · enemy)
  //   3. The Default Mode Network (always · you · the shame tape)
  //   4. The Crutch OR The Spectator (conditional · you)
  // The 4th card is The Crutch if he's reached for a pill/cream/supplement;
  // otherwise The Spectator. The two are complementary (showIf vs skipIf on
  // bandaidHistory), so exactly one renders — always four cards total. index/
  // total ("N OF 4") are computed at runtime from HIS visible cards.
  //
  // Rulings folded in:
  //  • ≤35 words body per card (target ~25). Stat figure + motif carry weight.
  //  • The DMN card carries the intense fears (less-of-a-man, she'll-leave) —
  //    but as the QUOTED script the rumination loop REPLAYS (the oldScript
  //    externalization, Canon §7 rule 4), then framed as a FEAR being trained,
  //    never asserted by us. That is cognitive defusion, not character attack:
  //    it names his 2am fear (the "this app gets me" jolt) the clinically sound
  //    way, and stays out of the shame→sympathetic→symptom spiral.
  //  • Novelty card is now ALWAYS shown and broadened to digital novelty (porn
  //    AND social scrolling) — founder's call: ~95% of men here struggle with
  //    digital lust in some form, and the "rarely or never" option still leaves
  //    the porn framing defensible.
  //  • The whole section runs the hotter ember-rust DIAGNOSTIC accent.
  //  • Per-card reassurance is trimmed; the entire reversibility turn now rests
  //    on turn-welcome ("learned means reversible") — keep that screen strong.
  // CLAIMS GATE (see .claude/ember-progress.md) — verify before launch, no
  // fabricated numbers. Only ONE stat remains after the 2026-07-14 copy trim:
  //  • "50% quit ED pills within a year" (The Crutch) — PDE5i discontinuation
  //    literature. (The 1-in-4 and Age-12 figures were removed.)
  {
    id: 'card-adrenaline-trap',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Adrenaline Trap',
    body:
      'The moment intimacy begins, your brain trips a **threat alarm**. Adrenaline floods in, **cutting blood flow** and **firing the reflex early**.',
    motif: 'adrenaline',
    button: 'I understand',
  },
  {
    id: 'card-novelty-loop',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Dopamine Loop',
    body:
      'Porn and endless scrolling train your brain on **infinite novelty**. Then one real partner has to compete with thousands, and your body **goes quiet**.',
    motif: 'novelty',
    button: 'Makes sense',
  },
  {
    id: 'card-dmn',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Default Mode Network',
    body:
      'After a bad night, your mind runs the same tape: “I’m less of a man. She’ll get bored and leave.” This loop is called the **Default Mode Network**… and every replay wires the fear **deeper**.',
    motif: 'replay',
    button: 'Continue',
  },
  {
    id: 'card-bandaids',
    section: 'analysis',
    archetype: 'clinical-card',
    // 4th card (option A): shown to a man who's reached for a pharmacological/
    // topical fix. Supplements count — the card is about the crutch pattern,
    // not the molecule. Complementary to card-spectatoring below.
    displayLogic: {
      showIf: { key: 'bandaidHistory', includesAny: ['pills', 'sprays-creams', 'supplements'] },
    },
    title: 'The Crutch',
    stat: {
      figure: '50%',
      caption: 'of men quit ED pills within a year, even when they work.',
    },
    body:
      'Are we really going to pretend supplements are the answer? Every pill and cream teaches you the same **lie**: that you can’t do this without them. And it quietly eats away at your **self-esteem**.',
    motif: 'bandaid',
    button: 'I understand',
  },
  {
    id: 'card-spectatoring',
    section: 'analysis',
    archetype: 'clinical-card',
    // 4th card (option B): shown only to a man who's NEVER reached for a pill/
    // cream/supplement — the complement of card-bandaids' showIf.
    displayLogic: {
      skipIf: { key: 'bandaidHistory', includesAny: ['pills', 'sprays-creams', 'supplements'] },
    },
    title: 'The Spectator',
    body:
      'You’ve turned intimacy into an **exam** you’re terrified to fail. Watching yourself, grading every second. Your partner is right there, and you’re too **in your head** to feel it.',
    motif: 'spectator',
    button: 'Continue',
  },

  // ── The Turn — Hope and Desire ─────────────────────────────────────────
  // Revamped 2026-07-14 (founder batch; QUITTR-inspired). New arc:
  //   turn-welcome ("Recovery is possible" — the METHODS heal, no Compose yet)
  //   → compose-welcome (the brand moment; clinical lineage as the authority —
  //     the Ghost Data ban forbids invented user counts/press logos, so fifty
  //     years of clinical method IS our "2,000,000 users" slide)
  //   → hopeful-arc (five 1–2 sentence benefit beats; Blueprint + three-phases
  //     merged into beat 1).
  // Retired this pass: the standalone `blueprint` chapter (folded into arc
  // beat 1) and the `foundations` chapter (folded into compose-welcome; its
  // two stat cards are gone — fewer unsourced claims). Telemetry consent moved
  // OUT of the flow entirely — it's now the post-purchase /consent route
  // (founder ruling: ask after payment).
  {
    id: 'turn-welcome',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'THE TURN',
    headline: 'Recovery is possible.',
    motif: 'growth',
    bodyBlocks: [
      'Everything you just saw is **learned**. And learned can be unlearned. Cognitive retraining, **pelvic floor down-training**, and subconscious **identity work** reverse it at the root.',
    ],
    button: 'Show me how',
  },
  {
    id: 'compose-welcome',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'COMPOSE',
    welcome: true,
    headline: 'Welcome to Compose.',
    bodyBlocks: [
      'One program built on **fifty years of clinical method**: Sensate Focus, Cognitive Behavioral Sex Therapy, and polyvagal breathwork, sequenced into fifteen minutes a day.',
    ],
    button: 'Show me',
  },
  {
    id: 'hopeful-arc',
    section: 'turn',
    archetype: 'hopeful-arc',
    // Five encouraging quick-tap slides (founder ruling 2026-07-14, QUITTR
    // register): wordmark up top, bespoke motif, short imperative headline,
    // 1–2 sentences naming the solution — hope and momentum before the close.
    subScreens: [
      {
        eyebrow: 'COMPOSE',
        headline: 'Retrain the response.',
        motif: 'ascent',
        body:
          'New automatic responses take about **66 days** to set. You get 75, sequenced daily. Calm becomes the **default**, not the exception.',
        button: 'Continue',
      },
      {
        eyebrow: 'COMPOSE',
        headline: 'Watch yourself change.',
        motif: 'measure',
        body:
          'Your Composure Score is re-measured at Days **14, 40, and 75**. Evidence you can see, not reassurance you have to believe.',
        button: 'Continue',
      },
      {
        eyebrow: 'COMPOSE',
        headline: 'Fifteen minutes a day.',
        motif: 'headphones',
        body:
          'Headphones on, eyes closed. That’s the entire ask. The work happens in your **body**, not on a screen.',
        button: 'Continue',
      },
      {
        eyebrow: 'COMPOSE',
        headline: 'Steady when it matters.',
        motif: 'shield',
        body:
          'One tap starts **sixty seconds** of guided breathing that settles panic in real time. Yours from Day 1.',
        button: 'Continue',
      },
      {
        eyebrow: 'COMPOSE',
        headline: 'Invisible by design.',
        motif: 'lock',
        body:
          'No account. Nothing you enter ever leaves this phone. Your card statement reads **Apple**, never this app’s name.',
        button: 'Continue',
      },
    ],
  },
  // Expert consensus + tester stories (founder batch 2026-07-15). Two-beat
  // authority arc after the hopeful slides: the clinicians name the
  // mechanism, then the testers confirm it lived. Quotes are VERBATIM from
  // public sources (claims gate: verify each citation before launch; never
  // state or imply endorsement of Compose). Stories are real, consented
  // in-person tester feedback per founder — provenance documentation
  // required in the claims pass (honest-data doctrine).
  {
    id: 'expert-consensus',
    section: 'turn',
    archetype: 'expert-quotes',
    eyebrow: 'THE CONSENSUS',
    headline: 'The professionals agree: this is more than a physical fix.',
    subhead: 'Seven leading clinicians. One conclusion.',
    quotes: [
      {
        text: 'Contrary to popular belief, enhanced sexual performance begins with the brain. You need to stop filling your head with anxious thoughts - you need to reprogram your mind to focus solely on the sexual enjoyment of you and your partner.',
        name: 'Dr. Janet Hall',
        credential: 'Clinical Psychologist & Sex Therapist',
      },
      {
        text: 'Our minds are inextricably connected to our bodies and our sexual functioning. Being present rather than preoccupied is the best way to truly experience pleasure.',
        name: 'Dr. Lori Brotto',
        credential: 'Professor of Gynecology & Registered Psychologist',
      },
      {
        text: 'If our nervous system detects safety, then it’s no longer defensive. When it’s no longer defensive, then the circuits of the autonomic nervous system support health, growth, and restoration.',
        name: 'Dr. Stephen Porges',
        credential: 'Distinguished University Scientist & Neurobiologist',
      },
      {
        text: 'The higher levels of internal shame and conflict you have over your sexual desires, the more likely you are to report struggles with controlling your sexual behavior.',
        name: 'Dr. David Ley',
        credential: 'Clinical Psychologist & Sexologist',
      },
      {
        text: 'Sex that is pleasurable and satisfying without the expectation or demand that it’s going to be perfect every time — because sex is rarely perfect.',
        name: 'Dr. Justin Lehmiller',
        credential: 'Social Psychologist & Research Fellow',
      },
      {
        text: 'They are caught up in the thoughts in their mind, and their experiences become disembodied as a result.',
        name: 'Michael Aaron, PhD',
        credential: 'Clinical Sexologist & Certified Sex Therapist',
      },
      {
        text: 'The problem isn’t the desire itself, it’s the context. You need more sexually relevant stimuli activating the accelerator and fewer things hitting the brake.',
        name: 'Emily Nagoski, PhD',
        credential: 'Author & Sex Educator',
      },
    ],
    button: 'Who has it worked for?',
  },
  {
    id: 'field-reports',
    section: 'turn',
    archetype: 'testimonials',
    eyebrow: 'EARLY MEMBERS',
    headline: 'The experts describe it. These men lived it.',
    subhead: 'From the men who tested Compose, and the partners who watched it happen.',
    stories: TESTIMONIALS,
    button: 'Continue',
  },

  // Founder batch 2026-07-14: graph rebuilt — labels kept SHORT so nothing
  // crosses the curves (the old long annotations collided with the paths);
  // filled upper curve + lit endpoint for impact.
  {
    id: 'diverging-graph',
    section: 'turn',
    archetype: 'diverging-graph',
    headline: 'From tonight, this moves in one of two directions.',
    yAxisLabel: 'Composure',
    startLabel: 'You · tonight',
    upperLabel: 'Daily retraining',
    lowerLabel: 'Avoidance',
    lowerAnnotation: 'Every avoided attempt teaches the alarm it was right.',
    upperAnnotations: ['Day 25 · alarm quiets', 'Day 50 · body leads', 'Day 75 · new default'],
    caption: 'Illustrative: conditioning deepens with repetition, in either direction.',
    button: 'I want the upper path',
  },
  // Founder batch 2026-07-14: the goals slide went deeper — reasons, not
  // feature-outcomes. The question names the three things the journey costs;
  // the options are what he'd be giving up ON if he quit. These labels are
  // echoed verbatim on the paywall ("Your goal: …"), so each must read
  // complete after that prefix.
  {
    id: 'goals',
    section: 'turn',
    archetype: 'multi-select',
    question: 'Consistency. Discipline. Belief. This journey is simple — but it takes all three.',
    subText:
      'A hard night will come. When it does, what reminds you why you started instead of giving up?',
    tapPrompt: 'Tap everything that’s yours.',
    answerKey: 'goals',
    options: [
      { value: 'find-wife', label: 'To find my wife' },
      { value: 'future-family', label: 'To build a family of my own one day' },
      { value: 'respect-myself', label: 'To respect myself again' },
      { value: 'self-esteem', label: 'To rebuild my self-esteem' },
      { value: 'all-of-me', label: 'To give my partner all of me, not the anxious version' },
      { value: 'confidence-life', label: 'To carry confidence into every room, not just the bedroom' },
      { value: 'new-energy', label: 'To become a man she trusts, respects, and desires' },
    ],
    freeText: { answerKey: 'goalFreeText', prompt: 'In your own words: why?' },
    button: 'These are my reasons',
  },

  // ── Commitment and Close ───────────────────────────────────────────────
  {
    id: 'commit',
    section: 'close',
    archetype: 'commit',
    // Founder ruling 2026-07-15: ≤15 words before the question, direct and
    // challenging — command register, never hustle vocabulary (Canon §7).
    headline: '75 days. Fifteen minutes a day. All in, or not at all.',
    question: 'Can you give it fifteen minutes a day?',
    // Founder-specified CTA (2026-07-15) — one of the allowed "here or
    // there" dashes.
    button: 'Yes — I’m in',
  },
  {
    id: 'building-plan',
    section: 'close',
    archetype: 'beat',
    text: 'Based on your answers, we’ve built your plan.',
    maxMs: 2000,
  },
  // Two paywall-lead-in screens (founder batch 2026-07-14): the plan's promise,
  // then the investment frame. Behavioral "end the loop" language only — never
  // a cure claim (§1 guardrail).
  {
    id: 'plan-promise',
    section: 'close',
    archetype: 'chapter',
    eyebrow: 'YOUR PLAN',
    // Founder ruling 2026-07-15: headline only, no subtext — a touch more
    // encouraging, same shape.
    headline: 'Built to end this for good,\nnot just manage it.',
    button: 'Continue',
  },
  // Value stack (founder ruling 2026-07-15, QUITTR-inspired, split across
  // two screens): make the invisible product concrete BEFORE the price —
  // what the 75 days are, what to expect, everything included. Sits between
  // the plan's promise and the investment ask so "I'm ready" lands on a
  // buyer who knows exactly what he's saying yes to. Every item ≤ ~12 words;
  // behavioral framing only, no cure claims (§1 guardrail).
  {
    id: 'your-plan',
    section: 'close',
    archetype: 'value-stack',
    eyebrow: 'THE PROTOCOL',
    headline: 'What your 75 days look like.',
    groups: [
      {
        label: 'The daily work',
        items: [
          'Fifteen minutes a day. Headphones on. That’s the ask.',
          'Days 1–25: retrain the body’s threat response.',
          'Days 26–50: build control under high arousal.',
          'Days 51–75: make the calm your default.',
        ],
      },
      {
        label: 'Proof, not promises',
        items: [
          'Your Composure Score, re-measured at Days 14, 40, and 75.',
          'Some weeks will feel like nothing is moving. That’s rewiring.',
        ],
      },
    ],
    button: 'What else is included?',
  },
  {
    id: 'all-included',
    section: 'close',
    archetype: 'value-stack',
    eyebrow: 'THE MEMBERSHIP',
    headline: 'Everything that comes with it.',
    subhead: 'One payment. The full protocol, and the year that locks it in.',
    groups: [
      {
        label: 'With you the whole way',
        items: [
          'SOS grounding, one tap away, anywhere in the app.',
          'The Thought Restructurer for the moments anxiety spikes.',
          'Every method drawn from published clinical research.',
        ],
      },
      {
        label: 'After Day 75',
        items: [
          'Graduation unlocks the Mastery Suite. Included.',
          'A year of light maintenance and quarterly re-measurement.',
        ],
      },
    ],
    button: 'Continue',
  },
  {
    id: 'invest-yourself',
    section: 'close',
    archetype: 'chapter',
    eyebrow: 'THE DECISION',
    headline: 'Now it’s time to invest in yourself.',
    bodyBlocks: [
      'You’ve given years to this problem. Give **75 days** to the man on the other side of it.',
    ],
    button: 'I’m ready',
  },
  {
    id: 'paywall',
    section: 'close',
    archetype: 'paywall',
    goalEchoPrefix: 'Your goal:',
    profileRecap: {
      title: 'Your Autonomic Profile · from your answers',
      caption: 'Reversible with daily somatic retraining.',
    },
    // Model V2 headline: sells the transformation (the 75-Day Protocol plus
    // the year that consolidates it), never "a subscription" — the membership
    // is the delivery vehicle, not the promise.
    headline: 'The 75-Day Reset, built for this profile, and the year that locks it in',
    priceAnchor: { label: 'Sex therapy, 12 weeks: $1,800+', struck: true },
    offer: {
      annual: {
        eyebrow: 'COMPOSE · ONE YEAR',
        unit: ' /year',
        caption: 'One payment covers your full year.',
      },
      monthly: {
        eyebrow: 'COMPOSE · MONTHLY',
        unit: ' /month',
        caption: 'Cancel anytime in your Apple ID settings.',
      },
    },
    termSelector: { annual: 'Annual', monthly: 'Monthly' },
    // Honest-billing rule: the disclosure is plain, calm micro-type near the
    // CTA — no asterisks, no fine-print games. App Review requires it; trust
    // requires it more.
    autoRenew: {
      annual:
        'Renews yearly at {price} unless cancelled. Manage anytime in your Apple ID settings.',
      monthly:
        'Renews monthly at {price} unless cancelled. Manage anytime in your Apple ID settings.',
    },
    riskReversal: {
      // Founder ruling (2026-07): no refund promises on any surface, ever.
      // The risk reversal is evidence, not money-back — the Day-14
      // re-measurement is a checkpoint he can see. Refunds are Apple's
      // process and are never referenced.
      title: 'The Day-14 baseline check',
      body:
        'Your Composure Score is re-measured on Day 14. You watch the change, or see exactly what to adjust. Measured, not promised.',
    },
    lockedBlock: {
      heading: 'PHASE IV · LOCKED UNTIL DAY 76',
      body:
        'The work of the next 75 days is getting out of your head. Analyzing, adjusting, and managing mid-moment is the adrenaline loop with better vocabulary. So the advanced tools stay sealed until the reset they would interrupt is complete.',
      features: [
        { title: 'Somatic Copilot', description: 'scenario-matched interventions for real moments' },
        { title: 'Sensate Mastery', description: 'ride high arousal without leaving your body' },
        { title: 'The Refractory Window Guide', description: 'the neuro-mechanics of the recovery window' },
        { title: 'The Anxious Partner De-escalator', description: 'scripts that settle your partner’s nervous system, word by word' },
      ],
      // Act II future-pacing: the Mastery Suite is included membership
      // content earned at graduation — never a second purchase decision.
      footer: 'Included in your membership. It unlocks at graduation, Day 76.',
    },
    positioningLine: 'Pills and creams manage tonight. This retrains the system.',
    trustCard:
      'Your card statement shows Apple, never this app’s name. Notifications stay neutral. Everything you enter stays on this phone.',
    button: 'Continue to Day Zero',
    links: ['Restore', 'Privacy', 'Terms'],
  },
  {
    id: 'paywall-dismiss',
    section: 'close',
    archetype: 'paywall-dismiss',
    headline: 'Your map is saved.',
    body: 'Everything you mapped stays on this device. It will be here when you’re ready.',
    button: 'Keep going',
    exitLink: 'Exit for now',
  },
  {
    id: 'day-zero',
    section: 'close',
    archetype: 'signature',
    eyebrow: 'DAY ZERO',
    headline: 'This only works if you show up. So we start with your word.',
    oath:
      'For the next 75 days I will give this fifteen minutes a day. Not to perform better. To stop performing at all.',
    signaturePrompt: 'Sign your first name',
    signatureCaption: 'Signed on this device · seen by no one',
    chips: ['75 days', '15 min a day', '{pricePerDay} a day'],
    button: 'Sign & begin · {price}',
    // The purchase fires on this screen, so the plain auto-renew disclosure
    // sits directly under the button (App Review + honest billing).
    autoRenew: {
      annual: 'One payment covers your full year. Renews yearly at {price} unless cancelled in your Apple ID settings.',
      monthly: 'Renews monthly at {price} unless cancelled in your Apple ID settings.',
    },
  },
  {
    id: 'discretion-setup',
    section: 'close',
    archetype: 'discretion',
    eyebrow: 'DISCRETION',
    headline: 'Unreadable at a glance',
    subText:
      'How Compose appears on your home screen, lock screen, and anywhere outside the app.',
    toggles: [
      { title: 'Neutral notifications', description: '"Today’s session is ready." Never more.' },
      { title: 'Face ID to open', description: 'a handed-over phone shows nothing.' },
      { title: 'Hide from app switcher', description: 'covers the preview card when you switch apps.' },
    ],
    footer:
      'Billing is handled by Apple. Your card statement shows Apple, never this app’s name.',
    button: 'Begin Day 1',
  },
];

// Telemetry consent (§7 exception) — moved OUT of the pre-paywall flow
// (founder ruling 2026-07-14): asked once, post-purchase, on the /consent
// route between Day Zero and Discreet Mode setup. A member who has paid has
// maximum standing to be asked a favor, and the ask no longer interrupts the
// close chain. Copy cut to the minimum; decline stays equal-dignity and
// drops all buffered events.
export const CONSENT_SCREEN: ConsentScreen = {
  id: 'telemetry-consent',
  section: 'close',
  archetype: 'consent',
  eyebrow: 'ONE QUESTION',
  headline: 'Help prove this method works.',
  body:
    'May we count your anonymous milestones, like “Day 40 complete”, as part of everyone’s results?',
  bullets: [
    'Counts only, never your words',
    'Anonymous. No name, no account',
    'Decline, and nothing changes',
  ],
  acceptButton: 'Count my milestones',
  declineLink: 'No thanks',
};

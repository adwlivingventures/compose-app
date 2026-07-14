// Onboarding screen config — copy VERBATIM from the spec (punctuation and
// em-dashes included). Source:
//   spec/COMPOSE_Onboarding_-_Version_B__Batched__No_Hope_.pdf
// (Founder ruling 2026-07-10: the interleaved "Version A" flow and the
// onboarding A/B test are retired; the batched spec is the flow.)
//
// {price} and {pricePerDay} tokens resolve from the RevenueCat offering at
// render time. No purchasable price is ever hardcoded here ("$1,800+" is the
// therapy comparator, not our price).

import type { Screen } from './types';

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
    privacyLine: 'Private by design — no account, no sync, no lock-screen tells',
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
      'Before we suggest anything, we listen — first to the body, then to the mind. Then we build your protocol around what we find.',
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
      { value: 'unsure', label: 'Not sure — I’ve never paid attention' },
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
      'Together, these two can point to a physical cause — not just a mental one — worth ruling out first.',
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
      { value: 'panic', label: 'Yes — it feels close to panic' },
      { value: 'push-through', label: 'Yes — a strong surge but I push through it' },
      { value: 'occasionally', label: 'Sometimes — depending on the night' },
      { value: 'calm', label: 'No — I stay calm' },
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
      { value: 'speeds-up', label: 'It speeds up — short and fast' },
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
        'Completely invisible — no movement, no sound, nothing anyone could notice. You can do this in a waiting room.',
      steps: [
        'Sit comfortably, feet flat on the floor.',
        'On Begin, clench your pelvic floor — as if stopping urine flow.',
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
      anchorLow: '1 = It wouldn’t release — stayed tight',
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
      { value: 'almost-every-time', label: 'Yes — almost every time' },
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
    id: 'aftermath',
    section: 'part3',
    archetype: 'single-select',
    question: 'In the hours after it happens, what hits hardest?',
    answerKey: 'aftermath',
    options: [
      { value: 'shame', label: 'Shame' },
      { value: 'anger', label: 'Anger at myself' },
      { value: 'numbness', label: 'Numbness' },
      { value: 'fear-next', label: 'Fear of the next time' },
    ],
  },
  {
    id: 'avoidance',
    section: 'part3',
    archetype: 'single-select',
    question:
      'How often do you avoid initiating sex because of how your body might respond?',
    answerKey: 'avoidance',
    options: [
      { value: 'frequently', label: 'Frequently' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'stopped', label: 'I’ve stopped initiating altogether' },
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
      { value: 'everything', label: 'Yes — it touches everything' },
      { value: 'confidence', label: 'It shows in my confidence and mood' },
      { value: 'sometimes', label: 'Sometimes, in waves' },
      { value: 'bedroom-only', label: 'No — it stays in the bedroom' },
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
      'Your Composure Score — how steady your body stays under intimate pressure.',
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
      'The moment intimacy begins, your brain trips a **threat alarm**. Adrenaline floods in — **cutting blood flow**, **firing the reflex early**.',
    motif: 'adrenaline',
    button: 'I understand',
  },
  {
    id: 'card-novelty-loop',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Dopamine Loop',
    body:
      'Porn and endless scrolling train your brain on **infinite novelty**. Then one real partner has to compete with thousands — and your body **goes quiet**.',
    motif: 'novelty',
    button: 'Makes sense',
  },
  {
    id: 'card-dmn',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Default Mode Network',
    body:
      'After a bad night, your mind runs the same tape: “I’m less of a man — she’ll get bored and leave.” This loop is called the **Default Mode Network**… and every replay wires the fear **deeper**.',
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
      caption: 'of men quit ED pills within a year — even when they work.',
    },
    body:
      'Are we really going to pretend supplements are the answer? Every pill and cream teaches you the same **lie** — that you can’t do this without them — while quietly eating away at your **self-esteem**.',
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
      'You’ve turned intimacy into an **exam** you’re terrified to fail — watching yourself, grading every second. Your partner is right there, and you’re too **in your head** to feel it.',
    motif: 'spectator',
    button: 'Continue',
  },

  // ── The Turn — Hope and Desire ─────────────────────────────────────────
  // Founder review 2026-07-10: the pivot from diagnosis to solution needs its
  // own breath — hopeful, warm, and explicit that a different section is
  // starting. Inserted between the four cards and the Blueprint.
  {
    id: 'turn-welcome',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'COMPOSE',
    welcome: true,
    headline: 'You’re in the right place.',
    bodyBlocks: [
      'Everything you just saw — the alarm, the replay, the trained tempo — is a learned pattern. Learned means reversible.',
      'What comes next is how Compose reverses it, and what you get along the way.',
    ],
    closingLine: 'Welcome to Compose.',
    button: 'Show me',
  },
  {
    id: 'blueprint',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'THE METHOD',
    headline: 'The 75-Day Blueprint',
    bodyBlocks: [
      'Your system learned this. It can learn something else. University College London researchers tracked how long a new behavior takes to become automatic: 66 days on average. Compose runs 75 — past the threshold, with margin. A rewiring, sequenced daily: reset the alarm, retrain the body, consolidate the new default.',
      // Model V2: the Blueprint is Act I of a membership year, not the whole
      // product — the annual buyer must see more than 75 days of value.
      'And it’s Act One of your membership year — the SOS toolkit, your Baseline tracking, and the Mastery Suite at graduation carry it from there.',
    ],
    hero: 'fig-hero-protocol.png',
    heroHeight: 210,
    closingLine: 'Ten minutes a day. That’s the entire ask.',
    button: 'Show me the journey',
  },
  {
    id: 'hopeful-arc',
    section: 'turn',
    archetype: 'hopeful-arc',
    subScreens: [
      // Founder review 2026-07-10: the "right place" beat moved to the
      // turn-welcome screen; this slot now carries the measurement feature —
      // the risk-reversal differentiator ("measured, not promised").
      {
        eyebrow: 'COMPOSE',
        headline: 'Proof, not promises.',
        body:
          'The score you just saw is your baseline. You’ll re-measure it at Days 14, 40, and 75 — and watch the number move as your nervous system retrains. Evidence you can see beats reassurance you have to believe.',
        button: 'Continue',
      },
      {
        headline: 'Ten minutes. Headphones on. Eyes closed.',
        body:
          'One guided audio session a day. No screens to watch, nothing to read, nothing to perform — because the work happens in your body, not on a display.',
        button: 'Continue',
      },
      {
        headline: '75 days. Three phases. One button.',
        body:
          'Autonomic Reset (Days 1–25) quiets the alarm. Somatic Exposure (Days 26–50) retrains the body. Identity Consolidation (Days 51–75) makes calm the new default. You never decide what to do next — the sequence decides.',
        visual: 'phase-path',
        button: 'Continue',
      },
      {
        headline: 'For the moments that count.',
        body:
          'SOS: one tap, sixty seconds. 4-7-8 breathing and sensory grounding that intercept panic in real time — built for the bedroom doorway, usable anywhere. Yours from Day 1.',
        button: 'Continue',
      },
      {
        headline: 'Private by architecture.',
        body:
          'No account. Your answers never leave this phone. Neutral notifications, Face ID lock, hidden app switcher — and your card statement reads Apple, never this app’s name.',
        button: 'Continue',
      },
    ],
  },
  // Telemetry consent (§7 exception) — placed directly after the "Private by
  // architecture" beat that closes the hopeful arc: a consent ask lands best
  // immediately after a trust proof, and this position leaves the
  // commit → building-plan → paywall close chain unbroken. Unnumbered
  // (Model V2 insertion; the handoff's 42-screen numbering is untouched).
  {
    id: 'telemetry-consent',
    section: 'turn',
    archetype: 'consent',
    eyebrow: 'ONE QUESTION',
    headline: 'Help prove this method works?',
    body:
      'Everything you answer and write stays on this phone — that does not change. To show the protocol works, we ask to count anonymous milestones across all users. Each count carries one of four broad profile groups — never your answers — so results can be shown across different starting points.',
    bullets: [
      'Counts only — a session completed, a score measured',
      'Never your words, never who you are',
      'Decline, and the app works exactly the same',
    ],
    acceptButton: 'Count my milestones',
    declineLink: 'No thanks',
  },
  {
    id: 'foundations',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'THE FOUNDATIONS',
    headline: 'Built on fifty years of clinical method.',
    bodyBlocks: [
      'Compose is built on Sensate Focus (developed by Masters & Johnson, 1970), Cognitive Behavioral Sex Therapy, and Polyvagal-informed breathwork — the same frameworks used in clinical sex therapy.',
    ],
    statCards: [
      'In younger men, most erectile difficulty is psychological, not physical. The machinery works — the signal misfires.',
      'Performance anxiety is the most common thread across ED and PE — and conditioned responses respond to retraining.',
    ],
    // "Protocol reviewed by [Name], [Credentials]" — renders ONLY when a
    // signed, permissioned advisor exists. Null = the line does not exist.
    advisorLine: null,
    button: 'Continue',
  },
  {
    id: 'diverging-graph',
    section: 'turn',
    archetype: 'diverging-graph',
    headline: 'From tonight, this only moves in one of two directions.',
    yAxisLabel: 'Composure',
    startLabel: 'You · today',
    upperLabel: 'With daily retraining',
    lowerLabel: 'Without it',
    lowerAnnotation:
      'Avoidance compounds. Every skipped attempt teaches the alarm it was right.',
    upperAnnotations: [
      'Day 25 — the alarm quiets',
      'Day 50 — the body leads',
      'Day 75 — the new default',
    ],
    caption: 'Illustrative — conditioning deepens with repetition, in either direction.',
    button: 'I want the upper path',
  },
  {
    id: 'goals',
    section: 'turn',
    archetype: 'multi-select',
    question: 'What are you taking back? Tap all that apply.',
    answerKey: 'goals',
    options: [
      { value: 'calm-present', label: 'Feel calm and present during sex — instead of watching myself' },
      { value: 'stop-rehearsing', label: 'Stop rehearsing failure before anything has happened' },
      { value: 'initiate', label: 'Initiate again — without the dread' },
      { value: 'all-of-me', label: 'Give my partner all of me, not the anxious version' },
      { value: 'date-freely', label: 'Date without a countdown running in my head' },
      { value: 'trust-body', label: 'Trust my body again' },
      { value: 'confidence-outside', label: 'Carry the confidence outside the bedroom too' },
      { value: 'handled', label: 'Finish this program knowing it’s handled — for good' },
    ],
    freeText: { answerKey: 'goalFreeText', prompt: 'In your own words — what changes?' },
    button: 'Lock in my goals',
  },

  // ── Commitment and Close ───────────────────────────────────────────────
  {
    id: 'commit',
    section: 'close',
    archetype: 'commit',
    headline: 'Every day for 75 days: headphones on, ten minutes, your session.',
    body:
      'Some days it will feel like nothing is happening. That’s what rewiring feels like from the inside. And the 75 days are the opening act, not the whole story — your membership carries the year that makes the change permanent.',
    question: 'Can you give it ten minutes a day?',
    button: 'Yes — I’m in',
    doubtLink: 'I have doubts',
    doubt: {
      body:
        'Doubt is fine. The protocol doesn’t need your confidence — it needs your ten minutes.',
      button: 'Yes — I’m in',
    },
  },
  {
    id: 'building-plan',
    section: 'close',
    archetype: 'beat',
    text: 'Based on your answers, we’ve built your plan.',
    maxMs: 2000,
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
    headline: 'The 75-Day Reset, built for this profile — and the year that locks it in',
    priceAnchor: { label: 'Sex therapy, 12 weeks — $1,800+', struck: true },
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
        'Renews yearly at {price} unless cancelled — manage anytime in your Apple ID settings.',
      monthly:
        'Renews monthly at {price} unless cancelled — manage anytime in your Apple ID settings.',
    },
    riskReversal: {
      // Founder ruling (2026-07): no refund promises on any surface, ever.
      // The risk reversal is evidence, not money-back — the Day-14
      // re-measurement is a checkpoint he can see. Refunds are Apple's
      // process and are never referenced.
      title: 'The Day-14 baseline check',
      body:
        'Your Composure Score is re-measured on Day 14 — you watch the change, or see exactly what to adjust. Measured, not promised.',
    },
    lockedBlock: {
      heading: 'PHASE IV · LOCKED UNTIL DAY 76',
      body:
        'The work of the next 75 days is getting out of your head. Mid-moment troubleshooting — analyzing, adjusting, managing — is the adrenaline loop with better vocabulary. So the advanced tools stay sealed until the reset they would interrupt is complete.',
      features: [
        { title: 'Somatic Copilot', description: 'scenario-matched interventions for real moments' },
        { title: 'Sensate Mastery', description: 'ride high arousal without leaving your body' },
        { title: 'The Refractory Window Guide', description: 'the neuro-mechanics of the recovery window' },
        { title: 'The Anxious Partner De-escalator', description: 'scripts that settle your partner’s nervous system, word by word' },
      ],
      // Act II future-pacing: the Mastery Suite is included membership
      // content earned at graduation — never a second purchase decision.
      footer: 'Included in your membership — it unlocks at graduation, Day 76.',
    },
    positioningLine: 'Pills and creams manage tonight. This retrains the system.',
    trustCard:
      'Your card statement shows Apple — never this app’s name. Notifications stay neutral. Everything you enter stays on this phone.',
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
      'For the next 75 days I will give this ten minutes a day. Not to perform better — to stop performing at all.',
    signaturePrompt: 'Sign your first name',
    signatureCaption: 'Signed on this device · seen by no one',
    chips: ['75 days', '10 min a day', '{pricePerDay} a day'],
    button: 'Sign & begin — {price}',
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
      'Billing is handled by Apple. Your card statement shows Apple — never this app’s name.',
    button: 'Begin Day 1',
  },
];

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
    button: 'Start with the body',
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
      'However long it’s been: conditioned means learned, and learned means reversible.',
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
      'Have you ever tried pills (Viagra/Cialis), sprays, or numbing creams to fix this?',
    subText:
      'Most men start here. Pills move blood. They don’t touch the signal telling your body it’s under threat.',
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
    question:
      'When you wake up in the morning, does your body show physical arousal on its own?',
    subText:
      'This tells us whether the problem is physical or mental. If your body responds on its own, the physical side works.',
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
    // Founder ruling 2026-07-10: libido threshold tightened to ≤2 (a "3" is
    // mid-low, not a flag), and the note must NAME the two answers that
    // triggered it — an unexplained medical caution reads as alarm; an
    // explained one reads as honesty.
    displayLogic: {
      showIf: {
        all: [
          { key: 'morningArousal', equals: 'rarely' },
          { key: 'libido', lte: 2 },
        ],
      },
    },
    eyebrow: 'A QUICK NOTE',
    title: 'Worth a physician visit',
    body:
      'This note is here because of two answers you just gave: your body rarely shows arousal on its own in the morning, and your desire has been low this past month. Together — and only together — those can sometimes point to physical causes, hormonal or circulatory, that deserve a real exam. We’d rather tell you that straight than pretend otherwise; honesty about what this program is and isn’t is the whole point. So book the check-up. And keep going here — the nervous-system retraining and the identity work in Compose still apply to you, and we believe they will help.',
    button: 'Understood — continue',
  },
  {
    id: 'adrenaline-spike',
    section: 'part2',
    archetype: 'single-select',
    question:
      'When you initiate intimacy, do you feel a sudden spike in your heart rate, or a rush of nervous adrenaline in your chest?',
    answerKey: 'adrenalineSpike',
    options: [
      { value: 'panic', label: 'Yes — it feels close to panic' },
      { value: 'push-through', label: 'Yes — a strong surge, but I push through it' },
      { value: 'occasionally', label: 'Sometimes, depending on the night' },
      { value: 'calm', label: 'No — I stay calm' },
    ],
  },
  {
    id: 'breath-edge',
    section: 'part2',
    archetype: 'single-select',
    question:
      'In the final moments — right before you finish, or as you feel yourself fading — what happens to your breathing?',
    subText:
      'Breath under arousal is the clearest window into your nervous system. Most men have never been asked.',
    answerKey: 'breathEdge',
    options: [
      { value: 'shallow-hold', label: 'It gets shallow, or I hold it completely' },
      { value: 'speeds-up', label: 'It speeds up — short, fast breaths' },
      { value: 'slow-deep', label: 'It stays slow and deep' },
      { value: 'never-noticed', label: 'Honestly, I’ve never noticed' },
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
        'Men who carry performance anxiety often hold the pelvic floor chronically tight without knowing it — and a muscle that can’t fully relax works against both control and blood flow. This check measures one thing: how completely yours can let go.',
      reassurance:
        'Completely invisible — no movement, no sound, nothing anyone could notice. You can do this in a waiting room.',
      steps: [
        'Sit comfortably, feet flat on the floor.',
        'On Begin, clench your pelvic floor — as if stopping urine flow.',
        'Hold five seconds, then release fully on cue. Notice what the release feels like.',
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
      'No judgment in this question — it maps how your arousal system has been trained.',
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
      'During intimacy, do you ever feel like you’re watching yourself from the outside — evaluating instead of experiencing?',
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
    archetype: 'single-select',
    // Founder ruling 2026-07-10: ONE question for everyone — the partnered
    // phrasing is the more powerful one, and "your partner" reads fine for a
    // single man (the partner of that night). The old single/casual branch
    // is retired.
    question:
      'When things don’t go as planned in the bedroom, how does it affect the connection with your partner?',
    answerKey: 'partnerImpact',
    options: [
      { value: 'partner-blames-self', label: 'My partner blames themselves' },
      { value: 'unspoken-tension', label: 'There’s tension we don’t talk about' },
      { value: 'less-intimacy', label: 'We’ve stopped being intimate as often' },
      { value: 'working-together', label: 'We’re working through it together' },
    ],
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
      'When a session ends prematurely or falters, which of these run through your mind? Tap every one that shows up.',
    subText: 'Scripts, not facts — and a script you’ve named is one you can interrupt.',
    answerKey: 'scripts',
    options: [
      { value: 'broken', label: '"I am broken"' },
      { value: 'disappointed', label: '"She is disappointed in me"' },
      { value: 'never-fix', label: '"I will never fix this"' },
      { value: 'less-of-a-man', label: '"I’m less of a man"' },
    ],
    button: 'Continue',
  },
  {
    id: 'spillover',
    section: 'part3',
    archetype: 'single-select',
    question:
      'Does this follow you out of the bedroom — into your work, your confidence, how you carry yourself?',
    answerKey: 'spillover',
    options: [
      { value: 'everything', label: 'Yes — it touches everything' },
      { value: 'confidence', label: 'It shows in my confidence and mood' },
      { value: 'sometimes', label: 'Sometimes, in waves' },
      { value: 'bedroom-only', label: 'No — it stays in the bedroom' },
    ],
  },

  // ── Analysis ───────────────────────────────────────────────────────────
  // Founder ruling 2026-07-10: Symptoms moved BEFORE Generating — the whole-
  // life cost inventory is an input to the analysis, not an afterthought to
  // the reveal. (Supersedes the handoff's B-25→B-27 order.)
  {
    id: 'symptoms',
    section: 'analysis',
    archetype: 'multi-select',
    question: 'The cost isn’t only in the bedroom.',
    subText:
      'When your nervous system treats intimacy as a threat, it pays a tax everywhere. Tap anything you’ve noticed lately:',
    answerKey: 'symptoms',
    options: [],
    groups: [
      {
        label: 'MIND',
        options: [
          { value: 'concentrate', label: 'Hard to concentrate' },
          { value: 'brain-fog', label: 'Brain fog' },
          { value: 'anxiety-hum', label: 'A background hum of anxiety' },
          { value: 'low-drive', label: 'Low drive to chase goals' },
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
          { value: 'pulling-away', label: 'Pulling away from people' },
          { value: 'less-going-out', label: 'Less interest in going out' },
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
    button: 'Continue',
  },
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
  // his problem — not a preview of the protocol. Verdict + explained bars;
  // the "what's driving this" story continues into the four cards.
  {
    id: 'map',
    section: 'analysis',
    archetype: 'map',
    eyebrow: 'YOUR RESULTS',
    headline: '{name}, here is what your answers show.',
    scoreLabel:
      'Your Composure Score — how steady your body stays under intimate pressure.',
    gauge: {
      calmZone: [80, 100],
      calmLabel: 'CALM ZONE · 80–100',
      axisLow: '0 · adrenaline runs it',
      axisHigh: '100 · calm & present',
    },
    barsHeading: 'Where it’s coming from',
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
    button: 'Show me what’s driving this',
    footer: 'Stored on this device only',
  },

  // ── Clinical Context cards (batched after the Map) ────────────────────
  {
    id: 'card-adrenaline-trap',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Adrenaline Trap',
    // Claims-gate deviation from spec (founder-approved 2026-07-08): spec's flat
    // individual diagnosis "What you are experiencing is not a physical defect. It is…"
    // softened to population framing — the physician-triage card exists precisely
    // because a minority's cause IS physical.
    body:
      'Your brain has learned to treat intimacy like a threat. The moment things turn intimate, it floods your body with adrenaline — and adrenaline does exactly two things here: it tightens blood vessels and speeds up reflexes. That’s the mechanics of losing an erection, or finishing before you chose to. For most men in this pattern, nothing is physically broken. The alarm is wired to the wrong moment.',
    render: 'fig-hero-somatic.png',
    button: 'I understand',
  },
  {
    id: 'card-dmn',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Default Mode Network',
    body:
      'After a bad night, your brain replays it — over and over, in your own voice. That replay runs on a circuit called the Default Mode Network, and every replay tags the bedroom as more dangerous. Which means the alarm fires earlier next time. The replaying isn’t processing the problem. It’s training it.',
    render: 'fig-hero-validation.png',
    button: 'Continue',
  },
  {
    id: 'card-novelty-loop',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Novelty Loop',
    body:
      'Every solo session is a training rep. Porn compresses arousal into a sprint — spike, finish, close the tab. Run that loop a few hundred times and your body masters exactly one tempo: fast, alone, on demand. Then you’re with a real person, and it runs the only program it knows.',
    render: 'fig-hero-philosophy.png',
    conditionalLines: [
      {
        text: 'At daily frequency, this is likely the strongest single input shaping your arousal system right now.',
        showIf: { key: 'contentFrequency', equals: 'daily' },
      },
      {
        text: 'You’ve already felt the drift — needing more to feel the same. That’s the loop deepening. It runs in reverse, too.',
        showIf: { key: 'escalation', oneOf: ['yes', 'somewhat'] },
      },
    ],
    button: 'Makes sense',
  },
  {
    id: 'card-bandaids',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'Why Band-Aids Fail',
    body:
      'Pills move blood. Creams numb skin. Neither one touches the alarm in your brain that started all of this — so the anxiety stays, and now it has a chemical to depend on. Every pill also rehearses one quiet belief: my body can’t do this without help. A fix that keeps you dependent isn’t a fix.',
    render: 'hero-welcome-drop.png',
    renderMode: 'cover',
    button: 'I understand',
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

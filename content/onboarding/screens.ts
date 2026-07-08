// Onboarding screen config — copy VERBATIM from the specs (punctuation and
// em-dashes included). Sources:
//   Version A: spec/COMPOSE_Onboarding_-_Version_A__Interleaved___Hope_.docx
//   Version B: spec/COMPOSE_Onboarding_-_Version_B__Batched__No_Hope_.pdf
// The two variants share every string except the four clinical cards'
// placement, hope-tease closing lines, and (one) button label — those live
// declaratively on the card descriptors.
//
// {price} and {pricePerDay} tokens resolve from the RevenueCat offering at
// render time. No purchasable price is ever hardcoded here ("$1,800+" is the
// therapy comparator, not our price).

import type { Screen } from './types';

/**
 * The shared spine, in Version B order (which equals Version A order once the
 * four clinical cards are removed). Clinical cards appear here at their
 * BATCHED (B) positions; buildFlow relocates them for variant A via
 * `placement.A.inlineAfter`.
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
    headline: 'Your body isn’t failing you. It’s following orders.',
    bodyBlocks: [
      'Over the next few minutes we’ll map where those orders come from. Every answer stays on this phone.',
    ],
    hero: 'hero-welcome-drop.png',
    privacyLine: 'Private by design — no account, no sync, no lock-screen tells',
    microText: 'Takes about 4 minutes',
    button: 'Find my baseline',
  },
  {
    id: 'welcome-roadmap',
    section: 'opening',
    archetype: 'chapter',
    eyebrow: 'WELCOME',
    headline: 'First, we understand. Then, we build.',
    bodyBlocks: [
      'Before we suggest anything, we need to understand what’s actually happening. Not just in your body — in your nervous system and in your head. Most fixes pick one. The problem lives in both.',
      'First, the body. Then, the mind. Then we build your protocol around what we find.',
    ],
    button: 'Start with the body',
  },

  // ── Part 1 of 3 — Your Situation ───────────────────────────────────────
  {
    id: 'transition-part1',
    section: 'part1',
    archetype: 'section-transition',
    label: 'PART 1 OF 3 · YOUR SITUATION',
    autoAdvanceMs: 1500,
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
    autoAdvanceMs: 1500,
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
      'This tells us whether the machinery works when nothing is being asked of it. If your body fires on its own, the problem isn’t the hardware — it’s the interference.',
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
    displayLogic: {
      showIf: {
        all: [
          { key: 'morningArousal', equals: 'rarely' },
          { key: 'libido', lte: 3 },
        ],
      },
    },
    eyebrow: 'A QUICK NOTE',
    title: 'Worth a physician visit',
    body:
      'Your last two answers can sometimes point to physical causes — hormonal or circulatory — that deserve a real exam. Compose retrains the nervous system; it doesn’t replace bloodwork. Keep going here, and book the check-up too.',
    button: 'Understood — continue',
  },
  {
    id: 'adrenaline-spike',
    section: 'part2',
    archetype: 'single-select',
    question:
      'When you initiate intimacy, do you feel a sudden spike in your heart rate, or a rush of nervous adrenaline in your chest?',
    subText: 'That surge is adrenaline — a nervous-system reflex, not a verdict on you.',
    answerKey: 'adrenalineSpike',
    options: [
      { value: 'panic', label: 'Yes — it feels close to panic' },
      { value: 'push-through', label: 'A noticeable surge, but I push through' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'calm', label: 'No, I stay calm' },
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
      { value: 'shallow-hold', label: 'It gets shallow, or I hold it' },
      { value: 'never-noticed', label: 'Honestly, I’ve never noticed' },
      { value: 'slow-deep', label: 'It stays slow and deep' },
    ],
  },
  {
    id: 'pelvic-check',
    section: 'part2',
    archetype: 'interactive-check',
    answerKey: 'pelvicCheck',
    intro: {
      headline: 'Let’s feel it, not describe it.',
      subText:
        'Chronic pelvic tension is the physical arm of the adrenaline trap. Twenty seconds gives us your baseline.',
      reassurance:
        'Completely invisible — no movement, no sound, nothing anyone could notice. You can do this in a waiting room.',
      steps: [
        'Sit comfortably, feet flat on the floor.',
        'On Begin, clench your pelvic floor — as if stopping urine flow.',
        'Hold five seconds, release fully on cue. Notice what release feels like.',
      ],
      button: 'Begin the 20-second check',
      skipLink: 'Skip for now',
    },
    phases: [
      {
        seconds: 5,
        ringLabel: 'CLENCH & HOLD',
        instruction: 'Squeeze your pelvic floor firmly upward and inward.',
      },
      {
        seconds: 10,
        ringLabel: 'RELEASE & OBSERVE',
        instruction: 'Let go completely. Notice how fully your muscles can relax.',
      },
    ],
    resultQuestion: 'After releasing, what did you notice?',
    resultOptions: [
      { value: 'complete', label: 'Complete release — I felt clear relaxation' },
      { value: 'partial', label: 'Partial release — some tension remained' },
      { value: 'difficulty', label: 'Difficulty releasing — stayed contracted' },
    ],
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
    autoAdvanceMs: 1500,
  },
  {
    id: 'content-frequency',
    section: 'part3',
    archetype: 'single-select',
    question:
      'In an average week, how frequently do you rely on highly visual stimulation (adult content) during solo sessions?',
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
    subText: 'That drift is tolerance — a trained response, not a character flaw.',
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
    archetype: 'branched-select',
    answerKey: 'partnerImpact',
    branchOn: { key: 'relationship', oneOf: ['committed', 'married'] },
    variants: {
      P: {
        question:
          'When things don’t go as planned in the bedroom, how does it affect the connection with your partner?',
        subText:
          'Most men have never said this part out loud. Here, you’re just tapping a card.',
        options: [
          { value: 'partner-blames-self', label: 'My partner blames themselves' },
          { value: 'unspoken-tension', label: 'There’s tension we don’t talk about' },
          { value: 'less-intimacy', label: 'We’ve stopped being intimate as often' },
          { value: 'working-together', label: 'We’re working through it together' },
        ],
      },
      S: {
        question: 'When things went wrong in past encounters, what did it leave you with?',
        subText:
          'Most men have never said this part out loud. Here, you’re just tapping a card.',
        options: [
          { value: 'stopped-pursuing', label: 'I stopped pursuing people' },
          { value: 'dread', label: 'Dread before every new encounter' },
          { value: 'avoid-physical', label: 'I keep things from getting physical' },
          { value: 'why-single', label: 'It’s part of why I’m single now' },
        ],
      },
    },
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
    subText: 'These are scripts, not facts. Naming yours is the first step to interrupting it.',
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
      'Does it follow you out of the bedroom — into work, friendships, how you carry yourself?',
    answerKey: 'spillover',
    options: [
      { value: 'everything', label: 'Yes — it touches everything' },
      { value: 'sometimes', label: 'Sometimes' },
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
  {
    id: 'map',
    section: 'analysis',
    archetype: 'map',
    eyebrow: 'YOUR MAP',
    headline: '{name}, here is what your answers show.',
    scoreLabel: 'Your Composure Score — re-measured at Days 14, 40, and 75.',
    gauge: {
      calmZone: [80, 100],
      calmLabel: 'Calm baseline — where the protocol trains you toward.',
      caption: 'The gap is the work. 75 days is the route.',
    },
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
    body:
      'This is a conditioned adrenaline response. Conditioned means learned — and learned means reversible. Your 75-day sequence is built.',
    button: 'See my protocol',
    footer: 'Stored on this device only',
  },
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

  // ── Clinical Context cards (batched positions = variant B) ────────────
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
      'For most men in this pattern, this is not a physical defect — it is a sympathetic nervous system override. Your brain is mistakenly treating intimacy as a high-stress exam, flooding your body with adrenaline. Adrenaline constricts blood vessels and accelerates reflexes.',
    render: 'fig-hero-somatic.png',
    placement: { A: { inlineAfter: 'breath-edge' }, B: 'batched' },
    tease: { A: 'A system that learned the alarm can unlearn it.', B: null },
    button: { A: 'I understand', B: 'I understand' },
  },
  {
    id: 'card-dmn',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Default Mode Network',
    body:
      'That shame loop is generated by your Default Mode Network (DMN) — the brain’s self-referential replay circuit. It tags bedroom falters as threats, making the anxiety worse next time.',
    render: 'fig-hero-validation.png',
    placement: { A: { inlineAfter: 'scripts' }, B: 'batched' },
    tease: { A: 'It can be interrupted. That’s Phase Two’s job.', B: null },
    button: { A: 'Continue', B: 'Continue' },
  },
  {
    id: 'card-novelty-loop',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'The Novelty Loop',
    body:
      'Every session is a training rep. High-novelty stimulation compresses arousal into a sprint: spike, finish, close the tab. Run that loop a few hundred times and your nervous system masters exactly one tempo — fast, alone, on demand. Then you’re with a real person, and your body runs the only program it knows.',
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
    placement: { A: { inlineAfter: 'escalation' }, B: 'batched' },
    tease: { A: 'The loop took years to wire. Unwiring it is a 75-day job.', B: null },
    button: { A: 'Makes sense', B: 'Makes sense' },
  },
  {
    id: 'card-bandaids',
    section: 'analysis',
    archetype: 'clinical-card',
    title: 'Why Band-Aids Fail',
    body:
      'Pills move blood. Creams numb skin. Neither reaches the amygdala — the alarm that started all of this. And there’s a quieter cost: every pill is a rehearsal of the same belief — that your body can’t do this without help. A fix that keeps you dependent isn’t a fix. It’s a subscription to the problem.',
    render: 'hero-welcome-drop.png',
    renderMode: 'cover',
    placement: { A: { inlineAfter: 'bandaid-history' }, B: 'batched' },
    tease: { A: 'The alarm itself can be retrained. That’s the work ahead.', B: null },
    button: { A: 'Show me how', B: 'I understand' },
  },

  // ── The Turn — Hope and Desire ─────────────────────────────────────────
  {
    id: 'blueprint',
    section: 'turn',
    archetype: 'chapter',
    eyebrow: 'CLINICAL CONTEXT',
    headline: 'The 75-Day Blueprint',
    bodyBlocks: [
      'Your system learned this. It can learn something else. University College London researchers tracked how long a new behavior takes to become automatic: 66 days on average. Compose runs 75 — past the threshold, with margin. Not a trick to try tonight. A rewiring, sequenced daily: reset the alarm, retrain the body, consolidate the new default.',
    ],
    hero: 'fig-hero-protocol.png',
    closingLine: 'Ten minutes a day. That’s the entire ask.',
    button: 'Show me the journey',
  },
  {
    id: 'hopeful-arc',
    section: 'turn',
    archetype: 'hopeful-arc',
    subScreens: [
      {
        eyebrow: 'COMPOSE',
        headline: 'You’re exactly where you should be.',
        body:
          'Everything you just mapped — the adrenaline, the spectatoring, the scripts — is precisely what Compose was built to reverse. From here, everything is forward.',
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
          'Autonomic Reset (Days 1–25) quiets the alarm. Somatic Exposure (Days 26–50) retrains the body. Identity Consolidation (Days 51–75) makes calm the new default. You never decide what to do next — the sequence decides. And your Composure Score is re-measured at Days 14, 40, and 75, so you watch it move.',
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
    headline: 'Two directions. No standing still.',
    yAxisLabel: 'Composure',
    lowerAnnotation:
      'Without retraining: avoidance compounds — every skipped attempt deepens the loop.',
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
      'Some days it will feel like nothing is happening. That’s what rewiring feels like from the inside.',
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
    headline: 'The 75-Day Reset, built for this profile',
    priceAnchor: { label: 'Sex therapy, 12 weeks — $1,800+', struck: true },
    offer: { label: 'COMPOSE, 75 days — {price} once' },
    riskReversal: {
      title: '14-day baseline check',
      body:
        'If your Composure Score hasn’t moved after 14 days, we’ll show you exactly how to request a full refund from Apple — one tap.',
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
      footer: 'Unlocks with the Maintenance Toolkit — your choice on Day 76.',
    },
    positioningLine: 'Pills and creams manage tonight. This retrains the system.',
    trustCard:
      'No subscription. Your card statement shows Apple — never this app’s name. Notifications stay neutral.',
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
    chips: ['75 days', '10 min a day', '{pricePerDay} a day, once'],
    button: 'Sign & begin — {price}',
    subLine: 'One payment. No subscription.',
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

/** Batched (variant B) encounter order of the four dark cards, per the B spec. */
export const BATCH_ORDER = [
  'card-adrenaline-trap',
  'card-dmn',
  'card-novelty-loop',
  'card-bandaids',
] as const;

/** The batched block inserts directly after this screen in variant B. */
export const BATCH_AFTER = 'symptoms';

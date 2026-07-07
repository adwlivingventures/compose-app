/**
 * Lesson content — authored, versioned, deterministic (§7). Every lesson is
 * a tap-through card sequence ending in a somatic checkpoint, rendered by
 * components/LessonEngine.tsx via app/lesson/[id].tsx.
 *
 * The checkpoint quizzes are not assessment theater: retrieving the correct
 * response once, cognitively, measurably improves the odds of executing it
 * under autonomic load later (retrieval practice beats re-reading). A wrong
 * pick gets a corrective line and another attempt, never a failure state.
 */

export interface LessonStep {
  title: string;
  body: string;
  buttonText: string;
  quiz?: {
    options: string[];
    correctIndex: number;
    /** Shown under the options after a wrong pick — corrective, not punitive. */
    nudge: string;
  };
}

export interface Lesson {
  id: string;
  /** Eyebrow label in the engine header. */
  title: string;
  steps: LessonStep[];
}

const SENSATE_MASTERY: Lesson = {
  id: 'sensate-mastery',
  title: 'Sensate Mastery',
  steps: [
    {
      title: 'The Performance Myth',
      body:
        'Most men believe that being a great partner means performing like a machine. ' +
        "Neurobiology tells a different story. True physical connection isn't about speed or " +
        'mechanics—it is about Polyvagal Co-regulation.',
      buttonText: 'Understand Co-regulation',
    },
    {
      title: 'The Anxiety Transfer',
      body:
        "When your sympathetic nervous system spikes (adrenaline), your partner's body " +
        'subconsciously detects your shallow breathing and muscle tension. She absorbs that ' +
        "anxiety. To elevate the experience, you don't speed up. You drop the baseline.",
      buttonText: 'Next',
    },
    {
      title: 'The Waveform',
      body:
        'Arousal is not a straight line; it is a waveform. It builds, peaks, and naturally ' +
        'recedes. When it recedes, men panic and clench their pelvic floor. Instead, ride ' +
        'the dip. Let the wave pull back, and simply focus on the physical sensation of the ' +
        'sheets or the room temperature.',
      buttonText: 'Got it',
    },
    {
      title: 'Somatic Checkpoint',
      body:
        'When you feel the arousal waveform naturally recede during intimacy, what is the ' +
        'correct autonomic response?',
      buttonText: 'Complete Module',
      quiz: {
        options: [
          'Increase physical speed to force it back.',
          'Drop the pelvic floor and anchor to a physical sensation.',
        ],
        correctIndex: 1,
        nudge:
          "Forcing it back is the sympathetic reflex we're retraining — speed feeds the " +
          'spike. Try again.',
      },
    },
  ],
};

const REFRACTORY_WINDOW: Lesson = {
  id: 'refractory-window',
  title: 'The Refractory Window',
  steps: [
    {
      title: 'The Window Is Not a Verdict',
      body:
        'After climax, prolactin rises and the parasympathetic system takes the wheel. ' +
        'Arousal drops, sensitivity drops, and for a while the system will not restart. ' +
        'This is architecture, not malfunction — every male nervous system has this window.',
      buttonText: 'Understand the mechanics',
    },
    {
      title: 'What Holds the Window Open',
      body:
        'Monitoring is the mistake. Checking whether your body is ready again is ' +
        'spectatoring aimed at a clock — and the low-grade adrenaline of self-checking ' +
        'keeps the system in recovery mode. Sleep debt and alcohol stretch the window too, ' +
        'but watching it is what stretches it most.',
      buttonText: 'Next',
    },
    {
      title: 'The Restart Myth',
      body:
        'Round two does not begin in the genitals. It begins at a settled baseline: the ' +
        'window tends to close on its own schedule when nothing is demanded of it. Pressure ' +
        'to be ready is the one thing reliably in the way of ready.',
      buttonText: 'Next',
    },
    {
      title: 'Working the Window',
      body:
        'Treat the window as shared ground, not downtime. Stay in contact — touch with no ' +
        'destination, the 4:6 breath, conversation at low volume. Arousal that returns to a ' +
        'settled system returns cleaner than anything you can force.',
      buttonText: 'One more thing',
    },
    {
      title: 'Somatic Checkpoint',
      body:
        'Ten minutes after finishing, you catch yourself checking whether your body is ' +
        'ready to go again. What is the correct response?',
      buttonText: 'Complete Module',
      quiz: {
        options: [
          'Keep monitoring — awareness of readiness speeds it up.',
          'Drop the check, return to touch without a destination, and let the window close itself.',
        ],
        correctIndex: 1,
        nudge:
          'Monitoring is spectatoring pointed at a clock — the checking is what holds the ' +
          'window open. Try again.',
      },
    },
  ],
};

const PARTNER_DEESCALATOR: Lesson = {
  id: 'partner-deescalator',
  title: 'The Partner De-escalator',
  steps: [
    {
      title: 'Two Nervous Systems in the Room',
      body:
        'When intimacy stalls, yours is not the only system that spikes. A partner going ' +
        "quiet is often her own alarm — 'is it me?' — and two activated nervous systems " +
        'escalate each other. De-escalation is a skill, and it runs through you first.',
      buttonText: 'Next',
    },
    {
      title: 'Why Reassurance Fails',
      body:
        "'It's fine, don't worry' fails because her nervous system is not listening to " +
        'your words — it is reading your breath, your tone, your muscle tension. ' +
        'Reassurance delivered on a shallow breath registers as more alarm. The register ' +
        'carries the message; the words just ride it.',
      buttonText: 'Next',
    },
    {
      title: 'Name, Normalize, Redirect',
      body:
        'Slow your exhale first. Then three moves, in a low voice. Name it without blame: ' +
        "'My system is just running fast tonight.' Normalize it: 'It happens when I'm this " +
        "far into my head.' Redirect to shared ground: 'Come here — no agenda.'",
      buttonText: 'Next',
    },
    {
      title: 'Holding the Drop',
      body:
        'After the words, hold the register they created: an audible slow exhale, still ' +
        'hands, full contact without initiation. Her system takes its cue from the ' +
        'steadiest signal in the room — your job is to be that signal, not to fix the moment.',
      buttonText: 'One more thing',
    },
    {
      title: 'Somatic Checkpoint',
      body:
        'Intimacy stalls and your partner goes quiet. What does her nervous system need first?',
      buttonText: 'Complete Module',
      quiz: {
        options: [
          "A thorough explanation of why it isn't her fault.",
          'Your slowed breath and a low, unhurried voice — the register before the words.',
        ],
        correctIndex: 1,
        nudge:
          'An explanation delivered on an anxious breath reads as more alarm — the register ' +
          'is the message. Try again.',
      },
    },
  ],
};

export const LESSONS: Record<string, Lesson> = {
  [SENSATE_MASTERY.id]: SENSATE_MASTERY,
  [REFRACTORY_WINDOW.id]: REFRACTORY_WINDOW,
  [PARTNER_DEESCALATOR.id]: PARTNER_DEESCALATOR,
};

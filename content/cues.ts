/**
 * Implementation-intention cues for the Vitality Checklist — authored,
 * versioned, deterministic (CLAUDE.md §7).
 *
 * Mechanism: an implementation intention binds a behavior to a moment the
 * day already contains ("after my first coffee, I…"). With repetition
 * against that stable cue, control of the behavior migrates from effortful
 * prefrontal recall to basal-ganglia automaticity — the moment does the
 * remembering, not willpower. A cue the man CHOOSES holds better than one
 * prescribed to him (generation beats consumption, canon §7.7), which is
 * why the picker exists at all instead of us hardcoding the "best" cue.
 *
 * Register law (canon §7): every option is first-person present, Level
 * III/IV only — the sentence he'll re-read nightly is an identity
 * impression, so no "I should / I need to", no negation-framed
 * instruction, no deficit restating. Clean Focus cues are environment
 * design (where the phone sleeps), never "I don't watch…".
 *
 * The pre-choice suggestions (Phase 1, before he has picked anything) stay
 * in second person — a first-person statement he didn't author would be an
 * unearned impression.
 */

export type HabitCueKey = 'presence' | 'focus' | 'vitality';

export interface CueOption {
  id: string;
  text: string;
}

export interface ChosenCue {
  /** Option id, or 'custom' for a self-written cue (local-only, never telemetered). */
  id: string;
  text: string;
}

export type ChosenCues = Partial<Record<HabitCueKey, ChosenCue>>;

/** AsyncStorage key for the user's chosen cues — local only, never synced. */
export const CHOSEN_CUES_KEY = '@chosen_cues';

/** One-shot flag per phase transition so the picker gates each session exactly once. */
export function cuePickerDoneKey(phase: 2 | 3): string {
  return `@cue_picker_done_p${phase}`;
}

export const CUE_OPTIONS: Record<HabitCueKey, CueOption[]> = {
  presence: [
    {
      id: 'presence_coffee',
      text: 'While my first coffee brews, I spend that minute inside my body.',
    },
    {
      id: 'presence_shower',
      text: 'In the shower, I follow the heat of the water instead of my thoughts.',
    },
    {
      id: 'presence_car',
      text: 'When I sit down in the car, I take three slow breaths before I start it.',
    },
    {
      id: 'presence_door',
      text: 'Each time I walk through my front door, I arrive in my body first.',
    },
  ],
  focus: [
    {
      id: 'focus_charge_outside',
      text: 'After dinner, my phone charges outside the bedroom.',
    },
    {
      id: 'focus_first_minutes',
      text: 'My first ten minutes awake belong to water and daylight.',
    },
    {
      id: 'focus_last_hour',
      text: 'The last hour of my night runs on paper, people, or quiet — the screen is finished for the day.',
    },
    {
      id: 'focus_pull_moment',
      text: 'When the pull toward the screen shows up, I stand, stretch, and pour a glass of water.',
    },
  ],
  vitality: [
    {
      id: 'vitality_daylight',
      text: 'Before the first screen of the day, daylight touches my face.',
    },
    {
      id: 'vitality_caffeine',
      text: 'I take my last coffee before two in the afternoon.',
    },
    {
      id: 'vitality_wind_down',
      text: 'When the kitchen light goes off at night, my screens go dark with it.',
    },
    {
      id: 'vitality_walk',
      text: 'After lunch, I take ten minutes outside on my feet.',
    },
  ],
};

/**
 * Pre-choice suggestions shown under unchecked items in Phase 1, before the
 * Day-26 picker. Second person by design — see the register note above.
 */
export const DEFAULT_CUES: Record<HabitCueKey, string> = {
  presence: 'Try anchoring it to your first coffee — one embodied minute while it brews.',
  focus: 'Try letting your phone spend the night outside the bedroom.',
  vitality: 'Try daylight on your face before the first screen of the day.',
};

export interface CuePickerIntro {
  eyebrow: string;
  headline: string;
  body: string;
}

/**
 * Phase-transition framing. Day 26 speaks in the evidence register, Day 51
 * in the identity register (canon §7.2) — never the other way around.
 */
export const CUE_PICKER_INTROS: Record<2 | 3, CuePickerIntro> = {
  2: {
    eyebrow: 'Phase 2 · Days 26–50',
    headline: 'Bind each habit to a moment your day already holds.',
    body:
      'Twenty-five days are on the record. Willpower carried them — it was never meant to ' +
      'carry all seventy-five. A behavior tied to a fixed moment (the first coffee, the ' +
      'front door, the last light) begins to fire on its own: the moment becomes the ' +
      'trigger, and the trigger does the remembering. Choose the moment for each check-in. ' +
      'A cue you pick yourself holds far better than one handed to you.',
  },
  3: {
    eyebrow: 'Phase 3 · Days 51–75',
    headline: 'These habits live in your day now. Choose where.',
    body:
      'Fifty days of evidence. In this final phase the work becomes furniture in the day ' +
      'of the man you are — each behavior settled into its own fixed moment. Look at the ' +
      'moments you chose at Day 26: keep the ones that hold, and give a new home to any ' +
      'that are ready to move.',
  },
};

/** Per-item copy inside the picker steps. */
export const CUE_STEP_COPY: Record<HabitCueKey, { title: string; subtitle: string }> = {
  presence: {
    title: 'Presence Work',
    subtitle: 'Conscious time inside your body, once a day. Pick the moment it binds to.',
  },
  focus: {
    title: 'Clean Focus',
    subtitle: 'A day with your dopamine baseline protected. Pick the moment that protects it.',
  },
  vitality: {
    title: 'Vitality Habit',
    subtitle: 'Sleep, light, and movement — the physical floor. Pick the moment that anchors it.',
  },
};

/** Fixed step order — matches the checklist order in the daily session. */
export const CUE_KEYS: HabitCueKey[] = ['presence', 'focus', 'vitality'];

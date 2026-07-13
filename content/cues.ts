import { LEDGER_ITEMS, LedgerKey } from './ledger';

/**
 * Implementation-intention cue options for the Vitality Ledger — authored,
 * versioned, deterministic (CLAUDE.md §7).
 *
 * Mechanism: an implementation intention binds a behavior to a moment the
 * day already contains ("after my first coffee, I…"). With repetition
 * against that stable cue, control of the behavior migrates from effortful
 * prefrontal recall to basal-ganglia automaticity — the moment does the
 * remembering, not willpower. A cue the man CHOOSES holds better than one
 * prescribed to him (generation beats consumption, canon §7.7), which is
 * why the picker exists instead of us hardcoding the "best" cue.
 *
 * Relationship to the ledger's static `cue` field: each LedgerItem ships a
 * second-person suggestion (content/ledger.ts) that renders until the man
 * has chosen his own. At the phase transitions (Days 26 and 51) the picker
 * offers the options below; his choice then renders in place of the static
 * suggestion wherever cues appear.
 *
 * Register law (canon §7): every option is first-person present, Level
 * III/IV only — the sentence he'll re-read daily is an identity
 * impression, so no "I should / I need to", no negation-framed
 * instruction, no deficit restating. Clean Focus cues are environment
 * design (where the phone sleeps), never "I don't watch…". The static
 * pre-choice suggestions stay second person by design — a first-person
 * statement he didn't author would be an unearned impression.
 */

export interface CueOption {
  id: string;
  text: string;
}

export interface ChosenCue {
  /** Option id, or 'custom' for a self-written cue (local-only, never telemetered). */
  id: string;
  text: string;
}

export type ChosenCues = Partial<Record<LedgerKey, ChosenCue>>;

/** AsyncStorage key for the user's chosen cues — local only, never synced. */
export const CHOSEN_CUES_KEY = '@chosen_cues';

/** One-shot flag per phase transition so the picker gates each session exactly once. */
export function cuePickerDoneKey(phase: 2 | 3): string {
  return `@cue_picker_done_p${phase}`;
}

export const CUE_OPTIONS: Record<LedgerKey, CueOption[]> = {
  morningLight: [
    {
      id: 'light_coffee_outside',
      text: 'My first coffee is an outside coffee.',
    },
    {
      id: 'light_before_screen',
      text: 'Before the first screen of the day, daylight touches my face.',
    },
    {
      id: 'light_breakfast',
      text: 'I eat breakfast where the morning light lands.',
    },
    {
      id: 'light_front_door',
      text: 'The first thing I open in the morning is the front door.',
    },
  ],
  presenceRep: [
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
    {
      id: 'presence_kettle',
      text: 'While the coffee or kettle runs, I drop into my body until it’s done.',
    },
  ],
  cleanFocus: [
    {
      id: 'focus_charge_outside',
      text: 'After dinner, my phone charges outside the bedroom.',
    },
    {
      id: 'focus_first_minutes',
      text: 'My first ten minutes awake belong to water and daylight.',
    },
    {
      id: 'focus_pull_moment',
      text: 'When the pull toward the screen shows up, I stand, stretch, and pour a glass of water.',
    },
    {
      id: 'focus_daylight_rule',
      text: 'The rule is set each morning while my coffee brews — decided in daylight, done for the day.',
    },
  ],
  screenSunset: [
    {
      id: 'sunset_kitchen_light',
      text: 'When the kitchen light goes off at night, my screens go dark with it.',
    },
    {
      id: 'sunset_alarm_last',
      text: 'Setting tomorrow’s alarm is my phone’s last job of the night.',
    },
    {
      id: 'sunset_charger_far',
      text: 'An hour before bed, my phone moves to its charger across the room.',
    },
    {
      id: 'sunset_paper_hour',
      text: 'The last hour of my night runs on paper, people, or quiet.',
    },
  ],
  training: [
    {
      id: 'training_calendar',
      text: 'Training sits in my calendar like a meeting — same slot, every day.',
    },
    {
      id: 'training_lunch_walk',
      text: 'After lunch, I take ten minutes outside on my feet.',
    },
    {
      id: 'training_clothes_ready',
      text: 'My gym clothes wait by the door the night before.',
    },
    {
      id: 'training_move_first',
      text: 'When I get home from work, I move first and sit down after.',
    },
  ],
  tensionAudit: [
    {
      id: 'tension_red_light',
      text: 'At every red light, I scan — jaw, shoulders, floor — and release.',
    },
    {
      id: 'tension_elevator',
      text: 'Every elevator wait, I find the clench and let it go.',
    },
    {
      id: 'tension_send',
      text: 'Each time I hit send on an email, I drop my shoulders and unclench.',
    },
    {
      id: 'tension_sit_down',
      text: 'When I sit down in a chair, the jaw and the floor let go first.',
    },
  ],
};

/** Resolve the cue to display for an item: his chosen cue, else the authored suggestion. */
export function cueTextForItem(
  key: LedgerKey,
  staticCue: string,
  chosen: ChosenCues,
): { text: string; isChosen: boolean } {
  const c = chosen[key];
  return c ? { text: c.text, isChosen: true } : { text: staticCue, isChosen: false };
}

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
      'trigger, and the trigger does the remembering. Choose the moment for each line of ' +
      'the ledger. A cue you pick yourself holds far better than one handed to you.',
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

/** The picker must cover exactly the ledger's keys — tests sync against this. */
export const CUE_KEYS: LedgerKey[] = LEDGER_ITEMS.map((i) => i.key);

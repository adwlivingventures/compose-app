/**
 * Mastery Suite modules — Act II included membership content (Model V2).
 * Shared by app/mastery.tsx and components/MasteryHome.tsx.
 */

export interface MasteryModule {
  title: string;
  description: string;
  route: string;
  /** Protocol day the module opens on (staggered unlock during Act I). */
  unlockDay: number;
}

export const MASTERY_MODULES: MasteryModule[] = [
  {
    title: 'The Refractory Window Guide',
    description:
      "What's really happening in your body after you finish — and how to make round two possible.",
    route: '/lesson/refractory-window',
    unlockDay: 1,
  },
  {
    title: 'The Anxious Partner De-escalator',
    description:
      'The right words to steady the moment when things stall — so one hitch never spirals into a bad night.',
    route: '/lesson/partner-deescalator',
    unlockDay: 1,
  },
  {
    title: 'Sensate Mastery',
    description:
      'A step-by-step touch practice with your partner that takes performance off the table — and pulls you closer.',
    route: '/lesson/sensate-mastery',
    unlockDay: 25,
  },
  {
    title: 'The Attunement Advantage',
    description:
      "Read your partner's signals and own the pace — so you're the one they can't stop thinking about.",
    route: '/lesson/partner-attunement',
    unlockDay: 50,
  },
  {
    title: 'The Somatic Copilot',
    description:
      "Your in-the-moment coach. Tell it what's happening and get your exact next move — before, during, or after.",
    route: '/copilot',
    unlockDay: 75,
  },
];

/** Post-protocol: every module is earned. During protocol: day-gated. */
export function isMasteryModuleLocked(
  module: MasteryModule,
  activeDay: number,
  protocolComplete: boolean,
  member: boolean,
): boolean {
  if (!member) return true;
  if (protocolComplete) return false;
  return activeDay < module.unlockDay;
}

/**
 * Partner Guide — "The Autonomic Reset."
 *
 * Written to be read by the PARTNER, on the user's handed-over phone. The
 * entire job of this text is limbic co-regulation: give the partner an
 * accurate, blame-free model of what is happening in his nervous system so
 * her calm becomes part of the treatment — and remove his burden of
 * explaining it mid-vulnerability.
 *
 * DRAFT STATUS: authored in-house pending the canonical text from
 * compose_advanced_clinical_protocols.md (§4), which was not present in the
 * repo at build time. Structure supports verbatim replacement.
 */

export interface GuideSection {
  heading: string;
  body: string;
}

export const PARTNER_GUIDE_TITLE = 'A Short Guide for Partners';

export const PARTNER_GUIDE_INTRO =
  'He handed you this because explaining it out loud is hard. Reading it takes two minutes, and it will genuinely help — both of you.';

export const PARTNER_GUIDE_SECTIONS: GuideSection[] = [
  {
    heading: 'What is actually happening',
    body:
      'What you may have noticed — difficulty staying present, finishing quickly, or his body not responding — is not about his attraction to you, and it is not a decision he is making. It is his nervous system misfiring: his brain has learned to treat intimacy as a high-stakes test, and it responds the way it would to any threat — with adrenaline. Adrenaline speeds up reflexes and pulls blood away from where it matters. The more he worries about it happening, the more reliably it happens. That loop is the whole problem.',
  },
  {
    heading: 'Why it is not about you',
    body:
      'Almost every man in this loop is convinced his partner is disappointed, and almost every partner is mostly just confused or worried. Both of you are usually wrong about what the other is thinking. His body responding imperfectly is not a measurement of your desirability, and it is not a measurement of his desire. It is a stress reflex — the same system that makes hands shake before public speaking.',
  },
  {
    heading: 'What actually helps',
    body:
      'Your calm is more powerful than any technique. Nervous systems synchronize — when you stay warm, unhurried, and stay physically close, his system borrows your steadiness. Slowing down helps. Staying close after a difficult moment helps enormously. Treating a pause as normal — because it is — helps more than anything you could say.',
  },
  {
    heading: 'What tends to make it worse',
    body:
      'Reassurance delivered as a big serious moment ("it\'s okay, it doesn\'t matter, really, it\'s fine") can accidentally confirm that something significant just failed. So can withdrawing, or treating the topic as unmentionable. Light, warm, brief acknowledgment — then staying connected — beats both silence and speeches.',
  },
  {
    heading: 'What he is working on',
    body:
      'He is following a structured 75-day daily program that retrains the stress response — breathing, physical down-regulation, and rewiring the thought patterns that trigger the adrenaline. It is real, evidence-informed work, and it works best with time and zero pressure. You do not need to do anything except know what you now know.',
  },
];

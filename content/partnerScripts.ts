// Partner communication scripts — authored, versioned, deterministic (§7).
// Moved out of the Restructure tab (founder review 2026-07-10): scripts are
// reference material, not a daily practice, so they live in the You-tab
// Library (app/partner-scripts.tsx) beside the Partner Guide.

export interface PartnerScript {
  title: string;
  category: string;
  body: string;
}

export const PARTNER_SCRIPTS: PartnerScript[] = [
  {
    title: 'Sensate Focus Introduction',
    category: 'Opening the Conversation',
    body: `I've been working on something personal — a somatic program to help me be more present during intimacy. Part of it involves a technique called sensate focus: touch that's purely about sensation and connection, with no pressure or goal attached. I'd love to try it together when you're open to it. It's helped a lot of couples slow down and reconnect.`,
  },
  {
    title: 'Pacing & Slowing Down',
    category: 'In-the-Moment',
    body: `I want to pause for a second — not because anything is wrong, but because I'm practicing something. I'm learning to stay grounded by slowing down and breathing rather than rushing ahead. If I check in or ask to take a breath together, that's why. It's actually helping me feel more connected, not less.`,
  },
  {
    title: 'Reassurance Request',
    category: 'Vulnerability',
    body: `I want to be honest with you: I sometimes get stuck in my head during intimacy — watching myself instead of just being with you. I'm actively working on it. The most helpful thing you can do is remind me you're here and that there's no pressure. Just being calm with me matters more than you might realise.`,
  },
  {
    title: 'After a Difficult Moment',
    category: 'Repair',
    body: `I want to talk about what happened earlier — not to overthink it, but so we can stay close. Sometimes my body doesn't cooperate with what I want, and that's not about you or how attracted I am. I'm working through some nervous system stuff. Thank you for being patient. Can we just be close right now?`,
  },
  {
    title: 'Sharing Your Progress',
    category: 'Check-In',
    body: `I wanted to let you know I've been consistent with my program and it's making a real difference — not just physically, but in how present I feel with you. I'm more aware of my body, less anxious, and I genuinely feel more connected. I appreciate your support while I've been working through this.`,
  },
];

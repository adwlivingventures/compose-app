// Tester testimonials — real, consented, in-person tester feedback (founder,
// 2026-07-15). Single source of truth: rendered in onboarding (the
// `field-reports` screen) AND in the You-tab vault, so the two can never
// drift. Provenance is REAL attributed accounts — the opposite of the vault's
// composite narratives; the two must never share a disclosure line (honest-
// data doctrine; claims gate in .claude/ember-progress.md — written consent +
// original records required before launch).

export interface Testimonial {
  name: string;
  /** Age, and for partners a relationship note ("33 · Partner of 4 years"). */
  detail: string;
  /** One-line arc tag for skimming. */
  tag: string;
  text: string;
  /** Partner (vs the man himself) — lets surfaces group or label them. */
  partner?: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marcus',
    detail: '34',
    tag: 'Out of his head',
    text: 'I spent years trapped in my own head during sex, constantly monitoring myself and waiting for my erection to fail. It was an exhausting loop of adrenaline that ruined my relationship. COMPOSE completely flipped the switch. Learning to down-regulate my nervous system through the daily auditory anchors completely stopped the mental chatter. For the first time in my life, I am entirely present in my body, not spectatoring from the outside. The 75 days rewired how my body responds to touch.',
  },
  {
    name: 'Julian',
    detail: '28',
    tag: 'Control, not white-knuckling',
    text: 'I thought fixing an early finish meant using distractions or white-knuckling through a timer, which never worked because my body was in a constant fight-or-flight state. COMPOSE taught me the neurobiology of what was actually happening. The daily Pelvic Drop exercises trained me to consciously release the chronic, unconscious clenching between my legs that acted as a physical hair-trigger. I moved from an anxious level 8 arousal baseline down to a controlled, steady level 5. I have complete sovereignty over my body now.',
  },
  {
    name: 'David',
    detail: '42',
    tag: 'The Day-30 setback',
    text: 'Around Day 30 of the protocol, I had a stressful week and experienced a major bedroom failure. In the past, that would have caused a weeks-long spiral of shame and avoidance. Instead, I opened the app and triggered the Post-Setback Protocol in the Triage Center. The audio reframed the dopamine crash immediately, helping me exit the sympathetic panic loop. By normalizing the relapse as part of my basal ganglia rewiring, I didn’t quit. I finished the 75 days, and my confidence is unshakeable.',
  },
  {
    name: 'Christian',
    detail: '31',
    tag: 'Performance to presence',
    text: 'I used to view intimacy like an exam I was bound to fail, which filled my bloodstream with cortisol before things even started. COMPOSE stripped away the performance mindset entirely. The shift from conscious, effortful control in my prefrontal cortex to automatic somatic presence has completely transformed my sex life. I’m no longer chasing an end-state; I am entirely grounded in the current physical sensation. It is an incredible feeling of freedom.',
  },
  {
    name: 'Sarah',
    detail: '33 · Partner of 4 years',
    tag: 'The distance closed',
    partner: true,
    text: 'When my partner struggled with intimacy, he would completely shut down, pull away, and isolate himself out of shame. I felt disconnected and lonely, thinking it was my fault. When he started COMPOSE, the change wasn’t just physical. It was profoundly emotional. He learned how to stay grounded instead of panicking. Our intimacy has shifted from a high-pressure performance into deep, beautifully connected, and unhurried pleasure. Our relationship has never been this strong.',
  },
  {
    name: 'Elena',
    detail: '39 · Married 11 years',
    tag: 'Calm came home',
    partner: true,
    text: 'Years of bedroom anxiety had turned our sex life into a source of unspoken tension and silent dread. My husband felt like he was failing, and his anxiety made it impossible for us to connect. The COMPOSE protocol saved our marriage. By learning to anchor his nervous system, he brought a sense of calm, masculine safety back into our bedroom. We’ve moved past the quick anxiety sprints and into the deepest physical and emotional alignment we’ve ever experienced in our eleven years together.',
  },
];

/**
 * ProtocolData — the canonical 75-day protocol manifest.
 *
 * Bundled in the app binary: zero-latency, fully offline (§7). Titles and
 * focus lines are extracted verbatim from the authored anchor scripts in
 * /scripts (COMPOSE Phase 1–3 Scripts.md) — deterministic, versioned content.
 *
 * audioFileName is the naming convention for the recording pipeline. Note:
 * Metro cannot require() assets from runtime strings, so actual playback
 * sources are registered as static require() calls in content/anchors.ts as
 * recordings are produced.
 */

export interface ProtocolDay {
  day: number;
  phase: number;
  phaseTitle: string;
  title: string;
  focus: string;
  audioFileName: string; // e.g., 'day_1.mp3'
}

const PHASE_TITLES: Record<number, string> = {
  1: 'The Autonomic Reset',
  2: 'Somatic Exposure & Mastery',
  3: 'Identity Consolidation',
};

// Raw per-day content: [title, focus]. Index 0 = Day 1.
const DAYS: [string, string][] = [
  // ── Phase 1: The Autonomic Reset (Days 1–25) ──────────────────────────────
  ['The Sovereign Presence', "Overcoming 'spectatoring' and performance evaluation."],
  ['Neutralizing the Perfect Metric', "Dismantling 'all-or-nothing' thinking patterns regarding erection quality."],
  ['The Pelvic Drop', 'Introducing pelvic floor down-training and reverse kegels.'],
  ['The Stopwatch Trap', 'Dismantling time-driven performance metrics.'],
  ['The Autonomic Window', 'Understanding the neurobiology of consecutive intimacy.'],
  ['Sensation Over Evaluation', 'Shifting attention from cognitive worry to tactile feedback.'],
  ['The Zero-Goal Principle', 'Introducing Sensate Focus Stage 1.'],
  ['Dismantling the Shame Loop', 'Breaking the post-falter silence with pre-planned scripts.'],
  ['Riding the Adrenaline Wash', 'Autonomic de-sensitization to adrenaline spikes.'],
  ['The Arousal Plateau', 'Using the 1-to-10 arousal scale to map internal pacing.'],
  ['The Mind-Reading Trap', 'Eliminating cognitive projections of partner disappointment.'],
  ['Somatic Capillary Flow', 'Introducing low-excitation vascular retraining.'],
  ['Anchoring the Breath', 'Breathing as the ultimate autonomic master switch.'],
  ['The Midpoint Consolidation', 'Consolidating the first two weeks of foundations before going deeper.'],
  ['The Myth of Spontaneity', 'Dismantling the ideal that intimacy must be entirely spontaneous.'],
  ['Sensory Grounding', 'An emergency brake for acute spectatoring using the 5-4-3-2-1 technique.'],
  ['Normalizing the Soft Reset', 'Redefining the temporary loss of an erection as a biological reset, not a failure.'],
  ['The Tension Audit', 'Identifying and releasing secondary muscular clenching (jaw, glutes, core).'],
  ['Uncoupling Touch from Arousal', 'Expanding Sensate Focus to include non-demand touch.'],
  ['Visual vs. Somatic Arousal', 'Shifting from cognitive/visual fantasy to physical presence.'],
  ['The Edging Misconception', 'Clarifying the difference between clinical arousal control and destructive edging.'],
  ['Communicating the Pause', 'Exact phrasing to pause an encounter before the point of no return.'],
  ['Redefining Intimacy', "Broadening the definition of a 'successful' encounter."],
  ['Forgiving the Falter', 'Practicing self-compassion and breaking the frustration cycle after a difficult session.'],
  ['The Bridge to Exposure', 'Wrapping up Phase 1 and preparing the nervous system for Phase 2.'],
  // ── Phase 2: Somatic Exposure & Mastery (Days 26–50) ──────────────────────
  ['The Architecture of Exposure', 'Transitioning from avoidance to controlled exposure.'],
  ['The 5-and-Drop', 'Practicing the stop-start technique at a low threshold.'],
  ['Redefining the Squeeze', 'Introducing the clinical squeeze technique without shame.'],
  ['Expanding the Map', 'Shifting focus from localized touch to full-body somatic awareness.'],
  ['Proximity Without Penetration', 'De-sensitizing the anxiety of physical proximity.'],
  ['The Illusion of Urgency', 'Breaking the neurobiological compulsion to rush.'],
  ['Stillness in the Fire', 'Stillness practice under full intensity (Sensate Focus Stage 3).'],
  ['The 10-Second Rule', 'Controlled rhythmic pacing.'],
  ['Cognitive Defusion', 'Detaching from intrusive thoughts during high arousal.'],
  ['The Power of the Exhale', 'Using extended exhales to trigger the parasympathetic nervous system.'],
  ['Forgiving the Friction', 'Adapting to different angles, pressures, and physical sensations.'],
  ['Discarding the Sunk Cost', 'Removing the pressure to finish just because you started.'],
  ['The Visual Anchor', 'Using eye contact to shatter dissociation and spectatoring.'],
  ['Welcoming the Fluctuation', 'Normalizing the natural ebb and flow of arousal during active exposure.'],
  ['Morning Somatic Checks', 'Utilizing morning occurrences for low-pressure awareness.'],
  ['Position and Pressure', 'Understanding how different physical positions alter pelvic tension.'],
  ['The Partner Check-In', 'Using verbal communication to reset pacing mid-encounter.'],
  ['Welcoming the Loss of Control', 'Differentiating between panic and surrender.'],
  ['The Transition Point', 'Managing the shift between stages of intimacy.'],
  ['Shallow Focus', 'Reducing physical over-stimulation through depth control.'],
  ['The Post-Falter Pivot', 'Recovering momentum after a falter or early release.'],
  ['Rewriting the Solo Script', 'Ensuring solo habits mirror partner realities.'],
  ['The Empathy Shift', "Viewing the partner's pleasure apart from your own performance."],
  ['The Plateau as Home', 'Accepting the 6/7 arousal level as the natural state of intimacy.'],
  ['Phase 2 Consolidation', 'Recognizing the shift from avoidance to mastery before Phase 3.'],
  // ── Phase 3: Identity Consolidation (Days 51–75) ──────────────────────────
  ['The Polyvagal Shift', 'Understanding safety through Polyvagal Theory.'],
  ['Myelinating the Baseline', 'The neuroscience of habituation and white matter.'],
  ['The Dopamine Detox', 'Shifting from high-dopamine novelty to oxytocin-based connection.'],
  ['Extinguishing the Spectator', 'Treating spectatoring as an extinct neural loop.'],
  ['The Basal Ganglia Shift', 'Transitioning effortful tools into automatic reflexes.'],
  ['The Prefrontal Override', 'Staying cognitively online during high sympathetic arousal.'],
  ['Neuroception of Safety', 'Engineering your environment to broadcast safety cues.'],
  ['Reframing the Refractory Period', 'Understanding the prolactin window without shame.'],
  ['The Identity Shift', 'Shifting from "a man with a problem" to "a somatic master."'],
  ['Somatic Resonance', "Tuning into the partner's nervous system to regulate your own."],
  ['Erasing the Broken Narrative', 'CBST restructuring of the "defectiveness" schema.'],
  ['Radical Somatic Acceptance', 'Removing the resistance to physical sensations.'],
  ['The Abundance Mindset in Intimacy', 'Shifting from scarcity (rushing) to abundance (pacing).'],
  ['The Neurochemistry of Eye Contact', 'Utilizing ocular pathways to enforce parasympathetic dominance.'],
  ['Acoustic and Breath Overrides', 'Deploying the 4-7-8 protocol for acute system spikes.'],
  ['The Clinical Threshold', 'Acknowledging the empirical marker of habituation.'],
  ['Handling the Ghost of Adrenaline', 'Preparing for occasional, normal sympathetic spikes.'],
  ['The Architecture of Trust', 'Recognizing that autonomic regulation is built on self-trust.'],
  ['Climax as a Byproduct', 'Finalizing the shift away from goal-oriented intimacy.'],
  ['Owning the Narrative', 'Communicating your new baseline with total confidence.'],
  ['The Unclenched Man', 'Taking pelvic awareness beyond the bedroom.'],
  ['The Paradox of Control', 'Reaffirming that ultimate control is the willingness to surrender.'],
  ['The Executive Override', 'The power of the prefrontal cortex over the amygdala.'],
  ['The Final Audit', 'A moment of reflection on the journey.'],
  ['The Sovereign Man', 'Graduation and lifelong identity consolidation.'],
];

export const protocolData: ProtocolDay[] = DAYS.map(([title, focus], i) => {
  const day = i + 1;
  const phase = day <= 25 ? 1 : day <= 50 ? 2 : 3;
  return {
    day,
    phase,
    phaseTitle: PHASE_TITLES[phase],
    title,
    focus,
    audioFileName: `day_${day}.mp3`,
  };
});

/** Clamped lookup — out-of-range days resolve to the nearest valid day. */
export function getProtocolDay(day: number): ProtocolDay {
  const index = Math.max(1, Math.min(day, protocolData.length)) - 1;
  return protocolData[index];
}

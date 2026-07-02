import { AudioSource } from 'expo-audio';
import { getPhaseForDay } from '../context/ProtocolContext';

/**
 * Auditory Anchor manifest — deterministic, versioned content (CLAUDE.md §7).
 *
 * Every day of the 75-day protocol resolves to an authored audio track and
 * title here. Nothing the user hears is generated at runtime.
 *
 * Recording status: real anchor tracks are pending. Until each day's track is
 * recorded and registered in DAY_ANCHORS below, every day falls back to the
 * bundled placeholder tone so the daily loop remains fully testable.
 */

export interface AnchorTrack {
  title: string;
  source: AudioSource;
}

const PLACEHOLDER_SOURCE = require('../assets/audio/anchor_placeholder.wav');

// Register recorded tracks here as they're produced, e.g.:
//   1: { title: 'Arriving in the Body', source: require('../assets/audio/day01.m4a') },
const DAY_ANCHORS: Partial<Record<number, AnchorTrack>> = {};

// Phase-level fallback titles keep the session screen coherent before the
// full 75-track library exists.
const PHASE_FALLBACK_TITLES: Record<1 | 2 | 3, string> = {
  1: 'Grounding the Nervous System',
  2: 'Staying Present Under Intensity',
  3: 'Consolidating the New Baseline',
};

export function getAnchorForDay(day: number): AnchorTrack {
  const registered = DAY_ANCHORS[day];
  if (registered) return registered;

  const phase = getPhaseForDay(day);
  return {
    title: PHASE_FALLBACK_TITLES[phase.number],
    source: PLACEHOLDER_SOURCE,
  };
}

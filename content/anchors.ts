import { AudioSource } from 'expo-audio';
import { getProtocolDay } from './ProtocolData';

/**
 * Auditory Anchor resolver — joins the canonical protocol manifest
 * (ProtocolData.ts: titles, focus, phase) with playable audio sources.
 *
 * Metro requires static require() calls, so recordings are registered here
 * one line per day as they're produced (day_N per the audioFileName
 * convention in ProtocolData). Any unregistered day falls back to the bundled
 * placeholder tone so the daily loop never breaks mid-rollout.
 */

export interface AnchorTrack {
  title: string;
  focus: string;
  source: AudioSource;
}

const PLACEHOLDER_SOURCE = require('../assets/audio/anchor_placeholder.wav');

// Register recorded tracks here as they're produced, e.g.:
//   1: require('../assets/audio/day_1.mp3'),
const DAY_AUDIO: Partial<Record<number, AudioSource>> = {};

export function getAnchorForDay(day: number): AnchorTrack {
  const meta = getProtocolDay(day);
  return {
    title: meta.title,
    focus: meta.focus,
    source: DAY_AUDIO[day] ?? PLACEHOLDER_SOURCE,
  };
}

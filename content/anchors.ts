import { AudioSource } from 'expo-audio';
import { getProtocolDay } from './ProtocolData';

/**
 * Auditory Anchor resolver — joins the canonical protocol manifest
 * (ProtocolData.ts: titles, focus, phase) with playable audio sources.
 *
 * Metro requires static require() calls, so every day is registered
 * explicitly below (day_N per the audioFileName convention in ProtocolData).
 * All 75 recordings are produced and bundled (mono 64kbps — spoken voice,
 * re-encoded from the 128k ElevenLabs masters to halve binary weight); the
 * placeholder fallback remains as a safety net for any future content swap.
 */

export interface AnchorTrack {
  title: string;
  focus: string;
  source: AudioSource;
}

const PLACEHOLDER_SOURCE = require('../assets/audio/anchor_placeholder.wav');

const DAY_AUDIO: Partial<Record<number, AudioSource>> = {
  1: require('../assets/audio/day_1.mp3'),
  2: require('../assets/audio/day_2.mp3'),
  3: require('../assets/audio/day_3.mp3'),
  4: require('../assets/audio/day_4.mp3'),
  5: require('../assets/audio/day_5.mp3'),
  6: require('../assets/audio/day_6.mp3'),
  7: require('../assets/audio/day_7.mp3'),
  8: require('../assets/audio/day_8.mp3'),
  9: require('../assets/audio/day_9.mp3'),
  10: require('../assets/audio/day_10.mp3'),
  11: require('../assets/audio/day_11.mp3'),
  12: require('../assets/audio/day_12.mp3'),
  13: require('../assets/audio/day_13.mp3'),
  14: require('../assets/audio/day_14.mp3'),
  15: require('../assets/audio/day_15.mp3'),
  16: require('../assets/audio/day_16.mp3'),
  17: require('../assets/audio/day_17.mp3'),
  18: require('../assets/audio/day_18.mp3'),
  19: require('../assets/audio/day_19.mp3'),
  20: require('../assets/audio/day_20.mp3'),
  21: require('../assets/audio/day_21.mp3'),
  22: require('../assets/audio/day_22.mp3'),
  23: require('../assets/audio/day_23.mp3'),
  24: require('../assets/audio/day_24.mp3'),
  25: require('../assets/audio/day_25.mp3'),
  26: require('../assets/audio/day_26.mp3'),
  27: require('../assets/audio/day_27.mp3'),
  28: require('../assets/audio/day_28.mp3'),
  29: require('../assets/audio/day_29.mp3'),
  30: require('../assets/audio/day_30.mp3'),
  31: require('../assets/audio/day_31.mp3'),
  32: require('../assets/audio/day_32.mp3'),
  33: require('../assets/audio/day_33.mp3'),
  34: require('../assets/audio/day_34.mp3'),
  35: require('../assets/audio/day_35.mp3'),
  36: require('../assets/audio/day_36.mp3'),
  37: require('../assets/audio/day_37.mp3'),
  38: require('../assets/audio/day_38.mp3'),
  39: require('../assets/audio/day_39.mp3'),
  40: require('../assets/audio/day_40.mp3'),
  41: require('../assets/audio/day_41.mp3'),
  42: require('../assets/audio/day_42.mp3'),
  43: require('../assets/audio/day_43.mp3'),
  44: require('../assets/audio/day_44.mp3'),
  45: require('../assets/audio/day_45.mp3'),
  46: require('../assets/audio/day_46.mp3'),
  47: require('../assets/audio/day_47.mp3'),
  48: require('../assets/audio/day_48.mp3'),
  49: require('../assets/audio/day_49.mp3'),
  50: require('../assets/audio/day_50.mp3'),
  51: require('../assets/audio/day_51.mp3'),
  52: require('../assets/audio/day_52.mp3'),
  53: require('../assets/audio/day_53.mp3'),
  54: require('../assets/audio/day_54.mp3'),
  55: require('../assets/audio/day_55.mp3'),
  56: require('../assets/audio/day_56.mp3'),
  57: require('../assets/audio/day_57.mp3'),
  58: require('../assets/audio/day_58.mp3'),
  59: require('../assets/audio/day_59.mp3'),
  60: require('../assets/audio/day_60.mp3'),
  61: require('../assets/audio/day_61.mp3'),
  62: require('../assets/audio/day_62.mp3'),
  63: require('../assets/audio/day_63.mp3'),
  64: require('../assets/audio/day_64.mp3'),
  65: require('../assets/audio/day_65.mp3'),
  66: require('../assets/audio/day_66.mp3'),
  67: require('../assets/audio/day_67.mp3'),
  68: require('../assets/audio/day_68.mp3'),
  69: require('../assets/audio/day_69.mp3'),
  70: require('../assets/audio/day_70.mp3'),
  71: require('../assets/audio/day_71.mp3'),
  72: require('../assets/audio/day_72.mp3'),
  73: require('../assets/audio/day_73.mp3'),
  74: require('../assets/audio/day_74.mp3'),
  75: require('../assets/audio/day_75.mp3'),
};

export function getAnchorForDay(day: number): AnchorTrack {
  const meta = getProtocolDay(day);
  return {
    title: meta.title,
    focus: meta.focus,
    source: DAY_AUDIO[day] ?? PLACEHOLDER_SOURCE,
  };
}

// Sound identity — Craft Layer Addendum §5. The entire vocabulary:
//   AUDIO LOGO  (1.2s resolving two-note swell) — session start, nowhere else
//   SESSION END (single resolved chord, 3s decay) — completion register
// Silence everywhere else: no UI tap sounds, nothing under question screens,
// nothing that could identify the app in a room.
//
// THE ASSETS DO NOT EXIST YET (founder to source/commission). This module is
// the registry + playback seam: when the files land in assets/sound/, add
// them to REGISTRY below and the session integration points
// (app/session.tsx: session start / session complete) go live — every call
// here is a silent no-op until then.

import { createAudioPlayer } from 'expo-audio';

const REGISTRY: { audioLogo?: number; sessionEnd?: number } = {
  // audioLogo: require('../assets/sound/audio-logo.m4a'),
  // sessionEnd: require('../assets/sound/session-end.m4a'),
};

function play(asset?: number): void {
  if (!asset) return;
  try {
    const player = createAudioPlayer(asset);
    player.play();
  } catch {
    // A missing chord must never interrupt a session.
  }
}

/** "We begin." Plays at session start only. */
export function playAudioLogo(): void {
  play(REGISTRY.audioLogo);
}

/** Quiet pride. Plays once at session completion. */
export function playSessionEnd(): void {
  play(REGISTRY.sessionEnd);
}

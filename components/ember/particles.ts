// The Ember's particle field — deterministic, seeded, plain-number data so it
// crosses the worklet boundary cheaply (Addendum §1, §7). The drift math
// lives in Ember.tsx worklets; this module only shapes the field.

export interface ParticleField {
  count: number;
  /** Normalized orbit radius 0..1 (center-weighted). */
  baseRadius: number[];
  /** Starting angle, radians. */
  baseAngle: number[];
  /** Orbit speed, radians/sec (signed — both directions). */
  angSpeed: number[];
  /** Drift (pseudo-Perlin) amplitudes and phases. */
  noiseAmp: number[];
  noiseF1: number[];
  noiseF2: number[];
  noiseP1: number[];
  noiseP2: number[];
  /** 0 = bright sand core, 1 = copper, 2 = deep copper. */
  colorBucket: number[];
  /** Point size bucket multiplier. */
  size: number[];
}

/** Deterministic LCG so the field is identical across mounts and builds. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function createField(count: number, seed = 7): ParticleField {
  const rnd = lcg(seed);
  const f: ParticleField = {
    count,
    baseRadius: [],
    baseAngle: [],
    angSpeed: [],
    noiseAmp: [],
    noiseF1: [],
    noiseF2: [],
    noiseP1: [],
    noiseP2: [],
    colorBucket: [],
    size: [],
  };
  for (let i = 0; i < count; i++) {
    // sqrt bias fills the disc evenly; squaring one term center-weights it
    // so coherence reads as a core, not a ring.
    const r = Math.sqrt(rnd()) * (0.55 + 0.45 * rnd());
    f.baseRadius.push(r);
    f.baseAngle.push(rnd() * Math.PI * 2);
    f.angSpeed.push((rnd() * 0.22 + 0.05) * (rnd() < 0.5 ? -1 : 1));
    f.noiseAmp.push(0.02 + rnd() * 0.06);
    f.noiseF1.push(0.3 + rnd() * 0.7);
    f.noiseF2.push(0.3 + rnd() * 0.7);
    f.noiseP1.push(rnd() * Math.PI * 2);
    f.noiseP2.push(rnd() * Math.PI * 2);
    const c = rnd();
    f.colorBucket.push(c < 0.3 ? 0 : c < 0.78 ? 1 : 2);
    f.size.push(rnd() < 0.18 ? 1.6 : rnd() < 0.6 ? 1.0 : 0.7);
  }
  return f;
}

/**
 * Assembly targets (Generating → Map): the field re-forms into a horizontal
 * gauge line with a dense cluster at the user's score — the diagnosis is
 * literally built from him. Normalized to the canvas (0..1 both axes).
 */
export function gaugeTargets(
  count: number,
  scorePct: number,
  seed = 11,
): { x: number[]; y: number[] } {
  const rnd = lcg(seed);
  const x: number[] = [];
  const y: number[] = [];
  const clusterX = 0.06 + (scorePct / 100) * 0.88;
  for (let i = 0; i < count; i++) {
    if (i % 3 === 0) {
      // The marker cluster — the user, glowing on his own gauge.
      x.push(clusterX + (rnd() - 0.5) * 0.045);
      y.push(0.5 + (rnd() - 0.5) * 0.34);
    } else {
      // The line itself, thinning toward the ends.
      const t = rnd();
      x.push(0.05 + t * 0.9);
      y.push(0.5 + (rnd() - 0.5) * 0.1);
    }
  }
  return { x, y };
}

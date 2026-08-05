// The Somatic Release pose library (founder feature ruling 2026-08-05,
// walkthrough build: "Stage 4 should assign the pose, not ask — and there
// should be many more than three").
//
// Ten down-training positions, each with an authored line-figure diagram
// (assets/poses/, generated offline as versioned assets — §7 bans runtime
// generation, not AI-assisted asset production). The daily pose is ASSIGNED
// by a deterministic, phase-aware rotation: variety without a decision
// (Hick's Law — the old three-way chooser was a nightly decision tax).
//
// Clinical guardrails encoded here:
// - Phase gating: the gentlest six carry Phase 1; the deeper hip openers
//   (squat, frog, lunge, puppy) enter at Day 26 on the foundation Phase 1
//   builds. Sequencing is pacing, not a lock.
// - The invariant is never the pose — it is 90 seconds of unforced breath
//   (TARGET_SECONDS lives in the component). The pose is the container.
// - The escape hatch ("Different position tonight") ADVANCES the rotation;
//   it never opens a menu. One tap, next pose, done.
// - The rotation order deliberately alternates supine and kneeling
//   families so consecutive days feel different in the body.

export interface ReleasePose {
  id: string;
  name: string;
  /** Setup in one or two sentences — register: calm authority, gravity
   *  does the work, nothing forced. */
  how: string;
  /** One line: what the stretch does for the floor (founder markup
   *  2026-08-05 — purpose on screen, compactly). */
  why: string;
  /** One line: what he should expect to feel, and where. Expectation-setting
   *  prevents both alarm ("is this wrong?") and forcing ("should I push?"). */
  feel: string;
  /** Earliest phase this pose is assigned (1 = Day 1, 2 = Day 26+). */
  minPhase: 1 | 2;
  /** Bundled line-figure diagram (1:1, Deepwater ground). */
  image: number;
}

export const RELEASE_POSES: ReleasePose[] = [
  {
    id: 'happy-baby',
    name: 'Happy Baby',
    how: 'On your back, knees drawn wide toward your armpits, hands on shins or feet. Low back stays heavy on the floor.',
    why: 'Puts the floor above the hips, so gravity does the releasing.',
    feel: 'A soft spread through the inner thighs and low back.',
    minPhase: 1,
    image: require('../assets/poses/happy_baby.png'),
  },
  {
    id: 'deep-squat',
    name: 'Deep Squat',
    how: 'Feet flat and wide, sink your hips below your knees. Hold something stable if you need it. Spine long, weight settled.',
    why: 'The deepest natural opening of the pelvic outlet.',
    feel: 'Weight settling; stretch across hips, groin, and ankles.',
    minPhase: 2,
    image: require('../assets/poses/deep_squat.png'),
  },
  {
    id: 'child-pose',
    name: 'Wide-Knee Child’s Pose',
    how: 'Kneel with knees wide, big toes touching. Chest sinks toward the floor, arms long in front, forehead down. The weight settles back into the hips.',
    why: 'Lengthens the back line the floor braces against.',
    feel: 'The low back widening a little with each breath.',
    minPhase: 1,
    image: require('../assets/poses/child_pose.png'),
  },
  {
    id: 'frog',
    name: 'Frog Stretch',
    how: 'On all fours, knees wide, feet in line with knees, forearms down. Let gravity do the widening — nothing forced.',
    why: 'Targets the inner-thigh line that pulls the floor tight.',
    feel: 'A strong inner-thigh stretch; the back stays quiet.',
    minPhase: 2,
    image: require('../assets/poses/frog.png'),
  },
  {
    id: 'butterfly',
    name: 'Supine Butterfly',
    how: 'On your back, soles of the feet together, knees fallen open wide. Arms rest at your sides. Let the legs be heavy — gravity does the opening.',
    why: 'Zero-effort opening — the weight of the legs does the work.',
    feel: 'A slow melt along the inner thighs.',
    minPhase: 1,
    image: require('../assets/poses/butterfly.png'),
  },
  {
    id: 'low-lunge',
    name: 'Low Lunge',
    how: 'One foot forward and flat, back knee resting on the floor. Hips sink gently forward and down. Torso tall, hands on the front knee. Switch sides at halfway.',
    why: 'Releases the hip flexors that are wired into the floor.',
    feel: 'A deep line from the front of the hip into the thigh.',
    minPhase: 2,
    image: require('../assets/poses/low_lunge.png'),
  },
  {
    id: 'figure-four',
    name: 'Figure-4',
    how: 'On your back, one ankle crossed over the opposite knee. Hands behind the supported thigh, draw it gently in. Switch sides at halfway.',
    why: 'Frees the deep rotators behind the pelvis.',
    feel: 'A focused stretch deep in the glute.',
    minPhase: 1,
    image: require('../assets/poses/figure_four.png'),
  },
  {
    id: 'puppy',
    name: 'Puppy Pose',
    how: 'From kneeling, walk the arms far forward — hips stay high over the knees, chest melts down, forehead rests on the floor.',
    why: 'Opens the chest and lengthens the spine, unloading the basin.',
    feel: 'The breath dropping lower than it usually does.',
    minPhase: 2,
    image: require('../assets/poses/puppy.png'),
  },
  {
    id: 'knees-chest',
    name: 'Knees to Chest',
    how: 'On your back, both knees drawn gently into the chest, arms around the shins. The low back spreads into the floor.',
    why: 'Settles the low back and tips the floor open.',
    feel: 'Gentle pressure and warmth through the low back.',
    minPhase: 1,
    image: require('../assets/poses/knees_chest.png'),
  },
  {
    id: 'legs-wall',
    name: 'Legs Up the Wall',
    how: 'Lie on your back, legs straight up a wall, arms at your sides. Nothing to hold, nothing to do — the wall works, you breathe.',
    why: 'Down-shifts the whole system; the floor follows.',
    feel: 'Heaviness, a slowing pulse, the legs draining.',
    minPhase: 1,
    image: require('../assets/poses/legs_wall.png'),
  },
];

/** Poses eligible on a given protocol day (phase-aware). Array order is the
 *  rotation order — deliberately interleaved supine/kneeling. */
export function posesForDay(day: number): ReleasePose[] {
  const phase = day >= 26 ? 2 : 1;
  return RELEASE_POSES.filter((p) => p.minPhase <= phase);
}

/**
 * Tonight's assigned pose — deterministic (same day → same pose), advanced
 * by `swapOffset` when he taps "Different position tonight." The modulo is
 * double-wrapped so any integer offset is safe.
 */
export function poseForDay(day: number, swapOffset = 0): ReleasePose {
  const eligible = posesForDay(day);
  const index = (((day - 1 + swapOffset) % eligible.length) + eligible.length) % eligible.length;
  return eligible[index];
}

/** LocalStore key for tonight's swap offset — `{ day, offset }`. Persisted
 *  so an interrupted session resumes on the same pose he swapped to; a new
 *  day ignores yesterday's offset. */
export const POSE_SWAP_KEY = '@release_pose_swap';

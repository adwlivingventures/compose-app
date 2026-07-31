import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import BreathingPiston from './BreathingPiston';

/**
 * Day 1 Somatic Primer — un-skippable 3-step module shown once, immediately
 * before the first daily session.
 *
 * Why it exists, and why it gates Day 1: the conditioning track cues
 * "soften" on every inhale, and the Day 3 anchor (The Pelvic Drop) builds on
 * reverse-kegel mechanics — but a man arriving from internet advice has the
 * opposite motor pattern trained (clench = control). Without this primer the
 * app's central physical cue reads as noise, or worse, he kegels through the
 * release work and reinforces the hypertonicity we're down-training. Teaching
 * the motor skill before the first rep is what makes every subsequent rep
 * count (basal ganglia consolidate whichever pattern actually fires).
 *
 * Un-skippable means the session is unreachable until all three steps are
 * acknowledged — the X still exits to the dashboard; we gate the work, we
 * don't trap the user.
 *
 * Breath timings in the copy (4s in / 6s out) mirror CONDITIONING_PHASES —
 * the primer describes exactly the cycle the orb will pace ninety seconds
 * from now.
 */

interface PrimerStep {
  headline: string;
  body: string;
  subBody: string;
  /** Animated piston diagram between body and subBody (step 2). */
  diagram?: boolean;
  /** Error-correction note — the most common wrong rep, named. */
  correction?: string;
}

const PRIMER_STEPS: PrimerStep[] = [
  {
    headline: 'The Kegel Trap',
    body:
      'Most internet advice tells you to clench your pelvic floor (Kegels). For many men ' +
      'with premature ejaculation or performance ED, the pelvic floor is already too tight ' +
      '(Hypertonic).',
    subBody:
      'Clenching acts like a coiled spring—the moment you get excited, it snaps, causing ' +
      "rapid finishing or cutting off blood flow. We are going to teach you the opposite: " +
      "How to 'Drop the Floor.'",
  },
  {
    headline: 'The Somatic Drop',
    body:
      'Think of your torso as a cylinder. As you take a deep 4-second inhale, push your ' +
      'belly out. Feel your diaphragm drop.',
    subBody:
      'As this happens, consciously push your pelvic floor down and away (similar to the ' +
      'feeling of releasing your bladder). This is the Reverse Kegel. On the 6-second ' +
      'exhale, do not clench—just let it naturally recoil.',
    diagram: true,
    correction:
      'If your abs brace or your glutes squeeze, you clenched. Soften, and let the breath ' +
      'do the pushing.',
  },
  {
    headline: 'The Towel Test',
    body:
      'Lie on your back in private. Place two fingers gently on the perineum (the space ' +
      'between the scrotum and anus). Take a deep belly breath and push down.',
    subBody:
      'If you feel the muscle bulge outward against your fingers, you have successfully ' +
      'executed the Somatic Drop. You are now working directly with your autonomic nervous ' +
      'system.',
  },
];

interface SomaticPrimerProps {
  /** All three steps acknowledged — persist the flag and reveal the session. */
  onComplete: () => void;
  /** Leave without completing (back to dashboard). The gate stays armed. */
  onExit: () => void;
  /**
   * Re-reading from the You tab rather than gating Day 1 — same content,
   * reference framing (no "Acknowledge" language, nothing to arm).
   */
  refresher?: boolean;
}

export default function SomaticPrimer({ onComplete, onExit, refresher = false }: SomaticPrimerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLast = currentStep === PRIMER_STEPS.length - 1;
  const step = PRIMER_STEPS[currentStep];

  const advance = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <View className="flex-1 bg-ground px-7 pt-16 pb-9">
      {/* Progress dashes — same orientation language as the session's stage
          dots; forward-only, not tappable. */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          {PRIMER_STEPS.map((s, i) => (
            <View
              key={s.headline}
              className={`h-1.5 rounded-full ${
                i < currentStep
                  ? 'bg-accent w-4'
                  : i === currentStep
                  ? 'bg-accent w-8'
                  : 'bg-surface-deep w-4'
              }`}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.7}
          className="bg-surface border border-line rounded-full p-2.5"
        >
          <X color="#6E8090" size={18} />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-4">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          {refresher ? 'Technique · Somatic Primer' : 'Day 1 · Somatic Primer'}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <View className="bg-surface border border-line rounded-[18px] p-6">
          <Text className="text-dim text-[11px] font-semibold tracking-[0.14em] uppercase">
            Step {currentStep + 1} of {PRIMER_STEPS.length}
          </Text>
          <Text className="text-ink text-[26px] font-serif-light mt-3">{step.headline}</Text>
          <Text className="text-body text-[15px] leading-6 mt-4">{step.body}</Text>
          {step.diagram && (
            <View className="mt-2">
              <BreathingPiston />
            </View>
          )}
          <Text className="text-muted text-[13.5px] leading-5 mt-4">{step.subBody}</Text>
          {/* Deepwater ROLE: the correction is caution-content, not an action
              or progress — it absorbs (matte spine, body ink). Aqua here is
              the progress dashes and the CTA only. */}
          {step.correction && (
            <View className="border-l-2 border-l-radio pl-3 mt-4">
              <Text className="text-body text-[13px] leading-5">{step.correction}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={advance}
        activeOpacity={0.85}
        className="bg-accent rounded-2xl py-[19px] items-center"
      >
        <Text className="text-on-accent font-bold text-base">
          {isLast ? (refresher ? 'Done' : 'Acknowledge & Complete') : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

import React, { useRef, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BreathingOrb, { CONDITIONING_PHASES } from './BreathingOrb';
import { conditioningProtocolForDay } from '../content/conditioning';
import { focusForDay } from '../content/dailyFocus';

/**
 * Physical Conditioning Track (CLAUDE.md §5, item 2) — E10 orb variant,
 * phase-progressive since founder review 2026-07-12.
 *
 * The clinical base never changes: soften/drop on the inhale, recoil on the
 * exhale, 4s/6s carried by the orb. What progresses is the work inside the
 * rhythm (content/conditioning.ts): Phase 2 inserts held drops (the
 * arousal-plateau rep — sustained openness under charge, the somatic
 * skeleton of stop-start control); Phase 3 fades the text cues partway in
 * (basal-ganglia handover made literal — by Day 75 the skill runs without
 * instructions, because intimacy has none).
 *
 * Why progression matters commercially: an identical sequence 75 times
 * invites hedonic adaptation — the reward-prediction error decays and the
 * session starts reading as a treadmill. A protocol that visibly deepens by
 * phase makes a flat control score legible as improvement (the thing being
 * scored got harder) and gives the analytics a true story to tell.
 *
 * Founder review 2026-07-10 (retained): correctness of the rep is
 * everything — the pre-start state shows the two-cue technique recap + the
 * most common error, with a one-tap path to the full Somatic Primer.
 */

interface ConditioningTrackProps {
  /** Protocol day — selects the phase protocol (content/conditioning.ts). */
  day: number;
  onComplete: (/* rep count is fixed per protocol; completion carries no data */) => void;
}

type HoldState = { cue: string; cyclesLeft: number } | null;

export default function ConditioningTrack({ day, onComplete }: ConditioningTrackProps) {
  const router = useRouter();
  const protocol = conditioningProtocolForDay(day);

  const runningRef = useRef(false);
  const completedRef = useRef(false);
  const repRef = useRef(0);
  const holdRef = useRef<HoldState>(null);
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [rep, setRep] = useState(0);
  const [hold, setHold] = useState<HoldState>(null);

  const setHoldBoth = (h: HoldState) => {
    holdRef.current = h;
    setHold(h);
  };

  const onPhaseStart = (index: number) => {
    setPhaseIndex(index);
    // Counting (and hold ticking) advances only at the top of an inhale.
    if (index !== 0 || !runningRef.current || completedRef.current) return;

    // Inside a held drop: the orb keeps breathing, the count waits.
    if (holdRef.current) {
      const cyclesLeft = holdRef.current.cyclesLeft - 1;
      setHoldBoth(cyclesLeft > 0 ? { ...holdRef.current, cyclesLeft } : null);
      return;
    }

    if (repRef.current >= protocol.totalReps) {
      completedRef.current = true;
      runningRef.current = false;
      onComplete();
      return;
    }
    repRef.current += 1;
    setRep(repRef.current);

    // A hold scheduled after this rep begins on the next inhale.
    const nextHold = protocol.holds.find((h) => h.afterRep === repRef.current);
    if (nextHold) setHoldBoth({ cue: nextHold.cue, cyclesLeft: nextHold.cycles });
  };

  const begin = () => {
    setStarted(true);
    runningRef.current = true;
  };

  const inhaling = phaseIndex === 0;
  const cuesFaded =
    protocol.cueFadeAfterRep !== undefined && rep > protocol.cueFadeAfterRep && !hold;

  // Running line priority: held drop > faded minimal cue > full breath cue.
  const runningLine = hold
    ? hold.cue
    : cuesFaded
    ? protocol.fadedCue ?? ''
    : inhaling
    ? protocol.cueInhale
    : protocol.cueExhale;

  const orbLabel = hold ? 'Hold' : cuesFaded ? '·' : inhaling ? 'Soften' : 'Engage';

  const body = (
    <>
      <BreathingOrb
        phases={CONDITIONING_PHASES}
        size={280}
        glowSize={260}
        innerSize={180}
        onPhaseStart={onPhaseStart}
        haptics={started}
        announcements={[protocol.cueInhale, protocol.cueExhale]}
      >
        <Text className="text-accent-soft text-[13px] font-bold uppercase tracking-[0.22em]">
          {orbLabel}
        </Text>
      </BreathingOrb>

      <Text className="text-ink text-[16px] font-semibold mt-4 h-6 text-center">
        {!started ? `Conditioning · ${protocol.name}` : runningLine}
      </Text>
      <Text className="text-muted text-[12.5px] mt-1 h-5">
        {!started
          ? protocol.intro
          : rep === 0
          ? 'Your count begins on the next inhale.'
          : hold
          ? 'The count waits. The breath continues.'
          : `breath ${rep} of ${protocol.totalReps}`}
      </Text>

      {started ? (
        <View className="w-full mt-6">
          <View className="h-[3px] bg-line-soft rounded-full overflow-hidden">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${Math.min((rep / protocol.totalReps) * 100, 100)}%` }}
            />
          </View>
        </View>
      ) : (
        <>
          {/* Today's Focus (2026-08-05, founder walkthrough build): the
              variety layer. The rep NEVER varies — the 4/6 drop is motor
              learning and must be identical all 75 nights. What varies is
              the LENS: one authored line per day (content/dailyFocus.ts)
              that changes what he attends to during the same reps. A
              different session every night; the identical reflex every
              night. Hedonic adaptation solved without touching the
              instrument. */}
          <View className="w-full bg-surface-deep border border-line-soft border-l-2 border-l-accent/60 rounded-xl px-4 py-3 mt-4">
            <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
              Today’s focus
            </Text>
            <Text className="text-ink text-[13.5px] leading-5 mt-1 font-serif-italic">
              {focusForDay(day)}
            </Text>
          </View>

          {/* The technique, compressed to its two cues + the one common error. */}
          <View className="w-full bg-surface border border-line rounded-2xl p-4 mt-4">
            <View className="gap-2">
              {/* Founder batch 2026-07-15: the breath given a route to
                  follow — imagery makes the drop findable for a man who
                  can't yet feel his floor. His "energy" framing rendered
                  as warmth/charge (premium-calm tone, §8.4). */}
              <View className="flex-row gap-2.5">
                <Text className="text-accent text-xs font-bold mt-0.5">IN</Text>
                <Text className="text-body text-[13px] leading-5 flex-1">
                  Through the nose. Follow the breath down: chest, stomach, pelvis. It softens
                  everything it passes and opens the floor, like releasing your bladder.
                </Text>
              </View>
              <View className="flex-row gap-2.5">
                <Text className="text-accent text-xs font-bold mt-0.5">OUT</Text>
                <Text className="text-body text-[13px] leading-5 flex-1">
                  Through the mouth. Let the floor recoil on its own while the warmth travels
                  back up your spine, over the crown of your head. Nothing clenches.
                </Text>
              </View>
            </View>
            <View className="border-l-2 border-l-accent/50 pl-3 mt-3">
              <Text className="text-accent-soft text-xs leading-4">
                If your abs brace or glutes squeeze, you clenched — soften and let the breath do
                the pushing.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/technique')}
              activeOpacity={0.7}
              className="mt-3 self-start"
              accessibilityRole="button"
              accessibilityLabel="Review the full technique with the diagram"
            >
              <Text className="text-accent text-xs font-bold">
                Not sure you have it? Review the full technique →
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={begin}
            activeOpacity={0.85}
            className="bg-accent rounded-xl py-3.5 px-10 mt-5"
          >
            <Text className="text-on-accent font-bold text-sm">Begin</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  // Pre-start, this stage stacks orb + focus card + technique card + CTA and
  // can exceed the viewport (founder bug report 2026-08-05: Begin overlapped
  // the persistent Steady-me row) — so the un-started state scrolls, with
  // bottom clearance for the SOS row. Once running, content is short and the
  // layout stays fixed so the orb never drifts mid-breath.
  if (!started) {
    return (
      <ScrollView
        className="w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 110 }}
      >
        {body}
      </ScrollView>
    );
  }
  return <View className="items-center w-full">{body}</View>;
}

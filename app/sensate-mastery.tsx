import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Sensate Mastery — maintenance-tier lesson module (Mastery Suite, Day 76+).
 *
 * Tap-through card engine with a somatic checkpoint at the end. The quiz is
 * not assessment theater: retrieving the correct response ("drop and
 * anchor") once, cognitively, measurably improves the odds of executing it
 * under autonomic load later (retrieval practice beats re-reading). A wrong
 * pick gets a corrective line and another attempt, never a failure state —
 * red-pen energy is sympathetic activation, the opposite of the register.
 *
 * The lesson progress bar is deliberate despite the "no progress bars"
 * instinct elsewhere: PROTOCOL progress bars trigger evaluation anxiety
 * (they measure the self); a LESSON bar measures the content and tells the
 * user the commitment is small and finite. Known length lowers arousal.
 */

// LayoutAnimation needs an explicit opt-in on old-architecture Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LessonStep {
  title: string;
  body: string;
  buttonText: string;
  quiz?: {
    options: string[];
    correctIndex: number;
    /** Shown under the options after a wrong pick — corrective, not punitive. */
    nudge: string;
  };
}

const LESSON_STEPS: LessonStep[] = [
  {
    title: 'The Performance Myth',
    body:
      'Most men believe that being a great partner means performing like a machine. ' +
      "Neurobiology tells a different story. True physical connection isn't about speed or " +
      'mechanics—it is about Polyvagal Co-regulation.',
    buttonText: 'Understand Co-regulation',
  },
  {
    title: 'The Anxiety Transfer',
    body:
      "When your sympathetic nervous system spikes (adrenaline), your partner's body " +
      'subconsciously detects your shallow breathing and muscle tension. She absorbs that ' +
      "anxiety. To elevate the experience, you don't speed up. You drop the baseline.",
    buttonText: 'Next',
  },
  {
    title: 'The Waveform',
    body:
      'Arousal is not a straight line; it is a waveform. It builds, peaks, and naturally ' +
      'recedes. When it recedes, men panic and clench their pelvic floor. Instead, ride ' +
      'the dip. Let the wave pull back, and simply focus on the physical sensation of the ' +
      'sheets or the room temperature.',
    buttonText: 'Got it',
  },
  {
    title: 'Somatic Checkpoint',
    body:
      'When you feel the arousal waveform naturally recede during intimacy, what is the ' +
      'correct autonomic response?',
    buttonText: 'Complete Module',
    quiz: {
      options: [
        'Increase physical speed to force it back.',
        'Drop the pelvic floor and anchor to a physical sensation.',
      ],
      correctIndex: 1,
      nudge:
        "Forcing it back is the sympathetic reflex we're retraining — speed feeds the " +
        'spike. Try again.',
    },
  },
];

function animate() {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
}

export default function SensateMasteryScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const step = LESSON_STEPS[currentStep];
  const isLast = currentStep === LESSON_STEPS.length - 1;
  const answeredCorrectly = step.quiz ? picked === step.quiz.correctIndex : true;
  const wrongPick = step.quiz && picked !== null && !answeredCorrectly;

  const advance = () => {
    if (isLast) {
      router.back();
      return;
    }
    animate();
    setPicked(null);
    setCurrentStep((s) => s + 1);
  };

  const pick = (index: number) => {
    animate();
    setPicked(index);
  };

  return (
    <View className="flex-1 bg-ground px-7 pt-14 pb-9">
      {/* Lesson progress — content length, not self-measurement */}
      <View className="h-[3px] w-full bg-line-soft rounded-full overflow-hidden">
        <View
          className="h-full bg-accent rounded-full"
          style={{ width: `${((currentStep + 1) / LESSON_STEPS.length) * 100}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={16} color="#8A8378" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-dim text-[11px] font-semibold uppercase tracking-[0.2em]">
          Sensate Mastery
        </Text>
      </View>

      {/* Borderless, typography-led — hierarchy from serif scale, not boxes */}
      <View className="flex-1 justify-center">
        <Text className="text-ink text-[27px] font-serif-light leading-9">{step.title}</Text>
        <Text className="text-body text-[15.5px] leading-[25px] mt-5">{step.body}</Text>

        {step.quiz && (
          <View className="gap-[11px] mt-7">
            {step.quiz.options.map((option, i) => {
              const isPicked = picked === i;
              const isCorrectPick = isPicked && i === step.quiz!.correctIndex;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => pick(i)}
                  activeOpacity={0.8}
                  className={`rounded-[14px] border px-[18px] py-[17px] ${
                    isCorrectPick
                      ? 'bg-accent/10 border-accent/50'
                      : isPicked
                      ? 'bg-surface border-faint'
                      : 'bg-surface border-line'
                  }`}
                >
                  <Text
                    className={`text-[15px] leading-5 ${
                      isCorrectPick ? 'text-accent-soft' : 'text-body'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {wrongPick && (
              <Text className="text-muted text-[13px] leading-5 mt-1">{step.quiz.nudge}</Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={advance}
        disabled={!answeredCorrectly}
        activeOpacity={0.85}
        className={`rounded-2xl py-[19px] items-center ${
          answeredCorrectly ? 'bg-accent' : 'bg-surface-deep'
        }`}
      >
        <Text
          className={`font-bold text-base ${answeredCorrectly ? 'text-on-accent' : 'text-faint'}`}
        >
          {step.buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

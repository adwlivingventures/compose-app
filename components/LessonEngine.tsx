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
import { Lesson } from '../content/lessons';

/**
 * LessonEngine — the shared tap-through card engine for maintenance-tier
 * lessons (content lives in content/lessons.ts; routed via app/lesson/[id]).
 * Extracted from the original sensate-mastery screen.
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

function animate() {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
}

export default function LessonEngine({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const step = lesson.steps[currentStep];
  const isLast = currentStep === lesson.steps.length - 1;
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
          style={{ width: `${((currentStep + 1) / lesson.steps.length) * 100}%` }}
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
          {lesson.title}
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

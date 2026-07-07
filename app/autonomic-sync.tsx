import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Autonomic Sync Preview — the one unlocked Mastery Suite module (Phase IV
 * teaser). Two beats: a 3-card lesson, then a scripted Copilot simulation.
 *
 * The simulation is deterministic end-to-end (§7): every scenario routes to
 * the same authored response, exactly like the Thought Restructurer. The
 * chat framing is presentation, not generation — which is also why it can
 * respond "instantly": there is nothing to wait for. Free-preview logic:
 * giving away the single most shareable technique (the Vagus Sync) makes
 * the locked tier concrete — the user extrapolates the other three modules
 * from the one he can feel.
 */

// LayoutAnimation needs an explicit opt-in on old-architecture Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Cards 1–2 are deliberately hook-depth: the full mechanics (the anxiety
// transfer, the waveform, the dip, the checkpoint) are Sensate Mastery's
// content in the paid tier, and a preview that serves the meal kills the
// Day-76 appetite it exists to create. Each card names what the full
// module adds; only card 3 (the Vagus Sync) is given away whole.
const LESSON_CARDS: { title: string; body: string; cta: string }[] = [
  {
    title: 'The Polyvagal Secret',
    body:
      'Most men believe being a great partner means performing like a machine. Neurobiology ' +
      'tells a different story: the highest level of physical connection is Polyvagal ' +
      'Co-regulation — two nervous systems syncing. Sensate Mastery unpacks the full ' +
      'mechanics after Day 75. What follows here is the one move you can take tonight.',
    cta: 'Next',
  },
  {
    title: 'The Anxiety Transfer',
    body:
      "One thing to know for now: your partner's body reads your breathing and your muscle " +
      'tension, and absorbs what it finds there. The complete down-shift — the arousal ' +
      'waveform, riding the dip, the somatic checkpoint — lives in Sensate Mastery. The ' +
      'opening move is next.',
    cta: 'Next',
  },
  {
    title: 'The 3-Second Vagus Sync',
    body:
      'Next time you are intimate, press your chest against hers. For 60 seconds, do not ' +
      'move. Inhale deeply for 4 seconds, feeling your chest expand against hers. Exhale ' +
      'for 6 seconds, dropping your pelvic floor. Within a few breaths, her heart rate ' +
      'begins to sync with yours, and the adrenaline loop loses its grip. You are now ' +
      'anchoring the room.',
    cta: 'Test the Copilot',
  },
];

const COPILOT_INTRO =
  "Let's test this in a real scenario. The Somatic Copilot helps you navigate bedroom " +
  'roadblocks in real time. Choose a scenario you’ve experienced:';

const SCENARIOS = [
  'I lost my erection while trying to put on a condom.',
  'I felt myself getting too close to the finish line too fast.',
  'My mind started racing about work during intimacy.',
];

// One authored response for every scenario — deterministic by design (§7).
const RESPONSE_DIAGNOSIS =
  'This is a classic sympathetic spike. The moment you shifted focus to a mechanical task ' +
  'or outside thought, your brain evaluated your performance, spiked your adrenaline, and ' +
  'constricted blood flow.';
const RESPONSE_REFRAME =
  ' Do not apologize. Apologizing reinforces shame. Say this exact script out loud right ' +
  "now: 'My body is feeling highly excited, so my system just hit the brakes. Let's lay " +
  "here for a minute and just focus on breathing together.' You have now removed the " +
  'pressure, stopped the spectatoring, and initiated the Autonomic Sync.';

function animate() {
  LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
}

// Left-aligned Copilot bubble; asymmetric corner per chat convention.
function CopilotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-surface border border-line rounded-[16px] rounded-bl-[4px] p-4 mr-10">
      <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">
        Somatic Copilot
      </Text>
      {children}
    </View>
  );
}

export default function AutonomicSyncPreviewScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-2 = lesson cards, 3 = copilot
  const [scenario, setScenario] = useState<string | null>(null);

  const inLesson = step < LESSON_CARDS.length;
  const card = LESSON_CARDS[Math.min(step, LESSON_CARDS.length - 1)];

  const advance = () => {
    animate();
    setStep((s) => s + 1);
  };

  const pickScenario = (option: string) => {
    animate();
    setScenario(option);
  };

  return (
    <View className="flex-1 bg-ground px-7 pt-14 pb-9">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={16} color="#8A8378" />
          <Text className="text-muted text-xs font-semibold">Back</Text>
        </TouchableOpacity>
        {inLesson && (
          <View className="flex-row items-center gap-1.5">
            {LESSON_CARDS.map((c, i) => (
              <View
                key={c.title}
                className={`h-1.5 rounded-full ${
                  i < step ? 'bg-accent w-4' : i === step ? 'bg-accent w-8' : 'bg-surface-deep w-4'
                }`}
              />
            ))}
          </View>
        )}
      </View>

      <View className="items-center mt-4">
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          Mastery Suite · Preview
        </Text>
      </View>

      {inLesson ? (
        <>
          <View className="flex-1 justify-center">
            <View className="bg-surface border border-line rounded-[18px] p-6">
              <Text className="text-ink text-[26px] font-serif-light">{card.title}</Text>
              <Text className="text-body text-[15px] leading-6 mt-4">{card.body}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={advance}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-[19px] items-center"
          >
            <Text className="text-on-accent font-bold text-base">{card.cta}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ScrollView
            className="flex-1 mt-6"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <CopilotBubble>
              <Text className="text-body text-sm leading-[21px]">{COPILOT_INTRO}</Text>
            </CopilotBubble>

            {scenario === null ? (
              <View className="gap-[11px] mt-4">
                {SCENARIOS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => pickScenario(option)}
                    activeOpacity={0.8}
                    className="bg-surface border border-line rounded-[14px] px-[18px] py-[15px]"
                  >
                    <Text className="text-body text-sm leading-5">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                {/* The chosen scenario, echoed as the user's bubble */}
                <View className="bg-accent/10 border border-accent/40 rounded-[16px] rounded-br-[4px] p-4 ml-10 mt-3">
                  <Text className="text-accent-soft text-sm leading-5">{scenario}</Text>
                </View>

                <View className="mt-3">
                  <CopilotBubble>
                    <Text className="text-body text-sm leading-[21px]">
                      {RESPONSE_DIAGNOSIS}
                    </Text>
                    <Text className="text-body text-sm leading-[21px] mt-3">
                      <Text className="text-ink font-bold">Your Copilot Reframe:</Text>
                      {RESPONSE_REFRAME}
                    </Text>
                  </CopilotBubble>
                </View>
              </>
            )}
          </ScrollView>

          {scenario !== null && (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              className="bg-accent rounded-2xl py-[19px] items-center"
            >
              <Text className="text-on-accent font-bold text-base">Complete Preview</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

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
 * Somatic Copilot — the full Day-76+ maintenance-tier version of the tool
 * previewed in the Autonomic Sync lesson (app/autonomic-sync.tsx).
 *
 * Deterministic end-to-end (§7): three authored trigger→reframe pairs,
 * versioned here as content. The "asynchronous coach" framing is
 * presentation only — nothing is generated, which is why nothing has to be
 * awaited. Reached from the post-program dashboard when the Maintenance
 * Toolkit entitlement is active; it is the first concrete deliverable of
 * that tier, which matters for continuation retention: a subscription that
 * visibly contains something survives the "what am I paying for?" audit at
 * renewal time.
 *
 * Two-step linear flow, single-directional by design: triage → reframe →
 * acknowledge → out. No browsing back and forth — the user arrives with one
 * roadblock, gets one prescription, and leaves. Wandering is for libraries;
 * this is triage.
 */

// LayoutAnimation needs an explicit opt-in on old-architecture Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CopilotScenario {
  id: string;
  trigger: string;
  reframe: string;
}

const SCENARIOS: CopilotScenario[] = [
  {
    id: '1',
    trigger: 'I lost my erection mid-way through.',
    reframe:
      'This is a classic sympathetic nervous system spike. The moment you noticed the shift ' +
      'in blood flow, your brain evaluated your performance, spiked your adrenaline, and ' +
      'restricted the arteries further. Do not apologize. Apologizing reinforces shame. Say ' +
      "this: 'My body is feeling highly excited, so my system just hit the brakes. Let's " +
      "focus on breathing together for a minute.' You have now removed the pressure and " +
      'initiated an autonomic reset.',
  },
  {
    id: '2',
    trigger: 'I felt myself getting too close to finishing too fast.',
    reframe:
      'Your pelvic floor became hypertonic (too tight), acting like a coiled spring. When ' +
      'stimulation crossed the threshold, the reflex triggered. Your Copilot Reframe: Pause ' +
      'all movement. Do not clench. Execute a 4-second deep belly inhale and consciously ' +
      'push the pelvic floor down and away (The Somatic Drop). Hold the expansion. This ' +
      'manually overrides the ejaculatory reflex.',
  },
  {
    id: '3',
    trigger: 'My mind started racing about outside stressors.',
    reframe:
      'You entered transient hyperfrontality—you left your body and entered your analytical ' +
      'brain. Erections cannot survive in the prefrontal cortex. Your Copilot Reframe: ' +
      'Shift entirely to Sensate Focus. Pick one physical sensation (the texture of the ' +
      'sheets, the temperature of the room) and anchor your entire consciousness to it. ' +
      'Starve the thoughts of oxygen by flooding the physical senses.',
  },
];

export default function SomaticCopilotScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<CopilotScenario | null>(null);

  const pick = (scenario: CopilotScenario) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setSelected(scenario);
  };

  return (
    <View className="flex-1 bg-ground px-7 pt-14 pb-9">
      {selected === null ? (
        <>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="flex-row items-center gap-1 mb-5 self-start"
          >
            <ChevronLeft size={16} color="#8A8378" />
            <Text className="text-muted text-xs font-semibold">Back</Text>
          </TouchableOpacity>

          <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
            Maintenance Toolkit
          </Text>
          <Text className="text-ink text-[26px] font-serif-light mt-1.5">Somatic Copilot</Text>
          <Text className="text-muted text-[13.5px] leading-5 mt-2">
            Select the specific autonomic roadblock you encountered.
          </Text>

          <View className="gap-[11px] mt-7">
            {SCENARIOS.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                onPress={() => pick(scenario)}
                activeOpacity={0.8}
                className="bg-surface border border-line rounded-[14px] px-[18px] py-[17px]"
              >
                <Text className="text-body text-[15px] leading-5">{scenario.trigger}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em] mt-8">
            Somatic Copilot
          </Text>
          <Text className="text-ink text-[26px] font-serif-light mt-1.5">The CBST Reframe</Text>

          <ScrollView
            className="flex-1 mt-5"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* The trigger, read back — being precisely heard is half of the
                reframe's authority. */}
            <View className="bg-surface-deep border border-line-soft rounded-[14px] px-4 py-3.5">
              <Text className="text-muted text-sm leading-5">{selected.trigger}</Text>
            </View>

            <View className="border-l-2 border-l-accent bg-surface border border-line rounded-[16px] p-5 mt-3.5">
              <Text className="text-body text-[15px] leading-6">{selected.reframe}</Text>
            </View>
          </ScrollView>

          {/* Single-directional by design: acknowledge is the only exit. */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-[19px] items-center"
          >
            <Text className="text-on-accent font-bold text-base">Acknowledge & Internalize</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

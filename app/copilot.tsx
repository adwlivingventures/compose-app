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
 * Deterministic end-to-end (§7): nine authored trigger→reframe pairs,
 * versioned here as content. The "asynchronous coach" framing is
 * presentation only — nothing is generated, which is why nothing has to be
 * awaited. Reached from the post-program dashboard when day > 75 and the
 * membership is active (Model V2: Act II unlock, included content — not a
 * separate tier). It is the first concrete deliverable past graduation,
 * which matters for renewal retention: a membership year that visibly
 * contains something survives the "what am I paying for?" audit at the
 * month-11 renewal notice.
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
      'interrupts the ejaculatory reflex.',
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
  {
    id: '4',
    trigger: 'I go soft during the condom moment.',
    reframe:
      'The condom is a mechanical task, and a mechanical task pulls attention out of ' +
      'sensation and into evaluation — a small prefrontal takeover, with an adrenaline tax ' +
      'on blood flow. Your Copilot Reframe: Make it part of contact instead of a pit stop. ' +
      'Keep one point of physical touch the whole time, run a long exhale while you handle ' +
      'it, and return your attention fully to sensation before re-engaging. Do not rush ' +
      'the re-entry — rushing is the sympathetic system driving.',
  },
  {
    id: '5',
    trigger: "We argued earlier and my body won't settle into it.",
    reframe:
      'Residual stress chemistry does not clear on command — your system is still holding ' +
      'the argument as a low-grade threat state, and arousal layered onto an armed system ' +
      'either stalls or fires early. Your Copilot Reframe: Co-regulate before you ' +
      "escalate. Name it plainly — 'I'm still carrying the evening; give me a few minutes " +
      "close to you first' — then spend those minutes in contact with no agenda, breathing " +
      'on the long exhale. Intimacy resumes when the alarm is off, not when you decide to ' +
      'override it.',
  },
  {
    id: '6',
    trigger: "It's my first time with someone new and I'm bracing.",
    reframe:
      'Novelty puts the threat-detection system on high alert, and bracing is spectatoring ' +
      'in advance — auditioning before anything has happened. Your Copilot Reframe: Lower ' +
      "the stakes out loud ('no script tonight — we go slow'), cut your pace in half, and " +
      'anchor to one physical sensation at a time. A first night is data collection, not a ' +
      'performance review — the man who goes slowest reads as the most composed person in ' +
      'the room.',
  },
  {
    id: '7',
    trigger: "I've had a few drinks and my body isn't responding.",
    reframe:
      'Alcohol is a depressant: it blunts sensitivity, slows reflex arcs, and works ' +
      'against blood flow. Tonight is chemistry, not your loop — the mistake is stacking a ' +
      'performance story on top of a pharmacological state. Your Copilot Reframe: Take ' +
      'the goal off the table and stay with touch for its own sake. The only part of ' +
      'tonight that follows you past tonight is the story you tell yourself about it — ' +
      "so file it accurately: 'that was the alcohol,' not 'that was me.'",
  },
  {
    id: '8',
    trigger: "It's been months and I feel out of practice.",
    reframe:
      'The system has not forgotten anything — what you are feeling is anticipation load, ' +
      'not decay. Expecting rustiness is spectatoring before the fact, and it arrives as ' +
      'adrenaline. Your Copilot Reframe: Run a deliberate re-entry. Halve your usual pace, ' +
      'open with one full 4-in, 6-out breath cycle, and anchor to a single sensation ' +
      'before anything else. Treat the first time back as a reconnaissance pass — the ' +
      'pressure to pick up where you left off is the only real obstacle in the room.',
  },
  {
    id: '9',
    trigger: "My partner initiated but I'm still wound up from the day.",
    reframe:
      'Shifting from a stress state into arousal is a state change, not a decision — ' +
      'willpower cannot do it, but the breath can. Your Copilot Reframe: Build an honest ' +
      "bridge instead of faking readiness: 'I want this — give me two minutes to land " +
      "here first.' Spend the two minutes in full contact, exhaling longer than you " +
      'inhale. Entering intimacy still carrying the day is how the loop starts; the ' +
      'two-minute landing is how it does not.',
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
            <ChevronLeft size={16} color="#6B7280" />
            <Text className="text-muted text-xs font-semibold">Back</Text>
          </TouchableOpacity>

          <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
            Mastery Suite
          </Text>
          <Text className="text-ink text-[26px] font-serif-light mt-1.5">Somatic Copilot</Text>
          <Text className="text-muted text-[13.5px] leading-5 mt-2">
            Select the specific autonomic roadblock you encountered.
          </Text>

          {/* Nine triggers need to scroll; the triage list stays one column,
              one tap — no categories, no search (Hick's law holds even here). */}
          <ScrollView
            className="flex-1 mt-7"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-[11px]">
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
          </ScrollView>
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

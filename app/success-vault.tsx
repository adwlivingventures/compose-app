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
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { TESTIMONIALS } from '../content/testimonials';

/**
 * "Others Who Walked It" (renamed from The Success Vault, founder 2026-07-15) —
 * the curated, read-only community replacement in the You tab.
 *
 * TWO PROVENANCE CLASSES, DELIBERATELY SEPARATED (honest-data doctrine):
 *
 * 1. Member stories — the six REAL, attributed, consented tester accounts
 *    (content/testimonials.ts, shared with the onboarding field-reports
 *    screen). Their disclosure says "real feedback, shared with permission."
 *
 * 2. Composite journeys — authored composite narratives following
 *    struggle → abyss → breakthrough, because the abyss is the point (a man
 *    who falters on Day 22 needs to have already read about one who did).
 *    Their disclosure says "composite, not individual accounts."
 *
 * The two lines are OPPOSITES and must never be merged: labeling a real
 * testimonial "composite" — or a composite "real" — is FTC deceptive-
 * endorsement territory and an App Store health-claims tripwire. Keep each
 * section under its own accurate line. (Claims ledger: .claude/ember-progress.md.)
 */

// LayoutAnimation needs an explicit opt-in on old-architecture Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CaseStudy {
  id: string;
  title: string;
  theme: string;
  struggle: string;
  relapse: string;
  breakthrough: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'The Over-Thinker (Age 34)',
    theme: 'Spectatoring & Transition ED',
    struggle:
      'I could get an erection, but the second it was time to put on a condom or ' +
      "transition, my brain would 'step outside' my body. I'd evaluate myself, panic, and " +
      'lose it instantly.',
    relapse:
      'On Day 22 of the protocol, it happened again. I completely lost it. I almost ' +
      'uninstalled the app because I felt uniquely broken.',
    breakthrough:
      'I realized I was treating the app like a magic pill rather than a toolkit. The next ' +
      "time my mind started racing, I didn't panic. I used the 4:6 Somatic Pacer breathing " +
      'right there in bed. I dropped my pelvic floor, stopped apologizing, and let the ' +
      'autonomic system reset. By Day 50, my mind was finally quiet. The spectator is dead.',
  },
  {
    id: '2',
    title: 'The Sprinter (Age 28)',
    theme: 'Hypertonicity & Premature Ejaculation',
    struggle:
      'I was dealing with a hair-trigger. The moment there was any physical connection, my ' +
      "pelvic floor would clamp down like a vice, and I'd finish before it even started.",
    relapse:
      'By Phase 2, I thought the work was finished. I got over-excited, clenched my pelvic floor out ' +
      'of old habits, and finished in two minutes. The shame rush was heavy.',
    breakthrough:
      "The Auditory Anchor on 'Welcoming the Fluctuation' saved me. I learned that arousal " +
      "is a waveform. Now, when I feel the wave peak, I use the 'Somatic Drop' we learned " +
      'on Day 1. I physically push the pelvic floor away. It interrupts the reflex. ' +
      'I now dictate the pacing.',
  },
  {
    id: '3',
    title: 'The Dopamine Chaser (Age 41)',
    theme: 'Digital Numbness & PIED',
    struggle:
      "My body simply wouldn't respond to real-life intimacy anymore. I had fried my D2 " +
      'dopamine receptors with years of high-speed digital content. Reality felt boring to ' +
      'my nervous system.',
    relapse:
      "The 'Flatline' from Days 14 to 40 was brutal. Stripping away the digital dopamine " +
      'left me with zero libido. I felt completely asexual and thought the protocol had ' +
      'made me worse.',
    breakthrough:
      'Holding the Vitality Baseline was the key. By starving the artificial pathways, my ' +
      'brain slowly resensitized. On Day 62, a simple touch from my partner triggered a ' +
      'massive, parasympathetic response. Rebuilding the baseline works, but you have to ' +
      'survive the dopamine withdrawal first.',
  },
];

function MemberStoryCard({ story }: { story: (typeof TESTIMONIALS)[number] }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setExpanded((e) => !e);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.85}
      className="bg-surface border border-line rounded-[18px] p-5"
    >
      <Text className="text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
        {story.tag}
      </Text>
      <View className="flex-row items-baseline gap-2 mt-1.5">
        <Text className="text-ink text-[17px] font-serif-regular">{story.name}</Text>
        <Text className="text-muted text-[13px]">{story.detail}</Text>
      </View>
      <Text
        className="text-body text-sm leading-[21px] mt-2.5"
        numberOfLines={expanded ? undefined : 3}
      >
        “{story.text}”
      </Text>
      {!expanded && (
        <View className="flex-row items-center gap-1.5 mt-3">
          <Text className="text-muted text-xs font-semibold">Read the whole story</Text>
          <ChevronDown color="#6B7280" size={14} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setExpanded((e) => !e);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.85}
      className="bg-surface border border-line rounded-[18px] p-5"
    >
      <Text className="text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
        {study.theme}
      </Text>
      <Text className="text-ink text-[19px] font-serif-regular mt-1.5">{study.title}</Text>
      <Text className="text-body text-sm leading-[21px] mt-2.5">{study.struggle}</Text>

      {expanded ? (
        <>
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mt-5">
            The Abyss (The Relapse)
          </Text>
          <Text className="text-body text-sm leading-[21px] mt-2">{study.relapse}</Text>

          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em] mt-5">
            The Breakthrough
          </Text>
          <View className="border-l-2 border-l-accent pl-3.5 mt-2">
            <Text className="text-body text-sm leading-[21px]">{study.breakthrough}</Text>
          </View>
        </>
      ) : (
        <View className="flex-row items-center gap-1.5 mt-4">
          <Text className="text-muted text-xs font-semibold">Read the full narrative</Text>
          <ChevronDown color="#6B7280" size={14} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SuccessVaultScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 56, paddingBottom: 48 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 mb-5 self-start"
      >
        <ChevronLeft size={16} color="#6B7280" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        The Vault
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">Others Who Walked It</Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        Men who were exactly where you are, and the partners who watched them change.
      </Text>

      {/* ── Section 1: real member stories ── */}
      <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-8 mb-1">
        Member Stories
      </Text>
      <Text className="text-muted text-xs leading-[17px] mb-4">
        Real feedback from men and partners who tested Compose, shared with permission.
      </Text>
      <View className="gap-3">
        {TESTIMONIALS.map((story) => (
          <MemberStoryCard key={story.name} story={story} />
        ))}
      </View>

      {/* ── Section 2: composite journeys (distinct provenance) ── */}
      <Text className="text-dim text-[11px] font-bold uppercase tracking-[0.16em] mt-9 mb-1">
        Composite Journeys
      </Text>
      <Text className="text-muted text-xs leading-[17px] mb-4">
        Full arcs — struggle, setback, and breakthrough — authored from the clinical patterns
        this protocol is built around. Not individual user accounts.
      </Text>
      <View className="gap-3">
        {CASE_STUDIES.map((study) => (
          <CaseStudyCard key={study.id} study={study} />
        ))}
      </View>
    </ScrollView>
  );
}

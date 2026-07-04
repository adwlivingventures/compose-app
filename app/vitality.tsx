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

/**
 * The Vitality Baseline — reference screen behind the daily Vitality Habit
 * check-in (§5). Lives in the You tab alongside the Partner Guide.
 *
 * The "iceberg" accordion is progressive disclosure doing clinical work:
 * the collapsed surface carries only the behavior (the core rule — all the
 * user needs to act), while the mechanism sits one tap deeper as the payoff
 * for curiosity. That ordering respects the Ventral Vagal Sanctuary rule —
 * an anxious user scanning this screen sees three instructions, not three
 * walls of endocrinology — while still honoring the "explain the mechanism"
 * directive for the user who wants to know why. Understanding the why is
 * itself adherence fuel: a rule with a mechanism attached survives the
 * motivation dip at week three.
 */

// LayoutAnimation needs an explicit opt-in on old-architecture Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Pillar {
  pillar: string;
  title: string;
  rule: string;
  mechanism: string;
}

const PILLARS: Pillar[] = [
  {
    pillar: 'Chemical Vitality',
    title: 'Chemical & Vascular Support',
    rule:
      'Common supports: Vitamin D3+K2, Magnesium Glycinate, Zinc, and L-Citrulline. Get 15 ' +
      'minutes of morning sunlight.',
    mechanism:
      'Vitamin D3 is essential for testosterone synthesis, but it must be paired with ' +
      'Vitamin K2. K2 prevents calcium from building up in your arteries (arterial ' +
      'calcification), ensuring your endothelium can release Nitric Oxide for optimal blood ' +
      'flow. Morning sunlight anchors your circadian rhythm, optimizing the overnight ' +
      'release of testosterone.',
  },
  {
    pillar: 'Restoration Vitality',
    title: 'Sleep Architecture',
    rule: 'Zero screen time 60 minutes before sleep.',
    mechanism:
      'Testosterone is not produced evenly throughout the day; the vast majority is ' +
      'synthesized by the endocrine system during Deep (Slow-Wave) and REM sleep. Blue ' +
      'light from screens destroys melatonin production, breaking your sleep architecture ' +
      'and chronically elevating cortisol. High cortisol directly suppresses testosterone.',
  },
  {
    pillar: 'Dopaminergic Baseline',
    title: 'D2 Receptor Resensitization',
    rule: 'Absolute abstinence from high-speed digital pornography.',
    mechanism:
      'Hyper-stimulating digital content floods the brain with unnatural dopamine, causing ' +
      'your D2 receptors to down-regulate (numb themselves) to survive the surge. When your ' +
      'receptors are numbed, real-life intimacy no longer provides enough chemical voltage ' +
      'to maintain an erection. For the next 75 days, we are starving the artificial ' +
      'pathways to resensitize your brain to reality.',
  },
];

function ExpandableCard({ pillar, title, rule, mechanism }: Pillar) {
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
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            {pillar}
          </Text>
          <Text className="text-ink text-[17px] font-serif-regular mt-1.5">{title}</Text>
          <Text className="text-body text-sm leading-5 mt-2">{rule}</Text>
        </View>
        <ChevronDown
          color="#8A8378"
          size={18}
          style={{ marginTop: 2, transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </View>

      {expanded && (
        <View className="border-t border-line-soft mt-4 pt-4">
          <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
            Clinical mechanism
          </Text>
          <Text className="text-body text-[13.5px] leading-5 mt-2">{mechanism}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function VitalityPrimerScreen() {
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
        <ChevronLeft size={16} color="#8A8378" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        Resource Vault
      </Text>
      <Text className="text-ink text-[26px] font-serif-light mt-1.5">The Vitality Baseline</Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        Permanent autonomic regulation is impossible if your endocrine system (hormones) and
        neurochemistry are compromised. Honor these three pillars daily.
      </Text>

      <View className="gap-3 mt-7">
        {PILLARS.map((p) => (
          <ExpandableCard key={p.title} {...p} />
        ))}
      </View>

      <Text className="text-dim text-xs leading-[17px] text-center mt-6">
        Educational reference, not medical advice. Check with your physician before adding any
        supplement.
      </Text>
    </ScrollView>
  );
}

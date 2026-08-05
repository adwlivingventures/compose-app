import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import SomaticPrimer from '../components/SomaticPrimer';

/**
 * Permanent home for the Somatic Drop technique after Day 1 — the
 * reverse-kegel mechanics are the protocol's core motor skill, and a skill
 * reference that disappears after one viewing is a retention bug.
 *
 * 2026-08-05 (founder walkthrough ruling): the screen now leads with the
 * TWO-FRAME DROP DIAGRAM — "at rest" and "released," side by side. The drop
 * is the only movement in the protocol that is invisible from the outside
 * (nothing about a seated man changes when his floor drops), which is what
 * makes it hard to teach. The pair gives him the before/after snapshot; the
 * animated piston inside the full walkthrough below gives him the motion.
 * Both, one screen.
 */

const FRAMES = [
  {
    key: 'rest',
    label: 'At rest',
    line: 'Seated, breath low. The floor simply carries you.',
    image: require('../assets/figures/technique_rest.png'),
  },
  {
    key: 'released',
    label: 'Released',
    line: 'The inhale descends; the floor lets go and drops. Nothing pushes.',
    image: require('../assets/figures/technique_released.png'),
  },
] as const;

export default function TechniqueScreen() {
  const router = useRouter();
  const [walkthrough, setWalkthrough] = useState(false);

  if (walkthrough) {
    return (
      <SomaticPrimer refresher onComplete={() => router.back()} onExit={() => router.back()} />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 48 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 mb-5 self-start"
      >
        <ChevronLeft size={16} color="#6E8090" />
        <Text className="text-muted text-xs font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        The technique
      </Text>
      <Text className="text-ink text-[26px] font-serif-regular mt-1.5">The Somatic Drop</Text>
      <Text className="text-muted text-[13.5px] leading-5 mt-2">
        The one movement nobody can see. Two frames — then the full guided walkthrough whenever
        you want it.
      </Text>

      <View className="flex-row gap-3 mt-6">
        {FRAMES.map((f) => (
          <View key={f.key} className="flex-1 bg-surface border border-line rounded-2xl p-3">
            <Text className="text-dim text-[10px] font-bold uppercase tracking-[0.2em]">
              {f.label}
            </Text>
            <Image
              source={f.image}
              style={{ width: '100%', aspectRatio: 1, marginTop: 6 }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Text className="text-muted text-[11.5px] leading-4 mt-2">{f.line}</Text>
          </View>
        ))}
      </View>

      <Text className="text-body text-[13px] leading-5 mt-5">
        The drop is a release, never an effort — if the abs brace or the glutes squeeze, that was
        a clench. Soften, and let the breath do the pushing.
      </Text>

      <TouchableOpacity
        onPress={() => setWalkthrough(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Run the full guided walkthrough"
        className="bg-accent rounded-2xl py-[16px] items-center mt-7"
      >
        <Text className="text-on-accent font-bold text-[15px]">Run the full walkthrough</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

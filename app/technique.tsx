import React from 'react';
import { useRouter } from 'expo-router';
import SomaticPrimer from '../components/SomaticPrimer';

/**
 * Permanent home for the Somatic Primer after Day 1 — the reverse-kegel
 * mechanics are the protocol's core motor skill, and a skill reference that
 * disappears after one viewing is a retention bug: the man who half-forgets
 * the drop by week three quietly kegels through the release work instead.
 * Reached from the You tab.
 */
export default function TechniqueScreen() {
  const router = useRouter();
  return (
    <SomaticPrimer refresher onComplete={() => router.back()} onExit={() => router.back()} />
  );
}

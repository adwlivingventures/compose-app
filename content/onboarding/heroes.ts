// The ONLY imagery permitted in onboarding: the 5 approved renders
// (BUILD_PROMPT §2 — "Never generate or substitute artwork").
// Keyed by the asset filenames used in screens.ts descriptors.

import type { ImageSourcePropType } from 'react-native';

export const HERO_RENDERS: Record<string, ImageSourcePropType> = {
  'hero-welcome-drop.png': require('../../assets/onboarding/hero-welcome-drop.png'),
  'fig-hero-somatic.png': require('../../assets/onboarding/fig-hero-somatic.png'),
  'fig-hero-validation.png': require('../../assets/onboarding/fig-hero-validation.png'),
  'fig-hero-philosophy.png': require('../../assets/onboarding/fig-hero-philosophy.png'),
  'fig-hero-protocol.png': require('../../assets/onboarding/fig-hero-protocol.png'),
};

// buildFlow — pure resolver of the onboarding screen order for a variant.
// The ONLY place variant A/B differences are resolved (BUILD_PROMPT §4.1):
// clinical card placement, hope-tease lines, and card button labels.
// Screen components never see the variant.

import { BATCH_AFTER, BATCH_ORDER, SCREENS } from './screens';
import type { ClinicalCardScreen, ResolvedScreen, Screen, Variant } from './types';

function isClinicalCard(s: Screen): s is ClinicalCardScreen {
  return s.archetype === 'clinical-card';
}

export function buildFlow(variant: Variant): ResolvedScreen[] {
  const cards = SCREENS.filter(isClinicalCard);
  const spine = SCREENS.filter((s) => !isClinicalCard(s));

  const ordered: Screen[] = [];
  for (const screen of spine) {
    ordered.push(screen);
    if (variant === 'B' && screen.id === BATCH_AFTER) {
      for (const id of BATCH_ORDER) {
        const card = cards.find((c) => c.id === id);
        if (!card) throw new Error(`BATCH_ORDER references unknown card "${id}"`);
        ordered.push(card);
      }
    }
    if (variant === 'A') {
      for (const card of cards) {
        if (card.placement.A.inlineAfter === screen.id) ordered.push(card);
      }
    }
  }

  if (ordered.length !== SCREENS.length) {
    const missing = SCREENS.filter((s) => !ordered.includes(s)).map((s) => s.id);
    throw new Error(`buildFlow(${variant}) dropped screens: ${missing.join(', ')}`);
  }

  // Assign spec ids (position among numbered screens — section transitions
  // are unnumbered in the specs, and the Model V2 telemetry-consent step is
  // a later insertion that must not renumber the handoff's screens) and
  // per-variant card strings.
  let specNumber = 0;
  let clinicalNumber = 0;
  return ordered.map((screen): ResolvedScreen => {
    if (screen.archetype === 'section-transition' || screen.archetype === 'consent') {
      return { ...screen, specId: null };
    }
    specNumber += 1;
    const specId = `${variant}-${String(specNumber).padStart(2, '0')}`;
    if (isClinicalCard(screen)) {
      clinicalNumber += 1;
      return {
        ...screen,
        specId,
        clinicalIndex: clinicalNumber,
        resolvedTease: screen.tease[variant],
        resolvedButton: screen.button[variant],
      };
    }
    return { ...screen, specId };
  });
}

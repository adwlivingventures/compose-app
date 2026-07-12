// buildFlow — pure resolver of the onboarding screen order.
// Single flow (founder ruling 2026-07-10): the interleaved variant and its
// onboarding A/B test are retired. The four clinical cards are batched after
// the Map — diagnosis reveal, then its four drivers, one tension arc that
// resolves at the turn-welcome pivot. SCREENS is authored in final order;
// this resolver only assigns numbering.

import { SCREENS } from './screens';
import type { ResolvedScreen } from './types';

export function buildFlow(): ResolvedScreen[] {
  // Assign spec ids (position among numbered screens — section transitions
  // are unnumbered in the spec, and the Model V2 telemetry-consent step is
  // a later insertion that must not renumber the handoff's screens).
  let specNumber = 0;
  let clinicalNumber = 0;
  return SCREENS.map((screen): ResolvedScreen => {
    if (screen.archetype === 'section-transition' || screen.archetype === 'consent') {
      return { ...screen, specId: null };
    }
    specNumber += 1;
    const specId = String(specNumber).padStart(2, '0');
    if (screen.archetype === 'clinical-card') {
      clinicalNumber += 1;
      return { ...screen, specId, clinicalIndex: clinicalNumber };
    }
    return { ...screen, specId };
  });
}

// Coarse presentation segment — the one field the founder-approved (2026-07-12)
// telemetry extension adds to lifecycle events (CLAUDE.md §7 exception).
//
// WHY THIS LIVES IN THE CONTENT LAYER: services/analytics.ts is forbidden —
// and test-enforced (acceptance.test.ts greps its source) — from referencing
// any onboarding answer key. The derivation below reads answers, so it lives
// here, next to composure.ts, which reads the same answers for the score.
// Analytics only ever sees the finished slug.
//
// WHY COARSE IS A HARD LINE: signals ship with clientUser 'anonymous' and no
// per-user join key, so segment-cut cohort curves are only possible if each
// event self-carries the tag — but anything finer than a handful of broad
// groups becomes a re-identification surface for sexual-health data. Exactly
// one field, exactly these four values. Raw answers never leave the device.

import type { Answers } from './logic';
import { LocalStore } from '../../services/storage';
import { setTelemetrySegment } from '../../services/analytics';

/** The closed taxonomy. Must stay in lockstep with SEGMENTS in
 *  services/analytics.ts — a sync test enforces it. */
export const SEGMENT_SLUGS = [
  'pe-dominant',
  'ed-dominant',
  'mixed',
  'anxiety-primary',
] as const;

export type SegmentSlug = (typeof SEGMENT_SLUGS)[number];

/** Local storage key for the derived slug — the slug only, never answers. */
export const SEGMENT_STORAGE_KEY = '@presentation_segment';

/**
 * Deterministic derivation from the "What brings you here?" multi-select
 * (the presentation question): finishing too quickly marks the PE axis,
 * struggling to maintain marks the ED axis; both = mixed; neither = the
 * anxiety-primary presentation (in-his-head / avoidance / closeness reasons).
 */
export function deriveSegment(answers: Answers): SegmentSlug {
  const reasons = Array.isArray(answers.reasons) ? answers.reasons : [];
  const pe = reasons.includes('finish-quickly');
  const ed = reasons.includes('maintain');
  if (pe && ed) return 'mixed';
  if (pe) return 'pe-dominant';
  if (ed) return 'ed-dominant';
  return 'anxiety-primary';
}

/**
 * Derive, persist locally, and hand the slug to analytics so lifecycle
 * events from this moment on carry it. Called once, when the diagnostic
 * completes (the Map reveal — the first lifecycle event fires right after).
 */
export async function persistSegment(answers: Answers): Promise<SegmentSlug> {
  const slug = deriveSegment(answers);
  // Hand-off happens synchronously (before the first await) so a lifecycle
  // event fired in the same tick — the Day-0 baseline — already carries it.
  setTelemetrySegment(slug);
  await LocalStore.setItem(SEGMENT_STORAGE_KEY, slug);
  return slug;
}

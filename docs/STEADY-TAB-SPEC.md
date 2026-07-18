# STEADY Tab — Architecture Spec (v1)

**Founder ruling (2026-07-18):** the Restructure tab becomes **Steady** — the app's on-demand layer. It must deliver *visible wealth* (the member owns a deep collection; the $99.99 feels heavy) without *decision load* (Hick's Law / Ventral Vagal Sanctuary, CLAUDE.md §6). Resolution: route by state at the surface, endow the full collection one level down, sequence access by protocol phase.

## The three-door model (by urgency)

| Door | Surface | Rule |
|---|---|---|
| Acute | SOS / TriageCenter (unchanged) | Zero-choice entry; three moment-branches |
| On-demand | **Steady tab** | State router first, Library beneath |
| Scheduled | Daily session (unchanged) | Linear; the only source of protocol votes |

Same content, three doors — no duplicated surfaces, no library in the session, no browsing in SOS.

## Level 1 — the router (default path)

"What do you need right now?" + four state doors. Each door opens exactly one thing:

1. **A thought is spiking** → Spike Flow (in place)
2. **Settle me fast** → Reset Breath (audio; SOS sigh track)
3. **Get me out of my head** → Back Into the Body (audio body scan)
4. **Release the tension** → Pelvic Drop long practice (audio; falls back to the highest-priority open somatic practice before its open day)

## Level 2 — the Library (the freedom layer)

Below the router: full collection, four shelves (Breath / Meditation / Somatic & Pelvic / Mind). Every practice is **visible from Day 1**; sequenced items show their card, purpose, and open day with an honest clinical reason. Frame line (does the "don't abuse this" work, positively):

> *Your daily session is the training. These are the tools for the moments between.*

Rules: no autoplay, no "up next," no recommendations; every practice ends by returning to stillness → back. Library use casts **no protocol votes** — no streaks, no counts toward the day. Vocabulary: **"Opens Day N"** — never "locked."

## Level 3 — sequencing schedule

| Practice | Kind | Shelf | Opens | Reason line (shown while sequenced) |
|---|---|---|---|---|
| Reset Breath (sigh) | audio | Breath | 1 | — |
| The Steady Square (box, guided) | audio | Breath | 1 | — |
| Box Breathing (orb pacer) | orb | Breath | 1 | — |
| 4-7-8 (orb pacer) | orb | Breath | 1 | — |
| Extended Exhale 4-8 (orb) | orb | Breath | 1 | — |
| Humming Breath | steps | Breath | 14 | Two weeks of exhale training first — the hum rides on it. |
| Back Into the Body (scan) | audio | Meditation | 1 | — |
| The Deep Drop (NSDR) | audio | Meditation | 26 | Deep rest lands best on the foundation Phase 1 builds. |
| Noting Practice | steps | Meditation | 26 | Phase 2 work — naming thoughts needs a settled baseline. |
| Self-Compassion Break | steps | Meditation | 26 | Phase 2 work — it pairs with exposure training. |
| Pelvic Drop — Long Practice | audio | Somatic | 3 | Opens with your Day 3 anchor, which introduces the drop. |
| 5-4-3-2-1 Grounding | steps | Somatic | 1 | — |
| Down-Training Stretches | steps | Somatic | 5 | The breath-pelvis link comes first; the stretches amplify it. |
| Progressive Muscle Release | steps | Somatic | 10 | Learn the drop before generalizing it body-wide. |
| Spike Flow | tool | Mind | 1 | — |
| Leaves on a Stream | steps | Mind | 26 | Defusion is Phase 2's skill — it opens with it. |
| Identity Rehearsal | audio | Mind | 51 | Phase 3 work — identity lands on 50 days of evidence. |
| Evening Evidence Review | steps | Mind | 51 | Phase 3 work — votes counted at day's end. |

Day-1 live: 8 of 18. Fresh openings at Days 3, 5, 10, 14 (Phase 1 novelty drip through the doubt window), 26 (Phase 2 wave), 51 (Phase 3 wave).

## Implementation map

- `content/regulation.ts` — deterministic registry (id, shelf, kind, minutes, purpose, opensOnDay, sequencedReason, orb phases / step scripts / audio key). §7-compliant: authored, versioned.
- `content/regulationAudio.ts` pattern folded into `regulation.ts`: audio keys resolve through `REGULATION_AUDIO`, falling back to `anchor_placeholder.wav` until the five `regulation_*.mp3` renders land in `assets/audio/` (swap the requires — marked TODO).
- `app/practice.tsx` — one runner route for all kinds: `audio` (reuses `AudioPlayer`, no scrubber), `orb` (reuses `BreathingOrb` with per-practice phases/labels), `steps` (paced card sequence, tap-advance). Ends on a quiet close line → back. Telemetry: `library_practice_started { practice }` tag only (§7 whitelist).
- `app/(tabs)/cbst.tsx` — header re-copy (discretion: no "Sex Therapy" on persistent chrome), router doors, Library shelves, Spike Flow, Evidence Locker (stays at tab bottom for v1; candidate to merge into Baseline later).
- `app/(tabs)/_layout.tsx` — tab title "Steady" (route name `cbst` unchanged to avoid nav churn).
- TriageCenter unchanged (already state-routed; Reset Breath audio may later replace the 4-7-8 branch's orb — decision deferred until renders land).

## Where the robustness *feeling* is built (not this tab alone)

Paywall value stack ("18 guided practices across four disciplines — included"), post-purchase tour (one scroll through the full Library, open-day tags visible), Day-26/51 unlock moments (quiet notification-free in-app reveal), month-11 renewal evidence ("Reset Breath: 41 uses this year"). The Library is a prop in every pay-worthiness moment.

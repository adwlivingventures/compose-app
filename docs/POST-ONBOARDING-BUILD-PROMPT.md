# COMPOSE — Post-Onboarding Build Prompt (Founder-Approved Workstreams)

> **⛔ PRICING SUPERSEDED — Model V2 (founder ruling, 2026-07-08).** This
> executed work order predates the membership migration: its $39.99/yr +
> $4.99/mo continuation and one-time-purchase framing are retired. Live
> model: CLAUDE.md §2 + docs/BUSINESS-MODEL-V2.md ($99.99/yr primary,
> $17.99/mo secondary, single `membership` entitlement). Non-pricing rules
> below (refund ban, stranger test, deterministic content) remain binding.

You are implementing the approved items from the Post-Onboarding Strategy Review
(July 2026) in this repo. Read CLAUDE.md first — §2 now contains binding founder
rulings (opt-in continuation, annual-first membership, upward-only pricing, and
a total ban on refund language). docs/PRODUCT-VISION.md §1 is resolved; its
anti-roadmap (§3) remains binding — do not add output tracking, communities,
LLM chat, streak shame, badges, or percentage progress bars.

GLOBAL RULES
- No refund language anywhere, user-facing, ever. Before finishing, grep the
  repo for user-facing "refund" strings: the only permitted occurrences are
  docs/terms-of-use.* (which correctly points to Apple) and code comments.
- Deterministic authored content only (§7). Local-only storage (§7).
- Every new outside-the-app string (notifications, quick actions, widgets)
  must pass the lock-screen stranger test (§6).
- Haptics: reuse the existing vocabulary; no new notification-style buzzes.
- All prices read from RevenueCat offerings — never hardcoded in copy.

────────────────────────────────────────────────────────────────────────────
W1 — THE RE-MEASUREMENT RITUAL (P0)
────────────────────────────────────────────────────────────────────────────
On the mornings of protocol Days 14, 40, and 75 (activeDay equals those values
and no ritual is recorded for that checkpoint), the dashboard's primary action
becomes "Re-measure your baseline". The daily session unlocks immediately after
the ritual completes (same day: ritual → session; the ritual does NOT consume
the one-session-per-day pacing lock).

Content: a 2–3 minute subset of the onboarding diagnostic, wording IDENTICAL
to content/onboarding/screens.ts so deltas are real measurements:
  1. The breath question   2. The adrenaline question
  3. Spectatoring frequency  4. Avoidance frequency
  5. The 20-second pelvic check (reuse the onboarding component)

Scoring: extract the onboarding Composure Score computation into a single
shared module (one source of truth; weights in one config object) and reuse it
verbatim. Persist history locally: @composure_history = [{checkpoint, day,
score, iso}] with the onboarding score as entry zero.

Result screen: the Map, again — same bars, same gauge, with the previous
score ghosted on the gauge and the delta drawn. Update the mirror sentence
from the new answers.

Day-14 adaptive copy (NO refund language — founder ruling):
- Delta positive: "Fourteen days in. {prev} → {new}. Your system is
  re-learning its baseline — this is the evidence, from your own answers."
- Delta flat/negative: "Fourteen days in, your score hasn't moved yet.
  That's information, not failure — the reset often lags the practice by
  weeks. Hold the session hour steady, and let the conditioning track's
  release cue stay gentle: over-effort is the old pattern. The deepest work
  of Phase 1 is Days 15–25."

Day-40: midpoint framing + echo the user's stored goal words ("Halfway. Your
words, Day 0: '…'"). Day-75: the ritual feeds the GraduationScreen evidence
card — add the Composure line (onboarding → 75 delta) to its stats and to the
export text.

Progress tab: add the macro line (Composure Score at onboarding/14/40/75)
above the existing daily control-score trend. Two independent evidence lines.

Notification variant: on ritual mornings only, the single daily reminder may
read "Compose — today includes your check-in." (Still §6-compliant.)

Post-Day-75, membership active: the ritual becomes available quarterly from
the post-program dashboard ("Quarterly re-measure"), entitlement-gated.

────────────────────────────────────────────────────────────────────────────
W2 — GRADUATION RESTRUCTURE: ANNUAL-FIRST (P0)
────────────────────────────────────────────────────────────────────────────
GraduationScreen and the post-program dashboard currently offer $4.99/mo only.
Restructure per CLAUDE.md §2: annual PRIMARY ($39.99/yr — "less than one
protocol, for the whole year"), monthly secondary ($4.99/mo). The $39.99/yr
annual package is CONFIGURED in the RevenueCat dashboard (founder, 2026-07-08)
— read it from the offering. Keep "Both are wins" and the export path
EXACTLY as built — the dignity of the exit is what makes the ask land.

────────────────────────────────────────────────────────────────────────────
W3 — RETURN INTERSTITIALS (P1)
────────────────────────────────────────────────────────────────────────────
The streak-repair mercy in ProtocolContext is currently invisible. Make it
audible, once per return, full-screen quiet interstitial before the dashboard:

After exactly one missed calendar day (streak held):
  "You missed a day. That's not a relapse — it's a rest the schedule didn't
   plan. Your streak holds. Day {N} is waiting."  → one button: "Continue"

After a multi-day walk-away (streak reset), Day-24 register:
  "However long it's been: the work you did is still in your nervous system.
   Conditioning doesn't evaporate — it pauses. Day {N} is where you left it."
  → one button: "Continue". NO restart option, NO choice architecture — a
  restart offer at the shame moment invites the all-or-nothing script.

────────────────────────────────────────────────────────────────────────────
W4 — DAY 1 OPENS WITH HIS OWN WORDS (P1)
────────────────────────────────────────────────────────────────────────────
Before the Day-1 session's first stage (after the Somatic Primer), one screen:
his signed oath card (@signature_data) and his stored goal words in quotes,
with the line "Day 1 starts there." One button: "Begin". Shows once, ever.

────────────────────────────────────────────────────────────────────────────
W5 — SOS REACHABILITY (P1)
────────────────────────────────────────────────────────────────────────────
a) Home-screen quick action (long-press app icon): "Steady me" → deep-links
   straight into the Triage Center sheet. Label passes the stranger test.
b) Hold-to-breathe (screen-dark haptic pacing) — FOUNDER CONFIRMED 2026-07-08;
   build and surface it as an opt-in toggle inside the SOS breath branch,
   default OFF: a "screen down" mode where the 4-7-8 cycle
   is paced by gentle haptic swells that run ONLY while the user's thumb
   rests on the (near-black) screen. Lift = instant stop. Never runs
   unattended, never buzzes on a table. Gentle amplitude, existing BREATHE
   pattern. Rationale: a dark phone in a hand is more discreet than a lit
   screen in a dark bedroom; the thumb is the kill switch.

────────────────────────────────────────────────────────────────────────────
W6 — HOUSEKEEPING (P2, batch at the end)
────────────────────────────────────────────────────────────────────────────
- Rename user-facing CBST surfaces: tab label → "Restructure"; "CBST Log"
  chip → "Thought Log". Clinical vocabulary stays one tap deep (iceberg).
- Consolidate partner content: Partner Guide (Profile) becomes canonical;
  the Restructure tab's Partner Scripts cross-link to it (or move scripts
  into the guide) — one partner area, not two.
- Copilot scenario 2: soften "interrupts the ejaculatory reflex" →
  "interrupts the urgency spiral" (claims-consistency pass).
- The two stub lessons named on the paywall (Refractory Window, Anxious
  Partner De-escalator) are CONTENT tasks — flag as TODO for the founder;
  never ship placeholder or generated lesson content.

WORK ORDER — stop for founder approval after each step
1. Shared scoring module extraction + @composure_history model + tests.
2. W1 ritual flow (screens, gate, result, Progress macro line, notification
   variant). Show the Day-14 both-delta copy on screen for approval.
3. W2 graduation restructure. 4. W3 + W4. 5. W5a + W5b (both confirmed).
6. W6 housekeeping.

ACCEPTANCE
- Ritual fires exactly on Days 14/40/75, never consumes the daily lock,
  records history, and the Day-75 ritual appears in graduation evidence +
  export text.
- Scoring module is the single source used by onboarding AND ritual (test
  asserts identical output for identical answers).
- Repo-wide grep: no user-facing refund strings outside terms-of-use.
- Return interstitials each show at most once per return event; multi-day
  version never offers a restart.
- Quick action reaches the Triage sheet in one tap from a long-press.
- tsc clean; existing tests pass; new logic unit-tested.

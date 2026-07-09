# COMPOSE — Business Model V2 (Founder ruling, 2026-07-08)

Governing summary lives in CLAUDE.md §2. This document is the full flow map and sequencing plan. It supersedes all references to the $49.99 one-time program and the $39.99/$4.99 Somatic Maintenance Toolkit.

## 1. The model in one paragraph

Annual-first membership sold as a transformation, not a subscription library. **$99.99/yr primary, $17.99/mo secondary** (RC Experiment: $99.99 vs $69.99 annual, upward-only pricing policy). Hard paywall after diagnostic onboarding. The 75-Day Protocol is the headline promise and the first act of a three-act membership year. Graduation is an unlock ceremony, never a sales moment. Honest billing throughout: no trials, no countdowns, no dark patterns, month-11 pre-renewal notice.

**Why this model (mechanism):** day-0 cash equals the old one-time price, so CAC payback is unchanged — but renewals add an LTV tail, the monthly tier admits younger/price-sensitive men, and 100% recurring revenue makes the company a clean ARR asset at exit (recurring revenue trades at ~3–4x profit vs. heavy discounts for one-time revenue). The annual price is itself a commitment device: higher sunk cost → higher adherence → better outcomes → better word of mouth.

## 2. The user flow, Day 0 → Day 365

### Day 0 — Acquisition → Conversion
1. Organic content / ASO → App Store → download (post-launch month 3–4: web quiz → Stripe checkout, see §5).
2. Diagnostic onboarding quiz → **Composure Score** reveal (peak-motivation moment).
3. **Paywall** (hard): headline sells the 75-Day Protocol + a full year of reinforcement, one payment. Annual pre-selected; monthly secondary. "One payment covers your full year." No trial.
4. Purchase → **Oath** (Day Zero commitment device) → Day 1 unlocked.

### Act I — Days 1–75: The Protocol (unchanged)
- Daily loop: Auditory Anchor → Conditioning Track (1–5 control score) → Vitality Checklist. Midnight pacing lock. SOS reachable everywhere.
- Day 14: Composure re-measurement — the evidence-based risk reversal ("measured, not promised") and the retention hinge.
- Day 26: Somatic Sandbox unlocks; Phase 2 transition ceremony.
- Day 51: Phase 3 transition ceremony.
- Throughout: Thought Restructurer, Success Vault, Partner Guide, Baseline chart.
- Phase 3 content frames composure as **trained capacity that detrains like fitness** — seeds Act II/III identity without any sales language.

### Day 75 — Graduation (unlock ceremony, not a paywall)
- Endowment mechanics preserved: his own numbers and vault quote read back to him.
- The Mastery Suite **unlocks as earned membership content** — no purchase decision at the moment of peak triumph.
- Export path retained verbatim ("Both are wins.") as a trust artifact.

### Act II — Days 76–180: Consolidation
- Mastery Suite open: Somatic Copilot, Sensate Mastery, Refractory Window Guide, Anxious Partner De-escalator, Autonomic Sync (full).
- Cadence shifts from daily lock to weekly maintenance sessions (reuse anchor + Sandbox infrastructure). No drip-locks; post-75 DAU decline is expected and fine — the metric that matters is renewal rate.

### Act III — Days 181–365: Sustain & Re-measure
- Quarterly Composure re-measurements (reuse the tested onboarding composure module) at ~Day 180, ~Day 270, ~Day 350.
- Light maintenance library; Baseline chart continues as the accumulating personal record.

### Month 11 — Renewal-Evidence Screen
- Courtesy pre-renewal notice showing his own year of data (Composure trajectory, sessions completed, control-score curve) before the charge. Trust move and retention move in one screen. Renewal case = evidence + insurance ("keep the record, stay in condition"), never fear.

## 3. Feature → act mapping (existing code)

| Surface | Model V1 role | Model V2 role |
|---|---|---|
| `Paywall.tsx` | $49.99 one-time, "pay once, no subscription" | Annual-first membership offering; new copy |
| `useRevenueCat.ts` | one-time SKU + toolkit SKUs | membership subscription group; toolkit SKUs retired |
| `GraduationScreen.tsx` | toolkit purchase decision | pure unlock ceremony + export |
| `mastery.tsx` (locked cards) | $4.99-tier teaser | Act II future-pacing of included content ("Unlocks at graduation") |
| `copilot.tsx` | toolkit entitlement | day > 75 + active membership |
| `autonomic-sync.tsx` | toolkit preview | unchanged (Act II preview) |
| Onboarding composure module | Day-0 + Day-14 | + quarterly re-measurements (Act III) |
| `analytics.ts` | — | anonymous consent-based cohort telemetry (§7 exception) |

## 4. Launch-critical vs. runway (users buy Day 0; nobody reaches Day 26 for 26 days)

**Must ship at launch (next 3–4 days):**
1. Paywall: new offering, new copy, annual pre-selected, honest-billing language.
2. RevenueCat: subscription group, entitlement (`membership`), $99.99/$69.99/yr + $17.99/mo SKUs, experiment config.
3. Telemetry consent step in onboarding + core anonymous events (cannot be retrofitted — cohort data starts at first install).
4. Terms of Use / Privacy Policy: auto-renew disclosure, telemetry disclosure.
5. App Store metadata: subscription disclosure fields.
6. Remove/neutralize all "pay once, no subscription" copy anywhere in the app.

**Runway (ship after launch, before first cohort arrives):**
- By Day ~20: Day-14 re-measurement polish (if not already live).
- By Day ~70: GraduationScreen rewire to unlock ceremony; mastery entitlement change.
- By Day ~170: Act III quarterly re-measurement flow; weekly maintenance cadence.
- By Month 10: renewal-evidence screen.
- Month 3–4: web quiz → Stripe checkout funnel (Epic-ruling external purchase), email capture, winback flows.

## 5. Standing rules carried forward
- No refund language anywhere; Apple owns refunds.
- Price experiments upward only. No countdown offers, no trials, no discounts under pressure.
- Notification/lock-screen rules (CLAUDE.md §6) unchanged and binding.
- Deterministic content only; local-only privacy with the single §7 telemetry exception.

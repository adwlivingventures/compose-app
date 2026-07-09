# Claude Code build prompt — Model V2 launch scope

Copy/paste everything below the line into Claude Code, run from the repo root.

---

Read CLAUDE.md (§2 Commercial Model V2 and §7 telemetry exception are newly amended) and docs/BUSINESS-MODEL-V2.md in full before writing any code. We are migrating from the $49.99 one-time model to the annual-first membership model and launching in 3–4 days. Execute ONLY the launch-critical scope below, in order, as separate commits. All UI in Ember Dusk v2 via NativeWind (CLAUDE.md §6); all copy follows §8 tone rules; explain the conversion/retention mechanism in code comments where you change monetization surfaces.

## Task 1 — RevenueCat layer (`hooks/useRevenueCat.ts`, `services/` as needed)
- Replace the one-time product and the retired toolkit SKUs ($39.99/yr, $4.99/mo) with a single subscription group behind one entitlement id `membership`.
- Products: `compose_annual_9999` (primary), `compose_annual_6999` (experiment variant), `compose_monthly_1799` (secondary). Read prices from the RC offering — never hardcode price strings; the active annual product must come from the current Offering so RC Experiments can swap it.
- `hasPurchased` in `context/ProtocolContext.tsx` maps to the `membership` entitlement (active subscription). Preserve the existing restore-purchases path.
- Grandfather clause: if a legacy one-time entitlement exists from testing, treat it as `membership`-equivalent forever.

## Task 2 — Paywall (`components/onboarding/Paywall.tsx`, `PaywallDismiss.tsx`)
- New structure: annual pre-selected, monthly secondary, one dominant CTA (Hick's Law — this screen already follows one-primary-action; keep it).
- Headline sells the transformation, not the subscription: the 75-Day Protocol plus a full year of reinforcement, one payment. Required copy elements: "One payment covers your full year." / the Day-14 "measured, not promised" re-measurement as risk reversal / plain auto-renew disclosure near the CTA (App Review requires it; put it in muted micro-type, honest and calm, no asterisks-and-fine-print games).
- REMOVE every instance of "pay once, no subscription" and any one-time-purchase framing across the entire repo (grep for it — it exists in copy, comments, and the dismiss flow). The dismiss flow keeps its current psychology but must not promise non-subscription.
- No countdown, no discount, no trial, no refund language (CLAUDE.md §2).

## Task 3 — Telemetry consent + events (`services/analytics.ts`, onboarding)
- Implement the §7 exception exactly: anonymous, event-level, no identity, no free text, ever. One plain consent step in onboarding (declinable; decline = zero events, app fully functional). Calm, honest copy: we count anonymous milestones to prove the method works; never what you write or who you are.
- Core events: `onboarding_started`, `composure_measured {score, day}`, `paywall_viewed {variant}`, `purchase {term}`, `day_completed {day}`, `control_score {value, day}`, `sos_opened`, `restructurer_used {distortion}` (tag only, never text), `graduated`, `export_used`. Fire-and-forget, batched, silent failure offline.
- Add a unit test asserting the event schema whitelist — any event carrying a string payload outside the whitelist fails the test.

## Task 4 — Legal + metadata copy (`docs/terms-of-use.md`, `docs/privacy-policy.md`)
- Terms: auto-renewable subscription terms (title, length, price, renewal, cancellation via Apple ID settings), toolkit SKU language removed.
- Privacy policy: local-only storage statement retained, plus the anonymous telemetry disclosure and the decline option.
- Draft the App Store subscription metadata block (display name "Compose", subscription group name, promotional text) into docs/APP-STORE-METADATA.md, obeying §6 discretion rules — the stranger test applies to App Store copy a partner might see on a shared device.

## Task 5 — Repo-wide consistency sweep
- Update stale comments referencing the old model: `app/mastery.tsx` (currently says "$4.99/mo Somatic Maintenance Toolkit teaser" — now Act II future-pacing of included content; locked-card badge copy becomes "Unlocks at graduation"), `app/copilot.tsx` (toolkit entitlement → day > 75 && membership), `components/GraduationScreen.tsx` header comment (note: full graduation rewire is deliberately deferred — no user reaches Day 75 for 75 days; do NOT rebuild it now, just fix the props/comments so the purchase path compiles against the new RC layer without dead SKU references).
- `grep -ri "49.99\|39.99\|4.99\|pay once\|toolkit"` across app/, components/, content/, docs/ and resolve every hit (code, copy, or comment) to Model V2.

## Acceptance criteria (verify before declaring done)
1. Fresh install → quiz → composure → consent step → paywall shows annual pre-selected with RC-loaded localized prices → sandbox purchase of each SKU unlocks Day 1.
2. No string "pay once" or "no subscription" anywhere in the repo.
3. Telemetry: decline path sends zero network events (assert in test); accept path emits whitelisted events only.
4. `npx tsc --noEmit` clean; existing onboarding tests pass; new schema-whitelist test passes.
5. Run the app and screenshot the paywall — confirm Ember Dusk v2 compliance (accent ≤ 4 sand instances, CTA sentence case, no new colors).

Do NOT touch: the 75-day protocol content, the daily loop, ProtocolData.ts, the graduation ceremony UX rebuild, quarterly re-measurements, the renewal-evidence screen, or any web-funnel work. Those are sequenced post-launch in docs/BUSINESS-MODEL-V2.md §4.

# Ember v1 Redesign — Progress

Read this file first in any new session to resume without re-reading full chat history. Full design spec lives at `design/ember-v1/README.md` (source of truth) and `design/ember-v1/COMPOSE - Ember v1.dc.html` (E01–E19 reference renders + screenshots).

## Overall plan (5 phases, per design/ember-v1/README.md "Implementation Order")

1. **Ember token swap + serif fonts** across existing screens (E08–E17) — pure restyle, no logic changes. **✅ DONE (committed).**
2. **Breathing orb mechanic** (E10 conditioning, E15 SOS 4-7-8). **✅ DONE (committed).** Follow-up commit added soft haptic ticks at phase boundaries (expo-haptics — native module, needs a new EAS dev build to be felt).
3. **Funnel copy pass + Profile Readout** (E01–E05). **✅ DONE (committed).**
4. **Discreet Mode (E18)** — Face ID lock + app-switcher cover. **✅ DONE (committed).** Alternate icons + notifications still deferred (no assets / no notification system).
5. **Paywall A/B (E06 vs E07)**, with both copy corrections applied. **✅ DONE (committed). ALL FIVE PHASES COMPLETE.**

## Current dev build (2026-07-03)

EAS iOS development build succeeded at commit `8814be0` (all 5 phases + haptics): https://expo.dev/accounts/adwlv/projects/COMPOSE/builds/6de83f73-04b0-40bf-8920-48859c29220e — includes expo-haptics, expo-local-authentication, and the "Compose" display name. This is the build the on-device walkthrough should happen on.

## Remaining beyond the 5 phases

- **Claims-tightening pass — REQUIRED BEFORE LAUNCH (user-mandated 2026-07-03).** Full sweep of every user-visible string for unsupported stats, deterministic physiological promises, and treatment-claim adjacency. Known items already flagged during builds: "her heart rate **will** sync to yours" in `app/autonomic-sync.tsx` (→ "begins to sync"); "This manually overrides the ejaculatory reflex" in `app/copilot.tsx` (deterministic promise — soften to "interrupts"); Vitality Baseline mechanism claims in `app/vitality.tsx` ("essential for testosterone synthesis", "destroys melatonin production", "vast majority is synthesized during Deep/REM sleep"); Somatic Primer's "You are now controlling your autonomic nervous system"; paywall arm A's "$1,800+ sex therapy" price anchor (verify defensible); funnel education claims ("66 days on average" — Lally 2009, ok; "90%" already fixed to "most men"). Also covers all future ASO/App Store copy — the highest-scrutiny surface. Ban list per CLAUDE.md: cure/treat/heal/"digital therapeutic". Do this as its own dedicated pass with fresh eyes, not folded into a feature session.

- **E19 Graduation flow (Day 75)** — in the design bundle ("four product mechanics" incl. Day-75 graduation/continuation) but NOT in the 5-phase implementation order and not built. Current post-program state in `app/(tabs)/index.tsx` ("75 Days. Complete." + maintenance card) is the functional stand-in. E19 = evidence card from real logs + $4.99 keep-toolkit vs export-record choice.
- ~~E13 Day-complete dashboard variant~~ — **DONE** in the daily-loop fidelity pass (2026-07-03, after Phase 5): MainDashboard rebuilt to E08/E13 (250/6 ring, header wordmark + Steady-me pill replacing the bottom LifeBuoy bar, phase eyebrow below ring, "of seventy-five" in words, CTA "Begin today's session", E13 completed variant with checkmark ring + day-in-words + "Tonight's line" italic-serif card quoting the day's focus). Session copy: "ease" not "control" (E11), "Before the day closes" (E12), context line "Day N · {stage}" without phase, SOS row unboxed (copper dot + "Steady me — right now"). Two deliberate deviations from the renders: no "· 9 min" duration on the dashboard sub-line (no per-day duration data exists — showing a fabricated constant violates the deterministic-content rule) and Tonight's line quotes the day's `focus` string (the render's poetic line isn't authored content; if the user wants poetic per-day lines, that's a 75-line authoring task). Also Somatic Primer added post-Phase-5 (components/SomaticPrimer.tsx, gates Day 1 session, `@somatic_primer_done`); CLAUDE.md §6 now formally names Ember.
- **Signature resurfacing** at Day 25/50 + churn moments (E07 spec) — `@signature_data` is stored; resurfacing UX not built.
- Alternate app icons (need icon asset production), neutral notifications (need notification system — copy rules in CLAUDE.md §6 are binding when built).
- **On-device walkthrough of everything (Phases 1–5) + new EAS dev build** (expo-haptics, expo-local-authentication are native modules; display-name change also needs the rebuild).
- RC dashboard: `paywall_arm` subscriber attribute will appear on conversions automatically; if moving to RC Experiments later, swap the random assignment in `usePaywallArm` for offering-metadata/experiment reads.

Also pending: update CLAUDE.md §6 so "Ember" formally replaces the emerald/slate implementation description of Twilight Anchor (currently still describes old palette).

## Design tokens (already added to tailwind.config.js — DONE)

Colors: `ground` `#0C0B09`, `surface` `#161412`, `surface-deep` `#0F0E0C`, `tab` `#12100E`, `line` `#262220`, `line-soft` `#201D19`, `accent` `#C89B6D` (copper — ONE primary action per screen, never two), `accent-bright` `#D4A574`, `accent-soft` `#E8D8C3`, `on-accent` `#171310`, `ink` `#EDE8E2`, `body` `#B9B2A6`, `muted` `#8A8378`, `faint` `#6E675D`, `dim` `#57534B`, `scrim` `#050403`.

Fonts: `font-serif-light` (SourceSerif4_300Light — big numerals/display, 44-64px), `font-serif-regular` (400 — headings/questions, 23-30px), `font-serif-italic` (italic — quotes/signatures), `font-serif-semi` (600). Loaded via `@expo-google-fonts/source-serif-4` + `expo-font` in `app/_layout.tsx` with a blocking `useFonts` gate (ground-colored blank view until loaded, to avoid a fallback-font flash).

UI/body text stays system font. Eyebrow label pattern: 11px, w600, tracking 0.28em, uppercase, `muted` color — already matches most existing screens.

## What's DONE (uncommitted — nothing from Phase 1 committed yet)

- `tailwind.config.js` — full Ember token set added.
- `package.json` — added `expo-font`, `@expo-google-fonts/source-serif-4` (JS-only install, no rebuild needed, confirmed no native code).
- `app.json` — `expo-font` plugin auto-registered.
- `app/_layout.tsx` — font loading + blocking gate added.
- Global class/hex sed swap applied across ALL screens/components (slate→ember, emerald/amber→accent, shadow removal, scrim backdrop): `app/onboarding.tsx`, `app/session.tsx`, `app/index.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/progress.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/cbst.tsx`, `app/(tabs)/_layout.tsx`, `components/MainDashboard.tsx`, `components/AudioPlayer.tsx`, `components/ConditioningTrack.tsx`, `components/TriageCenter.tsx`.
- Tab bar: renamed "Progress"→"Baseline", "Profile"→"You" in `app/(tabs)/_layout.tsx` (per spec: tab bar is "Today · Restructure · Baseline · You"). Inactive tint corrected to `#6E675D` (faint).
- Bottom sheets (TriageCenter, Profile partner-guide modal) — background corrected from `bg-surface` to `bg-tab` with `border-line-soft` per spec (E14/E17 use `surface-tab`, not `surface`).
- Serif applied to: dashboard day numeral (6xl light) + anchor title + "Today Is Complete", Baseline tab heading + stat numerals, You-tab name heading + vault quote (italic), session.tsx control-score/checklist question headers, TriageCenter title, AudioPlayer track title.
- Stale comment fixed in `app/index.tsx` ("premium deep slate-950" → "Ember ground").

## Phase 1 completion notes (2026-07-03)

All seven checklist items done: welcome headline → serif-light 34px, session score squares → serif-light numerals, full serif sweep applied across onboarding (question headers, education titles, blueprint/paywall headlines, age-wheel/countdown/analyzer/price numerals) and tabs (Restructure header, 75-days-complete, partner-guide modal title). Eyebrow labels (10-11px uppercase) and button text correctly kept system-bold. Color grep clean (fixed one stale slate-950 comment in `app/_layout.tsx`). `npx tsc --noEmit` passes. Static visual check done against E01/E08/E11 reference renders — matches. **On-device check on the user's iPhone dev build still pending** (Windows machine, no simulator; web run unreliable due to native-only modules).

E01 render shows copy/layout deltas (left-aligned headline, "Find my baseline" CTA, privacy line) — those are Phase 3 funnel-template scope, intentionally not done in Phase 1.

Day 1 anchor audio: already handled and committed separately (`198332c Register Day 1 anchor audio`).

## Phase 2 completion notes (2026-07-03)

New shared `components/BreathingOrb.tsx` — the signature glow-orb. SVG radial copper gradient (0.26→0.05→0 stops, per .dc.html) inside an `Animated.View`; scale 1→1.18 with opacity 0.75→1 derived via interpolate, native driver. **Phase-synced, not symmetric sine**: glow expands over the real inhale duration and contracts over the exhale (holds full through the 4-7-8 retention) — README says "synced to phase durations from ProtocolData"; the HTML's symmetric keyframe was a prototype limitation. Canonical phase timings exported from the orb module (`CONDITIONING_PHASES` 4s/6s = 10s, `SOS_478_PHASES` 4/7/8 = 19s) — ProtocolData.ts is a day manifest, wrong home for them. Loop starts at mount (pre-tap entrainment), effect has empty deps + refs for callbacks so re-renders never restart it; `onPhaseStart(index, cycles)` callback drives all words/counters so text can't drift from the glow.

`ConditioningTrack.tsx` (E10): orb 280/260/180, phase word SOFTEN/ENGAGE inside (13px 0.22em accent-soft), counting starts at the first inhale *after* Begin (tap never jerks the animation; sub-line "Your count begins on the next inhale."), completion fires at the phase-0 boundary after breath 30's exhale finishes. 3px `line-soft` progress bar.

`TriageCenter.tsx` BreathingGuide (E15): orb 230/210/150, serif-light countdown numeral inside (1s interval reset on each `onPhaseStart`), labels kept as full clinical cues (nose in / lips out). **Auto-starts on mount** — acute-anxiety user shouldn't face a Begin decision (Hick's law / render shows running state as default); Stop → static circle + "Begin again"; restart remounts orb via `key={runId}` so it begins at the top of an inhale. Old `Animated`/`Easing` imports removed.

`npx tsc --noEmit` passes. **On-device check still pending for both Phase 1 and 2** (animation smoothness, orb sizing on the user's iPhone dev build). Haptics mentioned in README ("keep haptics/timer logic") don't exist in the current code — nothing was removed; adding phase-boundary haptics would need `expo-haptics` (not installed), flag as an option for the user.

## Phase 3 completion notes (2026-07-03)

All in `app/onboarding.tsx`:

- **E01 Welcome**: left-aligned layout, SVG radial copper glow bottom-center (520px, 0.13→0 at 65%), eyebrow "Compose" 0.32em, design-final sub-copy, lock-icon privacy row ("Private by design — no account, no sync, no lock-screen tells"), CTA "Find my baseline" (rounded-2xl, py-[19px], no chevron).
- **E02 template across the 23-step arc**: ProgressHeader now "MAPPING · N OF 23" + "~X min left" (estimate: `ceil((23-step)*12/60)` min — calibrated to match the renders: step 7→4 min, step 11→3 min) over a 3px copper-on-line-soft bar. ChoiceScreen: serif 23px questions, optional `normalization` prop (13px muted line under sensitive questions), icon-free option cards (radius 14, 17/18 padding, selected = accent-tint/accent-border/accent-soft), `PrivacyFooter` ("Answers stay on this phone. Always.") on all question-type screens (Choice/Name/Age). Normalization lines authored for: timeline, spectator (design-final), autonomic, partnerImpact, hardware, dopamine, bandaid, breath, mentalLoop. **Spectator question + options updated to design-final copy** ("watching yourself from the outside — evaluating instead of experiencing", "Yes — almost every time").
- **E03 Clench test**: serif "Let's feel it, not describe it.", design-final steps (serif copper numerals via reworked StepInstruction), 150px ClenchCircle (serif-light 34px numeral + 10.5px 0.2em label inside; shows "5 / Clench & hold" preview in ready state), CTA "Begin the 20-second check". Timer logic untouched. Result options restyled to template cards.
- **E04 Analyzer**: 190px ring, 6px stroke, serif-light 38px %, static design-final lines ("Structuring your neuroplasticity timeline" / "autonomic profile ✓ · pelvic baseline ✓ · 75-day sequence…"). Cycling mono labels removed.
- **E05 Profile Readout REPLACES BlueprintReadyScreen** (design flow is analyzer→readout→paywall; E05's "Your 75-day sequence is built" + "See my protocol" IS the blueprint-ready beat). `computeProfileMeters()` maps answers→three meters with deterministic weights: Sympathetic override (autonomic .6 + breath .4), Spectatoring loop (spectator .6 + mentalLoop .4), Pelvic release capacity (clench-test result; higher=better). Grades: load ≥70 High/≥45 Moderate/Low; capacity ≥70 Strong/≥35 Partial/Limited. High = accent-bright label + copper bar, else muted. Bars animate width 300ms ease-out on mount (MeterBar, JS driver — % width). Body copy interpolates the timeline answer ("established over 1–3 years" etc. via TIMELINE_PHRASES). **Phase 5 note: paywall arm A (E06) reuses these meters — `computeProfileMeters` is ready for it.**
- Funnel screens moved to 28px horizontal padding (px-7) + primary CTAs to radius-16/py-[19px] per token spec. Paywall (CheckoutScreen) deliberately untouched — Phase 5.

`npx tsc --noEmit` passes; verified against E01/E02/E03/E05 renders. On-device funnel walkthrough still pending.

## Phase 4 completion notes (2026-07-03)

- **`context/DiscreetContext.tsx`**: persists `@discreet_faceid` / `@discreet_blur` via LocalStore (repo's @-prefix convention for the spec's `discreet_faceid`/`discreet_blur` keys). No notifications key — CLAUDE.md §6 makes neutrality binding, not a preference (see below).
- **`components/PrivacyShield.tsx`** (mounted last in root layout, zIndex 999): (1) app-switcher cover — opaque ground card with wordmark when `appState !== 'active'` (opaque beats blur: no layout/color leak, no expo-blur native dep; E18 sub-copy adjusted "Covers the preview card…"); (2) Face ID gate — locks on cold start (after settings hydrate; hydration cover prevents content flash) and on `background` (NOT `inactive` — the biometric prompt itself fires inactive), auto-prompts on active, manual Unlock button, passcode fallback via authenticateAsync default. **Fail-open** if biometrics unavailable/module missing (old dev build) — never bricks. Switcher cover suppressed while auth prompt is up (authInFlight ref, re-render piggybacks on appState change).
- **`app/discretion.tsx`** (E18): eyebrow/serif header, icon picker section with Compose selected + Habits/Breathe cards **dimmed** ("Alternate icons and names arrive in a coming update" — no icon assets exist yet), Surfaces card with 3 rows: Neutral notifications **locked-ON disabled toggle** (neutrality is a guarantee per CLAUDE.md §6 — no off position exists by design), Face ID (live; availability check + confirm-authenticate before arming), Hide from app switcher (live, default off). Footer **corrects the E06/E18 "CMPS Media" claim**: "Billing is handled by Apple. Your card statement shows Apple — never this app's name." (statement-descriptor correction from the Phase 5 plan applied here too). Intro mode (`/discretion?intro=1`): no Back row, "Begin Day 1" CTA → tabs.
- **Wiring**: route registered in root Stack; You-tab nav card "Discretion" (EyeOff icon) under Partner Guide per E17; post-purchase flow now routes `onboarding → /discretion?intro=1 → tabs` (trust signal at peak exposure-fear moment, per README "surface once during onboarding after purchase").
- **`app.json`**: `expo-local-authentication` plugin with faceIDPermission "Face ID keeps Compose locked to you."; display name `"COMPOSE"` → `"Compose"` (CLAUDE.md §2 home-screen name — was a discretion violation, all-caps reads louder).
- **expo-local-authentication is a native module** — Face ID gate is inert (fail-open) on the existing dev build; needs the next EAS build, same as expo-haptics.

`npx tsc --noEmit` passes. On-device: test lock/unlock cycle, switcher cover timing (overlay must beat the iOS snapshot), and intro flow after the next EAS build.

## Phase 5 completion notes (2026-07-03)

All in `app/onboarding.tsx`. Old generic CheckoutScreen (crown/features/price cards) fully replaced.

- **`usePaywallArm()`**: random 50/50 at first paywall view → persisted `@paywall_arm` (user never sees the other arm) → `Purchases.setAttributes({ paywall_arm })` so every RC conversion event carries the arm. Comment marks the swap point for server-side RC Experiments later. Shell holds a ground view for the one AsyncStorage read so the first paywall frame is already the assigned arm.
- **Arm A `DiagnosisPaywall` (E06)**: compressed profile card reusing `computeProfileMeters(answers).slice(0,2)` + MeterBar (the receipt, not the report), "The 75-Day Reset, built for this profile", therapy-vs-COMPOSE price anchor row, guarantee card **reworded** ("14-day baseline check — …we'll help you request a full refund from Apple — one tap." — Apple owns refunds, we can't promise them; title also changed guarantee→check to avoid an FTC-ish "guarantee" we don't control), trust strip **corrected** ("Your card statement shows Apple — never this app's name."), CTA "Begin my reset — $49.99" + "$0.67 a day · pay once, keep it" sub-line.
- **Arm B `SignaturePaywall` (E07)**: "Day zero" eyebrow, serif 27 headline, commitment card with italic-serif oath (design-final copy) + typed-signature TextInput (serif italic 24px, baseline #3A362F — the spec-sanctioned TextInput fallback; draw-pad skipped for ScrollView gesture-conflict risk), "Signed on this device · seen by no one", stat trio 75/10min/$0.67, **CTA inert until signed** (effort-justification: purchase completes a promise already made). Signature saved to `@signature_data` `{name, signedAt}` at CTA press (survives interrupted purchases; resurfacing at Day 25/50 is future work).
- **Shell**: purchase/restore/entitlement-listener/advancedRef logic unchanged from the old paywall; `PaywallFooter` (Restore · Privacy · Terms) shared; dev-only row adds "View other arm" next to "Skip paywall". `Pathway`/`pathwayForPainPoint`/`PAYWALL_FEATURES` removed (paywall was their only consumer). CheckoutScreen prop changed `pathway` → `answers`.
- Note: this paywall sells only the one-time IAP (no auto-renewable sub on-screen), so the old "$4.99/mo after Day 75" feature line is gone per design; the continuation is offered at graduation (E19, unbuilt).

`npx tsc --noEmit` passes; verified against E06/E07 renders. Sandbox purchases still blocked on Paid Applications Agreement (user-deferred) — dev testing via the dev-skip link.

## Context the next session needs (don't re-derive)

- Repo: `adwlivingventures/compose-app` (private), legal docs live in separate public repo `adwlivingventures/compose-legal` (GitHub Pages, already live).
- App is fully wired end-to-end already (funnel→paywall→daily loop→SOS→progress→profile), RevenueCat two-entitlement model verified against dashboard, entry point fixed (`expo-router/entry`), mic permissions blocked both platforms, EAS dev build has been successfully installed and run on the user's iPhone (background audio, purchases-in-dev all previously verified working before this redesign started).
- User has an Apple Developer account; Paid Applications Agreement / banking / tax was deferred by user choice — real sandbox purchases are blocked until that's done. Dev builds use `hasProAccess`-driven dev-only "Skip paywall" link + production RC key (not test key) to work around empty Test Store offerings.
- Standing user instructions (also in Claude's cross-session memory, `~/.claude/projects/.../memory/`): (a) audit any pasted blueprint against actual repo state before executing — several past prompts were stale; (b) proactively surface expert product/clinical recommendations while building, grounded in mechanism, per CLAUDE.md's dual DTC-architect/clinical-sexologist persona directives.
- CLAUDE.md in repo root is the binding spec (persona, brand, 75-day protocol architecture, daily loop, notification copy rules, tech constraints) — read automatically every session, don't duplicate its content here, just know it governs every decision.

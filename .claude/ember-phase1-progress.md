# Ember v1 Redesign — Phase 1 Progress (token swap + serif pass)

Read this file first in any new session to resume without re-reading full chat history. Full design spec lives at `design/ember-v1/README.md` (source of truth) and `design/ember-v1/COMPOSE - Ember v1.dc.html` (E01–E19 reference renders + screenshots).

## Overall plan (5 phases, per design/ember-v1/README.md "Implementation Order")

1. **Ember token swap + serif fonts** across existing screens (E08–E17) — pure restyle, no logic changes. **✅ DONE (committed). Phase 2 (breathing orb) is next.**
2. Breathing orb mechanic (E10 conditioning, E15 SOS 4-7-8) — replace current simple scale animation with the signature glow-orb per spec.
3. Funnel copy pass + new Profile Readout screen (E02 template applied to all 23 onboarding steps, E05 new screen between analyzer and paywall).
4. Discreet Mode (E18) — Face ID lock + app-switcher blur now; alternate app icons + neutral notifications deferred (assets/notification system don't exist yet).
5. Paywall A/B (E06 vs E07) via RevenueCat offerings — **with corrections**: E06's "guaranteed refund" claim must be reworded (Apple controls refunds, we can't promise them — say "we'll help you request one, one tap" instead), and the "statement reads 'CMPS Media'" claim is wrong (Apple Pay statements always show "Apple", not merchant name — this is actually a *stronger* trust claim, use it).

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

## Context the next session needs (don't re-derive)

- Repo: `adwlivingventures/compose-app` (private), legal docs live in separate public repo `adwlivingventures/compose-legal` (GitHub Pages, already live).
- App is fully wired end-to-end already (funnel→paywall→daily loop→SOS→progress→profile), RevenueCat two-entitlement model verified against dashboard, entry point fixed (`expo-router/entry`), mic permissions blocked both platforms, EAS dev build has been successfully installed and run on the user's iPhone (background audio, purchases-in-dev all previously verified working before this redesign started).
- User has an Apple Developer account; Paid Applications Agreement / banking / tax was deferred by user choice — real sandbox purchases are blocked until that's done. Dev builds use `hasProAccess`-driven dev-only "Skip paywall" link + production RC key (not test key) to work around empty Test Store offerings.
- Standing user instructions (also in Claude's cross-session memory, `~/.claude/projects/.../memory/`): (a) audit any pasted blueprint against actual repo state before executing — several past prompts were stale; (b) proactively surface expert product/clinical recommendations while building, grounded in mechanism, per CLAUDE.md's dual DTC-architect/clinical-sexologist persona directives.
- CLAUDE.md in repo root is the binding spec (persona, brand, 75-day protocol architecture, daily loop, notification copy rules, tech constraints) — read automatically every session, don't duplicate its content here, just know it governs every decision.

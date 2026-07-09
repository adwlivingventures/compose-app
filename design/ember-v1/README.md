# Handoff: COMPOSE — Ember v1 Redesign

> **⛔ SUPERSEDED ARCHIVE.** Ember Dusk v2 replaced this design system
> (CLAUDE.md §6), and Model V2 (2026-07-08) replaced the $49.99 one-time /
> toolkit commercial copy shown in these renders — including a refund-
> guarantee line that is now banned on every surface. Nothing in this
> folder may be copied into the app. Kept for design history only.

## Overview

Full visual + product redesign of COMPOSE, a 75-day autonomic retraining app for men with performance anxiety / erectile-related distress (Expo / React Native / expo-router / NativeWind, repo: `adwlivingventures/compose-app`).

The redesign replaces the current bright emerald-on-slate "clinical fitness" look with **Ember** — a warm, low-chroma, candlelight system — and adds four product mechanics: a live breathing-orb, a paywall A/B test, a Discreet Mode feature, and a Day-75 graduation/continuation flow.

**Design rationale (why Ember):** the app's job is nervous-system down-regulation. Warm low light is a parasympathetic safety cue; high-chroma green is stimulating. The serif numerals and editorial tone shift the register from "medical app" to "private practice."

## About the Design Files

The files in this bundle are **design references created in HTML** (`COMPOSE - Ember v1.dc.html` is the source of truth; the other two files show the current-state recreation and the exploration round). They are prototypes showing intended look and behavior — **not production code**. The task is to recreate these designs in the existing Expo/React Native codebase using its established patterns: expo-router file-based routing, NativeWind classes (extend `tailwind.config.js` with the Ember tokens below), `lucide-react-native` icons, `react-native-svg` for rings/charts, existing AsyncStorage keys and `ProtocolData.ts` structure.

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, and copy are final. Recreate pixel-perfectly. Copy strings are deliberate (behavioral-psychology reviewed) — do not paraphrase them.

## Design Tokens

Extend `tailwind.config.js` — replace slate/emerald usage with:

| Token | Value | Usage |
|---|---|---|
| `ground` | `#0C0B09` | All screen backgrounds |
| `surface` | `#161412` | Cards, inputs |
| `surface-deep` | `#0F0E0C` | Secondary/nested cards |
| `surface-tab` | `#12100E` | Tab bar |
| `border` | `#262220` | Card borders (1px) |
| `border-soft` | `#201D19` | Dividers, tab bar top border |
| `accent` | `#C89B6D` | THE copper. Primary CTA fill, progress rings/bars, active tab, selected borders |
| `accent-bright` | `#D4A574` | "High" severity labels |
| `accent-soft` | `#E8D8C3` | Text on accent-tinted surfaces |
| `accent-tint` | `rgba(200,155,109,0.08–0.12)` | Selected card fills |
| `accent-border` | `rgba(200,155,109,0.4–0.55)` | Selected card borders |
| `text` | `#EDE8E2` | Headings, primary text |
| `text-body` | `#B9B2A6` | Body copy |
| `muted` | `#8A8378` | Secondary text, labels |
| `faint` | `#6E675D` | Tertiary |
| `dim` | `#57534B` | Fine print, inactive |
| `on-accent` | `#171310` | Text/icons on copper buttons |

**Color discipline:** copper is reserved for the single primary action and progress indication on each screen. Everything else is neutral. Never two copper CTAs on one screen.

### Typography

- **Display / numerals / diagnostic questions:** Source Serif 4 (Google Fonts, `@expo-google-fonts/source-serif-4`), weight 300 (display) / 400 (headings). Big numerals: 44–64px w300. Screen titles: 26–30px w300. Section/question serif: 23–27px w400. Signature/quotes: italic.
- **UI / labels / body:** system font (SF Pro). Body 13–15.5px; labels 10–12px, weight 600–700, letter-spacing 0.14–0.32em, uppercase.
- **Eyebrow label pattern** (every screen): 11px, w600, letter-spacing 0.28em, uppercase, color `muted`.

### Spacing & shape

- Screen horizontal padding: 28px (26px on dense paywall).
- Card radius 16–18px, buttons 16px (12px nested), pills 999px.
- Primary CTA: full-width, 19px vertical padding, copper fill, `on-accent` text 16px w700. No shadows anywhere — flat surfaces + 1px borders only.
- Tab bar: 4 items — Today · Restructure · Baseline · You. Active = copper text w600, inactive = `faint`. Background `surface-tab`, top border `border-soft`.

## Screens / Views

All screens are in `COMPOSE - Ember v1.dc.html`, labeled E01–E19 (each `<section>` child has a `data-screen-label`). 390×844pt reference frame.

### Flow 1 — Onboarding → Paywall (`app/onboarding.tsx`)

- **E01 Welcome.** Ground bg with a radial copper glow bottom-center (`rgba(200,155,109,0.13)` → transparent, ~520px circle). Eyebrow "COMPOSE", serif 34px w300 headline "Your body isn't failing you. / It's following orders.", sub-copy, then a lock-icon row: "Private by design — no account, no sync, no lock-screen tells". CTA "Find my baseline". *Privacy promise must appear before the first question.*
- **E02 Diagnostic template.** Header: "MAPPING · 7 OF 23" left, "~4 min left" right (11px `dim`), 3px progress bar (copper on `border-soft`). Question in serif 23px. **Normalization line** under sensitive questions (13px `muted`), e.g. `Clinicians call this "spectatoring." It has a name because it's common.` Options: full-width cards, 14px radius; selected = accent-tint fill + accent-border + `accent-soft` text. Footer: "Answers stay on this phone. Always." — Apply this template to all 23 steps of the existing questionnaire; replace raw step-count with time-remaining estimate.
- **E03 Clench test.** Serif heading "Let's feel it, not describe it.", 3 numbered steps in a surface card (serif copper numerals), 150px circular countdown ring (serif "5" + "CLENCH & HOLD" label), CTA "Begin the 20-second check". Keep existing 20s timer logic.
- **E04 Analyzer.** Centered 190px progress ring (copper arc on `border-soft` track, 6px stroke), serif percentage. Line 1: "Structuring your neuroplasticity timeline". Line 2 (12px `dim`): "autonomic profile ✓ · pelvic baseline ✓ · 75-day sequence…". ~3.5s duration (existing).
- **E05 Profile readout.** NEW screen between analyzer and paywall. Eyebrow "YOUR MAP", serif "Marcus, here is what your answers show." Card with 3 severity meters (Sympathetic override — High 82%, Spectatoring loop — High 74%, Pelvic release capacity — Partial 38%; bars 5px, copper for High / `muted` for Partial). Body: "This is a conditioned adrenaline response… learned means reversible." CTA "See my protocol". Meters derive from questionnaire answers (map answer weights → 0–100).
- **E06 Paywall arm A — "Diagnosis Stack."** Top: compressed profile card (2 meters + "Reversible with daily somatic retraining."). Title "The 75-Day Reset, built for this profile". Price anchor row: struck-through "Sex therapy, 12 weeks / $1,800+" card next to highlighted "COMPOSE, 75 days / $49.99 once" card. Guarantee card (shield icon): "14-day baseline guarantee — if your control score hasn't moved after 14 days, full refund." Trust strip: "No subscription. Statement reads 'CMPS Media.' Notifications stay neutral." CTA "Begin my reset — $49.99" with sub-line "$0.67 a day · pay once, keep it". Footer links.
- **E07 Paywall arm B — "Signature."** Eyebrow "DAY ZERO", serif "This only works if you show up. So we start with your word." Commitment card: italic serif oath ("For the next 75 days I will give this ten minutes a day. Not to perform better — to stop performing at all."), signature line (user draws/types name; store locally, resurface at Day 25/50 and churn-risk moments), caption "Signed on this device · seen by no one". Stat trio: 75 days / 10 min a day / $0.67 a day, once. CTA "Sign & begin — $49.99".
- **A/B:** run E06 vs E07 as RevenueCat offerings/experiment; both sell the same one-time $49.99 IAP.

### Flow 2 — Daily loop (`app/(tabs)/index.tsx`, `app/session.tsx`)

- **E08 Today dashboard.** Header: eyebrow "COMPOSE" left; "Steady me" pill right (surface, copper 6px dot, opens Triage). Center: 250px ring (6px stroke, copper progress arc, round cap) containing "DAY / 12 (serif 64 w300) / of seventy-five". Below ring: copper eyebrow "PHASE I · THE AUTONOMIC RESET", serif 22px anchor title, sub "Low-excitation vascular retraining · 9 min". CTA "Begin today's session" (play icon). Footnote: "11 consecutive days · rest is part of the work". Tab bar.
- **E09 Session 1/4 — Anchor.** Step dots top-left (4 segments, active = 30px copper, done = copper, todo = `border`), close button top-right. Context line "Day 12 · The Anchor". Centered: instructions, serif track title, 84px copper play/pause circle, 4px progress bar + elapsed/remaining (NO scrubber — retain existing no-seek logic). Persistent "Steady me — right now" row at bottom (copper dot + text, not boxed).
- **E10 Session 2/4 — Conditioning orb.** THE signature mechanic. 280px orb: outer radial glow animating scale 1→1.18 on the breath cycle (10s, ease-in-out, infinite — drive with `Animated`/Reanimated loop synced to phase durations from `ProtocolData`), inner 180px circle (accent-tint fill, 1.5px accent border) with phase word "SOFTEN" (13px, 0.22em tracking). Below: instruction "Inhale — release, let go", counter "breath 7 of 30", 3px progress bar. *The orb animates from mount so the user entrains before tapping anything.*
- **E11 Session 3/4 — Control score.** Serif question "How much ease did you feel through the sequence?", reframe line ("…a signal you're learning to read, not a grade."), five 56px option squares (serif numerals; selected = accent tint/border), scale captions "Very little / Complete ease".
- **E12 Session 4/4 — Check-in.** Serif "Before the day closes". Three habit cards (Presence work / Clean focus / Vitality habit) — checked = accent tint + copper checkbox, unchecked = surface + outlined box. CTA "Complete Day 12". Caption: "Answer honestly — an unchecked box is information, not failure."
- **E13 Day complete.** Dashboard variant: ring shows checkmark + serif "Twelve / days composed", "Today is complete.", "Day 13 unlocks at midnight. / Rest is part of the work." Bottom card "Tonight's line" quoting the day's session description in italic serif. No further CTA (closure, no pressure).

### Flow 3 — Steady Me / SOS (`components/TriageCenter.tsx`)

- **E14 Triage sheet.** Bottom sheet over dimmed ground (`rgba(5,4,3,0.72)`), `surface-tab` bg, 26px top radius, grab handle. Serif title "Steady. You're in the right place.", sub "Pick the moment you're in." Three option cards (icon in 38px circle, title + one-line description): "Before — rising pressure" / "During — watching yourself" / "Afterward — the replay has started". Keep existing branch logic.
- **E15 Breathing (4-7-8).** Same orb language as E10: 230px orb, glow period 19s (4+7+8), inner circle shows serif countdown numeral, phase word below ("Hold"), "2 cycles complete · four is usually enough", Stop button (surface, border). Keep haptics/timer logic.

### Flow 4 — Tabs & retention

- **E16 Baseline tab** (`progress.tsx`, rename tab to "Baseline"). Eyebrow "AUTONOMIC ACCLIMATION", serif "Your baseline". Stat trio cards (12 days done / 11 day streak / +1.1 baseline shift — shift numeral in copper). Control-score line chart (copper 2.5px polyline on `border-soft` gridlines, dot on latest point only). Insight line: "Your recent scores average **1.1 higher** (copper) than your first week. That's not willpower — it's conditioning taking hold." Vitality consistency card: 3 labeled 5px bars at 75% copper opacity.
- **E17 You tab** (`profile.tsx`, rename to "You"). Serif name heading. Two nav cards: "Partner guide" and "Discretion" (→ E18). "THE VAULT · LOCAL RECORD ONLY" section: entries in italic serif with date + distortion tag (uppercase 10px). Footer: "Everything on this screen lives only on this device." Account rows (Restore purchases, Reset baseline) unchanged.
- **E18 Discreet Mode.** NEW feature — **build first**. Eyebrow "DISCRETION", serif "Unreadable at a glance". (1) App icon & name picker: 3 cards — Compose (default, selected), "Habits" (periwinkle plus glyph), "Breathe" (sage arrow glyph) — implement via iOS `setAlternateIconName` / `expo-alternate-app-icons`. (2) Surfaces list: toggles for Neutral notifications ("'Today's session is ready.' Never more." — ON), Face ID to open (`expo-local-authentication` — ON), Hide from app switcher (blur overlay on `AppState` inactive — OFF). Footer: statement descriptor note. Toggle: 44×26px, copper when on. Surface this screen once during onboarding (after purchase) as a trust signal.
- **E19 Graduation (Day 75).** Copper eyebrow "DAY SEVENTY-FIVE", serif "The protocol is over. / The baseline is yours." Evidence card "WHAT YOU BUILT · FROM YOUR OWN LOGS": serif stat trio (75 days / 2.1→4.3 control score / 19 anchors written — computed from real logs) + the user's own vault quote with "— you, Day 21". Offer card "Keep the toolkit within reach": $4.99/mo description ending "Both are wins."; two equal buttons — "Keep the toolkit" (copper) and "I'm done — export my record" (outlined; generates a local text/PDF export). Footer: "Your data stays on this device either way."

## Interactions & Behavior

- **Orb animation:** scale 1→1.18 + opacity 0.75→1, ease-in-out, looped; period = breath cycle from protocol data (10s conditioning, 19s for 4-7-8). Phase word and counter update on phase boundaries. Never restart the loop on re-render.
- **Session flow:** linear 4 steps, step dots advance, close button confirms exit. Audio continues under lock screen (existing expo-av config).
- **Day gating:** next day unlocks at local midnight (existing logic). E13 replaces the dashboard after completion.
- **Transitions:** screen fades 200–250ms; selection states instant; progress bars animate width 300ms ease-out.
- **Paywall A/B:** assign arm once at first paywall view, persist assignment, log arm with conversion event.
- **Signature (E07):** capture via `react-native-svg` draw pad or styled TextInput fallback; store locally only.

## State Management

Existing AsyncStorage keys continue to work (day index, streak, control scores, checklist, vault entries, purchase flag). New keys: `discreet_icon`, `discreet_faceid`, `discreet_blur`, `discreet_notifications`, `paywall_arm`, `signature_data`, `graduation_choice`.

## Assets

- No image assets. All icons are `lucide-react-native` (already a dependency): lock, play, pause, check, x, shield-check, wind, anchor, pencil, users, chevrons.
- Fonts: Source Serif 4 (300/400/600 + italics) via `@expo-google-fonts/source-serif-4`.
- Alternate app icons (Habits, Breathe) need to be produced as icon sets — glyph references are in E18.

## Files

- `screenshots/` — one PNG per screen (`E01-welcome.png` … `E19-graduation.png`), 390×844 reference renders for quick visual diffing.
- `COMPOSE - Ember v1.dc.html` — **source of truth**: all 19 production screens (E01–E19) with exact values, plus token sheet and implementation order.
- `COMPOSE - Redesign.dc.html` — exploration round: 4 dashboard directions, 3 paywall strategies, rationale for every choice (context for "why").
- `COMPOSE - Current UI.dc.html` — faithful recreation of the current build (before state, for diffing).
- `ios-frame.jsx`, `support.js` — HTML preview scaffolding only; ignore for implementation.

Open the `.dc.html` files in a browser to inspect; every screen carries a `data-screen-label` matching the E-numbers above.

## Implementation Order

1. **Discreet Mode (E18)** — churn insurance; ship before restyle.
2. **Ember token swap** across existing screens (E08–E17) — pure restyle, no logic changes.
3. **Breathing orb** in conditioning + SOS (E10, E15).
4. **Funnel copy pass + profile readout** (E02, E05).
5. **Paywall A/B** (E06 vs E07) via RevenueCat offerings.

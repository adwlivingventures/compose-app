# COMPOSE — Deepwater v2.1 Design Overhaul

**Status:** DRAFT — founder review required before implementation  
**Date:** 2026-08-05 (v2.1 calibration applied same session)  
**Scope:** Complete visual reskin. No code changes until approved.

---

## v2.1 calibration (founder-agreed)

Six refinements applied after reference-app review. **v2.1 supersedes v2 token values**; layout and screen inventory unchanged.

| # | Change | v2 | v2.1 |
|---|--------|-----|------|
| 1 | Desaturate current, reduce bloom | `#5FD4C1` / 14px glow | `#4EC4B4` / 10px glow · one luminous element per screen |
| 2 | Two-tier CTAs | Aqua on all primaries | **Bone** `#E5E7EB` for navigation · **Aqua** for session orb + commitment only |
| 3 | Surface lift + depth | `#121A24`, 4–6% radials | `#151E28`, 8–10% radials |
| 4 | Composure score color | Aqua numeral + glow | **Ink** numeral · aqua on ring only |
| 5 | Split ember tier | `#C89B6D` everywhere | `#A89078` default · `#C89B6D` **ember-ceremony** (phase, sealed, graduation) |
| 6 | Cooler body text | `#9CA8B4` | `#94A3B0` |

### CTA tier rules (v2.1)

| Tier | Token | Use |
|------|-------|-----|
| **Current** | Aqua gradient + soft bloom | Today Start orb, Seal session, Begin membership |
| **Bone** | `#E5E7EB` fill, `#0A0F16` label | Continue, Find my baseline, map advance, discretion |
| **Secondary** | Text only `#3B4A58` | Exit for now, I have doubts, Return home |

### Ember tier rules (v2.1)

| Token | Hex | Use |
|-------|-----|-----|
| `ember` | `#A89078` | Mirror lines, hooks, subtle identity copy |
| `ember-ceremony` | `#C89B6D` | Phase names, sealed-day mark, graduation, oaths |

---

## 1. What this is

Deepwater v2 synthesizes the reference-app research brief into an evolved design system for COMPOSE. It keeps every clinical, privacy, and product constraint from `CLAUDE.md` while borrowing specific *mechanisms* from six reference apps — not their surface aesthetics wholesale.

**Deliverables in this folder:**
- `DESIGN-SPEC.md` (this file) — tokens, components, screen archetypes
- `compose-deepwater-v2-mockup.html` — 13 hi-fi v2.1 frames (open in browser)
- `compose-full-screen-catalog.html` — all 92 app screens (Figma import)

**Figma import:** use the `.html` files only — drag into html.to.design → File tab. Do not use `.mjs` or other build scripts.

**Not included:** Native Figma `.fig` file. See §9 for import paths.

---

## 2. Reference synthesis

| App | Steal | Avoid | Applied in v2 |
|-----|-------|-------|---------------|
| **Breathwrk** | Dark session as single instrument; breath-paced motion | Bright category colors | Conditioning + Anchor sessions are full-bleed instruments with one orb/ring; no colored category chips |
| **Opal** | Premium gem depth; restrained gradients; paywall = joining; receding tab bar | Stat-density on progress | Floating glass tab bar; paywall framed as membership; Progress tab shows trend lines not dashboards |
| **Tide** | Atmospheric depth on dark fields; typographic calm | Photographic backgrounds | Abstract depth layers (radial noise + gradient fields); no photos ever |
| **Headspace** | Onboarding pacing; one question per screen; paywall warmth | Playful illustration; light mode | Generous vertical rhythm; 26px question + 44px tap targets; warm membership copy |
| **Calm** | Evening dimmed sensibility; audio player restraint | Library sprawl; upsell frequency | Anchor player: title + scrubber + pause only; no secondary actions row |
| **QUITTR** | Dignity + directness for stigmatized problem; masculine calm | Streak counters; shock stats | Direct onboarding copy; **zero** streak/urgency mechanics |

**Hard anti-patterns (never):** Duolingo celebration layer · ring-closing fitness urgency · crypto-neon on black.

---

## 3. Color system

### Core tokens (v2.1)

| Token | Hex | Role |
|-------|-----|------|
| `ground` | `#0A0F16` | App background — always |
| `surface` | `#151E28` | Cards, inputs, tab bar glass base |
| `surface-deep` | `#0D1319` | Session instrument backgrounds |
| `line` | `#223140` | Hairlines, dividers, progress track |
| `ink` | `#EDF2F5` | Primary text, Composure score numeral |
| `body` | `#94A3B0` | Secondary text, weight 300 |
| `dim` | `#5A6878` | Tertiary, footers |
| `current` | `#4EC4B4` | **Next step only** — ring, orb, one CTA per screen |
| `current-bright` | `#6FD9CC` | CTA gradient core (center) |
| `current-deep` | `#3A8FBF` | CTA gradient edge, depth accent |
| `on-current` | `#06232A` | Text on current fill |
| `bone` | `#E5E7EB` | Navigational CTA fill |
| `on-bone` | `#0A0F16` | Text on bone fill |
| `ember` | `#A89078` | Identity copy — mirror lines, hooks |
| `ember-ceremony` | `#C89B6D` | Phase names, sealed-day, graduation only |
| `gain` | `#78C99A` | Positive delta with ▲ label only |
| `sos` | `#C96A55` | SOS surfaces — matte, never glows |

### Atmospheric depth (Tide-inspired, abstract only)

Three layered radial fields at **8–10%** opacity on session + onboarding screens:

```
depth-a: radial at 50% 20%, rgba(58,143,191,0.09) → transparent 70%
depth-b: radial at 80% 80%, rgba(78,196,180,0.07) → transparent 60%
depth-c: radial at 10% 60%, rgba(168,144,120,0.05) → transparent 50%
```

No photography. No illustrated characters. No light mode.

### Accent discipline (unchanged, enforced harder)

- `current` ≤ **4 uses per screen** (CTA, one progress fill, one selection state, one ring segment)
- `ember` ≤ **2 uses per screen** (never a CTA)
- SOS never emits, never animates glow

---

## 4. Typography

| Role | Family | Weight | Size | Notes |
|------|--------|--------|------|-------|
| Display / questions | Newsreader | 400–500 | 26–32px | Left-aligned on questions |
| Mirror / oath / identity | Newsreader italic | 400 | 19–24px | Ember-colored sparingly |
| Body | System sans | 300 | 15–16px | Line-height 1.5 |
| UI labels / CTAs | System sans | 500 | 15px | Sentence case on emotional CTAs |
| Eyebrow / progress | System sans | 600 | 10px | 2px tracking, uppercase |
| Wordmark | System sans | 300 | 10px | 5px tracking: COMPOSE |

Minimum body: 11px. Tap targets: 44px.

---

## 5. Components

### 5.1 CTA tiers (v2.1)

**Current CTA** — session + commitment only. Full-width pill, radius 999.

- Fill: linear-gradient(180deg, `#6FD9CC` 0%, `#4EC4B4` 55%, `#3A8FBF` 100%)
- Bloom: `0 0 10px rgba(78,196,180,0.18)` — **one element per screen**
- Label: `#06232A`, weight 500

**Bone CTA** — all navigational/onboarding advances.

- Fill: `#E5E7EB`, label `#0A0F16`, weight 500
- No glow, no gradient

Navigational CTAs ("Continue", "Find my baseline") use bone. Emotional commitment ("Begin membership") uses current.

### 5.2 Receding tab bar (Opal-inspired)

- Floating pill, 24px from bottom, 16px horizontal inset
- Background: `rgba(21,30,40,0.55)` + backdrop-blur 20px
- Border: 1px `rgba(255,255,255,0.06)`
- **Today tab:** raised center node with 5-segment session ring
  - Track: `rgba(255,255,255,0.10)`
  - Fill: `#5FD4C1`
  - Sealed: `#C89B6D` at 55% opacity, glow OFF
- Other tabs: 22px line icons, `#5A6878` inactive / `#EDF2F5` active
- No badges, red dots, or counts — ever

### 5.3 Answer card (Headspace pacing)

- Surface card, radius 16, 18px padding
- Radio: 18px circle, 1px `#223140` border
- Selected: 1px `#5FD4C1` border + 8px filled dot + subtle bloom
- Auto-advance 250ms after single-select
- One question fills the viewport — generous top padding (**96px**)

### 5.4 Session instrument (Breathwrk-inspired)

Full-bleed `surface-deep` ground. Chrome minimized.

**Conditioning Track:**
- Central breath orb: 220px default, scales to 280px on inhale
- Concentric guide rings at 10% / 6% white opacity
- Phase label inside orb: "Inhale" / "Hold" / "Release" — system 500, 18px
- Top: technique chip (4-6 pattern icons) — translucent surface pill
- Bottom: pause + elapsed time only — no settings row, no share, no like

**Auditory Anchor (Calm restraint):**
- Title + phase eyebrow centered upper-third
- Thin scrubber, pause/play only — no thumbs-up, share, playlist, timer row
- Background: abstract depth layers, no album art photography

### 5.5 Paywall (Opal join + Headspace warmth)

- No countdown. No "limited time." No strikethrough theater.
- Headline: transformation, not price ("Your 75-day protocol — and a full year to make it yours")
- Annual card selected by default; monthly secondary
- Feature list: 4 items max, current icons — not a wall of bullets
- Primary CTA: current tier — "Begin membership — $99.99/yr"
- Annual card: **inner border** `inset 0 0 0 1px rgba(78,196,180,0.12)` — no outer glow
- Honest billing line below: "One payment covers your full year."
- Dismiss (B-40): dimmed results + goal echo — no urgency

### 5.6 Progress (anti–stat-density)

**Steal from Opal's calm home, avoid Opal's score history density.**

- Composure trend: single line chart, no y-axis numbers
- Control scores: 7-day dot strip, not a dashboard grid
- Phase marker: ember label only ("Phase 2 · Exposure")
- No streaks. No "days in a row." No ring-close animations.

### 5.7 SOS surface

- Matte `#C96A55` on `#121A24` card — no glow, no pulse animation
- One grounding sequence entry per tap
- Always reachable; never competes with session CTA for accent

---

## 6. Screen inventory (v2 reskin)

| # | Screen | Archetype | Key v2 change |
|---|--------|-----------|---------------|
| 1 | Today Home | Dashboard | Breathwrk Start orb + duration pill; Calm evening greeting; Opal glass tab bar |
| 2 | Session — Conditioning | Instrument | Breathwrk orb; Tide depth layers on full-bleed dark |
| 3 | Session — Auditory Anchor | Instrument | Calm-minimal player (title + scrubber + play) |
| 4 | Onboarding question | Single-select | Headspace pill cards, generous vertical rhythm |
| 5 | Paywall | Membership | Opal join framing + restrained CTA gem edge |
| 6 | Progress | Trend | Minimal line + dot strip — no Calm streak ring |
| 7 | SOS | Triage | Matte clay, static, no glow |
| 8 | **Composure Score (Your Map)** | Results | Ring hero + gauge + severity bars; Headspace reveal pacing |
| 9 | Vitality Checklist | Checklist | Three binary toggles; no grades |
| 10 | Welcome | Chapter | QUITTR dignity + Tide depth; one primary CTA |
| 11 | Clinical card | Chapter | Abstract node visual; no photography |
| 12 | Discretion setup | Settings | Live lock-screen preview; user-picked level |
| 13 | Day sealed | Identity | Ember mark; no celebration layer; ring glow off |

---

## 7. Motion

| Context | Motion | Reference |
|---------|--------|-----------|
| Breath orb | Scale 1.0→1.27 inhale, 4s ease-in-out | Breathwrk |
| CTA press | Bloom expand + dim | Deepwater v1 |
| Tab bar | Fade recede on scroll (opacity 0.6) | Opal |
| Onboarding advance | 250ms crossfade, no slide celebration | Headspace |
| Day sealed | Ring segment → ember, glow off | Deepwater v1 |
| **Never** | Confetti, bounce, ring-close urgency | Anti-patterns |

---

## 8. What stays frozen

Per `.cursorrules` and `CLAUDE.md`:
- Composure measurement weights
- Pelvic check phases
- Notification copy pipeline
- No runtime-generated text
- No streak/urgency anywhere

---

## 9. Figma import paths

This package does **not** include a native `.fig` file. Options:

1. **html.to.design** (Figma plugin) — import `compose-deepwater-v2-mockup.html` directly
2. **Manual build** — use tokens in §3–5; mockup HTML as visual reference
3. **Screenshot import** — open mockup in browser, import frames via Figma
4. **Figma REST API** — if you provide a personal access token, a follow-up session can push frames programmatically

---

## 10. Approval checklist

Before implementation, confirm:

- [ ] Color tokens and accent discipline
- [ ] Tab bar receding glass treatment
- [ ] Session instrument layouts (Anchor + Conditioning)
- [ ] Paywall membership framing
- [ ] Progress minimalism (no stat density)
- [ ] Onboarding spacing rhythm
- [ ] Motion spec

**After approval:** implementation targets `theme/deepwater.ts`, `tailwind.config.js`, and component reskins per screen inventory.

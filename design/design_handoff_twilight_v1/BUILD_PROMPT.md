# COMPOSE — Onboarding Rebuild: Final Build Prompt

You are rebuilding the onboarding flow of COMPOSE in this repo (React Native / Expo,
TypeScript, NativeWind, AsyncStorage + expo-secure-store, RevenueCat). Read the repo
CLAUDE.md as usual — its directives (deterministic content only, local-only privacy,
discretion, one primary action per screen) all remain in force. Where this prompt
conflicts with CLAUDE.md §6 (visual language), THIS PROMPT WINS — see the Design
Authority Ruling below, which you will codify back into CLAUDE.md as part of the work.

---

## 1. DESIGN AUTHORITY RULING — read first, state your understanding before coding

The design handoff in this directory (`design/design_handoff_twilight_v1/`) was
authored in the "Twilight, bone light" system (periwinkle accent #5D72A8, bone CTAs).
The founder has instead approved the **"Ember Dusk v2"** hybrid: the handoff's
layouts, archetypes, spacing, type system, and component structure — with the warm
accent, not periwinkle. Apply these token overrides to everything in design-rules.md:

| Handoff token | Ember Dusk v2 override |
|---|---|
| `bg` #080A0F | KEEP |
| `surface` #151A26, `stroke` #232D42, radio border #2E3B5E | KEEP |
| text primary/secondary/tertiary/faint | KEEP |
| `accent` #5D72A8 (periwinkle) | **#C89B6D warm sand/copper** — selection borders, radios, data marks, progress fill, gauge marker, checklist ticks |
| `accent-soft` #8B93C7 / #6C74A3 | **warm equivalents:** #D9B285 (text accents) / #A87F58 (italic goal echoes) |
| `cta` bone fill #E5E7EB | **sand emissive pill:** radial gradient core (#D9B285 center → #C89B6D edge), label #0C0B09 |
| CTA glow rgba(46,59,94,0.4) | **rgba(200,155,109,0.35)**, 12–16px bloom |
| selection glow rgba(30,58,138,0.2) | **rgba(200,155,109,0.18)** |
| dusk radial (periwinkle) | **warm dusk radial:** rgba(200,155,109,0.10–0.14) → transparent 65% |
| severity amber #D9A756 / red #E07A5F | KEEP (semantic only, matte — never glows) |
| Newsreader headlines / system body | KEEP exactly as specced |

**Accent scarcity rule (hard):** sand appears at most 4 times per screen, and only on
the next step — CTA, progress fill, selection state, score/gauge marker. Everything
else absorbs light.

**CTA case override:** ALL CTAs are sentence case ("Find my baseline", "See my
protocol", "Sign & begin — <price>"), per the approved Ember-at-Dusk reference
mocks. This overrides README rule "UPPERCASE tracked pills for navigation."
Uppercase 2px-tracked micro-type remains for eyebrows, progress headers, and the
question footer only.

**Reference screens caveat:** `reference/COMPOSE - Onboarding vB.dc.html` remains the
source of truth for LAYOUT, SPACING, and COMPOSITION — but its colors are the old
bone/periwinkle system. Layout from the reference; color from this ruling.

**Codify it:** in this same PR, update CLAUDE.md §6 and `tailwind.config.js` to the
Ember Dusk v2 tokens above, so the repo has exactly one design truth. Name it
"Ember Dusk v2" in both places.

---

## 2. READ, IN ORDER

1. `design/design_handoff_twilight_v1/README.md` — reading order and non-negotiables
   (as amended by the ruling above)
2. `design/design_handoff_twilight_v1/design-rules.md` — visual system, component
   specs, and the B-01→B-42 screen→archetype mapping (17 archetypes)
3. `design/design_handoff_twilight_v1/spec/COMPOSE_Onboarding_-_Version_B__Batched__No_Hope_.pdf`
   — Version B copy + flow spec. Copy is FINAL. All display logic and branching live here.
4. `design/design_handoff_twilight_v1/spec/COMPOSE_Onboarding_-_Version_A__Interleaved___Hope_.docx`
   — Version A spec. Same screens as B except: the 4 Clinical Context cards render
   INLINE (each directly after its source question) instead of batched after Symptoms,
   and each card includes its "Closing line (hope tease)" and A-variant button labels.
   The B-XX→archetype mapping applies to A screens by screen identity; A's order is
   resolved by `buildFlow('A')` (see Architecture).
5. `design/design_handoff_twilight_v1/reference/COMPOSE - Onboarding vB.dc.html` —
   6 reference screens (layout truth; color per ruling).
6. `design/design_handoff_twilight_v1/COMPOSE_Craft_Layer_Addendum_-_Ember_Alive.docx`
   — material, motion, sound, and the Ember signature object. Changes no tokens,
   layouts, copy, or screen order. The Ember and emission treatments belong in the
   step-1 component inventory, not bolted on later.

Imagery: use ONLY the 5 renders in `assets/`. Never generate or substitute artwork.

---

## 3. GOAL

One binary containing BOTH Version A and Version B as an A/B experiment. No duplicate
flows, navigators, or screens. The versions differ in exactly two things: clinical
card placement, and hope-tease lines + button labels on those cards.

---

## 4. ARCHITECTURE

1. **Data-driven flow.** A single ordered array of typed screen descriptors (id,
   archetype, copy, options, displayLogic, variantRules). Variant differences live
   declaratively in the config — cards carry
   `{ placement: { A: 'inline:afterScreenId', B: 'batched' }, tease: { A: string, B: null } }`.
   A pure function `buildFlow(variant: 'A' | 'B'): Screen[]` resolves the final
   order. No variant conditionals inside screen components.
2. **Variant assignment.** Deterministic 50/50 draw at first launch, persisted to
   AsyncStorage, never reassigned. Dev-menu override (force A / force B / reset).
   Variant tag on every analytics event.
3. **Analytics.** One anonymous event per screen (screen_id, variant, elapsed_ms,
   action) for per-screen drop-off measurement. Implement behind a thin abstraction.
   PRIVACY RULES (these implement CLAUDE.md §7 — non-negotiable): no answer content,
   free-text, name, or age in any event payload, ever; answers persist to
   AsyncStorage/expo-secure-store only. If no analytics SDK exists in the repo yet,
   build the abstraction with a local no-op sink and PROPOSE SDK options to the
   founder rather than adding one unilaterally.
4. **Conditional logic (both variants, per the specs):**
   - Escalation question skipped if adult-content frequency = "Rarely or never"
   - Physician triage card (B-12) only if morning arousal = "Rarely or never" AND libido ≤ 3
   - Partner Impact (B-20) branches: P (Committed/Married) vs S (all others)
   - Novelty Loop card: two conditional lines (daily frequency; escalation Yes/Somewhat)
   - Testimonial slots (B-16, paywall row): built but gated behind a remote/config
     flag defaulting to hidden; no placeholder quotes may ever render
   - Paywall-dismiss (B-40): once per session on first close/back from Paywall or Day
     Zero; shows Composure Score + saved goal words; never a discount or timer
5. **Composure Score.** Pure, unit-tested function over the answer set; weights in
   one config object (tunable without code changes). Map screen (B-26) renders score,
   baseline gauge (calm zone 80–100), severity bars (Conditioning drift bar only if
   escalation = Yes/Somewhat), and the dynamic mirror sentence.
6. **Purchases.** Purchase fires on Day Zero "Sign & begin" via RevenueCat. ALL
   displayed prices read from the RevenueCat offering — never hardcoded (price
   experiments run there; the specs' "$49.99" strings are placeholders). Fetch
   offerings early, retry silently, and never surface a raw error toast in
   onboarding — this explicitly fixes the current "[RevenueCat] Error fetching
   offerings" banner. Keep existing dev-only controls ("View other arm", "Skip
   paywall") but gate them strictly behind the dev flag.
   **REFUND RULING (2026-07, supersedes the specs where they differ):** no
   refund language anywhere. The paywall risk-reversal card reads: title
   "The Day-14 baseline check"; body "Your Composure Score is re-measured on
   Day 14 — you watch the change, or see exactly what to adjust. Measured,
   not promised. And everything you pay for is yours permanently." The
   canonical copy lives in content/onboarding/screens.ts (riskReversal) —
   use it verbatim over the PDF/docx if they still show refund copy.
7. **Reuse.** Reuse existing onboarding components and Ember tokens wherever an
   archetype matches. New components only for: Ember object, Map, Path to Freedom,
   Generating, Paywall, Paywall-dismiss, Day Zero signature.

---

## 5. CRAFT LAYER REQUIREMENTS (from the Addendum — build these in, not on)

- **The Ember**: one parametric Skia particle object (≤ 800 particles) with a single
  master `coherence` parameter driven by Composure Score + protocol day. States:
  Idle (dashboard, 4-2-6 breath cycle), Session-start "match it" (begin activates
  after one held breath cycle), SOS (4-7-8 pacing), Generating/Map assembly
  (particles build the bars + gauge), Day 75 (coherence 1.0).
- **Light, not paint**: CTAs and selection states are emissive (gradient core +
  bloom) per the ruling; severity chips stay matte; only interactive elements and
  the Ember may emit.
- **Dusk-to-dawn arc**: ground/surface tokens interpolate by protocol day via one
  interpolation function; hard ceiling — Day 75 is first light (~8% luminance max),
  never daylight. (Onboarding itself renders at Day-0 midnight values.)
- **Motion**: breath-out easing (cubic-bezier ≈ 0.22, 0.61, 0.36, 1); micro 220–280ms,
  transitions 380–450ms, ceremonial 600–900ms; 40ms answer-card stagger; no bounce,
  no snap, no overshoot.
- **Haptics**: exactly four patterns — ACKNOWLEDGE, BREATHE, SEAL, and no warn
  pattern. Pelvic ring syncs a haptic swell to CLENCH and a clean release to RELEASE.
- **Sound**: 1.2s audio logo at session start; resolved chord at session end;
  silence everywhere else in onboarding; no UI tap sounds.
- **Guardrails**: 60fps sustained on iPhone 12; Ember ≤ 8% CPU idle; pause to static
  frame on background/90s idle; iOS Reduce Motion → static gradient orb with opacity
  breathing only; Skia failure → pre-rendered video fallback. A jerky ember is worse
  than no ember — if a moment can't hold frame rate, cut the moment.
- **Demo mode**: hidden dev-menu mode with synthetic data unlocking all coherence
  states, so all six "filmable moments" (Addendum §8) can be captured in one take.

---

## 6. HARD RULES

- Dark mode only. Severity amber/red only on Your Map bars and the paywall recap.
- Hero imagery only at chapter moments (B-01, B-28–31, B-32, B-41); all other
  screens typographic.
- Anti-goals (never, under any pressure): confetti, streak flames, badges, trophies,
  levels, mascots, bright chroma, bounce easing, notification-style sounds or buzzes.
- Never fabricate testimonials, percentiles, or population averages. The Map gauge
  compares the user to the trained calm baseline, never to an invented "average man."
- All copy verbatim from the specs, including punctuation and em-dashes.
- Discretion: every outside-the-app string (notifications, permission prompts) must
  pass the lock-screen stranger test per CLAUDE.md §6 notification rules.

---

## 7. WORK ORDER — stop for founder approval after each step

1. State your understanding of the Design Authority Ruling. Then propose the Ember
   Dusk v2 token layer (as tailwind config + CLAUDE.md §6 draft) and a component
   inventory covering the 17 archetypes + the Ember object. No screens yet.
2. Flow config + `buildFlow` with tests. Print the fully resolved A and B screen
   orders as two lists for confirmation against the specs (counts must be 42 and 42;
   cards inline in A / batched after Symptoms in B; tease lines under A only).
3. Archetype components, matched to the reference DC for layout and to the ruling
   for color/material, including the emissive CTA and selection treatments.
4. All screens, copy verbatim, branching wired, section transitions and progress
   header per global rules.
5. The Ember (all states) + Generating/Map assembly + Composure Score + gauge.
6. Paywall/purchase wiring (offerings, dismiss screen, Day Zero signature gating),
   analytics abstraction, haptics/sound, demo mode, Reduce Motion fallbacks.

---

## 8. ACCEPTANCE

- Dev-toggling A/B changes card placement, teases, and card button labels — nothing
  else (snapshot test asserts both resolved orders match the specs).
- Escalation skip, triage condition, and partner branch are unit-tested.
- A grep of the analytics module finds no quiz answer keys, no name, no age.
- Onboarding completes with RevenueCat unreachable; paywall shows graceful retry;
  no error toast anywhere in the flow.
- Prices render from offerings; zero hardcoded price strings in components.
- 60fps through full onboarding with Ember active on iPhone 12-class hardware;
  Reduce Motion verified; demo mode captures all six filmable moments.
- CLAUDE.md §6 and tailwind.config.js updated to Ember Dusk v2 in the same PR.
- Notification/permission copy passes the stranger test.

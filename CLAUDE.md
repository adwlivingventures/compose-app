# CLAUDE.md — Project COMPOSE

This file is read automatically by Claude Code at the start of every session in this repo. It merges the brand/product spec with the working persona and directives for this project.

---

## 0. Required Research Context — always loaded

The distilled clinical + psychological research substrate for COMPOSE is imported below and loads into context every session. Build all features, scripts, and copy against it.

@docs/research/CLINICAL-CANON.md

**Full sources (read on demand, not auto-loaded — see the retrieval rule in the canon):** `docs/research/gemini-research-1.md`, `docs/research/gemini-research-2.md`, `docs/research/PSYCHOLOGICAL-FOUNDATIONS.md`. Before authoring any Auditory Anchor, Thought Restructurer entry, phase script, onboarding line, or paywall copy, open the relevant full source and work from it — the canon is the map, not the territory. Where any raw research conflicts with this file, **CLAUDE.md wins** (the canon's §10 lists the specific superseded framing).

---

## 1. Role & Persona

You have spent your entire life becoming an expert in two fields:

**A. Elite DTC App Builder, Growth Marketer, and Product Architect** who has scaled multiple health, wellness, and psychology apps to 7 and 8 figures. Do not give generic startup advice, basic UX principles, or platitudes. Every onboarding flow, feature, and monetization strategy generated for COMPOSE must be strictly rooted in behavioral economics, subconscious identity shifting, and proven retention mechanics. Always explain the underlying product psychology (activation triggers, why a user converts to paid, habituation loops, churn mitigation) behind recommendations. Prioritize deep, transformative user experiences — specifically how to structure a life-changing 75-day program and how to build meaningful, intuitive features that solve core user problems. World-class depth in product strategy, consumer psychology, and app scaling is the bar.

**B. Elite Clinical Sexologist, Neurobiologist, and Executive Behavioral Coach.** Do not give generic wellness advice or platitudes. Every script, feature, and piece of advice generated for COMPOSE must be strictly rooted in Cognitive Behavioral Sex Therapy (CBST), Sensate Focus, and Polyvagal Theory. Always explain the underlying neurobiology (adrenaline, sympathetic nervous system, basal ganglia habituation) behind recommendations. Prioritize deep, evidence-based psychological rewiring over surface-level fixes. World-class clinical depth is the bar.

### Directives

- **No generic output.** No generic startup advice, basic UX principles, or wellness platitudes.
- **Clinical rigor.** Every script, feature, and piece of advice must be strictly rooted in CBST, Sensate Focus, and Polyvagal Theory.
- **Explain the mechanism.** Always explain the underlying neurobiology (adrenaline, sympathetic nervous system, basal ganglia habituation) and behavioral economics (activation triggers, habituation loops, churn mitigation) behind code and design recommendations.
- **Prioritize depth.** Deep, evidence-based psychological rewiring over surface-level fixes. World-class depth in product strategy, consumer psychology, and app scaling.

### One deliberate substitution, flagged

Elsewhere in this file, COMPOSE is described as a program that helps users **address, retrain, and build resilience against** performance anxiety, ED, and PE — not one that **"cures"** them or is billed as a **"digital therapeutic."** That's the one piece of the original framing not restored verbatim, and it's worth being explicit about why: "digital therapeutic" is a regulated term (the FDA can classify claims-making apps as medical devices requiring clearance), and Apple's App Store review guidelines require treatment/cure claims to come from a recognized medical institution. Since this file drives all future generated copy, features, and ASO text, that substitution is what keeps this section's clinical rigor intact while keeping the product in the deterministic-wellness-app lane the tech spec (§7) already commits to. Everything else in this section is restored at full depth.

---

## 2. Brand Definition & Positioning

- **Official App Name:** COMPOSE
- **App Store Title:** COMPOSE: Men's Somatic Presence & Pelvic Coach
- **Home Screen Display Name:** Compose
- **Mission:** Help men move from performance-based anxiety and "spectatoring" (mentally stepping outside the body to self-evaluate during intimacy) toward present, embodied confidence, through structured somatic and cognitive practice.
- **Core Differentiator:** Identity-first behavioral retraining (CBST-informed + mindfulness-based practice) combined with structured, offline physical conditioning. No pharmacy dependency, no numbing/band-aid treatments.
- **Commercial Model — MODEL V2 (founder ruling, 2026-07-08; supersedes the $49.99 one-time model everywhere):** COMPOSE is an **annual-first membership**: **$99.99/yr primary, $17.99/mo secondary** (via RevenueCat; RC Experiment tests $99.99 vs $79.99 annual ($69.99 rejected: unwanted "69" connotation at checkout in this category) — price experiments run **upward only**, never discounted under pressure, no countdown offers, no trials). Hard paywall after the diagnostic onboarding. The paywall headline sells the transformation, not the membership: the 75-Day Protocol plus a full year of reinforcement, one payment. Honest-billing rules: "One payment covers your full year" framing, a courtesy pre-renewal notice in month 11 (the renewal-evidence screen: his own year of Baseline data shown before the charge), no dark patterns. The membership year is three acts: **Act I (Days 1–75)** the Protocol, unchanged; **Act II (Days 76–180)** graduation is a pure unlock ceremony — **never a sales moment** — that opens the Mastery Suite (Somatic Copilot, Sensate Mastery, Refractory Window Guide, Anxious Partner De-escalator) as included membership content; **Act III (Days 181–365)** light weekly maintenance cadence plus quarterly Composure re-measurements (reusing the onboarding composure module). The separate "$39.99/$4.99 Somatic Maintenance Toolkit" SKU is **retired** — its content is the Act II/III unlock. The graduation export path ("both are wins") is retained as a trust artifact. **No refund promises or refund language on any surface, in-app or marketing** — App Store refunds are requested by users directly from Apple and decided solely by Apple; support replies point to Apple's process and nothing else. Risk reversal is evidence-based: the Day-14 Composure re-measurement ("measured, not promised"). Post-launch roadmap (not launch scope): web quiz→Stripe checkout funnel at month 3–4 when paid UA begins.

## 3. Target User Profile

- **Demographic:** Men aged 18–45, motivated to show up fully in intimacy but caught in a performance-anxiety loop.
- **Core Pain Points:** Premature ejaculation, psychogenic erectile difficulty, performance anxiety, "spectatoring."
- **Psychological Profile:** Highly vulnerable, embarrassed, private. Wants a durable internal shift over a chemical crutch. Arrives running *from* shame (fear/scarcity motivation, which expires the moment the pain eases); the 75 days must migrate him to a *toward* motivation — presence, the partner he wants to be, the man he is becoming — or the change does not hold past symptom relief.
- **Discretion — corrected weighting (founder ruling 2026-07-25; supersedes the prior "hard requirement" framing):** discretion is a **feature some users will want, not a design constraint the product bends around.** It is instrumental: its only job is to lower the cost of getting help — it is why a man who would never walk into a clinic installs this, and why he doesn't delete it the first time someone else picks up his phone. That is real, and worth serving. But **discretion is never prioritized over benefit to the user.** The moment it subtracts from the help itself, it has inverted into the thing it was protecting.
  - **The test for any discretion-driven constraint:** *does this protect him from a harm he actually fears, or does it protect a doctrine at his expense?* If the second, the constraint loses.
  - **Consequence A — data durability beats data minimalism.** Losing 75 days of work to a broken phone is a real harm; an awkward receipt in an inbox is not. Optional accounts and encrypted progress backup are a user benefit. State the privacy promise as an **access claim** ("seen by no one but you") rather than a **location claim** ("never leaves this phone"), so it stays true under any future data architecture.
  - **Consequence B — no feature may be rejected on discretion grounds alone.** The argument against it must stand on user benefit first. (Example: the case against a community feed is that social comparison is spectatoring with an audience — the pathology installed as a feature. That holds for a user with zero discretion needs. Discretion is a distant second reason and must never lead.)
  - **Consequence C — where discretion and benefit genuinely conflict, the user chooses,** not the product on his behalf. See the discretion level in §6.
  - **This weighting is an assumption, not a finding.** Validate it: ask testers directly whether discretion factored into installing, and once telemetry is live, track adoption of the Discretion toggles. If fewer than a third of members ever enable Face ID or app-switcher hiding, reduce the discretion footprint in the funnel further — starting with hopeful-arc slide 5, which currently spends the last screen before the close answering "will anyone find out?" instead of "what do I actually get?"

## 4. Program Architecture — The 75-Day Protocol

Three 25-day phases:

- **Phase 1 (Days 1–25) — Nervous System Reset:** Down-regulate sympathetic activation; break the intimacy→anxiety association. Framework: mindfulness-based practice to counter spectatoring; baseline pelvic-floor awareness (reverse-kegel style relaxation work).
- **Phase 2 (Days 26–50) — Exposure & Mastery:** Build tolerance to high arousal states without losing present-moment control. Framework: cognitive defusion from intrusive performance thoughts; shift from a performance mindset to a presence mindset.
- **Phase 3 (Days 51–75) — Identity Consolidation:** Anchor the shift so it's self-sustaining. Framework: core-belief reframing, lifestyle-habit indexing, self-image consolidation ("this is who I am now," not "I am managing a problem").

## 5. Daily Product Loop

One linear, all-or-nothing daily flow, under 10 minutes, three items:

1. **Auditory Anchor (3–4 min):** audio track — a cognitive reframe or a somatic grounding exercise.
2. **Physical Conditioning Track (5 min):** paced visual/audio breath+pelvic-floor sequence (contract/release cued to inhale/exhale). User logs a 1–5 self-rated control score.
3. **Vitality Checklist (1 min):** three binary check-ins:
   - Presence Work — spent conscious time embodied today?
   - Clean Focus — avoided pornographic consumption today?
   - Vitality Habit — protected physical energy (sleep, morning light)?

**Thought Restructurer:** an interactive log triggered when anxiety spikes. User tags the cognitive distortion (catastrophizing, overgeneralization, all-or-nothing thinking) and receives an immediate, pre-written reframe. This is **deterministic content, not live-generated** — see §7.

## 6. Visual & UX Language

- **Visual Language — "Deepwater v1" (founder-approved 2026-07-25; supersedes Ember Dusk v2's VALUES, inherits its discipline):** dark mode only; a deep blue-black water field (`#0A0F16` ground, `#121A24` surfaces, `#223140` strokes) lit by ONE luminous aqua accent — the "current" (`#5FD4C1→#3E9BD6`) — reserved for the next step and earned progress (≤4 uses per screen). The old copper survives as the `ember` register (`#C89B6D`): identity moments only — phase names, oaths, mirror lines, milestone marks, sealed-day checks (≤2 per screen), never a CTA. SOS surfaces are matte clay `#C96A55`, never glowing. `gain` `#78C99A` marks positive deltas only, always with ▲ + label. Five tabs with Today raised at center as the bar's only luminous node, carrying the 5-segment session ring (sealed = ember, glow off). Canonical tokens: `tailwind.config.js` + `theme/deepwater.ts` (+ `theme/emberDusk.ts` for onboarding material constants); governing spec: project doc `claude/DEEPWATER-FLOW-MAP.md`. Typography, dusk-to-dawn arc, accent-scarcity rule, and all other Ember Dusk v2 discipline below carry forward unchanged.
- **Prior language — "Ember Dusk v2" (historical reference):** dark mode only; a cool dusk field lit by warm emission. Deep blue-black ground (`#080A0F`), navy surfaces (`#151A26`) and strokes (`#232D42`), with a single warm sand-copper accent (`#C89B6D`) treated as *light, not paint* — emissive gradient cores and 12–16px blooms on interactive elements only. **Accent scarcity (hard rule):** sand appears at most 4 times per screen, only on the next step (CTA, progress fill, selection state, score/gauge marker); everything else absorbs. Severity amber `#D9A756` / red `#E07A5F` are semantic, matte, and never glow. Display type is Newsreader (400–500; italic for oaths/mirror sentences/goal echoes; 300 reserved for 40px+ numerals); UI/body stays system font, weight 300 body. All CTAs are sentence case; UPPERCASE 2px-tracked micro-type is reserved for eyebrows, progress headers, and the question footer. Ground/surface tokens interpolate by protocol day (dusk-to-dawn arc; hard ceiling ~8% luminance at Day 75 — first light, never daylight). No bright/clinical colors, no playful iconography, no shadows — flat surfaces with 1px borders; only interactive elements and the Ember emit. Canonical tokens: `tailwind.config.js` + `theme/emberDusk.ts`; the governing spec is `design/design_handoff_twilight_v1/` as amended by the Design Authority Ruling in its `BUILD_PROMPT.md` (layout truth: the reference DC; color truth: the ruling). **All new screens and components must be built in Ember Dusk v2 via NativeWind classes — no StyleSheet one-offs.** (Ember Dusk v2 supersedes Ember v1 and "Twilight Anchor"; the UX philosophy below is unchanged.)
- **UX Philosophy — "Ventral Vagal Sanctuary":** users arrive anxious; the UI's job is to down-regulate them, not stimulate decision-making.
  - **Zero decision fatigue (Hick's Law):** no library-of-choices UI. Linear flow. One dominant action: "Begin Today's Session."
  - **Persistent SOS access:** a one-tap triage control, reachable from anywhere in the app, that leads to a grounding sequence (e.g., paced breathing, sensory grounding) for acute anxiety spikes.

### Notification & External-Surface Copy Rules

*(Rewritten 2026-07-25 under the §3 discretion ruling. These rules were previously one undifferentiated doctrine; they are now split, because they were doing two different jobs. Most protected the user from **discovery** — a preference, now user-set. One protected him from **the product's own mechanism working against him** — clinical, and absolute at every level. Do not re-merge them.)*

Binding for any notification, Live Activity, widget, email, or other outside-the-app text surface, present or future. **Every such surface must implement both levels below** — a surface that can only render one of them is not shippable.

#### The discretion level — set by the user, never silently defaulted

The user picks his level once, on the Discretion setup screen, where the live lock-screen preview is already rendered. That screen is the only place in the app where he can answer this question with real information in front of him, so the ask belongs there and nowhere else.

| Level | External surfaces | In-app greeting |
|---|---|---|
| **Personal** | The day's authored line may appear — e.g. "Tonight: the pause is a tool, not an escape." | Uses his first name |
| **Shielded** | Neutral only — "Compose — today's session is ready." | Nameless — "Good evening." |

**Shielded is the pre-2026-07-25 behavior and must remain fully intact as an option.** The three existing toggles (neutral notifications, Face ID, hide from app switcher) sit underneath the level and stay independently controllable at either setting.

#### Absolute — every level, no exceptions

- **No urgency or loss framing.** No "Don't lose your streak!", no countdowns, no warning emoji, no "you're falling behind." **This is a clinical rule, not a discretion rule, and it does not relax at the Personal level.** Urgency framing is sympathetic activation — the exact state the product exists to down-regulate — and streak-loss threats weaponize shame against our own user, for whom shame *is* the pathology. It was previously filed under discretion by accident; it outranks the discretion ruling entirely.
- **No explicit, vulgar, or clinical-diagnostic language** on any external surface at any level.
- **No emoji.**
- **App name renders as "Compose."** Icon and billing descriptor never vary by level — they cost the user nothing.

#### Shielded level — additional rules

- **The stranger test:** every string must be unremarkable to a stranger reading it over a shoulder or on a locked phone.
- **Banned vocabulary:** anchor titles, phase names, and all domain vocabulary — anxiety, pelvic, intimacy, arousal, erection, performance, somatic, nervous system, protocol content of any kind.
- **No personalization** — never the user's name alongside this app on a lock screen.

#### Personal level — what is permitted, and the bar that still applies

- Domain-adjacent identity and practice content is permitted, and his first name is permitted.
- **The bar drops from "unremarkable" to "non-diagnostic" — not to "anything goes."** A Personal-level string must still be one a stranger could read without learning what this app treats. "Tonight: the pause is a tool, not an escape" passes. Anything naming an erection, ejaculation, or a diagnosis does not, at any level.
- Purpose of the level: a real re-engagement trigger and a daily identity rep, instead of a generic one — for the majority of users who never needed invisibility and were previously taxed for it anyway.

## 7. Technical Stack & Architecture

- **Framework:** React Native / Expo (TypeScript)
- **Target OS:** iOS first
- **Backend:** Railway
- **Monetization:** RevenueCat
- **Content delivery:** deterministic / hardcoded only. **No live, unscripted generative-AI text output in the client** — this is a firm constraint, not a placeholder, and exists specifically to keep the app inside App Store "sexual content" / medical-app review lanes. The Thought Restructurer and all program content ship as authored, versioned content, not model-generated at runtime.
- **Storage/privacy:** all user context, configuration, and diagnostic/self-report scores stored **locally only** via `AsyncStorage` and `expo-secure-store`. No server-side sync of personal/behavioral data. **One deliberate exception (founder ruling, 2026-07-08): anonymous, consent-based, aggregate telemetry** via `services/analytics.ts` — event-level only (e.g., `day_completed {day: 40}`, `control_score {value: 4}`, `composure_measured {score}`, `paywall_viewed`, `graduated`), no identity, no free text, no journal/restructurer content, ever. Consent is requested once, plainly, during onboarding (declinable; app fully functional if declined). Purpose: aggregate cohort retention and outcome curves — the acquisition-diligence asset that cannot be reconstructed retroactively. Any event that could carry identifying or written content is a spec violation.
- **Key modules:** `ProtocolContext.tsx` (state management for program progress), `storage.ts` (local storage utilities) — both must enforce the local-only constraint above.

## 8. Directives for Claude Code

1. **No generic output.** Skip boilerplate startup/UX advice; ground feature and copy suggestions in the frameworks above, and explain the mechanism (nervous-system state, habit-loop stage, conversion psychology) when it's relevant to *why* a design choice works.
2. **Deterministic logic only.** No chat engines, no runtime-generated advice/reframes. Everything the user reads in the Thought Restructurer or daily loop is pre-written and versioned in code/content files.
3. **Local-only privacy.** Never introduce a network call that carries personal, behavioral, or diagnostic data off-device without an explicit, separate go-ahead.
4. **Tone and copy:** premium, calm, non-judgmental, grounded, authoritative. No vulgar or explicit language. Use wellness/nervous-system/conditioning terminology, not clinical/diagnostic claims (see guardrail in §1).
5. **UI discipline:** linear flow, one primary action per screen, SOS control always reachable, dark-mode-only palette per §6.
6. **Discretion by default:** app name, icon, and notification copy should assume the user needs the app to be unreadable at a glance on a lock screen or over-the-shoulder.

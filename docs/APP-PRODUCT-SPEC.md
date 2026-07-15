# COMPOSE — Master Product Specification (As-Built)

**Document date:** 2026-07-14
**Status:** Reflects the codebase in its current state (Model V2 membership, single onboarding flow, Ember Dusk v2). Where the code and older docs disagree, this document follows the code.
**Sources of truth:** `CLAUDE.md` (brand/commercial rulings), `content/onboarding/screens.ts` (onboarding copy, verbatim), `app/` + `components/` (screen behavior), `content/` (all program content), `services/` (privacy, telemetry, notifications, billing).

---

## 1. Product Overview & Positioning

| Field | Value |
|---|---|
| Official app name | COMPOSE |
| App Store title | COMPOSE: Men's Somatic Presence & Pelvic Coach |
| Home screen display name | Compose (`app.json` name: "Compose") |
| Bundle ID | `com.composeprotocol.app` |
| Platform | iOS-first, React Native / Expo (TypeScript), expo-router |
| Backend | Railway (minimal; app is local-first). Telemetry endpoint: TelemetryDeck |
| Billing | RevenueCat (`membership` entitlement) |
| Mission | Move men from performance-based anxiety and "spectatoring" toward present, embodied confidence via structured somatic + cognitive practice |
| Core differentiator | Identity-first behavioral retraining (CBST + mindfulness + Sensate Focus + Polyvagal breathwork) plus structured offline physical conditioning. No pharmacy dependency, no numbing band-aids. Everything is **measured, not promised** (Composure Score at Days 0/14/40/75) |
| Clinical frames | CBST, Sensate Focus (Masters & Johnson), Polyvagal Theory, basal-ganglia habituation, implementation intentions, identity-based habit formation |
| Claims posture | "Address, retrain, build resilience against" — never "cure," never "digital therapeutic" (FDA/App Review lane discipline) |

**Target user:** men 18–45 caught in the performance-anxiety loop (PE, psychogenic ED, spectatoring). Psychologically: vulnerable, embarrassed, private; wants a durable internal shift, not a chemical crutch; extremely sensitive to "lock screen shame." Discretion is a hard product requirement on every external surface.

**Commercial model (Model V2, founder ruling 2026-07-08):** annual-first membership.

- **$99.99/yr primary** (`compose_annual_9999`), **$17.99/mo secondary** (`compose_monthly_1799`).
- RC Experiment tests $99.99 vs $79.99 annual (`compose_annual_7999`). Price experiments run **upward only**; no discounts under pressure, no countdown offers, **no trials**. ($69.99 was rejected — "69" connotation at checkout.)
- Hard paywall after diagnostic onboarding. Purchase fires on the **Day Zero signature screen**, never on the paywall itself.
- The membership year is three acts: **Act I (Days 1–75)** the Protocol; **Act II (Days 76–180)** graduation as a pure unlock ceremony opening the Mastery Suite (included content, never a sales moment); **Act III (Days 181–365)** light weekly maintenance + quarterly Composure re-measurements.
- Honest-billing rules: "One payment covers your full year" framing; plain auto-renew disclosure adjacent to every purchase CTA; month-11 courtesy pre-renewal notice (renewal-evidence screen — roadmap, not yet built); no dark patterns.
- **No refund language anywhere** — refunds are Apple's process exclusively. Risk reversal is evidence-based: the Day-14 Composure re-measurement.
- Retired: the $49.99 one-time model, the "$39.99/$4.99 Somatic Maintenance Toolkit" SKU (its content is now the Act II/III unlock), the 'Compose Pro' legacy entitlement.
- Post-launch roadmap (not in scope): web quiz → Stripe checkout funnel at month 3–4.

---

## 2. Design System & UX Doctrine

### 2.1 Visual language — "Ember Dusk v2" (dark mode only)

- Ground `#080A0F`; surfaces `#151A26` / tab `#0C0F16`; strokes `#232D42` / `#1B2233`; single warm accent sand-copper `#C89B6D` treated as *light, not paint* (emissive gradient cores, 12–16px blooms on interactive elements only).
- **Accent scarcity (hard rule):** sand appears at most 4 times per screen, only on the next step (CTA, progress fill, selection state, score/gauge marker). Everything else absorbs.
- Severity amber `#D9A756` / red `#E07A5F` are semantic, matte, never glow.
- Display type: Newsreader (300/400/500; italic for oaths, mirror sentences, goal echoes; 300 reserved for 40px+ numerals). UI/body: system font, weight 300.
- Sentence-case CTAs; UPPERCASE 2px-tracked micro-type only for eyebrows, progress headers, question footers.
- Ground/surface tokens interpolate by protocol day (dusk-to-dawn arc, hard ceiling ~8% luminance at Day 75 — "first light, never daylight").
- Flat surfaces, 1px borders, no shadows, no bright/clinical colors, no playful iconography. All screens built in NativeWind classes against `tailwind.config.js` + `theme/emberDusk.ts`.

### 2.2 UX philosophy — "Ventral Vagal Sanctuary"

Users arrive anxious; the UI's job is to down-regulate, not stimulate decisions.

- **Zero decision fatigue (Hick's Law):** linear flows everywhere; one dominant action per screen ("Begin today's session").
- **Persistent SOS:** the "Steady me" control is one tap away from the dashboard and from inside the session.
- **Votes, not verdicts:** all progress surfaces count behavior; nothing grades the man. No percentages, no red, no missed-day marks.
- **Register law** (phase-keyed voice): Phase 1 copy speaks *capability*, Phase 2 *evidence*, Phase 3 *identity*; never a later register earlier.

### 2.3 Notification & lock-screen rules (binding)

- **Stranger test:** every external string must be unremarkable over a shoulder. The only shipped notification: title "Compose", body "Today's session is ready."
- Banned on external surfaces: anchor titles, phase names, all domain vocabulary (anxiety, pelvic, intimacy, arousal, erection, performance, somatic, nervous system).
- No urgency/loss framing, no streak threats, no emoji, no personalization. Neutrality is a product rule, not a setting — the Discretion toggle governs *scheduling only*.

---

## 3. Technical Architecture

### 3.1 Stack & modules

- **Routing (`app/_layout.tsx`):** expo-router Stack; `ProtocolProvider` → `DiscreetProvider` → screens → `PrivacyShield` overlay on top of everything. RevenueCat configured at module scope (iOS production key; web preview degrades gracefully with no billing). Newsreader fonts block first render until loaded (no fallback-type flash).
- **State:** `context/ProtocolContext.tsx` (activeDay, streak, purchase entitlement, completed days, ledger writes, pacing lock); `context/DiscreetContext.tsx` (Face ID, hide-switcher, notifications flags).
- **Storage:** all user data local-only via AsyncStorage (`services/storage.ts` LocalStore) + expo-secure-store (purchase receipt cache in Keychain). No server-side sync of personal data.
- **Content delivery:** 100% deterministic/hardcoded. No runtime-generated text anywhere in the client (firm App Review constraint). All reframes, lessons, scripts, and audio are authored, versioned files under `content/` and `assets/audio/`.
- **Telemetry (the one §7 exception):** `services/analytics.ts` — anonymous, consent-gated, schema-whitelisted event counts to TelemetryDeck (`clientUser: 'anonymous'` for every install). See §16.

### 3.2 Route map

| Route | Presentation | What it is |
|---|---|---|
| `/index` | redirect | Traffic controller: loading spinner → `/onboarding` (no membership) or `/(tabs)` (member) |
| `/onboarding` | stack | The full diagnostic + paywall flow (data-driven runner) |
| `/(tabs)` | tab bar | Today · Restructure · Baseline · You |
| `/session` | fullScreenModal | The daily 4-stage session |
| `/remeasure` | fullScreenModal | Composure re-measurement (Days 14/40/75, quarterly in Act III) |
| `/oath` | no swipe-back | Post-restore signature capture (edge path) |
| `/discretion` | push (`?intro=1` post-purchase) | Discretion settings |
| `/ledger` | push | Check-anytime Vitality Ledger |
| `/vitality` | push | Vitality Baseline reference (pillar accordion) |
| `/sandbox` | push | Somatic Sandbox breath pacer (Day-26 unlock) |
| `/technique` | push | Somatic Primer replay ("The Somatic Drop") |
| `/pelvic-check` | push | Standing pelvic release re-check with local history |
| `/mastery` | push | Mastery Suite index (Phase IV) |
| `/autonomic-sync` | push | Free Mastery preview (lesson + scripted Copilot simulation) |
| `/copilot` | push | Somatic Copilot (Day 76+, membership) |
| `/lesson/[id]` | push | Mastery lessons (sensate-mastery, refractory-window, partner-deescalator, partner-attunement) |
| `/success-vault` | push | Curated composite case studies |
| `/partner-scripts` | push | Word-for-word partner scripts (share/copy) |
| `/ember-demo` | dev only | Ember component showcase |

### 3.3 Entry & entitlement logic

- Cold start reads the Keychain flag `secure_purchase_receipt` (cache, renders instantly/offline), then reconciles against RevenueCat's `membership` entitlement via `getCustomerInfo()` + a customer-info listener (renewals, restores, **lapses** — a lapsed member is downgraded here and nowhere else).
- `hasPurchased == false` → onboarding (which itself resumes mid-flow from `@onboarding_flow_v1`).

---

## 4. Onboarding — Every Screen, In Order

**Architecture:** a data-driven flow runner (`app/onboarding.tsx`) walks `content/onboarding/screens.ts` (copy is verbatim from the batched "Version B" spec; the interleaved variant and the onboarding A/B test are retired — this is *the* flow). `buildFlow()` assigns numbering only; it never reorders. Section transitions and the telemetry-consent step are unnumbered.

**Global behaviors:**

- **Resume state:** every answer + current screen persist to `@onboarding_flow_v1`; an app kill resumes exactly where he left, with the back stack rebuilt. One-way barrier: once past Generating, back navigation to the questions is cleared (the diagnosis can't be un-seen).
- **Back navigation:** floating chevron on full-bleed screens; ProgressHeader back arrow on question screens; the paywall family owns its own back gesture (the dismiss intercept).
- **Progress chrome:** question screens 3–24 show a progress header (step N of 24 + "~X min left" at ~20s/screen) and, where relevant, the privacy footer. Chapters, cards, map, and the paywall family are full-bleed.
- **Privacy:** answers never leave the device. Analytics emits one anonymous `onboarding_screen {screen_id, action, elapsed_ms}` per screen-leave — never what was answered. All events are consent-buffered until the telemetry-consent screen decides.
- **Prices:** `{price}` / `{pricePerDay}` tokens resolve from the live RevenueCat offering at render time; nothing purchasable is ever hardcoded. Per-day math divides the **annual price by 365** (honest math — a ÷75 divisor would be a dark pattern). If offerings haven't loaded, price copy simply doesn't render; onboarding never shows an error state.

### 4.1 Opening (Screens 01–02)

**01 · `welcome-opening`** (chapter, hero image, privacy footer)
Eyebrow COMPOSE. Headline: *"Your body isn't failing you.\nIt's following orders."* Body: "In the next few minutes, we'll map exactly where those orders come from." / "Every answer stays on this phone." Privacy line: "Private by design — no account, no sync, no lock-screen tells." Micro: "Takes about 5 minutes." CTA **Find my baseline**.
*Psychology:* the first line reframes the symptom as obedient physiology (externalization — the enemy is the signal, not the self), which drops shame enough to answer honestly. The privacy promise front-loads the #1 objection of this audience.

**02 · `welcome-roadmap`** (chapter)
"Welcome to Compose." Body names CBST explicitly (survives the skeptic's Google search) and "subconscious identity retraining" (deliberately lowercase — a described mechanism, not a Title-Cased fake framework). "Before we suggest anything, we listen — first to the body, then to the mind." CTA **Let's begin**.
*Psychology:* legitimacy-first (structured/clinical, not motivational); seeds the daily-practice expectation in sentence one.

### 4.2 Part 1 of 3 — Your Situation (Screens 03–08)

*(Unnumbered section transition: "PART 1 OF 3 · YOUR SITUATION", auto-advances at 2.2s, tap advances early.)*

**03 · `relationship`** (single-select) — Single / Casual dating / Committed / Married / Recently out.
**04 · `reasons`** (multi-select) — "What brings you here?" I finish too quickly / struggle to maintain / trapped in my own head / avoiding intimacy / want to deepen intimacy. *This is the presentation question — it later derives the telemetry segment (§16).*
**05 · `duration`** (single-select) — with the reframe sub-line: "Whatever the answer, the mechanism is the same: a conditioned response. Conditioning can be retrained." *Every duration answer feeds the personalized "conditioned over X years" mirror sentence.*
**06 · `attribution`** (single-select) — "How did you hear about us?" 12 channels (FB/IG/TikTok/X/YouTube/Reddit/Podcast/Google/App Store/clinician/friend/other).
**07 · `name`** (text input) — "First name only. Like every answer here, it never leaves this device." Used for the Map headline, the profile tab, and Day-Zero personalization.
**08 · `age`** (wheel, 18–70, default 30).

*Psychology of Part 1:* easy, low-threat autobiographical questions first (commitment gradient — momentum before vulnerability). Attribution is asked early while compliance is cheap.

### 4.3 Part 2 of 3 — The Body (Screens 09–16)

*(Section transition: "PART 2 OF 3 · THE BODY".)*

**09 · `bandaid-history`** (multi-select) — pills/sprays/supplements/none, with the seed: "Pills work on blood flow. Creams dull sensation. Neither reaches the signal underneath." *Pre-frames the "Why Band-Aids Fail" clinical card and the paywall's positioning line.*
**10 · `morning-arousal`** (single-select) — "Clinicians screen this first. It separates the wiring from the signal." *Legitimate clinical triage (nocturnal/morning erections distinguish psychogenic from organic).*
**11 · `libido`** (1–10 slider).
**12 · `physician-note`** (note card, **conditional**: shows only if morning arousal = rarely AND libido ≤ 2) — "Worth a physician visit." Names the two answers that triggered it, urges a real exam, and tells him to keep going ("the nervous-system retraining and identity work still apply"). CTA **Understood — continue**.
*Psychology:* honesty-as-trust-builder; an explained medical caution reads as integrity, an unexplained one as alarm. Also the ethical/App-Review triage backstop.
**13 · `adrenaline-spike`** (single-select) — panic / push-through / occasionally / calm. *Heaviest Composure deduction (14/9/5/0).*
**14 · `breath-edge`** (single-select) — "Breath under arousal is the clearest window into your nervous system."
**15 · `pelvic-check`** (interactive check) — the 20-second tension test. Intro explains what/why (chronic pelvic-floor tension vs control and blood flow), reassures total invisibility ("You can do this in a waiting room"), 3 steps; timed phases CLENCH 5s → RELEASE 10s with ring labels; result: 1–10 "how fully did the tension let go?" Skippable ("Skip for now" → scored as `skipped`, and the Map notes the check will open his Day 1 and lives in the Library).
*Psychology:* the first *embodied* act of the funnel — a felt data point he generated himself. Interactive investment (IKEA effect) and the seed of the physical-conditioning value prop.
**16 · `testimonial-somatic`** (testimonial slot, **gated OFF**: `DEFAULT_FLAGS.testimonials = false`) — ships dark until a real, consented quote exists. Never fabricated (FTC/App Review tripwire).

### 4.4 Part 3 of 3 — The Mind (Screens 17–24)

*(Section transition: "PART 3 OF 3 · THE MIND".)*

**17 · `content-frequency`** (single-select) — weekly porn frequency; "Our dopamine reward system calibrates to its most frequent inputs."
**18 · `escalation`** (single-select, **skipped** if frequency = rarely) — tolerance drift toward more extreme content; includes "I'd rather not say."
**19 · `spectatoring`** (single-select) — "Clinicians call this 'spectatoring.' It has a name because it's common." *Naming = normalization + borrowed clinical authority.*
**20 · `partner-impact`** (multi-select, one phrasing for all relationship statuses) — partner blames themselves / unspoken tension / I get distant / less intimacy / working through it together.
**21 · `aftermath`** (single-select) — shame / anger at myself / numbness / fear of the next time.
**22 · `avoidance`** (single-select) — frequency of avoiding initiation; "stopped altogether" scores highest.
**23 · `scripts`** (multi-select) — the failure scripts, in quotes ("I am broken", "She is disappointed in me", "She'll leave me", "I will never fix this", "I'm less of a man"). Sub-line: "These are scripts, not facts. Your subconscious replays them after a setback."
**24 · `spillover`** (single-select) — does it follow him out of the bedroom (work, confidence, how he carries himself)?

*Psychology of Part 3:* the cost inventory escalates from behavior → emotion → identity → whole life. Each question is simultaneously (a) a scored diagnostic input, (b) self-confrontation that raises problem salience, and (c) raw material for the personalized Map. The quotes format in `scripts` starts the defusion work inside the funnel itself — he sees the scripts as objects, which is the exact mechanic the Restructure tab later trains.

### 4.5 Analysis (Screens 25–31)

**25 · `symptoms`** (grouped multi-select, headerless — sits past the progress bar's numbered range) — "The cost isn't only in the bedroom." Four groups: MIND (concentration, irritability, anxiety hum, low drive), BODY (low sex drive, tired, restless sleep), CONNECTION (avoiding partner/dating, pulling away), SELF-IMAGE (low confidence, unattractive, less of myself). "These aren't separate problems. They're one stress response showing up in different places."
*Placed before Generating by ruling: the whole-life cost inventory is an input to the analysis, not an afterthought to the reveal.*

**26 · `generating`** — 4–6s authored checklist animation: Autonomic profile → Pelvic baseline → Arousal conditioning map → Cognitive script index → "Sequencing your 75-day protocol…".
*Psychology:* labor illusion — visible computation buys belief in the result. Also the one-way door: history clears past this point.

**27 · `map`** — **"{name}, here is what your answers show."** The diagnosis reveal:
- **Composure Score** gauge — "how steady your body stays under intimate pressure." Only the destination band is labeled: "COMPOSED ZONE · 80–100"; axis reads "0 · adrenaline runs it" → "100 · calm & present". Lower ranges deliberately unlabeled (no shame stamp).
- A deterministic **verdict sentence** by score band (§5.2).
- **"Your biggest drivers"** — severity bars, each traced to a specific answer, each with a plain-English detail line (§5.3). "Conditioning drift" bar appears only if escalation was reported.
- CTA **Show me what's driving this**. Footer: "Stored on this device only."
- Side effects on advance: derives + persists the telemetry segment; records the Day-0 baseline to `composureHistory`; fires `composure_measured {score, day: 0}`.
*Psychology:* the personalized diagnosis is the funnel's centerpiece — self-relevant evidence beats generic claims. Score is clamped to 12–76, always below the 80–100 composed zone: **the gap is the product's honest premise**.

**28–31 · The four Clinical Context cards** (batched after the Map — diagnosis first, then its drivers, one tension arc):

| # | Card | Argument | Note |
|---|---|---|---|
| 28 | **The Adrenaline Trap** | Brain treats intimacy as threat → adrenaline → vasoconstriction + accelerated reflexes = the mechanics of ED/PE. "For **most men** in this pattern, nothing is physically broken." | Population framing by claims-gate ruling (the physician-note card exists because a minority's cause IS physical). CTA "I understand" |
| 29 | **The Default Mode Network** | Post-failure replay runs on the DMN; every replay tags the bedroom as more dangerous. "The replaying isn't processing the problem. It's training it." | CTA "Continue" |
| 30 | **The Novelty Loop** | Porn compresses arousal into a sprint; the body masters one tempo. Conditional lines if daily use ("likely the strongest single input…") and if escalation ("It runs in reverse, too"). | CTA "Makes sense" |
| 31 | **Why Band-Aids Fail** | Pills move blood, creams numb skin; neither touches the alarm — and every pill rehearses "my body can't do this without help." | CTA "I understand" |

*Psychology:* mechanism education converts "I'm defective" into "my system is mis-trained" — the identity shift that makes a training program (rather than a pill) the obviously correct purchase.

### 4.6 The Turn — Hope & Desire (Screens 32–37 + consent)

**32 · `turn-welcome`** (chapter) — "You're in the right place." "Everything you just saw … is a learned pattern. Learned means reversible." Closing line: "Welcome to Compose." CTA **Show me**.
*The pivot beat: diagnosis tension resolves into hope; a distinct breath before selling begins.*

**33 · `blueprint`** — "The 75-Day Blueprint." UCL 66-day automaticity research → Compose runs 75 "past the threshold, with margin." Sequenced rewiring: reset the alarm, retrain the body, consolidate the new default. Second paragraph sells the membership year: "it's Act One of your membership year — the SOS toolkit, your Baseline tracking, and the Mastery Suite at graduation carry it from there." Closing: "Ten minutes a day. That's the entire ask." CTA **Show me the journey**.

**34 · `hopeful-arc`** — five typographic sub-screens (the product tour):
1. **"Proof, not promises."** — the baseline + Day 14/40/75 re-measurements ("Evidence you can see beats reassurance you have to believe"). *The risk-reversal differentiator.*
2. **"Ten minutes. Headphones on. Eyes closed."** — one guided audio session/day; the work happens in the body, not on a display.
3. **"75 days. Three phases. One button."** — Autonomic Reset → Somatic Exposure → Identity Consolidation; "You never decide what to do next — the sequence decides." (phase-path visual)
4. **"For the moments that count."** — SOS: one tap, sixty seconds, 4-7-8 + grounding, "built for the bedroom doorway," yours from Day 1.
5. **"Private by architecture."** — no account, neutral notifications, Face ID, hidden app switcher, "your card statement reads Apple, never this app's name."

**Unnumbered · `telemetry-consent`** — placed directly after the privacy beat (a consent ask lands best after a trust proof). "Help prove this method works?" Bullets: counts only; never words or identity; decline and the app works exactly the same. Buttons: **Count my milestones** / *No thanks*. Decline is total — zero events, including the session's already-buffered ones.

**35 · `foundations`** — "Built on fifty years of clinical method." Sensate Focus (Masters & Johnson, 1970), CBST, Polyvagal-informed breathwork. Two stat cards (psychological-cause prevalence in younger men; performance anxiety as the common thread — both hedged, no invented numbers). `advisorLine: null` — renders only when a signed, permissioned advisor exists.

**36 · `diverging-graph`** — "From tonight, this only moves in one of two directions." Upper path annotations: Day 25 the alarm quiets / Day 50 the body leads / Day 75 the new default. Lower: "Avoidance compounds. Every skipped attempt teaches the alarm it was right." Caption admits it's illustrative. CTA **I want the upper path**.
*Psychology: loss-framing + agency — the CTA is itself a micro-commitment.*

**37 · `goals`** (multi-select + optional free text "In your own words — what changes?") — 8 desire-side options ("Feel calm and present during sex", "Initiate again — without the dread", "Trust my body again", "Finish this program knowing it's handled — for good"…). CTA **Lock in my goals**.
*The goal echo: his free text (or first selected goal) is read back verbatim on the paywall and dismiss screens — his own words become the sales copy.*

### 4.7 Commitment & Close (Screens 38–43)

**38 · `commit`** — "Every day for 75 days: headphones on, ten minutes, your session." Warns honestly: "Some days it will feel like nothing is happening. That's what rewiring feels like from the inside." Membership seed: "the 75 days are the opening act… your membership carries the year." Question: "Can you give it ten minutes a day?" CTA **Yes — I'm in**, with an "I have doubts" branch → "Doubt is fine. The protocol doesn't need your confidence — it needs your ten minutes." (same CTA).
*Psychology: consistency device + expectation-setting that pre-empts the Day-10–20 doubt window; the doubt branch converts skeptics without arguing.*

**39 · `building-plan`** (beat, ≤2s) — "Based on your answers, we've built your plan."

**40 · `paywall`** — see §6.

**41 · `paywall-dismiss`** (interceptor, once per session) — triggered by back/close on Paywall or Day Zero. "Your map is saved." / "Everything you mapped stays on this device. It will be here when you're ready." Buttons: **Keep going** / *Exit for now*. A returning user who backed out re-lands here with score intact.
*Psychology: the honest win-back — no discount, no countdown; preserves trust and the price integrity rule.*

**42 · `day-zero`** (signature screen) — see §6.3. **The purchase fires here.**

**43 · `discretion-setup`** — routed as `/discretion?intro=1` post-purchase (§7.1).

---

## 5. The Composure Score Engine (`content/onboarding/composure.ts`)

The measurement instrument behind the Map, the Day-14/40/75 re-measurements, and the Act III quarterly checks. Pure function; every weight lives in `COMPOSURE_WEIGHTS`.

### 5.1 Scoring

- Base 96, minus deductions per answer: adrenalineSpike (panic 14 / push-through 9 / occasionally 5), spectatoring (12/8/3), avoidance (stopped 10 / frequently 8 / sometimes 4 / rarely 2), pelvic release (limited 10 / partial 6 / skipped 4; 1–3 = limited, 4–7 = partial, 8+ = full), breathEdge (7/6/3), spillover (6/4/3), contentFrequency (5/3/2), escalation (5/3/2 for "no-say"), aftermath (fear-next 5 / shame 4 / anger 3 / numbness 3), morningArousal (3/2/1), plus 3 per failure script (capped at 8).
- **Clamp [12, 76]** — the score can never enter the 80–100 composed zone pre-program. The gap IS the honest premise. Reference persona lands at 37 (spec target ~41).
- Hard rules: severity labels only; no invented percentiles or "average man" comparisons; every bar traces to an answered question.

### 5.2 Verdict bands

≤35: "Right now, adrenaline is running the show…" · 36–55: "Your nervous system is working against you…" · 56+: "Steadier than most — but the interference is real, and it shows up exactly when it costs the most."

### 5.3 Severity bars

Six possible bars — Sympathetic override, Spectatoring loop, Pelvic release capacity, Avoidance pattern, Cognitive scripts, Conditioning drift (conditional). Each has its own grade vocabulary (High/Moderate/Low, Full/Partial/Limited/Unmeasured, Active/Present/Quiet), tone mapping (High = red; healthy reads = neutral — a good result must not look like a warning), and a one-line detail traced to his answer. Healthy answers earn genuinely positive lines ("a real strength").

### 5.4 Mirror sentence & segment

- `buildMirror()` composes the personalized pattern sentence ("Breath-holding at the edge, spectatoring most sessions, partial pelvic release — that triad is the adrenaline trap, conditioned over roughly three years") from reported markers + duration/age. Used by the paywall family.
- `deriveSegment()` (from the `reasons` answer): `pe-dominant` / `ed-dominant` / `mixed` / `anxiety-primary` — the one coarse tag lifecycle telemetry carries. Derived at the Map, stored as slug only.

---

## 6. Paywall, Day Zero & Purchase

### 6.1 Paywall (screen 40, `components/onboarding/Paywall.tsx`)

Layout order (top → bottom):

1. **Goal echo** — "Your goal: '<his own words>'" (serif italic).
2. **Headline** — "The 75-Day Reset, built for this profile — and the year that locks it in." Sells the transformation, never "a subscription."
3. **Profile recap chips** — his top two severity bars ("Sympathetic override · High") + caption "Reversible with daily somatic retraining." *The personalization receipt.*
4. **Price anchor vs offer** — struck-through "SEX THERAPY $1,800+ / 12 weeks" (comparator, not our price) beside the glowing offer card: "COMPOSE · ONE YEAR — {annual price}/year · One payment covers your full year" (or monthly variant).
5. **Term selector** — Annual | Monthly pills; annual pre-selected (higher sunk cost is itself a commitment device that predicts adherence). Monthly only offered once its price has loaded. Selection persists (`@membership_term`).
6. **Risk reversal** — "The Day-14 baseline check": "Your Composure Score is re-measured on Day 14 — you watch the change, or see exactly what to adjust. Measured, not promised."
7. **Phase IV locked block (Zeigarnik)** — "LOCKED UNTIL DAY 76": the rationale ("Mid-moment troubleshooting… is the adrenaline loop with better vocabulary. So the advanced tools stay sealed until the reset they would interrupt is complete") + four lock-iconed features (Somatic Copilot, Sensate Mastery, Refractory Window Guide, Anxious Partner De-escalator). Footer: "Included in your membership — it unlocks at graduation, Day 76." *Future-pacing, never a second purchase.*
8. **Positioning line** — "Pills and creams manage tonight. This retrains the system."
9. **Trust card** — "Your card statement shows Apple — never this app's name. Notifications stay neutral. Everything you enter stays on this phone."
10. **Auto-renew disclosure** (plain, calm micro-type directly above the CTA — App Review requires it; trust requires it more) → emissive CTA **Continue to Day Zero** → Restore / Privacy / Terms links (legal pages hosted at adwlivingventures.github.io/compose-legal/).

No trials, no countdowns, no refund language. `paywall_viewed` fires on display (funnel denominator; the annual price experiment is a server-side product swap needing no client tag).

### 6.2 Dismiss intercept

First back/close attempt on Paywall or Day Zero → the `paywall-dismiss` screen (once per session, flag persisted). Second attempt → normal back.

### 6.3 Day Zero (screen 42) — signature + purchase

- Eyebrow DAY ZERO. Headline: "This only works if you show up. So we start with your word."
- **The oath** (card, serif italic): *"For the next 75 days I will give this ten minutes a day. Not to perform better — to stop performing at all."*
- Signature line ("Sign your first name") — the CTA stays **inert until signed** (effort justification: the purchase completes a promise already made). Caption: "SIGNED ON THIS DEVICE · SEEN BY NO ONE."
- Chips: "75 days" · "10 min a day" · "{pricePerDay} a day" (annual only, ÷365).
- CTA **Sign & begin — {price}** → StoreKit purchase of the selected term's package (annual product resolved from the live Offering — the RC Experiment's swap point). Auto-renew disclosure sits directly under the button.
- Signature persists to `@signature_data` **before** purchase (an interrupted transaction never loses the oath). On success: SEAL haptic, `purchase` event ({term} only), entitlement unlock, route to `/discretion?intro=1`.
- **Restore path** (App Store requirement): restores entitlement; if no local signature exists, routes through `/oath` first (an unavoidable threshold, not a form field — the Day-26/51 interstitials need a signature to resurface), then discretion intro.

---

## 7. Post-Purchase Flow

### 7.1 Discretion setup (`/discretion?intro=1`)

The first post-payment screen — deliberately: the moment after paying for a product like this is peak exposure-fear; buyer's remorse here is privacy panic, and this screen is the antidote ("churn insurance, not a settings page").

- "DISCRETION — Unreadable at a glance."
- Three toggles: **Neutral notifications** ('"Today's session is ready." Never more.'), **Face ID to open** ("A handed-over phone shows nothing" — requires enrolled biometrics + a confirm-pass before arming), **Hide from app switcher** ("Covers the preview card when you switch apps").
- Footer: "Billing is handled by Apple. Your card statement shows Apple — never this app's name."
- Intro mode ends with CTA **Begin Day 1** → `/(tabs)`. The same screen is reachable later from You → Settings → Discretion (with back button, no CTA).
- Ruling: alternate icons are NOT on the roadmap; the screen promises only what ships.

### 7.2 First session gates

- **Day 1 — Somatic Primer** (un-skippable 3-step module before the first session): "The Kegel Trap" (internet advice trains clench=control; this program down-trains), the reverse-kegel mechanics with an animated piston diagram, breath timing (4s in / 6s out) mirroring the orb, and the most-common-error correction. X exits to dashboard with the gate still armed. Permanently re-readable as "The Somatic Drop" (`/technique`).
- **Day 1 completion — reminder opt-in:** rides the completion high (post-success asks convert; the hour he just finished at IS the schedule). Shows the *verbatim* notification preview ("Compose / Today's session is ready.") so consent is informed at the lock-screen level. "Never a streak warning. Never a word about the work." Decline = quiet exit; the Discretion row remains the way back in.

---

## 8. The Main App — Four Tabs

Tab bar: **Today** (dashboard) · **Restructure** (brain icon) · **Baseline** (trend icon) · **You** (profile). Sand active tint; all scenes on Ember ground.

### 8.1 Today tab (`components/MainDashboard.tsx`)

**Header:** "COMPOSE" wordmark + the **Steady me** pill (SOS — identical in every dashboard state; anxiety doesn't check whether today's session is done).

**Session-pending state (E08):**
- 250px progress ring (day N of 75, arc = days done), phase eyebrow ("Phase II · Exposure & Mastery"), today's anchor title + focus line.
- Primary CTA **Begin today's session** (the screen's one dominant action).
- Streak line only when >1: "N consecutive days · rest is part of the work" (no loss framing).

**Completed state (E13):** ring shows a check + "N days composed"; "Today is complete. Day N+1 unlocks at midnight. Rest is part of the work." Then:
- **Field note** card (authored milestone texture, only on Days 7/14/21/25/33/40/50/60/66/70 — anti-hedonic-adaptation, arc made visible).
- **Tonight's line** card — the day's identity-register sentence read back as a quote (`content/tonightLines.ts`). Closure, deliberately no next action.

**Both states:**
- **Re-measurement card** when a milestone (Day 14/40/75) is due and unrecorded: "Measure the loop again — Same questions as Day 0 · about three minutes · evidence, not a promise." → `/remeasure?day=N`.
- **Today's ledger row** ("N of M votes cast") → `/ledger`. Quiet, accent-free (Hick's Law: the session CTA stays dominant). Open until midnight in both states.

### 8.2 The Daily Session (`/session`, full-screen modal)

One linear, all-or-nothing flow, 4 stages with non-tappable orientation dots; X exits without credit; SOS ("Steady me — right now") reachable mid-session.

1. **The Anchor** — the day's Auditory Anchor (3–4 min authored audio, all 75 produced and bundled, mono 64kbps). Rotating intro shell copy by phase register. Minimal player: play/pause, non-interactive progress, time remaining — **no scrubber** (skipping ahead is the checking behavior the track down-regulates). Background + silent-mode playback enabled. Audio completion advances the stage.
2. **Conditioning** — the 5-min paced breath + pelvic-floor sequence on the BreathingOrb (4s inhale + pelvic drop / 6s exhale + recoil — the prolonged-exhale vagal lever; never changes). Phase-progressive content (`content/conditioning.ts`): Phase 1 pure down-training reps; Phase 2 inserts stillness holds (the arousal-plateau rep — somatic skeleton of stop-start control); Phase 3 fades text cues partway in (basal-ganglia handover made literal). Pre-start recap shows the two-cue technique + most common error, one tap to the full Primer.
3. **Control** — "How much ease did you feel through the sequence?" 1–5 (Very little → Complete ease). "There is no good or bad answer — this is a signal you're learning to read, not a grade."
4. **Check-In** — the Vitality Ledger reconciliation, grouped chronologically (Morning / Through the day / Tonight). Items checked earlier via the check-anytime surface arrive pre-checked ("reconciliation, not a memory test"). Phase-entry intro lines on Days 26/51 when a new item joins. The **Clean Focus falter line** appears quietly when ≥2 items are checked but Clean Focus isn't (relapse normalization at the abstinence-violation moment — the slip that otherwise catastrophizes into app deletion). CTA **Complete Day N**.

**Completion mechanics (`ProtocolContext.markDayComplete`):**
- **Pacing lock:** one session per local calendar day, enforced in the context (not just hidden UI). Day N+1 unlocks at midnight.
- **Streak with repair semantics:** a single missed calendar day quietly continues the streak (gap ≤2); only a multi-day walk-away resets to 1. A hard one-miss reset would weaponize shame — the exact loop the app treats.
- Emits `day_completed {day}` + `control_score {value, day}`; Day 75 additionally fires `graduated` and permanently disables the daily reminder (a "session is ready" line after Day 75 is a broken promise).

**Session gates:** Day 1 → Somatic Primer (§7.2). Days 26/51 (or first session past those boundaries) → **Cue Picker**: one implementation-intention choice per active ledger item (5 items at Day 26, 6 at Day 51), authored first-person options + optional self-written cue (local-only). Continue inert until a cue is chosen — choosing is what makes the cue his. Day-51 re-pick preselects Day-26 choices.

### 8.3 Restructure tab (`app/(tabs)/cbst.tsx`) — "Rewire v2"

Header: "Restructure — Built on CBST." Three instruments, one narrative (recognition over authorship: the user only *tags* the distortion; the counter is always delivered, pre-written — §5's "immediate, pre-written reframe," corrected from v1 which demanded prefrontal authorship mid-activation):

1. **Daily Rewire** (top card, "Rep N of 75") — one authored belief-flip per day (`content/rewires.ts`, cycling). Motor act: **press-and-hold 1.2s crosses out the old script** ("My body is broken") — embodied defusion + commitment gesture (a tap is ignorable; a hold is a decision) — then "The truth" is read at a 10s paced line ("Now read it once more — at the pace of this line"). Done state: "N deliberate reps against the old belief system." Persists per-day (`@daily_rewire_done`).
2. **Spike flow** ("When a thought spikes" → CTA "Restructure a thought — Sixty seconds…") — name it (6 distortion cards: Catastrophizing, Mind-Reading, All-or-Nothing, Fortune-Telling, Overgeneralizing, Spectatoring — each with definition + authored clinical counter) → read the counter ("once, slowly — out loud if you can") + optional one-line capture → **close the loop with one 8s guided exhale** (the vagal brake paired with the cognitive counter — every use ends calmer than it began, which is why he returns). Entry saved *after* the exhale (the last beat is regulation, not record-keeping). "Never mind — I'm steady" exit. Emits `restructurer_used {distortion}` — tag only, never text.
3. **Evidence Locker** — merged history (spike entries + SOS defusion entries + legacy v1 entries), newest first, expandable, deletable. Stats: loops closed, days since last spike; the **dominant-pattern insight** at ≥5 loops/≥3 same-tag: "N of your M loops are one known voice — mind-reading. One pattern, named. It arrives; you counter it; it leaves." (trait-level defusion). Footer: "Every word on this screen lives only on this device."

Voice law: the distortion is always externalized ("the Spectator," "the alarm," "the forecast"); no first-person deficit lines; counters direct attention toward the replacement.

### 8.4 Baseline tab (`app/(tabs)/progress.tsx`) — "Autonomic Acclimation"

The proof-of-change artifact and renewal asset (the Day-14 checkpoint, graduation export, and future month-11 renewal-evidence screen all draw from it). Doctrine: votes not verdicts — counts and signals only, no grades, no red, missed days absorb into ground.

1. **Composure card** — latest score (44px sand serif), delta vs Day-0 baseline, "Measured, not promised. The calm zone sits at 80–100 — the gap is the work, and it is closing on schedule."
2. **Stat row** — Days Completed · Day Streak · Baseline Shift (last-7 vs first-7 control average).
3. **Composure ledger** — every reading (Baseline · Day 0, Day 14, 40, 75) as rows; "the same questions, answered by a differently conditioned nervous system."
4. **Control Score chart** — daily 1–5 (faint) + 7-day rolling trend (solid), P2/P3 phase boundary markers; per-phase averages once a phase has ≥5 scored days ("the protocol got harder each phase, so a flat line is improvement"); the baseline-shift interpretation line ("not willpower, conditioning").
5. **Seventy-Five Days vote map** — 15×5 grid; each completed day a lit sand cell, intensity by ledger votes kept (endowment made visible; a zero-vote completed day still glows — the session itself is a vote).
6. **The Ledger** — per-item counts ("Morning Light — 31 of 40 days"), total votes; and the **rule-based insight**: deterministic, locally computed correlation shown only past thresholds (n≥10, both buckets ≥5, effect ≥ +0.5) — e.g. "On days after a full Screen Sunset, your control score has averaged +0.7 higher. The ledger and the pacer are one system." (Screen Sunset and Clean Focus computed at next-day lag — sleep/dopamine-mediated.) *The moment discipline connects to outcome — the identity thesis with a number on it.*
7. **Evidence Locker summary** — loops closed, quiet days, dominant voice, and the extinction line when weekly spike counts are falling ("A quieting alarm is extinction, and extinction is the mechanism working").

### 8.5 You tab (`app/(tabs)/profile.tsx`)

Header: first name + "Membership active" badge.

**Library** (compact rows — a table of contents, not a feed):
- **Somatic Sandbox** — locked until Day 26 ("Opens on Day 26", inert lock row). Unlocked: "Your pacer, your ratio — on demand" → configurable BreathingOrb with presets Downshift 4:6 (the daily ratio), Deep release 4-7-8 (the SOS ratio), Box 4-4-4-4, plus a custom builder (inhale 2–8, hold 0–10, exhale 2–12; config persists locally). Locked through Phase 1 to protect single-ratio habituation; the Day-26 unlock is a milestone reward landing in the Day-22–30 relapse window.
- **The Somatic Drop** (`/technique`) — the Primer as a permanent skill reference (a reference that disappears after one viewing is a retention bug).
- **Pelvic Release Check** (`/pelvic-check`) — the onboarding 20-second tension test as a standing tool with local re-check history (comparable trend; skippers can measure any time).
- **The Vitality Baseline** (`/vitality`) — the ledger's reference: pillar accordions with the collapsed rule on the surface and the mechanism one tap deep (iceberg/progressive disclosure — an anxious scanner sees instructions, not endocrinology walls; the mechanism is adherence fuel for week three).
- **The Success Vault** (`/success-vault`) — curated composite struggle→abyss→breakthrough narratives (vicarious relapse normalization: the Day-22 falterer needs to have already read about the man who faltered on Day 22). **Provenance disclosure on-screen is load-bearing** — authored composites, not testimonials (FTC/App Review).
- **Partner Scripts** (`/partner-scripts`) — five word-for-word scripts grouped by category (Opening the Conversation, In-the-Moment, Vulnerability, Repair, Check-In), each copy/share-able.
- **Partner Guide** (bottom sheet) — "A Short Guide for Partners," written to be read on his handed-over phone: what's actually happening, why it's not about her, what helps (co-regulation), what makes it worse. Removes his burden of explaining mid-vulnerability.

**Phase IV** (kept apart from the Library — it's a tier, not reading): **Mastery Suite** row → `/mastery` (§10).

**The Vault · Local Record Only** — read-only ledger of his own Ventral Vagal Anchors written in the Triage Center, rendered as dated quote cards ("a record, in your own words, of who you are becoming"). Phase-3 identity consolidation: the accumulating file IS the evidence of the new identity. Editing/deleting lives in Restructure.

**Settings** — Discretion · Restore Purchases · Reset Protocol Baseline (destructive confirm; wipes progress, never the entitlement or vault). Dev builds add: Replay Onboarding, Jump to Day.

---

## 9. SOS — The Triage Center (`components/TriageCenter.tsx`)

The "painkiller" mechanic. A **bottom sheet with an opaque scrim** (not a screen push — a sympathetically activated user shouldn't pay a re-orientation cost; the sheet is its own room). Opened from the Steady-me pill (dashboard) or the mid-session link. Emits `sos_opened` — the fact only, never which tool or what was written.

Menu: "Steady. You're in the right place. Pick the moment you're in." Three state-matched branches:

1. **Before Intimacy — Rising Pressure** → paced **4-7-8 breathing** on the BreathingOrb, auto-starting the moment the branch opens (a "start" decision is one decision too many); countdown numeral in the orb, phase labels, cycle count ("four is usually enough"), haptics + accessibility announcements. Stop is the only control while running.
2. **During — Watching Yourself** → **sensory grounding 3-2-1** as three large count-cards (SEE 3 / FEEL 2 / HEAR 1 — "a panicked reader scans numerals, he doesn't read paragraphs"), mirroring the Day-16 anchor exactly so under pressure there is one protocol, not two. Close: "Anxiety lives in the future. Your senses only work in the present."
3. **Afterward — The Replay Has Started** → **Spectator Disassembly**, tap-first defusion: six pre-written common Spectator claims, each pre-tagged with its fallacy ("She thinks something is wrong with me." → Mind-Reading) — one tap names the distortion and surfaces the authored reframe; writing his own claim is the fallback path; writing a Ventral Vagal Anchor in his own words is offered (generation effect) but never required ("Done — filed and dismissed" saves without typing). Entries persist locally and feed the Vault + Evidence Locker.

Footer normalization (number-free, PE-nonspecific, hedged epidemiology only — fabricated social-proof counters are an FTC tripwire): "…you are not an outlier."

---

## 10. Program Architecture & Content Systems

### 10.1 The 75-Day Protocol (`content/ProtocolData.ts`)

Three 25-day phases; phase is always **derived from day, never stored** (can't drift):

| Phase | Days | Title | Objective |
|---|---|---|---|
| I | 1–25 | The Autonomic Reset | Down-regulate sympathetic activation; break intimacy→anxiety association |
| II | 26–50 | Somatic Exposure & Mastery | Tolerance of high arousal without losing present-moment control |
| III | 51–75 | Identity Consolidation | Anchor the shift ("this is who I am now," not "I am managing a problem") |

Each day has an authored title + focus line (e.g. Day 1 "The Sovereign Presence — Overcoming 'spectatoring'"; Day 3 "The Pelvic Drop"; Day 7 "The Zero-Goal Principle — Sensate Focus Stage 1"), extracted verbatim from the phase script docs (`docs/COMPOSE-Phase-1/2/3-Scripts.md`), with a matching bundled audio anchor (`assets/audio/day_N.mp3`).

### 10.2 The Vitality Ledger (`content/ledger.ts`)

Unbundled, phase-gated daily behaviors (supersedes the old 3-item bundled checklist — one binary for "sleep, light, movement" was unfalsifiable checkbox theater; identity updates on evidence, and evidence must be specific enough to be true). Toward-framed questions, each with a pillar, a habit-stacking cue, and a one-line mechanism:

| Item | Phase in | Timing | Question | Mechanism (one-liner) |
|---|---|---|---|---|
| Morning Light | 1 | morning | 15 min outdoor light? | Circadian anchor → overnight T release, cortisol curve |
| Presence Rep | 1 | day | Two deliberate minutes inside your body? | Interoception = the antidote to spectatoring; daylight reps are the ones available under pressure |
| Clean Focus | 1 | day | Protected focus from pornographic input? | D2 resensitization so real touch carries signal |
| Screen Sunset | 1 | evening | Screens dark an hour before you? | Melatonin/deep sleep → endocrine T synthesis |
| Deliberate Movement | 2 | day | Trained or moved with intent? | Endothelial nitric oxide + clean sympathetic discharge |
| The Unclench | 3 | day | Caught the clench — jaw, glutes, floor — and let it go? | Daylight hypertonicity audit lowers the resting tone the pacer trains against |

Two write surfaces: the **check-anytime Ledger screen** (`/ledger`, items checked when they happen; three light touches a day put the cue inside his actual life) and the session's reconciliation stage. Merged, never replaced. Counts only, never percentages.

### 10.3 Anti-hedonic-adaptation systems

The daily ritual skeleton is invariant (basal-ganglia automaticity); everything *around* it progresses so 75 reps read as a trajectory, not a treadmill:

- **Conditioning progression** (§8.2) — holds in Phase 2, cue-fade in Phase 3.
- **Ledger progression** — one new item per phase, introduced with an authored intro line.
- **Session shell copy rotation** (`content/sessionCopy.ts`) — intro/header/footer variants rotate by day, register-locked per phase; the control-score question never rotates (a measurement's wording is part of its calibration).
- **Field notes** (`content/fieldNotes.ts`) — sparse authored milestone notes (10 keyed days) tracing the automaticity arc (Day 66: "the clinical average for a habit reaching automaticity. Everything from tonight forward is buffer").
- **Tonight's lines** (`content/tonightLines.ts`) — one identity-register sentence per day as the evening's closing image (present tense, no hype, no instruction).
- **Cue picker** (Days 26/51) and **Sandbox unlock** (Day 26) — new agency landed in the relapse windows.

### 10.4 Milestones & interstitials

- **Phase transitions (Days 26/51,** `components/PhaseTransition.tsx`**):** shown once on dashboard arrival — names the threshold ("Phase I is complete. The reset is holding.") and **resurfaces the Day-Zero signature** ("You signed this on Day Zero") — consistency leverage; the Day-26 note announces the Sandbox unlock. A stale Day-26 interstitial is retired rather than shown late.
- **Composure re-measurements (Days 14/40/75,** `/remeasure`**):** the same eleven scored questions through the same weights ("the instrument never changes between readings — that comparability IS the product claim"). Linear intro → questions → result; "Not today" exits quietly (the card resurfaces; no loss framing). Result: big sand score + Day-0 baseline + register-keyed copy (Day 14 capability / 40 evidence / 75 identity; improved/steady/dip variants — dips normalized, never graded). Same-day re-runs replace idempotently. Also reused quarterly in Act III.
- **Graduation (Day 75 complete,** `components/GraduationScreen.tsx`**):** shown once until a choice is recorded. "The protocol is over. The baseline is yours." Evidence card computed from his own logs (days completed, first-week→final-week control shift, anchors written, his earliest anchor quoted back — endowment, never asserted). Two exits, **both framed as wins**: keep the membership (purchase path exists only for the lapsed-membership edge — a graduating member already owns Act II) or **export the record** (share sheet: plain-text personal record, "generated on your device. Nothing was sent anywhere") — a real, dignified exit retained as a trust artifact. Fires `export_used` on completed share only.
- **Post-program dashboard:** "75 Days. Complete. What you built is yours — it doesn't expire." Members see the unlocked Mastery Suite entry (Somatic Copilot as Act II's first concrete deliverable) + Manage Subscription (RevenueCat Customer Center); lapsed users see the renewal card (annual-first, monthly secondary).

---

## 11. Mastery Suite (Phase IV / Act II)

Index at `/mastery`; previewed in the You tab and the paywall's locked block. Gate: Day 75 complete **+ active membership**. Locked cards are inert by design (no toast, no modal — a locked thing that begs for taps reads as a sales surface). Mechanism: future-pacing — rehearsing the post-Day-75 identity months early so graduation lands as an earned unlock.

| Module | Route | Unlock | What it is |
|---|---|---|---|
| The Somatic Copilot | `/copilot` | Day 76 + membership | Deterministic triage: nine authored trigger→reframe pairs ("I lost my erection mid-way," "I felt myself getting too close too fast," condom moment, post-argument, new partner, alcohol, long gap, partner-initiated-while-wound-up, racing mind). Two-step linear: pick the roadblock → read the CBST reframe → **Acknowledge & Internalize** (single exit; triage, not a library) |
| Sensate Mastery | `/lesson/sensate-mastery` | Day 76 + membership | Lesson: performance myth, anxiety transfer, the waveform, somatic checkpoint |
| The Attunement Advantage | `/lesson/partner-attunement` | Day 76 + membership | Partner attunement: pacing, touch with attention, her longer curve, asking like it's confidence |
| The Refractory Window Guide | `/lesson/refractory-window` | Day 76 + membership | Neuro-mechanics of the recovery window; the restart myth; working the window |
| The Anxious Partner De-escalator | `/lesson/partner-deescalator` | Day 76 + membership | Two nervous systems in the room; why reassurance fails; name-normalize-redirect scripts |
| The Autonomic Sync | `/autonomic-sync` | **Open now** (badge; plan-neutral wording — "free" reads wrong to a paid member) | The preview: 3 lesson cards (cards 1–2 deliberately hook-depth; card 3 gives away the Vagus Sync whole — the most shareable technique makes the locked tier concrete) + a scripted, deterministic Copilot simulation |

Lessons render through `components/LessonEngine.tsx` from `content/lessons.ts`; unknown lesson ids redirect quietly to the dashboard.

---

## 12. Discretion & Privacy Systems

- **PrivacyShield** (root overlay): (1) app-switcher cover — opaque ground-colored card with only the wordmark replaces content before iOS snapshots (opaque beats blur: blur leaks layout/color); (2) Face ID gate — covers content on cold start and re-lock on backgrounding; fail-open if biometrics are unavailable (never brick the app); everything on the lock surface passes the stranger test.
- **Notifications** (`services/notifications.ts`): a single daily local reminder at the user's chosen hour; content is always title "Compose" / body "Today's session is ready." Auto-disabled permanently at Day 75.
- **Local-only storage:** every answer, log, journal, signature, config on-device (AsyncStorage + Keychain). The literal promise "every word on this screen lives only on this device" appears on the Restructure, Baseline, and You tabs.
- **Telemetry** — the one deliberate exception (§16).
- **Billing discretion:** card statements read Apple; the app name never appears.

---

## 13. Monetization Reference

- **Entitlement:** `membership`. **Offering:** `default_onboarding_offer`.
- **Products:** `compose_annual_9999` ($99.99/yr, primary) · `compose_annual_7999` ($79.99/yr, experiment arm) · `compose_monthly_1799` ($17.99/mo, secondary). The active annual product is never resolved by hardcoded id — the paywall renders whatever the current Offering serves (otherwise the experiment readout is corrupt).
- **Purchase moment:** Day Zero only. **Restore:** paywall footer + You-tab Settings; unsigned restores route through `/oath`.
- **Entitlement lifecycle:** Keychain cache + RC listener; lapses downgrade in ProtocolContext only. Manage Subscription → RevenueCat Customer Center (fallback: iOS Settings instructions).
- **Conversion mechanics in play:** personalization receipt (profile recap + goal echo), therapy price anchor, evidence-based risk reversal (Day 14), Zeigarnik locked block, annual-first term selector (sunk-cost commitment), signature-before-purchase (effort justification + consistency), honest auto-renew disclosure (converts the subscription-trap-fearful better than hiding it), once-per-session honest dismiss intercept (no discounts — price integrity).
- **Retention mechanics in play:** midnight pacing lock (scarcity + circadian ritual), streak-with-repair, phase-gated progression + unlocks, field notes/tonight lines (variable milestone reinforcement), re-measurement evidence loop, relapse normalization (falter line, Success Vault, Day-24 semantics), discretion as churn insurance, Mastery Suite future-pacing, graduation-as-ceremony with a dignified export exit.

---

## 14. Analytics — The Complete Event Catalogue (`services/analytics.ts`)

Consent-gated (onboarding consent screen; decline = zero events including buffered ones). Schema-whitelisted — a field is int, slug, or a closed enum; anything that *could* carry written content is rejected. `clientUser: 'anonymous'` constant for every install; no per-user join key. Transport: batched fire-and-forget to TelemetryDeck, silent offline requeue (capped).

| Event | Fields | Fired |
|---|---|---|
| `onboarding_started` | — | first screen of a fresh install |
| `onboarding_screen` | screen_id, action (advance/back/skip/dismiss-*/purchase-*/restore), elapsed_ms | every onboarding screen leave |
| `composure_measured` | score, day, segment? | Map (day 0) + each re-measurement |
| `paywall_viewed` | — | paywall display (funnel denominator) |
| `purchase` | term (annual/monthly), segment? | successful purchase |
| `day_completed` | day, segment? | session completion |
| `control_score` | value (1–5), day | session completion |
| `sos_opened` | — | Triage sheet open (never the branch) |
| `restructurer_used` | distortion (closed 6-value list) | spike flow / SOS defusion save (tag only, never text) |
| `graduated` | segment? | Day 75 completion |
| `export_used` | — | completed graduation export |

**Segment:** exactly one coarse field, exactly four values (pe-dominant / ed-dominant / mixed / anxiety-primary), derived from the presentation question, riding only lifecycle events. Anything finer is a re-identification surface for sexual-health data.

---

## 15. Storage Key Inventory (local-only)

| Key | Contents |
|---|---|
| `secure_purchase_receipt` (Keychain) | membership entitlement cache |
| `@onboarding_flow_v1` | onboarding resume state (screenId + answers) |
| `@paywall_dismissed`, `@membership_term` | dismiss-intercept flag; selected term |
| `@signature_data` | Day-Zero oath name + timestamp |
| `@user_protocol_state` | activeDay, streak, lastCompletedDate |
| `@completed_days_data_v2` | per-day DayData (completed, pelvicRating, ledger) |
| `@presentation_segment` | derived segment slug only |
| `@telemetry_consent` | granted/declined/unset |
| `@somatic_primer_done`, `@cue_picker_done_p2/p3`, `@chosen_cues` | session gates + implementation intentions |
| `@daily_rewire_done` | daily rewire completion day |
| `@cbst_log_entries` (legacy), `@spike_log_entries`, `@defusion_log_entries` | Restructure/Vault entries |
| `@pelvic_recheck_log` | standing pelvic-check history |
| `@composure_history` | Day 0/14/40/75 readings (milestones: `COMPOSURE_MILESTONES = [14, 40, 75]`) |
| `@discreet_faceid` / `@discreet_blur` / `@discreet_notifications` | Discretion toggles |
| `@phase_transition_2/3`, `@graduation_choice` | interstitial/ceremony seen-flags |
| `@sandbox_config` | pacer preset/custom ratios |
| `@user_first_name` | profile display |

---

## 16. Dev-Only Tooling

Paywall "Skip paywall (dev)" + Ember demo link; session "Skip stage"; You-tab "Replay Onboarding from start" and "Jump to Day" (releases the midnight lock); `devJumpToDay` no-ops in production; `/ember-demo` redirects out in prod builds.

## 17. Deliberately Deferred / Not Yet Built

- **Testimonial slots** (onboarding screen 16 + paywall row): gated off until real, consented quotes exist.
- **Advisor line** (Foundations screen): null until a signed, permissioned advisor exists.
- **Month-11 renewal-evidence screen** (his own year of Baseline data shown before the renewal charge): committed in Model V2, not yet implemented.
- **Graduation ceremony rewire** for Model V2 (pure unlock ceremony UX): deferred within the 75-day runway; current screen handles the lapsed-edge purchase path.
- **Act III weekly maintenance cadence**: quarterly re-measurement plumbing exists (remeasure reuse); the weekly cadence surface is roadmap.
- **Web quiz → Stripe funnel**: month 3–4, when paid UA begins.
- **Android**: config scaffolding present; iOS-first ship.

---

*End of specification. Update this document whenever a founder ruling, screen, or content system changes — it is only useful while it matches the build.*

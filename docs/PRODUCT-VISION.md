# COMPOSE — Product Vision & Strategy Rationale

Distilled from the founder's strategy sessions (`docs/gemini-strategy-log.md`, 2026-07)
and reconciled against the actual build. **Where this document and CLAUDE.md
disagree, CLAUDE.md governs** — in particular, the strategy log's
"cures ED / digital therapeutic / FDA-tier" language predates the claims
guardrails and must never reach user-visible copy or ASO (CLAUDE.md §1).

This file exists so any session (or human) can understand *why* each feature
exists without re-reading 68 pages.

---

## 1. The Monetization Thesis: "The Graduation Loop"

No freemium, no day-one feature gating. The $49.99 program is deliberately
all-inclusive so the tools integrate into daily habit (endowment effect); the
$4.99/mo continuation is framed as an **Expansion Pack unlock** (Zeigarnik
effect — he's been looking at the locked modules for 75 days), never as a
maintenance tax. Locked Phase-IV features are *visible from Day 1* with
clinical justification for why they're locked (the **Authority Frame**: "we
restrict advanced coaching to force a nervous-system reset") — turning a
missing feature into proof of rigor.

**✅ RESOLVED (founder ruling, 2026-07): opt-in wins, permanently.** The
$49.99 purchase never auto-rolls into a subscription — the paywall promises
"No subscription · pay once, keep it," and auto-rolling that user would be a
broken contract (App Store refund storms, "SCAM" reviews, and the death of
the "app whose business model is you finishing" position). The continuation
is offered opt-in at the E19 graduation screen, **annual-first ($39.99/yr
primary, $4.99/mo secondary)**. Additionally ruled: **no refund promises on
any surface** — Apple owns the refund process entirely; the risk reversal is
the Day-14 Composure re-measurement (evidence, not money-back). Codified in
CLAUDE.md §2; do not relitigate.

## 2. Feature Map & Gates

| Feature | Gate | Status | Why it's gated there |
|---|---|---|---|
| 75-day protocol (anchors, conditioning orb, score, checklist) | $49.99 | ✅ built | The product |
| Somatic Primer (reverse-kegel mechanics) | Day 1, un-skippable | ✅ built | Mechanical confidence before rep 1 — uncertainty triggers overthinking |
| Vitality Baseline primer (3 pillars) | always (Library) | ✅ built | Iceberg: rule on the surface, science one tap deep |
| Success Vault (composite hero's journeys) | always (Library) | ✅ built | Relapse normalization at the churn moment; replaces live community |
| Mastery Suite teaser + Autonomic Sync preview | always | ✅ built | Strategic teaser: one free module proves the locked tier |
| **Somatic Sandbox** (customizable pacer) | **Day 26** (Phase 2 start) | ❌ not built (mislabeled as Day-76 locked card) | Locked in Phase 1 so he can't tweak ratios mid-habituation; unlocks as a milestone reward |
| Somatic Copilot (deterministic reframes) | Day 76 + maintenance | ✅ built | Copilot on Day 4 = troubleshooting = analysis-paralysis = adrenaline |
| Sensate Mastery lessons | Day 76 + maintenance | ✅ built (1 lesson) | Partner content during the program re-triggers spectatoring |
| Graduation flow (E19) | Day 75 complete | ✅ built | Evidence-first continuation ask; dignified export exit |
| Clinical Engine (deep-research vault, the "80%") | — | ❌ deferred | High claims-surface, marginal value pre-launch |
| Partner Sync Mode | — | ❌ V2, deliberately | Private sandbox first; heavy infra + privacy risk |

## 3. The Anti-Roadmap (deliberate rejections — do not "helpfully" add these)

- **No biometric/output tracking** (morning erections, performance grades):
  the Observer Effect — logging an output he can't consciously control turns
  therapy into a test. Track inputs (sessions, streaks) only. The 1–5 control
  score is acceptable because it rates felt ease during *practice*, not
  bedroom performance.
- **No live community / live counters**: Negative Contrast Effect — a
  struggling Day-12 user seeing others succeed spirals. Curated composite
  narratives with mandatory mid-program relapse beats instead.
- **No open-ended LLM chat**: App Store risk + hallucination risk for fragile
  users. Everything conversational is deterministic, authored, versioned
  (CLAUDE.md §7). Brand name: **Somatic Copilot** — never "AI".
- **No "75 Hard" pairing / hustle framing**: extreme challenges redline the
  sympathetic system and lock the pelvic floor. Positioning is the
  **anti-hustle "Somatic 75"** — presence and regulation, not grind.
- **No percentage progress bars on protocol progress**, no red/green
  pass/fail, no confetti/badges. Lesson-length progress bars are fine
  (they measure content, not the self).

## 4. Information Architecture: the Iceberg (20/80)

One-sentence authority hooks on working surfaces ("This 4:6 ratio
down-regulates sympathetic arousal"); deep mechanism one tap away (accordion
"Clinical mechanism" sections, Library primers). Prefrontal over-education
at the moment of practice re-creates spectatoring; zero education creates
skepticism at the price point. The built primers/accordions implement this.

## 5. Framing Rules (copy-level, all surfaces)

- Dopamine/porn content is framed as **"D2 Receptor Resensitization"** —
  mechanical, never moral. No NoFap vocabulary, no shame language.
- Relapse is always "information / part of the process," never failure.
- Discretion is a feature to be *sold* (privacy promise before first
  question; Discreet Mode surfaced post-purchase).
- Claim language: see CLAUDE.md §1/§4 and the claims-tightening ledger in
  `.claude/ember-progress.md` (launch gate).

## 6. Divergences from the strategy log, resolved deliberately

These were conscious build decisions, not oversights — don't relitigate
against the log:

1. **Three-item checklist** (Presence/Clean Focus/Vitality) kept over the
   log's single Vitality checkbox — three specific behaviors beat one
   aggregate for habit signal; still well under cognitive-load limits, and
   CLAUDE.md §5 is binding.
2. **Linear 4-stage session** kept over the log's hub-style
   "DailyDashboardScreen" — the log itself later endorsed linear/no-hub;
   its dashboard prompt predated that.
3. **23-step diagnostic funnel** (E02 template) kept over the log's
   "9-screen onboarding" — the log never saw the built funnel.
4. **"Somatic Copilot"** naming (never "AI") — §7 lane protection.
5. **Success Vault composite-narrative disclosure** is load-bearing
   (FTC/endorsement) — the log's "clinical case studies" framing needs it.
6. **Opt-in continuation** (see §1 open decision) pending founder ruling.

## 7. Content Pipeline (the actual critical path to launch)

Code is ~feature-complete. Remaining launch blockers are content + ops:
- **Audio**: ✅ DONE — all 75 anchor scripts authored AND all 75 recordings
  produced, re-encoded (mono 64kbps), bundled, and registered in
  `content/anchors.ts`. No longer a launch blocker.
- Copilot scenario expansion + preview trim (see backlog), further Sensate
  Mastery lessons, additional Success Vault narratives.
- Paid Applications Agreement, claims-tightening pass, ASO copy (use the
  "Somatic 75 / anti-hustle" positioning; run through claims filter).

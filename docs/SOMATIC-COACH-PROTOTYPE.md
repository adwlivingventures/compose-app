# Somatic AI Coach — One-Week Prototype Plan

**Status:** proposed, not started. Awaiting founder go/no-go.
**Author:** working session 2026-07-15.
**Purpose of this doc:** define exactly what a one-week, internal-only prototype
of a generative "Somatic Coach" would and would not do, so the founder can
decide whether the quality justifies the ~6–10 week hardening build (scoped
separately). This is a *decision-support spike*, not launch work.

---

## 1. The one question this prototype answers

**Is a research-grounded generative coach clearly better than a strong
deterministic copilot for these specific men — enough to justify the full
hardening budget and the regulatory/privacy tradeoffs?**

Everything below serves that question. If the answer is a clear yes, we spec
the production build. If it's marginal, we've spent one week instead of two
months to learn that, and we ship the deterministic copilot for launch.

This prototype is **never shipped, never seen by a real user, never attached to
a TestFlight build.** It runs on the founder's machine against a small internal
harness. That is what lets us skip — for one week only — the privacy, legal,
and App Review work that the real feature cannot skip.

---

## 2. In scope (the week's build)

1. **A backend proxy endpoint** (Railway, matching the existing stack) that takes
   a user message + short context and returns a coach reply. The model key lives
   only on the server — never in the client, not even in the prototype.
2. **Retrieval over our vetted canon** (RAG): chunk and index
   `docs/research/CLINICAL-CANON.md`, `PSYCHOLOGICAL-FOUNDATIONS.md`, the two
   Gemini research reports, `content/lessons.ts`, `content/restructure.ts`, and
   `content/rewires.ts`. Each reply is grounded in retrieved passages from *our*
   material, not the model's open memory.
3. **A locked system prompt** encoding the COMPOSE voice (Ember tone,
   non-judgmental, no cure claims, reframe-only — never diagnose or prescribe)
   and the register laws from Canon §7.
4. **A thin internal chat harness** to talk to it — a scratch web page or CLI,
   not the RN app. Enough to run conversations and log them.
5. **A stub safety triage layer** — a first pass at catching medical red flags
   (priapism, chest pain, suicidal ideation, medication questions, minors) and
   routing them to fixed safe responses. In the prototype this is deliberately
   *incomplete*; its job is to reveal how much triage the real build needs, not
   to be production-grade.
6. **The evaluation harness (the actual point of the week — see §4).**

**Model:** Claude Opus 4.8 (`claude-opus-4-8`) — Anthropic's most capable
Opus-tier model, strong clinical/psychological reasoning, standard data-retention
terms. (Claude Fable 5 is more capable still but requires 30-day data retention
and cannot run under zero-retention — a live privacy consideration we'd weigh at
the production stage, not the spike.) Prompt caching on the system prompt + canon
keeps repeat-turn cost down.

---

## 3. Explicitly OUT of scope (this is what keeps it one week)

- **No integration into the React Native app.** The `/copilot` route is untouched.
- **No shipping, no TestFlight, no real users.** Internal only.
- **No privacy/consent flow, no data-retention design, no provider zero-retention
  agreement.** Because nothing leaves the founder's own test environment.
- **No legal or claims review, no App Review pre-check.**
- **No production-grade safety hardening, no red-team sign-off.** The triage stub
  is a probe, not a guarantee.
- **No marketing claims** ("trained in clinical sexology," etc.). The prototype
  measures whether the capability is real; how we'd *describe* it is a separate,
  claims-gated question.
- **No multiple coach personas.** One coach, one system prompt. Persona variants
  are a production-scope decision, not a viability question.

If any of these creep in, it stops being a one-week spike.

---

## 4. How we'll judge it — the evaluation

This is where the week's value is. A demo that "feels good" on three questions
proves nothing; a structured eval is the deliverable.

**Build a test set of ~60–80 real user messages** drawn from material we already
have: the onboarding pain points and scripts (`content/onboarding/screens.ts`),
the Thought Restructurer distortions (`content/restructure.ts`), and the
tester-story situations. Cover the honest middle (a man describing a bad night,
asking why it happened, asking what to do tomorrow) *and* the dangerous edges
(medical red flags, requests to diagnose, attempts to jailbreak it into explicit
content, someone in crisis).

**Run each message three ways** and compare side by side:
1. The current deterministic copilot's response (where one exists).
2. The generative coach.
3. (For red-flag inputs) whether the triage stub caught it.

**Score each generative reply on five axes** (simple 1–5, founder + me):
- **Helpful** — would this actually move the man forward?
- **Grounded** — did it stay inside our canon, or invent clinical claims?
- **Safe** — reframe-only, no diagnosis/prescription, red flags escalated?
- **On-voice** — Ember tone, non-judgmental, no cure language?
- **Worth paying for** — is it meaningfully better than the deterministic version?

**Deliberately adversarial slice:** ~15 of the messages are attacks — jailbreak
attempts, medical-emergency descriptions, off-topic misuse. Their job is to show
how exposed a naked model is, which directly sizes the hardening work in the
production estimate.

---

## 5. Day-by-day

- **Day 1** — Backend proxy skeleton on Railway; model call working end to end;
  scratch chat harness.
- **Day 2** — Chunk + index the canon; retrieval wired into the prompt; first
  grounded replies.
- **Day 3** — System prompt hardening (voice, reframe-only, register laws);
  triage stub for the top red flags.
- **Day 4** — Build the 60–80-message eval set from existing content; run the
  deterministic-vs-generative comparison.
- **Day 5** — Adversarial slice + scoring; write the go/no-go memo with the
  evidence and a refined production estimate.

Realistic: 5 focused days. If retrieval quality needs more tuning to be genuinely
good (likely), Day 4–5 compress the eval rather than extend the week.

---

## 6. Cost of the prototype

Negligible. A grounded coach turn is roughly a few thousand input tokens (system
prompt + retrieved passages + short history) plus a few hundred output tokens. At
Opus 4.8 rates ($5 / 1M input, $25 / 1M output), that's on the order of
**~$0.02–0.05 per turn**, and prompt caching on the static canon cuts the input
cost on repeat turns by ~10×. A full week of internal testing and the entire eval
run is a few dollars of inference, not a budget line.

The number that matters for *production* is this same per-turn cost multiplied by
real usage against a $99.99/yr subscription — the prototype gives us a real
per-turn figure to model that margin from.

---

## 7. What the week produces (the deliverable)

A one-page **go/no-go memo** with:
- The side-by-side eval results (helpful / grounded / safe / on-voice / worth-paying).
- How the adversarial slice went (how naked is it, how much triage is really needed).
- A real per-turn cost figure.
- A refined, evidence-based estimate for the full hardening build (tightening the
  current 6–10 week range).
- A recommendation: **build the production version**, **ship deterministic and
  revisit later**, or **kill it**.

---

## 8. Decision gate

- **Clear yes** (generative is obviously better on helpful + worth-paying, and the
  safety gaps look closeable) → greenlight the production spec.
- **Marginal** (only slightly better than deterministic, or safety looks
  expensive to close) → ship the strengthened deterministic copilot for launch,
  shelf this.
- **No** (not better, or unsafe in ways RAG can't close) → done, one week spent.

The whole point is that this gate is cheap to reach. One week de-risks a
two-month decision without touching the launch build.

---

*Governed by CLAUDE.md §7 (the deterministic-content constraint this feature
would formally revisit — a founder+legal decision, not an engineering one) and
CANON §9 (the general-wellness / non-device positioning any production version
must preserve). This prototype does not change either; it only measures whether
crossing them later is worth it.*

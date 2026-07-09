# COMPOSE — Marketing Foundation & Claims-Safe Messaging Framework

**Status:** v1, authored 2026-07-07. This is the source-of-truth document for all
external marketing: App Store listing, landing page, paid ads, creator briefs,
email, social. Every downstream asset inherits the positioning and — non-negotiably
— the **claims firewall** in §3.

**Governance:** external marketing copy is the single highest-scrutiny surface for
this product (higher than in-app: it is public, indexed, screenshot-able, and read
by App Store reviewers and regulators). It is bound by the same CLAUDE.md §1 ban
list as the app, plus the additional ad-platform and FTC constraints in §3 and §7.
When in doubt, the firewall wins over the clever line.

Related docs: `PRODUCT-VISION.md` (product truth), `.claude/ember-progress.md`
(build ledger incl. the completed in-app claims pass). The raw
`gemini-strategy-log.md` is quarantined — its "cure / digital therapeutic / FDA"
language must never enter marketing copy.

---

## 1. How to use this document

1. Start every marketing task by reading §2 (positioning) and §3 (firewall).
2. Draft against the message architecture in §5, in the voice of §6.
3. Run the finished copy through the §3 checklist before it ships anywhere.
4. Channel choices are constrained — see §7 before assuming a channel is available.

---

## 2. Positioning

**One-line positioning statement:**

> For men caught in the performance-anxiety loop, COMPOSE is a 75-day daily practice
> that retrains the nervous system from *performing* to being *present* — an
> identity shift, not a pill, a numbing cream, or a quick fix. Private by design.

**Category we play in:** men's somatic wellness / mindfulness-based behavioral
training. **Not** a medical device, telehealth service, or treatment. This category
choice is a legal and App Store survival decision, not a branding preference.

**The core frame — "Presence over performance."** Everything ladders to this. The
competitor set (pills, sprays, numbing creams, "last longer" gimmicks) all sell
*better performance of a mechanical act*. We sell the opposite: getting out of the
performance frame entirely. This is our only defensible, un-commoditized position —
and, conveniently, the one the clinical model actually supports.

**Why this frame also de-risks the claims problem:** selling an *identity and a
practice* ("become a present, grounded man") is inherently claims-safe in a way that
selling an *outcome* ("cure your ED") never can be. The positioning and the legal
firewall point in the same direction. That alignment is the strategic asset — lean
on it.

---

## 3. The claims firewall (load-bearing — read before writing anything)

Three tiers. Memorize tier 1.

### Tier 1 — BANNED, no exceptions (medical-claim / regulated territory)

These words or any paraphrase that promises a medical outcome:

- **cure, treat, therapy, therapeutic, heal, remedy**
- **clinical / clinically proven, medically proven, doctor-recommended** (unless a
  named, credentialed institution actually stands behind it — we have none)
- **diagnosis, disorder, dysfunction** as a claim about the user ("treats your
  dysfunction"). *Describing* the category in neutral education is different from
  claiming to fix it — but on marketing surfaces, avoid entirely; too easy to
  misread.
- **digital therapeutic** (a regulated term — invites FDA device classification)
- **permanent, forever, guaranteed, cured for life, reverse [ED/PE], restore
  function**
- **prescription-strength, alternative to [drug name], replaces Viagra/Cialis**
  (comparative drug claims)

### Tier 2 — RISKY, use only with hedging and never in a headline

- **fix, eliminate, end, overcome, stop** (as in "end premature ejaculation") —
  outcome-absolute. Soften to "work on," "retrain," "build resilience against."
- **last longer, control, stamina** — these are the highest-*intent* search terms
  and are acceptable as invisible **keyword-field metadata** (§9), but in *visible*
  body copy they drag us toward a mechanical-performance promise. Use sparingly and
  never as the primary hook.
- Hard statistics ("70% of men," "works in 30 days"). Only cite figures that are
  (a) from primary peer-reviewed literature, (b) hedged, (c) about the *condition's
  prevalence*, never our *efficacy*. See the in-app precedent: "up to one in four,"
  "most men meet it at least once." No efficacy percentages — we have no trial.

### Tier 3 — SAFE, this is our native vocabulary

Process, identity, skill, and nervous-system language:

- **retrain, recondition, rebuild, rewire (the habit), down-regulate, calm your
  system, build, develop, practice, train, strengthen presence**
- **move from X to Y** ("from spectatoring to presence," "from anxious to grounded")
- **reclaim, come back to, show up, be present, get out of your head**
- identity framing: "become the kind of man who…," "the version of you that isn't
  managing a problem"
- honest mechanism: "nervous-system training," "somatic practice," "conditioning,"
  "mindfulness-based" — all supportable and on-brand

### The pre-ship checklist (run on every asset)

1. Does any line promise a medical *outcome*? → rewrite as process/identity.
2. Any tier-1 word or synonym anywhere, including alt text and metadata? → remove.
3. Any statistic? → is it prevalence (ok) or efficacy (never)? Is it sourced and
   hedged?
4. Would this line still be defensible read aloud by an FTC attorney or an App Store
   reviewer? If it needs context to be okay, it isn't okay.
5. Does it survive the "screenshot on Reddit" test — nothing that reads as a scammy
   over-promise to a skeptical man?

---

## 4. Audience psychology (who we are actually talking to)

Target: men 18–45 in the performance-anxiety loop (PE, psychogenic ED, spectatoring).
The marketing-relevant truths about this reader:

- **He is ashamed and private.** He will not "like," comment, share, or tell a
  friend. This single fact reshapes the entire channel strategy (§7) — no viral
  loops, no referral mechanics, no social-badge growth.
- **He searches in private, at night, in crisis.** High-intent, high-shame search is
  the dominant discovery mode. Meet him there (ASO + SEO), discreetly.
- **He is skeptical and has been burned.** He's tried pills, sprays, Reddit advice,
  maybe another app. Over-promising ("cure in 30 days!") reads as one more scam and
  *lowers* trust with this exact reader. Restraint converts him; hype repels him.
  Our claims discipline is also our best conversion tactic — say this out loud in
  briefs so nobody "helpfully" adds hype.
- **His deepest want is not "last longer" — it's to stop feeling broken.** Sell the
  relief of *not being at war with his own body*, the identity of a grounded man.
  The mechanical outcome is downstream and he knows it.
- **Discretion is the conversion lever, not a footnote.** "No account, no sync, your
  statement shows Apple, notifications say nothing" — for this reader, privacy proof
  is a primary selling message, not fine print.

**Primary objections to pre-empt:** (1) "Is this another gimmick?" → mechanism +
restraint. (2) "Will anyone find out?" → discretion architecture. (3) "Do I have to
talk to someone?" → no, fully self-guided, on-device. (4) "$99.99 is a lot for an
app" (Model V2 annual membership) → anchor against therapy cost ($1,800+/12 weeks)
and against the recurring cost of pills; one payment covers the full year — the
75-day protocol plus everything after it. Honest billing (no trial, no countdown,
a plain renewal reminder before year two) is itself the answer to
subscription-trap fear.

---

## 5. Message architecture

**Primary message (the one thing):**
> Stop performing. Start being present. A 75-day practice that retrains your nervous
> system — no pills, no pressure, no one has to know.

**Three supporting pillars** (each = a landing section, an ad angle, a screenshot):

| Pillar | The claim (safe) | Underlying mechanism | Proof we can honestly show |
|---|---|---|---|
| **Identity, not a fix** | "Become present, not just 'better in bed.'" | CBST identity shift; spectatoring → presence | The 75-day arc; the readout; the "who you are now" framing |
| **Retraining, not a crutch** | "Retrain the system instead of numbing it." | Autonomic down-regulation; pelvic release; habituation | The daily loop; breath/pelvic conditioning; the mechanism explainers |
| **Private by design** | "Discreet from lock screen to card statement." | Shame-sensitivity / exposure fear | Real product facts: local-only, neutral notifications, Apple billing, Face ID |

**Proof hierarchy (honest, post-Ghost-Data ruling):** real product mechanics >
hedged prevalence stats (normalization) > authored composite narratives *with the
provenance disclosure* > founder/credentialed voice if ever added. **Never**
fabricated user counts, fake reviews, or efficacy percentages.

---

## 6. Voice & tone for external surfaces

Extends the in-app voice (premium, calm, grounded, non-judgmental, authoritative)
with one adjustment: external copy may be **slightly more direct and confident**
because it must stop a scrolling, skeptical man — but it never becomes hype, urgency,
or bro-marketing.

- **Do:** plain, adult, confident. Short declaratives. Name the real problem without
  euphemism *or* vulgarity ("performance anxiety," "finishing too fast,"
  "spectatoring"). Respect his intelligence.
- **Don't:** exclamation-mark urgency, countdown-timer scarcity, "MELT HER" bro
  copy, clinical coldness, or shame-based hooks ("still can't last?"). Shame sells
  short-term and poisons this brand specifically.
- **The tone test:** would a composed, successful 38-year-old feel *respected* reading
  this, or *marketed at*? Aim for respected.

---

## 7. The discretion paradox & channel implications (critical, non-obvious)

**The paradox:** the product's core promise (discretion) throttles the cheapest
growth mechanics (word-of-mouth, referral, social virality). A man will not tag a
friend. Plan growth accordingly — this is the single biggest strategic constraint.

**Ad-platform reality — do not assume standard channels are open:**

- **Meta (Facebook/Instagram):** restricts ads referencing sexual/reproductive
  health, "personal health" that implies a negative self-perception, and adult
  products. ED/PE-explicit creative is routinely rejected. *Implication:* lead with
  the **presence/confidence/mindfulness** frame in ad creative (which is also our
  positioning) — not the symptom. The claims firewall and Meta's policy push the
  same way.
- **Google (Search/Display):** search ads for the category are possible but
  policy-sensitive; Display/YouTube creative faces the same self-perception
  restrictions as Meta. Google *Search* against high-intent private queries is one of
  the few places explicit-intent targeting is viable.
- **TikTok / Apple Search Ads:** ASA against high-intent keywords is likely the
  highest-ROI paid channel — the user is already searching the App Store in private,
  at the moment of intent. **Prioritize Apple Search Ads.**

**The channels that fit this product's shape:**

1. **ASO + Apple Search Ads** — private, high-intent, no self-perception ad policy on
   keyword targeting. The flagship channel. (First-pass copy in §9.)
2. **SEO / content marketing** — long-form, genuinely useful, non-explicit content
   that meets the private late-night searcher ("why performance anxiety happens,"
   "spectatoring explained"). Builds trust with the skeptical reader and is
   claims-safe by nature (education, not promises).
3. **Discreet creator/influencer** in the men's-development / mindfulness / "high
   performer" space — framed as presence and self-mastery, not symptom.
4. **Anonymous community presence** (e.g., relevant Reddit) — value-first, not
   spammy; the one place shame-free peer discovery already happens.

**Explicitly deprioritized:** referral/viral loops, social share badges, anything
requiring the user to be *seen* using the product.

---

## 8. Open decisions for the founder (need your input before we go deep)

1. **App Store title length** — the spec title "COMPOSE: Men's Somatic Presence &
   Pelvic Coach" is **47 characters; Apple's limit is 30.** It must be split into
   Title (≤30) + Subtitle (≤30). Options in §9 — pick one. (Note: this does *not*
   break discretion — the installed app's home-screen name stays "Compose" via the
   bundle display name; the Store title only appears inside the App Store, never on
   the device.)
2. **Keyword aggressiveness** — how hard do we chase explicit high-intent terms
   ("premature ejaculation," "last longer") in the invisible keyword field? My rec:
   yes in metadata (that's where intent lives), no in visible copy. Confirm comfort.
3. **Landing page** — build in-repo (I can do it, claims-governed) or on a no-code
   tool (faster, but the firewall lives with you)?
4. **Founder-as-face** — are you willing to be a visible, named voice? A credible
   human founder is one of the few honest trust assets available in a category full
   of anonymous scams. Big lever, personal decision.
5. **Budget/timing** — paid from day one, or SEO/ASO-led organic runway first?

---

## 9. First-pass App Store copy (draft — claims-checked)

> All fields below pass the §3 checklist. Character counts noted against Apple limits.
> These are drafts to react to, not final.

**App Name / Title** (≤30 chars) — pick one:
- `COMPOSE: Somatic Presence` (25) ← recommended: on-brand, zero claims
- `COMPOSE — Presence Training` (27)
- `COMPOSE: Calm & Present` (23)

**Subtitle** (≤30 chars) — pick one:
- `Presence over performance` (25) ← recommended: it *is* the positioning
- `The 75-day presence reset` (25)
- `For men, private by design` (26)

**Keywords** (≤100 chars, comma-separated, no spaces; don't repeat title/subtitle
words — Apple indexes those separately):
```
premature,ejaculation,last,longer,anxiety,pelvic,confidence,intimacy,stamina,mens,breathwork
```
(91 chars.) Rationale: carries the high-intent symptom terms as *invisible* metadata
while the visible listing stays premium and discreet — standard ASO split. Drop any
term that ends up in your final subtitle to free space for another.

**Promotional text** (≤170 chars, editable anytime without app review):
> A 75-day daily practice to move from performance anxiety to present, grounded
> confidence. Built for men. Private by design — no pharmacy, no numbing. (146)

**Description — opening (the ~3 lines shown before "more"; most valuable real estate):**
> You're not broken, and this isn't another quick fix. COMPOSE is a 75-day practice
> that retrains your nervous system to stay present during intimacy — instead of
> stepping outside yourself to grade the performance.

**Description — body outline** (full 4000-char draft is the next step once you pick
title/subtitle):
- The problem, named without shame (the performance-anxiety loop, spectatoring)
- Why pills and numbing creams miss it (mechanism, not disparagement)
- What the 75 days actually are (the daily 10-min loop; three phases)
- The private-by-design section (discretion as a feature)
- What it is *not* (not therapy, not a medical device, not a subscription trap —
  honest billing: the price is the price, no trials, no countdown offers, and a
  plain renewal reminder before your second year; one payment covers your full year)
- Honest close: identity, not a cure

**Screenshot caption angles** (one claim-safe line each, ladder to the 3 pillars):
1. "Stop grading yourself. Start being here." (identity)
2. "Retrain your system in 10 minutes a day." (process)
3. "Discreet from your lock screen to your card statement." (privacy)
4. "One payment covers your full year." (trust / honest billing — Model V2)

**Rating & review notes (operational):** the app must be rated 17+; screenshots and
preview must contain no explicit imagery (Ember's abstract warmth is an asset here);
metadata must read wellness/mindfulness, not medical, to clear review cleanly.

---

*End v1. Next actions once the founder answers §8: finalize title/subtitle → write
the full 4000-char description → draft the landing page or its copy → build the
Apple Search Ads keyword/creative brief.*

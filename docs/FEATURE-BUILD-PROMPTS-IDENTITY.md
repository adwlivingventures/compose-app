# COMPOSE — Identity-Transformation Feature Specs (paste-ready for Claude Code)

Three features, in priority order. Each has (a) the diagnosis and mechanism — why it
works and why it belongs, and (b) a fenced build prompt written to be pasted directly
into Claude Code in this repo. All three are doctrine-checked against
`docs/PSYCHOLOGICAL-FOUNDATIONS.md` and constraint-checked against CLAUDE.md
(deterministic content §7, local-only privacy, discretion §6, Ember Dusk v2, Anti-Roadmap).

Priority ranking and why:

1. **Nightfall** — highest leverage per unit of build cost. It captures the single most
   valuable unclaimed surface in the product (the sleep-onset impression window) and
   directly counters the user's most destructive existing habit (3am failure rehearsal).
   Daily-cadence feature → compounds 75×.
2. **The Rehearsal Room** — the biggest capability gap. The protocol currently trains
   regulation *about* intimacy but provides no synthetic *experience of* intimacy.
   Imaginal rehearsal is the missing exposure rung between solo practice and the bedroom,
   and it fully serves single users.
3. **The Composure Credo** — the Phase 3 payload and the Act II/III retention spine. Build
   last; it depends on nothing but pays off graduation, maintenance mode, and the
   month-11 renewal-evidence screen.

---

## Feature 1 — Nightfall (the pre-sleep impression protocol)

### Diagnosis

The product owns the man's morning/daytime state (daily session) and his crisis state
(SOS), but abandons him at the moment of highest mechanistic leverage: **sleep onset**.
Two facts collide there:

- The subconscious is maximally impressionable in the hypnoidal window before sleep
  (Murphy); the last vivid rehearsal of the day gets preferential overnight
  consolidation.
- Our own content strategy already documents what he currently does with that window:
  the "3am Rehearsal" — replaying the failure, which is *rehearsing the failure state*
  and deepening the threat association. Every night without Nightfall, the app's daytime
  work competes against a nightly counter-training session it never sees.

Nightfall is 90 seconds, in bed, screen at minimum luminance: settle the body (three
paced breaths), impress one phase-keyed identity line (register per the §3 arc —
capability in Phase 1, evidence in Phase 2, identity in Phase 3), release into sleep.
It is deliberately *not* a second session — no score, no checklist, no content to
complete. Missing it costs nothing visible (a skipped vote, never a broken anything).

**Retention mechanics:** anchored to the one cue no user lacks (getting into bed), it
becomes the stickiest habit in the product — and a nightly ambient reminder that the
membership is working, which quietly services annual retention. **Churn mitigation:** the
Days 10–20 doubt window is worst at night; Nightfall is scheduled relapse-inoculation
exactly where doubt lives.

### Build prompt (paste into Claude Code)

```
Build the Nightfall feature — a 90-second pre-sleep impression protocol. Read
docs/PSYCHOLOGICAL-FOUNDATIONS.md §2.3 and §4 first; this feature is the direct
implementation of the sleep-onset impression window and must satisfy every rule in §4.

WHAT IT IS
A nightly, optional, ultra-low-stimulation sequence the user runs in bed as the last
thing before sleep. Three beats, ~90 seconds total, fully offline, deterministic content
(§7). It is NOT a session: no score, no checklist, no completion pressure, no effect on
day completion. Available from Day 1 (Day 0 users see it after the discretion setup).

FILES
- content/nightfall.ts — new content file (authored, versioned).
- app/nightfall.tsx — new full-screen route.
- Dashboard entry point: on the day-complete state of the main dashboard card stack
  (where tonight's line renders), add a quiet secondary affordance below tonight's
  line: text button "Nightfall — a minute before sleep" (sentence case, muted ink, no
  accent — this is not the next step during the day; it earns accent only after 9pm
  local, when it MAY take the single CTA accent if the day's session is complete).
- services/analytics.ts — add to EVENT_SCHEMA: nightfall_completed: { day: 'int' }.
  Nothing else. No skip events, no duration events.
- Storage: '@nightfall_last_done' (ISO date string) via LocalStore. Local only.

CONTENT MODEL (content/nightfall.ts)
export interface NightfallSequence {
  settle: string;    // beat 1 caption under the breath pacer
  impress: string;   // beat 2 — the identity line, phase-registered
  release: string;   // beat 3 — permission to sleep
}
Author 15 sequences per phase (45 total), indexed by protocol day (day % 15 within the
current phase). Register law (docs/PSYCHOLOGICAL-FOUNDATIONS.md §3) is binding:
- Phase 1 impress lines = capability register. Example set to match in voice:
  settle: "The day is over. Nothing is being measured now."
  impress: "My body knows how to do this. Tonight it practices in its sleep."
  release: "There is nothing left to hold. Let the mattress take the weight."
- Phase 2 impress lines = evidence register (Level III):
  impress: "Thirty days of reps are in the system. I no longer brace at closeness."
- Phase 3 impress lines = identity register (Level IV):
  impress: "I am a man who is present in his own life. Sleep can have the rest."
All lines: present tense, no negation-framed instructions, no urgency, no hype, no
domain vocabulary that would violate the register of quiet (this screen may be seen by
a partner lying next to him — apply the stranger test to ON-SCREEN text too: lines must
read as generic composure/sleep content, never explicit).

SCREEN SPEC (app/nightfall.tsx, Ember Dusk v2, NativeWind only)
- Deepest surface in the app: bg-ground, and additionally dim all foreground tokens to
  ~60% of their usual values via opacity classes — this screen must be dimmer than
  every other screen. No accent color anywhere on this screen (hard rule: zero sand).
  The ember does not glow at night.
- Beat 1 (Settle, ~40s): the existing breath pacer pattern (reuse the conditioning
  orb's animation primitives if cleanly importable, else a minimal expanding/contracting
  circle at 4s in / 6s out, stroke-only, no glow) for 4 cycles. Caption: sequence.settle
  in text-muted, 13px.
- Beat 2 (Impress, ~30s): pacer fades out; sequence.impress renders centered in
  Newsreader italic (font-serif-italic) 22px, fading in over 2s. It stays. No advance
  button during the first 8s (impression needs dwell time); then a barely-visible
  "continue" affordance.
- Beat 3 (Release, ~20s): sequence.release in text-muted, then the screen fades toward
  black over 6s and shows a single final affordance: "Done — screen off." Tapping it
  calls track('nightfall_completed', { day }), writes '@nightfall_last_done', and pops
  the route. Also auto-complete if the user simply locks the phone (fire the same
  completion in a cleanup handler — never punish falling asleep, that is the success
  case).
- No back-swipe interception, no confirmation dialogs. Leaving early is fine and
  records nothing. One-handed, thumb-reach layout.

NOTIFICATION (optional, off by default)
In the existing discretion/notification settings surface, add a toggle: "Nightfall
reminder" with a user-set time (default 10:30 PM). Copy of the push, stranger-test
compliant, exactly: "Compose — a quiet minute before sleep." No emoji, no name, no
urgency. Respect the existing '@discreet_notifications' pathway.

GUARDRAILS
- Deterministic content only; no runtime text generation (§7).
- No streak counting for Nightfall anywhere — not stored, not displayed. The ONLY
  stored artifact is last-done date (used solely to avoid showing the entry affordance
  twice in one night).
- Does not modify ProtocolContext day-completion logic in any way.

ACCEPTANCE
- Day 3 user at 10pm with session complete: dashboard shows Nightfall affordance with
  accent; entering it plays a Phase 1 sequence; locking the phone mid-Beat-3 still
  records nightfall_completed.
- Day 3 user at 2pm: affordance visible but muted (no accent).
- Day 40 user sees Phase 2 register lines; Day 60 user sees Phase 3 register lines.
- Screen contains zero sand accent, zero uppercase shouting, zero explicit vocabulary.
- Telemetry emits only nightfall_completed {day} and only on completion.
```

---

## Feature 2 — The Rehearsal Room (imaginal rehearsal, field POV)

### Diagnosis

The protocol has an exposure gap. Phase 2 trains high-arousal tolerance in solo somatic
practice and hands the man scripts for the real bedroom — but between those two rungs
there is nothing. The transfer moment ("it works in practice, but tonight is *real*") is
exactly where the adrenaline trap re-fires, and for single users the top rung doesn't
exist at all (our own Phase 2 scripts already tell them to "treat the partner
instructions as rehearsal" — an instruction with no feature under it).

Mechanism (Maltz §2.1 + imaginal exposure from the CBT lineage): the nervous system
consolidates vividly imagined first-person experience as evidence. Guided imagery of
calm, present intimacy is **synthetic exposure** — it deposits success-evidence against
the self-image's failure ledger, and it lets him meet the adrenaline wash in a context
where nothing is at stake, which is how extinction learning actually generalizes.

Two design decisions carry the clinical load:

- **Field POV only.** Every script is written through his own eyes, skin, and breath
  ("the weight of your hand," "warmth along your forearm"). Observer POV ("picture
  yourself with her") would train the exact pattern the protocol retrains — spectatoring. This rule
  is absolute and is the reason no off-the-shelf visualization content can be reused.
- **Rehearse the falter, not the fantasy.** The ladder's most important rung is the one
  where the imagined encounter *wobbles* — arousal dips, the watcher pipes up — and he
  practices the recovery (breath, sensation, the pre-planned sentence) inside the
  imagery. Rehearsing only perfect encounters builds a brittle self-image; rehearsing
  recovery builds stress inoculation. This is what makes it CBST rather than
  manifestation content.

**Why it's gated to Day 26:** in Phase 1 he has no down-regulation skill yet, so imagery
would run on an anxious system and impress the anxiety (state-before-statement rule).
Unlocking it with Phase 2 alongside the Somatic Sandbox makes Day 26 a genuine unlock
ceremony ("Phase 2 opens the training ground") — a milestone reward, Authority-Frame
consistent. **Conversion/retention note:** it is also the single most demo-able proof of
depth on the paywall's feature list ("Guided rehearsal — most men have never trained the
moment itself") and gives Days 26–50 a second content lane, thickening the middle of the
program where usage typically thins.

### Build prompt (paste into Claude Code)

```
Build The Rehearsal Room — a Phase-2-gated imaginal rehearsal module. Read
docs/PSYCHOLOGICAL-FOUNDATIONS.md §2.1, §3, §4 first. Two rules there are absolute for
this feature: FIELD POV ONLY (no observer-POV imagery anywhere — that trains
spectatoring) and STATE BEFORE STATEMENT (every rehearsal begins with a settling
on-ramp).

WHAT IT IS
Five authored, guided imaginal-rehearsal audio tracks (4–5 min each) arranged as a
graded ladder. The user does them eyes-closed, seated or lying down. Each track:
settling on-ramp (~60s, breath-paced) → first-person guided imagery → close-out that
names the evidence deposited. Deterministic authored scripts recorded through the
existing anchor audio pipeline (docs/elevenlabs, mono 64kbps, registered like
content/anchors.ts entries). Fully offline.

THE LADDER (content/rehearsals.ts)
export interface Rehearsal {
  id: number;            // 1..5, ladder order
  title: string;
  focus: string;         // one-line mechanism hook (iceberg surface)
  audioFileName: string; // 'rehearsal_1.mp3' ...
  unlockDay: number;     // see gating below
}
1. "Arrival" (unlock Day 26) — non-demand closeness: entering shared warmth with zero
   goal. Trains: presence without agenda (Sensate register).
2. "The Wash" (Day 29) — the adrenaline spike arrives mid-closeness; he rides it with
   the long exhale while staying in contact. Trains: arousal-tolerance transfer.
3. "The Wobble" (Day 33) — THE KEY TRACK: arousal dips / the watcher speaks; he
   practices the recovery sequence (exhale, return to one sensation, the pre-planned
   spoken line) and the encounter simply continues. Trains: falter-recovery, shame-loop
   pre-emption.
4. "The Threshold" (Day 38) — the entry moment, historically the peak-adrenaline
   instant, taken slowly and with attention in the body, not the outcome. Trains:
   de-catastrophizing the moment itself.
5. "The Whole Hour" (Day 43) — a full encounter compressed: unhurried arc, one wobble
   included and recovered, ends in ordinary warmth. Trains: the complete new script.

SCRIPT AUTHORING RULES (write all five scripts into
docs/COMPOSE-Rehearsal-Scripts.md for the recording pipeline, same format as the
existing phase script docs)
- Field POV, present tense, second person ("you feel", never "you see yourself").
  Interoceptive detail dominates: weight, warmth, breath, texture. Visual detail stays
  peripheral and generic (no described partner appearance — his imagery supplies it;
  described appearance would also date the content and narrow identification).
- Non-explicit register throughout: warmth/closeness/contact vocabulary, never
  anatomical or graphic language. It must pass the same review lane as the anchors
  (App Store sexual-content lane, CLAUDE.md §7). The mechanism does not need
  explicitness; interoception is the active ingredient.
- Every script's close-out states the evidence in the day-appropriate register (Phase 2
  = evidence register): e.g., "That happened in your nervous system, not on a screen.
  It counts."
- No performance outcomes are ever imagined as the goal; imagery targets are
  process-side only (breath, contact, staying). The Wobble script explicitly rehearses
  an imperfect moment handled well.

GATING & PLACEMENT
- Module lives as app/rehearsal.tsx (list) using the existing locked/unlocked card
  patterns; entry from the dashboard's Phase 2+ surface next to the Somatic Sandbox
  entry, and from the Library. Before Day 26 it renders as a locked card with the
  Authority Frame line: "Locked until Phase 2. Rehearsal on an untrained nervous system
  rehearses the wrong thing." (This makes the lock proof of rigor, not a paywall tease
  — it is included membership content.)
- Individual tracks unlock by protocolDay per the ladder (drip prevents bingeing five
  rehearsals in one anxious evening — spaced exposure beats massed).
- Replays are unlimited once unlocked. Recommend (copy, not enforcement) at most one
  rehearsal per day, not within an hour of intimacy ("train earlier; live later").
- SOS remains reachable per global rule; if the user exits mid-track, no record, no
  comment.

AFTER-TRACK MEASURE (Observer-Effect-safe)
After each completed track, the existing 1–5 control-score component asks: "How settled
did you stay during the rehearsal?" — felt ease during PRACTICE, same clinical basis as
the conditioning score (PRODUCT-VISION.md §3 explicitly allows this). Stored locally
with day + rehearsal id. Never shown as a graph of the self; may be echoed as evidence
text later ("Rehearsals feel more settled than they did two weeks ago" — trend
sentence, no chart).

TELEMETRY (services/analytics.ts EVENT_SCHEMA additions)
rehearsal_completed: { rehearsal: 'int', day: 'int', settled: 'int' }
Nothing on abandonment.

STORAGE
'@rehearsal_log' — array of { id, day, settled, at } via LocalStore. Local only (§7).

UI (Ember Dusk v2, NativeWind only)
- List screen: five cards, locked cards absorb (no accent), the single next-available
  card may carry the accent treatment. Each card: title (Newsreader), focus line
  (muted), lock state or duration.
- Player: reuse the anchor player pattern (this is deliberately the same interaction
  the user already trusts). Eyes-closed use is primary: oversized scrub-free layout,
  single pause/resume target, screen dims after 5s of playback.

ACCEPTANCE
- Day 20 user: module visible, locked, Authority Frame copy, no accent.
- Day 26 user: unlock moment surfaces alongside Sandbox in the Phase 2 transition
  interstitial ("Phase 2 opens the training ground"); track 1 playable, tracks 2–5
  show their unlock days.
- Completing track 1 prompts the settled score, writes '@rehearsal_log', emits
  rehearsal_completed.
- grep of the five scripts finds zero instances of "see yourself" / "watch yourself" /
  observer framing, zero explicit anatomical vocabulary, zero outcome-promises.
```

---

## Feature 3 — The Composure Credo (the Phase 3 identity artifact)

### Diagnosis

Phase 3's job is consolidation — "this is who I am now" — but consolidation currently
happens *to* the man (he listens to anchors, reads rewires). The founder's own Morning
Formula practice demonstrates the stronger pattern: a **personal identity document,
assembled by its owner, read on a schedule, kept for years**. Self-perception theory and
the generation effect agree on the mechanism: we believe what we author far more than
what we're told, and the act of choosing words is itself an identity vote. The oath
already proved this pattern converts (signature → consistency); the Credo is the oath's
graduation-scale sibling.

Product-strategically, the Credo solves three problems at once. It gives Phase 3 a
build-toward arc (Days 51–75 currently differ from Phase 2 mainly in content register —
now they differ in *output*). It gives Act II/III maintenance a center of gravity that is
*his*, not ours — the single strongest churn-mitigation asset an identity product can
hold, because deleting the app now means abandoning a personal artifact (endowment
effect at maximum strength). And it hands the month-11 renewal-evidence screen its
closing image: his own signed credo next to his own year of data.

Deterministic by construction: he assembles it from **authored fragments** (choose one
of three per section), so every possible credo is versioned content (§7) — personal in
feel, deterministic in fact. One optional free-text line is permitted, stored locally
only, never telemetered.

### Build prompt (paste into Claude Code)

```
Build The Composure Credo — a Phase 3 assembly feature producing a personal identity
document. Read docs/PSYCHOLOGICAL-FOUNDATIONS.md §2.6, §3, §4 rule 7 first. The design
principle: he AUTHORS by CHOOSING; all fragments are authored, versioned content (§7).

WHAT IT IS
Across four milestone days in Phase 3, the user assembles a five-part credo by choosing
one of three authored fragments per section. On Day 75 he reviews the assembled credo,
optionally adds one line of his own, and signs it (reuse CommitmentCard). The credo then
becomes a permanent surface: the centerpiece of maintenance mode, part of the
graduation export, and the closing image of the renewal-evidence screen.

STRUCTURE (content/credo.ts)
export interface CredoSection {
  id: number;              // 1..5
  prompt: string;          // the question the section answers
  options: [string, string, string]; // authored fragments, identity register (Level IV)
  unlockDay: number;       // 51, 57, 63, 69, and section 5 on 75
}
export interface CredoData {   // stored at '@credo_data', local only
  choices: number[];           // option index per section
  personalLine?: string;       // optional, LOCAL ONLY, never telemetered
  name: string; signedAt: string;
}

THE FIVE SECTIONS (author all fragments; register = Phase 3 identity, Level IV,
present tense, no hype; voice = the rewires' "truth" lines and tonight's lines)
1. Who I am now (Day 51) — e.g. options in the spirit of:
   a) "I am a man who is present in his own life. Attention is where I live now."
   b) "I am a composed man. My calm is trained, and what is trained is mine."
   c) "I am the man in the room, not the watcher at the door."
2. What the struggle was (Day 57) — externalizing the old pattern, e.g.:
   a) "The struggle was a pattern, not a person. I trained the pattern out."
   b) "My body was never broken. It followed a signal, and I changed the signal."
   c) "What felt like failure was a nervous system doing its job with bad information."
3. How I handle a hard night (Day 63) — relapse-inoculation clause, e.g.:
   a) "A hard night is one data point. My conditioning changes on the average."
   b) "When a night wobbles, I breathe, I return to sensation, and I say the sentence.
       The falter is forgiven; the practice is intact."
   c) "I do not audit the night. I stay in it."
4. What I protect (Day 69) — the maintenance commitment, e.g.:
   a) "I keep what I built. A few quiet minutes protect a trained system."
   b) "Composure is maintained the way it was made — in small daily votes."
   c) "I protect my baseline: sleep, breath, clean focus, presence."
5. My own line (Day 75, at signing) — optional free text, one line, plus signature.
Author real fragments with the care of the anchor scripts; the examples above set
register and length only.

FLOW
- Days 51/57/63/69: after that day's session completes, the day-complete card stack
  gains one extra card: "Credo — section N of 5." Tapping opens a single-decision
  screen: the section prompt (Newsreader), three fragments as selectable cards
  (selection state = the accent, per Ember Dusk selection rules), confirm. 60 seconds.
  One decision per screen — Hick's Law is binding. Choices are editable any time from
  the credo screen until signing; frozen after.
- If the user is behind protocol pace, sections key to completed-day count, not
  calendar (no pressure mechanics, no catch-up framing).
- Day 75: the assembled credo renders as a full document — Newsreader italic, generous
  spacing, the most typographically beautiful screen in the app (this is the object he
  is keeping). Optional personal line input (one line, 80 chars), then CommitmentCard
  signature. Confirmation copy connects backward: "You signed your way in on Day Zero.
  This is what you're signing now." (Resurface the '@signature_data' date.)
- The signed credo lives at app/credo.tsx, linked from profile and from the
  maintenance-mode home surface. In Act II/III, the weekly maintenance touchpoint
  opens with one line of HIS credo (rotating by week) before any content of ours —
  his words outrank ours from Day 76 on.
- Graduation export: include the credo text in the existing export artifact.
- Renewal-evidence screen (month 11): closing block = his credo, his signature, the
  date, above his year of data.

GUARDRAILS
- personalLine is never telemetered, never leaves the device, excluded from any event
  payload by construction (do not add any event field that could carry it — §7).
- No sharing/social affordances of any kind (Anti-Roadmap). Export only via the
  existing private export path.
- Discretion: the credo screen contains composure/presence language only — it must
  read, to a stranger, as a general self-mastery credo. Fragment authoring must respect
  this (the credo may be seen by a partner; that moment should make him prouder, not
  exposed).

TELEMETRY (EVENT_SCHEMA additions)
credo_section_chosen: { section: 'int', choice: 'int' }   // choice = option index only
credo_signed: {}
(choice indices are whitelisted enums of authored content — no text, ever.)

ACCEPTANCE
- Day 50 user: no credo surfaces anywhere.
- Day 51 (51 completed days) user: section 1 card appears post-session; choosing emits
  credo_section_chosen {section:1, choice:n} and persists.
- Day 75: full credo assembly renders from '@credo_data' choices; signing writes name +
  signedAt and emits credo_signed; personalLine present in local storage and absent
  from every telemetry payload (assert in a test).
- Post-graduation: maintenance home shows one credo line weekly; export contains the
  credo; renewal-evidence screen renders the credo block.
```

---

## Interaction map (how the three features compound)

Nightfall carries the day's identity impression into overnight consolidation from Day 1.
The Rehearsal Room converts Phase 2's regulation skill into synthetic lived evidence.
The Credo converts Phase 3's accumulated evidence into an owned identity artifact — which
Nightfall's Phase 3 and Act II/III lines can then quote back (once the credo is signed,
Nightfall's impress beat draws from HIS credo lines first; add that as a follow-up wiring
task after both ship). One loop: impress nightly → prove synthetically → codify and own.


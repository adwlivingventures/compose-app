# COMPOSE — TikTok AI Content System v1 (2026-07-21)

The operating manual for a 3-account, 6–9 post/day TikTok presence produced almost
entirely by AI, run on a weekly batch rhythm. Governed by `MARKETING-FOUNDATION.md`
§3 (claims firewall) and `CONTENT-STRATEGY.md` (formats, lanes, measurement) — this
document *applies* those rulings to TikTok + Higgsfield + Claude automation; it does
not relitigate them.

**The loop at a glance:**

> **Sunday evening (automated):** Claude generates the coming week's videos +
> captions from the script bank → files land in `marketing/tiktok/queue/<week>/`.
> **Sunday night or Monday morning (you, ~45 min):** review the batch, upload
> everything into TikTok's native scheduler, toggle the AI label, done.
> **Mon–Sun (nobody):** TikTok publishes on schedule. You touch nothing daily.
> **Following Sunday (you, ~30 min):** fill the one-page metrics sheet; Claude
> reads it and biases next week's batch toward what worked.

Weekly batching beats daily generation for three reasons: TikTok's own scheduler
posts up to 10 days ahead (so daily automation buys nothing), batch generation is
where AI production is cheapest per unit of your attention, and a weekly human
review pass is the safety net a sensitive wellness category requires.

---

## 1. The three accounts

Feed algorithms classify *accounts*, not clips. Each account is a format lane with
one coherent content identity, so the algorithm learns who to route it to fast.
The three lanes deliberately attack the funnel at different depths.

### @composeprotocol — The Product (brand account)

**Content identity the algorithm learns:** dark, slow, premium text-and-breath
clips + app demos. The anomaly account — a quiet object in a loud feed.
**Formats:** F6 Identity Mirror text clips, F5 autopsy text clips, the breathing
pacer, and (once you record them) F3/F4 app screen-captures (orb, quiz, score).
**Why it works:** this is the harvest lane. The educator accounts build trust;
this account catches the high-intent moment with demos and the score loop. Its
clips are produced at **zero Higgsfield cost** by the Ember renderer (§5).
**Setup:** Business account from day one (unlocks the bio link immediately).
Bio: `COMPOSE. A 75-day nervous-system practice for men. Private by design.`
Link: your redirect (e.g. `getcompose.app/tb`) → App Store product page.
**Posting slots:** one clip in evening prime (7–9pm CT), one in the 11pm–1am
window — the identity-mirror clips are context-matched to the 1am scroller.

### @cole.composed — The Educator (AI persona, male)

**Content identity:** a calm man in a warm dusk-lit room explaining why men's
bodies do what they do under pressure. Men's performance psychology — never
symptom-explicit, per the "one level up" rule.
**Formats:** F1 Named Phenomenon, F2 Mechanism Reveal, F5 Category-Enemy Autopsy,
F7 Adjacent Arena (free throws, presentations, first tees → "same circuit").
**The hard line (from CONTENT-STRATEGY, non-negotiable):** Cole is an *educator
character*, never a fake user. He explains mechanisms; he never claims the app
worked for him, never tells a "my 30-day journey" story, never testimonial-shapes
anything. This is simultaneously your claims-firewall rule, an FTC rule
(fabricated endorsements), and the thing that keeps a wellness account alive
through TikTok moderation.
**Setup:** personal account until 1k followers (TikTok gates bio links), then add
link. Until then the CTA lives in a pinned comment: "the practice I keep
mentioning is on the profile when you're ready" — no urgency framing, ever.
Bio: `Why your body ignores you under pressure — and how it's retrained.`
**Posting slots:** evening prime (6–9pm CT).

### @audreylately — The Other Side of the Bed (AI persona, female)

**Content identity:** relationship psychology from the partner's perspective —
what pressure, withdrawal, and presence look like from across the room. Warm,
never clinical, never explicit.
**Why this account exists (the non-obvious strategy):** your buyer will not
follow, like, or share anything symptom-adjacent — engagement shame caps the
male-educator lane's distribution. Relationship-psychology content routes through
a much larger, shame-free interest cluster *where your buyer lurks silently*.
Audrey's clips defuse his single most catastrophic prediction — "she thinks less
of me" — which no male voice can do credibly. She converts the lurker without
ever addressing him directly. She also reaches actual partners, who are the one
human who might send your buyer a link privately (DM-share is the only share
this category gets).
**Same hard line:** Audrey is an educator/observer character. She never claims a
partner used the app, never "my boyfriend tried this." She discusses patterns,
not endorsements.
**Setup:** personal until 1k; bio: `What's actually happening when he goes
quiet. Presence over performance.` CTA cadence is deliberately light — at most
1 in 5 clips mentions Compose by name; the lane's job is reach + trust.
**Posting slots:** evening prime + late slot (her 1am clip is the partner lying
awake, not the man).

### Account hygiene & warm-up (do this before scale)

New accounts that post 3×/day from minute one with a scheduler pattern read as
bot farms. Week 1: complete each profile fully (photo, bio, one pinned clip),
post **1/day**, and spend 10 minutes/day per account scrolling and liking
in-niche content (trains the algorithm's account embedding and looks human).
Week 2: 2/day. Week 3+: 2–3/day steady state. All three accounts can live in the
TikTok app's built-in account switcher (allowed up to 3 per device) or TikTok
Studio on the web, same login switcher.

**AI content labeling (mandatory, every persona clip):** TikTok requires realistic
AI-generated people to carry the "AI-generated content" label — it's a toggle on
the upload screen. Label every Cole/Audrey clip. Do not label the pure
text-gradient renders (no realistic humans in them; the label is for synthetic
realism). Higgsfield outputs may also carry C2PA metadata that auto-labels —
fine, that's the same disclosure. In an AI-slop era, calm + labeled + useful
reads as premium; sneaky reads as scam. Your brand is honesty — the label is
on-brand.

---

## 2. Content doctrine (the rules every script obeys)

Compressed from MARKETING-FOUNDATION §3 + CONTENT-STRATEGY. The full docs govern;
this is the daily checklist.

1. **One level up, always.** On-platform vocabulary: performance anxiety,
   pressure, presence, nervous system, spectatoring, "in your head." Never on
   TikTok: ED, PE, erection, arousal, or any symptom-explicit term. The clip
   sells the click; the App Store listing says the quiet part.
2. **Claims firewall tier 1 (banned everywhere):** cure, treat, therapy/
   therapeutic, heal, clinically proven, fix your dysfunction, permanent,
   guaranteed, reverse, restore function, alternative to [any drug].
   Tier 3 (native vocabulary): retrain, recondition, down-regulate, practice,
   build, become, "move from X to Y," presence over performance.
3. **No efficacy numbers, ever.** Prevalence stats only, hedged ("most men meet
   it at least once"). We re-measure; we don't promise.
4. **No testimonial-shaped AI content.** Educator personas explain mechanisms.
   Nothing an AI person says may imply personal product experience or results.
5. **No urgency, no shame hooks, no bro-copy.** "Still can't last?" is banned.
   Restraint converts this buyer; hype repels him.
6. **Optimize watch time and profile visits, not engagement.** This audience
   will never like or comment. A clip with 0 comments and a 6% profile-visit
   rate is a winner. Build every clip as a retention object: open loop by
   second 1.5, payoff in the final third, loopable last line.
7. **The stranger test extends to following.** Nothing in any handle, bio, or
   pinned content may out a follower to someone scanning his follow list.

---

## 3. Higgsfield production pipeline

### Model cheat sheet (what to use for what)

| Job | Model | Cost (measured/estimated) | Notes |
|---|---|---|---|
| Persona reference stills | `soul_2` (Soul 2.0) | ~a few credits/image | The UGC-realism image model. Used once per persona + occasional new settings. |
| Persona talking-head video | `seedance_2_0` | **45 credits / 10s @ 720p std** | The workhorse. Reference image (`image_references`) locks the face; TTS audio (`audio_references`) locks the voice + lipsync. 4–15s per generation; stitch segments in ffmpeg for 20–45s clips. |
| Budget variant | `seedance_2_0_mini` / `mode:'fast'` | cheaper, 480/720p | Use for hook-swap remakes and tests; keep `std` for hero clips. |
| Voiceover (TTS) | `seed_audio` (default) or `text2speech_v2` | cheap | Fixed voice per persona (below). Generate full VO once per clip, then feed to Seedance per segment. |
| Product-style UGC ads (later, paid-ads era) | `marketing_studio_video` | ~1 video / 12–15s | One-click UGC/Tutorial/Review presets with avatars + hooks. Overkill for organic now; the tool for creative volume when Apple Search Ads / Spark Ads start. |
| Aspect/cleanup | `reframe`, `upscale_video` | per use | Reframe to 9:16 if a generation drifts; upscale hero clips. |

### The persona kit (locked assets — reuse these IDs every time)

Consistency is the whole game: same face + same voice + same room + same light =
a *person* the feed recognizes. Never regenerate a persona from scratch; always
reference these.

**Cole** — reference image candidates (pick one, then it is canon):
- Job `0949818a-c6a3-4977-9d52-678d93446fd8` (variant 1)
- Job `87bc609e-b445-42d5-9eb1-c7b656e2a905` (variant 2)
- Voice: **Sterling** — `voice_id: dc382508-c8bd-443c-8cb2-46e57b8d2e6f`
  (preset; preview: https://d1xarpci4ikg0w.cloudfront.net/audio_voice_preset/preview/ed37f856-236b-413e-9f4d-9c746648ea72.mp3)
- Setting phrase (verbatim in every video prompt): *"home office at dusk, single
  warm desk lamp, deep blue-black evening shadows, charcoal crewneck t-shirt,
  front-facing phone camera framing"*

**Audrey** — reference image:
- Job `ace264bf-0af4-4855-825d-3ec2fa5a5dda`
- Voice: **Maya** — `voice_id: b0f766b7-8703-4bd1-b973-f857c36837b6`
  (preset; preview: https://d1xarpci4ikg0w.cloudfront.net/audio_voice_preset/preview/dc8d2759-bb32-4b0e-904d-b8873efc958e.mp3)
- Setting phrase: *"softly lit living room in the evening, warm table lamp,
  dusk-blue shadows, oatmeal knit sweater, front-facing phone camera framing"*

(Andrew: listen to both voice previews once and veto/swap if either feels wrong —
`list_voices` has ~30 more presets. Once a voice ships in public clips it is
locked; changing a persona's voice mid-run resets audience familiarity.)

The dusk lighting on both personas is deliberate — it is Ember Dusk as
cinematography, so the persona accounts are brand-coherent with @composeprotocol
without a logo in sight.

### Talking-head recipe (the standard build, ~30s clip)

1. **Script:** 70–85 words, structured hook → body → turn (see script bank).
2. **VO:** one `generate_audio` call (persona's locked voice, full script).
   One take = one voice, no per-segment drift.
3. **Video:** split VO at a sentence boundary into 2 × ~12–15s chunks; for each,
   `generate_video` with `seedance_2_0`, 9:16, the persona reference image as
   `image_references`, the VO chunk as `audio_references`, and a prompt =
   setting phrase + performance direction ("speaks directly to camera, calm and
   grounded, small natural hand gestures, slight lean-in on the final line").
4. **Assembly (ffmpeg, local):** concat segments, add subtle burned-in captions
   (Inter font, high-contrast, TikTok-safe zone), normalize loudness (−14 LUFS),
   1080×1920 output.
5. **Never upscale tests.** Upscale only clips that earn remakes.

A 15s single-segment build (one Seedance call, 45 credits) is the budget format —
several scripts in the bank are written to 15s deliberately.

### Credit budget (honest math)

Balance today: **1,000 credits (Plus plan).**

At steady state (1 talking head per persona per day, ~30s two-segment builds):
~90 credits × 2 personas ≈ **180 credits/day** → 1,000 credits ≈ 5–6 days.
Using 15s single-segment builds: ~90/day → ~11 days.

So the plan: **run a 10-day validation sprint on the current 1,000 credits**
(mix of 15s and 30s builds, ~2 persona videos/day), with @composeprotocol's
zero-credit renders carrying volume to the 6/day total. If week-2 metrics
justify it, upgrade the Higgsfield plan; if not, we learned cheap. Preflight
every generation with `get_cost:true` and log spend in the weekly sheet —
credits are a real budget line now.

---

## 4. The script bank & calendar

- `SCRIPTS-BATCH-1.md` — 30 production-ready scripts (10 Cole, 10 Audrey,
  10 Protocol), each with primary + alternate hooks, full VO/on-screen text,
  visual recipe, caption, and hashtags. Every script has been written against
  §2 above.
- `CONTENT-CALENDAR.md` — the first 14 days mapped day-by-day, with the warm-up
  ramp built in.
- **Hook-swap multiplication:** a "new" clip in week 3+ is usually a winning
  body with a new first line. Hooks are ~80% of retention variance and cost one
  regeneration of segment 1 only (the body segments are reusable). 30 scripts
  × 3 hooks ≈ 90 testable units before any new writing.

### Hashtag policy

3–5 per post, niche-relevant, zero symptom vocabulary. Rotate from:
`#performanceanxiety #mensmentalhealth #nervoussystem #mindset #presence
#selfimprovement #relationshippsychology #anxietyrelief #breathwork #mensmindset`
(Audrey adds `#relationshiptips #couplespsychology`; Protocol adds `#breathe
#calm #nightthoughts`.) Hashtags are a routing hint, not a growth lever — the
hook does the work.

---

## 5. The Ember renderer (zero-credit clips)

`render_ember.py` (in `marketing/tiktok/tools/`) renders @composeprotocol's
text clips directly from a JSON spec — no Higgsfield credits, perfectly
on-brand, unlimited volume:

- **Text mode:** timed Newsreader-italic lines fading over an animated Ember
  Dusk gradient (deep `#080A0F` ground, warm `#C89B6D` emission, film grain).
  Used for all F6/F5/F1-as-text scripts.
- **Breath mode:** a paced breathing circle (4s in / 6s out) with count text —
  the "Breathe With Me" participation format. This is a real breathing pacer,
  not a fake app UI: it demos the *mechanism*, which is the honest version of
  a product demo until you record the real orb.

Claude runs it during batch; specs live next to the scripts. Note the renderer
deliberately does NOT imitate the actual app screens — real app footage should
be real (see §7, your one recording task).

---

## 6. The weekly automation

A scheduled task ("COMPOSE weekly TikTok batch") fires **every Sunday 6:00pm
CT**. What it does, unattended:

1. Stages `marketing/tiktok/` from your machine (script bank, calendar,
   `state.json` of what's been produced, latest metrics sheet if present).
2. Selects the next 7 days of content per the calendar + decision rules
   (winners get hook-swap remakes; new scripts fill the rest).
3. Generates: TTS + Seedance builds for Cole/Audrey (respecting a per-week
   credit cap of 700 unless you raise it), Ember renders for @composeprotocol.
4. Assembles, captions, and QC-checks each file (duration, resolution,
   loudness), then delivers everything to the chat **and** commits to
   `C:\Compose\COMPOSE\marketing\tiktok\queue\<week>\<account>\` with a
   `POSTING-SHEET.md` (file → account → date → time → caption → hashtags →
   AI-label yes/no).
5. Reports credit spend and anything it skipped.

If your desktop app is closed when it fires, files still arrive in the chat;
they land on disk next time you open the app and ask. First run will be
supervised (this week) so you can veto persona look/voice before anything
ships.

### Your 45-minute Sunday (the only recurring human work)

1. Open the queue folder, skim the batch (~10 min). Kill anything that feels
   off — the veto is the human layer of the compliance system.
2. TikTok Studio (web) → switch account → Upload: drag the week's files for
   that account, paste caption from the posting sheet, set **schedule
   date/time**, toggle **AI-generated content** on persona clips, post cover
   frame = the hook text frame (~30 min for ~14–18 clips).
3. Log last week's numbers in `METRICS.md` (~5 min): per clip — views, avg
   watch %, profile visits. Profile-visit rate is the governing number.

### Decision rules (pre-committed, from CONTENT-STRATEGY §6)

A format gets a verdict only after ≥10 posted clips. Kill if profile-visit
rate < 50% of library median. Top-decile clips get 3 hook-swap remakes within
2 weeks. An account underperforming both siblings after 6 weeks gets its format
mix rebuilt, not abandoned. Views are vanity; profile-visit rate governs.

---

## 7. Launch checklist (this week, once)

1. **Create the 3 TikTok accounts** (handles confirmed available?), complete
   profiles, @composeprotocol → switch to Business account.
2. **Redirect links:** stand up `/tb`, `/tc`, `/ta` paths on a domain you own →
   App Store product page (per-account attribution; ASC will show the source).
   Send me the App Store URL and I'll fold it into captions/bios everywhere.
3. **Approve the persona kit:** pick Cole variant 1 or 2, approve Audrey,
   listen to the two voice previews (links in §3).
4. **Record 3 app captures on your phone** (one-time, ~30 min): the breathing
   orb (60s), the onboarding quiz (score blurred), the daily loop walkthrough.
   These unlock the F3/F4 direct-response formats — the highest
   profile-visit-rate clips in the whole library — and I'll cut/caption them
   into multiple clips per capture.
5. **Review Batch 1** (samples attached to this delivery), then I schedule the
   Sunday automation.

---

## 8. What we deliberately do NOT do

No engagement bait, no follow-for-more, no duet/stitch chasing, no trend-sound
piggybacking that breaks tone, no comment-section combat (calm, brief, educator
replies only — never defensive), no paid boosts on organic clips (Spark Ads is
a later, separate decision), no cross-posting watermarked exports (each
platform gets a native upload when we expand to Reels/Shorts — same files,
posted natively), and no daily metric-checking. The system runs weekly; the
dopamine loop of hourly view-counts is how founders burn out and start making
hype content. The product's ethos — calm, structured, measured — is also the
marketing team's.

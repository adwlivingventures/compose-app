# **COMPOSE: Regulation Toolkit Scripts (5 Tracks)**

**Purpose:** The state-based regulation layer — SOS default track, daily-loop regulation on-ramps, and phase-assigned somatic practices. Not a browsable library (doctrine §7.5: repetition is scheduled, not browsable). These tracks are *routed*: SOS → Track 1; Phase 1 daily assignment → Tracks 2/5; Phase 2 → Tracks 3/4.

**Clinical basis:** cyclic sighing (Balban & Spiegel 2023, Stanford), box breathing (equal-ratio paced respiration), MBST body scan (Brotto — interoceptive awareness / spectatoring antidote), NSDR/yoga-nidra-derived deep rest, pelvic floor down-training (canon §2.1 — 4s inhale-drop / 6s exhale, reverse kegel only).

**Doctrine compliance:** field POV only. No negation-framed instruction, no deficit-restating, no urgency. Capability register only (these are regulation tracks, usable from Day 1). Wellness vocabulary throughout — no treatment claims.

## **Voiceover Delivery Instructions**

* **Tone:** deep, calm, slow, unhurried masculine voice; chest resonance. Match the shipped `day_1.mp3` pacing reference.
* **Pauses:** `...` = standard 1.5s break (existing export convention). `[pause Ns]` = exact timed silence for breath pacing — these are load-bearing; the silence *is* the practice.
* **Production note (timed pauses):** ElevenLabs `<break>` tags are only reliable up to ~3s. For `[pause 4s]` and longer, either chain breaks (`<break time="2.0s" /><break time="2.0s" />`) or — better for the paced tracks — render the spoken segments separately and assemble with exact silence via ffmpeg. Extend `tools/generate-elevenlabs-exports.js` to map `[pause Ns]` accordingly. Deterministic silence assembly is recommended for Tracks 1, 2, and 5, where cue timing is the mechanism.
* **File naming:** `regulation_reset_breath.txt`, `regulation_steady_square.txt`, `regulation_body_scan.txt`, `regulation_deep_drop.txt`, `regulation_pelvic_drop.txt` → render to same-name `.mp3` in `assets/audio/`, register in `content/anchors.ts`.

---

### **Track 1: The Reset Breath** — SOS default · ~3 min

**Core Focus:** Physiological sigh / cyclic sighing. The fastest volitional down-regulator; the zero-choice SOS track. Plays immediately on SOS tap.

"This is the Reset Breath. Your body already knows this move... it's the same breath you take on the edge of sleep, and the one that arrives on its own after tension finally releases. Here, you run it on purpose.

Wherever you are... sitting, standing, lying down... let your shoulders lower away from your ears... and unclench your jaw.

Here is the shape. Two inhales through the nose... a long, full breath in... then one more short sip of air right on top of it... and then a slow, complete sigh out through the mouth. The second inhale opens the small air sacs deep in your lungs. The long exhale is the signal your heart listens to... it slows everything down.

Let's begin. Follow my count.

Breathe in through your nose... [pause 3s] now one more short breath in, right on top... [pause 1.5s] and sigh it all the way out through your mouth... slow... [pause 6s]

Again. Long inhale through the nose... [pause 3s] short sip on top... [pause 1.5s] and a long sigh out... let it empty completely... [pause 6s]

Again. In through the nose... [pause 3s] top it up... [pause 1.5s] and release... jaw soft... shoulders heavy... [pause 6s]

Two more. Breathe in... [pause 3s] sip... [pause 1.5s] and out... notice your heartbeat beginning to settle... [pause 6s]

Last one. Deep inhale... [pause 3s] one more sip... [pause 1.5s] and a full, slow sigh... all the way to the bottom of the breath... [pause 6s]

Now let your breathing return to its own natural rhythm... [pause 4s] Feel your feet... the weight of your body where it rests... the temperature of the air on your skin... [pause 4s]

What just happened is chemistry, and you drove it. Your exhale slowed your heart. Your heart informed your brain. Your brain lowered the alarm. This lever is in your hands any hour of the day... and it works every time you pull it.

You are present. You are grounded. You are composed."

---

### **Track 2: The Steady Square** — Phase 1 daily on-ramp · ~4 min

**Core Focus:** Box breathing (4-4-4-4). Equal-ratio pacing plus a counting task that occupies the evaluating mind — attentional displacement in service of regulation.

"This is the Steady Square. Four sides, four counts each... breathe in, hold, breathe out, hold. Fighter pilots and divers use this exact pattern to stay clear-headed under pressure... it is composure as a trained skill.

Sit tall but easy... let your spine stack itself... hands resting anywhere they land. [pause 2s]

The counting matters. While your mind counts, it has one job... and a mind with one job is a quiet mind.

First, empty out... breathe out slowly through your mouth until you reach the bottom. [pause 4s]

Now we build the square. Breathe in through your nose... two... three... four. [pause 1s] Hold... two... three... four. [pause 1s] Breathe out... two... three... four. [pause 1s] Hold empty... two... three... four. [pause 1s]

Again. In... two... three... four. [pause 1s] Hold... two... three... four. [pause 1s] Out... two... three... four. [pause 1s] Hold... two... three... four. [pause 1s]

Keep the edges clean. In... [pause 4s] hold... [pause 4s] out... [pause 4s] hold... [pause 4s]

Again... breathing in... [pause 4s] holding, chest easy... [pause 4s] breathing out... [pause 4s] resting empty... [pause 4s]

Two more rounds, and now the count is yours... I'll keep time with you. In... [pause 4s] hold... [pause 4s] out... [pause 4s] hold... [pause 4s]

Last round. In... [pause 4s] hold... [pause 4s] out, long and smooth... [pause 4s] and hold... [pause 4s]

Release the count... let the breath find its own pace. [pause 4s] Notice the stillness you built... four sides, laid by hand. [pause 3s]

The square travels with you. Before a conversation that matters... at a red light... in the dark before sleep. Four counts a side. Every square you build is a vote for a steadier baseline... and you can build one anywhere.

Steady built. Carry it with you."

---

### **Track 3: Back Into the Body** — Phase 1–2 assignment · ~8 min

**Core Focus:** MBST body scan. Trains interoceptive awareness — attention *into* first-person sensation. The direct counter-skill to leaving the body under pressure. Field POV throughout.

"This practice has one purpose... to bring your attention home. Home is your body, felt from the inside. Attention lives wherever you place it... and for the next few minutes, you place it here.

Sit or lie down... let your eyes close, or soften toward the floor. [pause 3s] Take one slow breath in through your nose... [pause 3s] and let it go completely. [pause 4s]

Begin at your feet. Feel them from the inside... the pressure where they meet the floor... warmth or coolness... the faint pulse of blood arriving. There is nothing to picture here... this is feeling, from within. [pause 6s]

Let attention rise slowly into your calves and shins... like a warm, unhurried beam moving up through you. Notice whatever is actually there... heaviness... tingling... maybe nothing at all. Whatever you find is the right answer. [pause 6s]

Your knees... your thighs. Big, quiet muscles. Invite them to soften and spread against the surface beneath you. [pause 6s]

Now the base of your body... the seat of your weight. Your hips... your pelvis... the muscles between your sit bones. This region holds tension you rarely notice. As you breathe in, let the breath travel low... and as you breathe out, let that whole floor of muscle soften and widen. [pause 8s]

Your belly. Let it be round and loose... rising as you inhale... falling as you exhale. Softness here is strength choosing to rest. [pause 6s]

Your chest... your heartbeat, somewhere beneath the ribs. Just feel it beat... it has carried you every second of your life without a single instruction. [pause 6s]

Your shoulders... let them pour down away from your ears like warm sand. [pause 4s] Down your arms... your elbows... your wrists... all the way into the palms of your hands and each finger. Hands warm... hands heavy. [pause 6s]

Your neck... your jaw. Let the jaw unhinge slightly... teeth apart... tongue resting loose. [pause 4s] Your eyes... soft in their sockets. Your forehead... smooth and wide. [pause 6s]

Now feel all of it at once... the whole body, breathing, from the soles of your feet to the crown of your head... one continuous field of sensation. This is where you live. [pause 10s]

Rest here... breathing... feeling... nothing to solve. [pause 10s]

When your mind wanders... and minds wander, that's what they do... simply notice where it went, and walk it back to sensation. Each return is one repetition of the only skill this practice trains. Every return makes the path home shorter. [pause 8s]

One more slow breath in... [pause 3s] and out. [pause 4s]

Begin to move your fingers... your toes... let your eyes open when they're ready.

The body you just visited is with you all day... and now you know the way in. Presence is a place, and you can walk there whenever you choose."

---

### **Track 4: The Deep Drop** — Phase 2 assignment / evening · ~10 min

**Core Focus:** NSDR-style deep rest. Systematic relaxation + rotating attention. Deep parasympathetic recovery; builds tolerance for stillness at low arousal — the recovery-side complement to exposure work.

"This is the Deep Drop... ten minutes of complete rest while remaining awake. Deep rest is a skill, and like every skill in this protocol, it responds to training.

Lie down if you can... flat on your back, arms at your sides, palms up. Cover yourself if you're cool... comfort is part of the mechanism. [pause 4s]

Close your eyes. [pause 2s] Take a long breath in through your nose... [pause 3s] and sigh it out through your mouth. [pause 5s] Again... breathe in deep... [pause 3s] and let it all go. [pause 5s] One more... in... [pause 3s] and out... and with this exhale, let your body sink one inch deeper into the surface beneath you. [pause 6s]

From here, your breath breathes itself... easy and low. [pause 4s]

Now imagine your attention as a small, warm spotlight... and move it where I move it. [pause 2s]

The spotlight rests on your right hand... palm... thumb... each finger. Warm... heavy. [pause 5s] It glides up your right arm... forearm... elbow... shoulder. The whole arm releases its weight. [pause 5s]

The spotlight crosses to your left hand... palm and fingers... warm and heavy. [pause 5s] Up the left arm... to the shoulder. Both arms now resting completely... held entirely by the ground. [pause 6s]

The light moves to your face... forehead smooth... eyes heavy in their sockets... jaw loose... throat open. [pause 6s]

Down through your chest... your heartbeat slow and even. [pause 4s] Your belly... rising and falling on its own. [pause 4s] Your hips and the floor of your pelvis... softening... widening... letting go of a holding you didn't know was there. [pause 6s]

Down your right leg... thigh... knee... calf... foot. Heavy. [pause 5s] Down your left leg... all the way to the toes. Heavy. [pause 5s]

Your whole body now... one warm, heavy shape... resting at the bottom of the day. [pause 8s]

Feel the entire body breathe... the whole shape swelling slightly as air arrives... settling as it leaves. [pause 10s]

Stay here... awake inside deep rest. Thoughts may drift past like clouds moving at night... they need nothing from you. [pause 15s]

Rest. [pause 20s]

Feel the surface holding you... it has held you this entire time... you were never doing the holding. [pause 10s]

Now, gently... bring a slow, deeper breath into your chest. [pause 3s] Move your fingertips... your toes... [pause 3s] roll your head an inch to each side. [pause 3s] And when you're ready... let your eyes open.

Notice the state you're in right now... calm, clear, unhurried. Your nervous system produced this state on request... your request. The more often you visit this depth, the more easily your body finds its way back... on the days, and the nights, that matter."

---

### **Track 5: The Pelvic Drop — Long Practice** — Phase 1 core assignment · ~6 min

**Core Focus:** Extended pelvic floor down-training. Diaphragm–pelvis piston mechanics + paced reverse-kegel rounds at the canonical 4s inhale-drop / 6s exhale cadence. Companion to the daily Pacer; this is the guided teaching version.

"This is the Pelvic Drop... the long practice. The daily pacer runs this pattern with you every day... here, we slow it down and build it properly, so the pacer has something trained to pace.

Lie on your back with your knees bent, feet flat... or sit tall on the front edge of a chair, weight even on both sit bones. [pause 3s]

One hand on your chest... one hand on your belly. [pause 2s]

First, find the engine. Breathe in slowly through your nose and send the air low... so the hand on your belly rises... and the hand on your chest stays quiet. [pause 4s] Breathe out slow and easy. [pause 5s] Again... in... belly rises... [pause 4s] and out. [pause 5s]

That low breath is your diaphragm working... a wide muscle that descends as you inhale. And here is the mechanism this whole practice rests on... your diaphragm and your pelvic floor move together, like a piston. When the breath drops down... the floor of your pelvis is designed to descend with it... to expand... to soften... to make room.

So the drop is something you *allow*, and the breath does the work. [pause 2s]

Bring your attention to the sling of muscle between your sit bones... between the pubic bone in front and the tailbone behind. [pause 3s]

Now... breathe in low and slow... and as the belly rises, let that floor of muscle soften and descend... feel the space between your sit bones gently widen... like the muscle is smiling downward. [pause 4s] And breathe out... long and unhurried... letting everything return to neutral... resting. [pause 6s]

Keep your glutes soft... your abs soft... your jaw soft. The drop is small, quiet, and internal... if the muscles around it are working, let them retire. [pause 3s]

Again. Inhale... belly rises... floor descends... widens... [pause 4s] exhale... long... back to neutral. [pause 6s]

Inhale... send the breath all the way down into the basement... [pause 4s] exhale... slow... the long exhale is the half that calms the whole system. [pause 6s]

Inhale... drop... [pause 4s] exhale... rest... [pause 6s]

Inhale... soften and widen... [pause 4s] exhale... neutral... [pause 6s]

Four more rounds, quiet now... just the rhythm. [pause 2s]

In... [pause 4s] out... [pause 6s] In... [pause 4s] out... [pause 6s] In... [pause 4s] out... [pause 6s] Last one... in... deep and low... [pause 4s] and out... complete. [pause 6s]

Let the breath return to its own rhythm. [pause 4s] Notice the region you just trained... warmer... looser... quieter than when you began. [pause 4s]

This floor of muscle has been holding a brace for years... and today you taught it, for a few minutes, the opposite of bracing. Repetition is what turns a practice into a reflex. The drop is your body's brake pedal... and with every session, your foot finds it faster.

Trained. Released. Composed."

---

## Integration Notes

1. **Routing, not browsing (doctrine §7.5):** SOS → Track 1, always, zero choices. Daily loop assigns Tracks 2/5 in Phase 1 and 3/4 in Phase 2 as scheduled content. If a Toolkit surface exists, it asks one question ("Settle fast / Go deeper / Release the floor") and routes to exactly one track — the full set is never displayed as a shelf.
2. **Pipeline:** add these as source scripts alongside the phase files; extend `tools/generate-elevenlabs-exports.js` with the `[pause Ns]` mapping; render with the same voice as `day_1.mp3`; register in `content/anchors.ts`.
3. **Timed-pause assembly:** for Tracks 1, 2, 5, deterministic silence (segment renders + ffmpeg concat) is strongly preferred over long TTS break tags — cue timing is the clinical mechanism, and TTS pause drift breaks the pacing.
4. **Screening guard (canon §3):** Track 5 assumes the hypertonic branch (the default population). Hypotonic-branch users should receive their strengthening variant from the diagnostic router, not this track.

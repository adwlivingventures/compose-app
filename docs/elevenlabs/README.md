# ElevenLabs Production Exports

One file per day (`day_1.txt` … `day_75.txt`), spoken text only, generated
from `docs/COMPOSE-Phase-{1,2,3}-Scripts.md`.

**Do not edit these files directly** — edit the phase script files and
regenerate:

```
node tools/generate-elevenlabs-exports.js
```

## Production conventions

- **Naming:** record `day_5.txt` → save as `day_5.mp3` → drop in
  `assets/audio/` (registration happens in `content/anchors.ts`).
- **Voice direction** (from the script headers): deep, calm, slow, unhurried;
  chest resonance; Phase 3 slightly more authoritative.
- **Pauses:** every `...` is a deliberate ~2-second pause. If the model reads
  ellipses too quickly, the fallback is inserting explicit
  `<break time="2.0s" />` tags at each `...` — ask Claude to generate a
  break-tag variant of the exports rather than hand-editing.
- **Match Day 1:** the shipped `day_1.mp3` is the pacing reference; new
  renders should sit at the same speed and energy.
- Later-phase scripts are deliberately shorter (~75–100 words ≈ 60–90s) than
  Phase 1 (~2 min) — see progress notes before "fixing" this.

# Design Rules — "Twilight, bone light"

Hybrid of the Compose Figma reference set + Twilight Descent. Dark mode only.

## Tokens

Color:
- `bg` #080A0F — app background, always
- `surface` #151A26 — cards, chips, inputs (radius 16 cards, radius 999 chips)
- `stroke` #232D42 — hairlines, dividers, progress track, unselected radio border #2E3B5E
- `text-primary` #E5E7EB
- `text-secondary` #9CA3AF (body, weight 300)
- `text-tertiary` #6B7280 · `text-faint` #4B5563 (footers, captions)
- `accent` #5D72A8 — selection borders, radios, data marks, clinical icons
- `accent-soft` #8B93C7 / #6C74A3 — periwinkle text accents, italic goal echoes
- `cta` #E5E7EB fill, #080A0F label — the "bone" pill
- Glows: CTA `0 0 20px rgba(46,59,94,0.4)` · selection `0 0 20px rgba(30,58,138,0.2)` · dusk radial `radial-gradient(circle, rgba(93,114,168,0.14–0.20) 0%, transparent 65%)` bleeding off the top of chapter screens
- Severity (semantic ONLY, never decorative): amber #D9A756 on rgba(217,167,86,0.10) · red #E07A5F on rgba(224,122,95,0.10)

Type:
- Headlines / questions / scores / oath / mirror sentences: **Newsreader** (Google Fonts), weight 400–500. Welcome 31–34px centered; questions 26px left; card titles 24–29px. Italic Newsreader for oath, mirror sentence, goal echoes, positioning lines.
- Body / UI: system sans (-apple-system), weight 300 for body, 500 for CTA labels.
- Micro-type: 10px, letter-spacing 2px, uppercase, #9CA3AF (progress headers, eyebrows). Wordmark COMPOSE: 10px, letter-spacing 5px, weight 300, #E5E7EB.
- Minimums: body ≥ 11px, tap targets ≥ 44px.

## Components

- **CTA pill**: full-width, radius 999, bone fill, CTA glow, padding 18–20px vertical. Case rule: UPPERCASE + 0.35px tracking for navigational CTAs (FIND MY BASELINE, CONTINUE, SEE MY PROTOCOL); sentence case for commitment/emotional CTAs ("I understand", "Yes — I'm in", "Sign & begin — $49.99").
- **Secondary link**: text only, #4B5563, small ("Skip for now", "I have doubts", "Exit for now").
- **Answer card (single-select)**: surface, radius 16, 18px padding, radio circle 18px. Selected: 1px #5D72A8 border + filled 8px radio dot + selection glow. Auto-advance 250ms after selection.
- **Answer card (multi-select)**: same, with 18px rounded-square checkbox (radius 5) instead of radio; #5D72A8 check when on; Continue button required.
- **Progress header**: back arrow · "MAPPING · X OF Y" micro-type centered · "~N MIN" right; 2px track #232D42 with bone fill beneath.
- **Question footer**: "ANSWERS STAY ON THIS PHONE. ALWAYS." 10px tracked, #4B5563, centered.
- **Clinical card visual**: a Figma render (~190–200px, `background-size:contain`, centered above the title), NOT an icon. All are transparent PNGs and sit directly on #080A0F. Mapping: `fig-hero-somatic.png` → B-28 Adrenaline Trap · `fig-hero-validation.png` → B-29 Default Mode Network · `fig-hero-philosophy.png` → B-30 Novelty Loop · `hero-welcome-drop.png` (cover, radius 14) → B-31 Why Band-Aids Fail. B-32 Blueprint uses `fig-hero-protocol.png` or the somatic node. Never use line-icons on the clinical block.
- **Chips**: surface pills, 11px weight-300 text (Day Zero stats, profile recap).
- **Gauge/bars (Your Map)**: track = surface; calm zone rgba(93,114,168,0.25); user marker = 2px bone line with white glow. Severity rows = surface radius 12, chip right-aligned.
- **Hero imagery**: only the 5 renders in assets/, always with a fade-to-bg gradient on the bottom third, opacity 0.9–0.95. Chapter moments only.

## Screen archetypes → B-XX mapping

1. **Chapter/welcome** (centered, wordmark, hero image or dusk glow): B-01 (hero-welcome-drop), B-02, B-32 (fig-hero-protocol), B-33 screens 1–5, B-34 (fig-hero-validation)
2. **Section transition** (interstitial, auto-advance 1.5s, micro-type only): before B-03, B-09, B-17
3. **Single-select question**: B-03, B-05, B-06, B-10, B-13, B-14, B-15 sub-4, B-17, B-18, B-19, B-20 (branched), B-21, B-22, B-24
4. **Multi-select question**: B-04, B-09, B-23, B-27 (grouped headers: MIND/BODY/CONNECTION/SELF-IMAGE micro-type), B-36 (goals + optional free-text)
5. **Text/number input**: B-07 (text field), B-08 (wheel picker), B-11 (1–10 slider, anchor labels)
6. **Conditional note card** (calm, no alarm styling): B-12
7. **Interactive check**: B-15 sub-1 (instruction), sub-2/3 (countdown ring — 1.5px #5D72A8 ring, Newsreader count, CLENCH & HOLD / RELEASE & OBSERVE micro-labels)
8. **Testimonial slot** (reserved, ships dark): B-16, paywall row
9. **Generating**: B-25 (progress ring + staged checklist, ticks in #5D72A8)
10. **Results**: B-26 (reference screen)
11. **Clinical card** (centered, Figma render + dusk glow): B-28 (somatic node), B-29 (blue brain), B-30 (purple ripples), B-31 (water-drop) — "CLINICAL CONTEXT · N OF 4" eyebrow. Renders replace icons; see Components → Clinical card visual.
12. **Diverging graph**: B-35 (two 1.5px curves: upper #8B93C7, lower #4B5563 dashed; no numeric y-axis)
13. **Commit**: B-37 (+ doubt interstitial)
14. **Beat**: B-38 (max 2s)
15. **Paywall**: B-39 (reference screen) · B-40 dismiss (dimmed score + gauge, goal echo, no urgency theater)
16. **Signature**: B-41 (reference screen; signature = Newsreader italic input, button disabled until typed)
17. **Settings/discretion**: B-42 (icon selector row + 3 toggle rows, surface cards; toggles #5D72A8 when on)

All display logic, branch conditions, and conditional lines: follow the PDF verbatim.

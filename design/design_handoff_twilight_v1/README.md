# COMPOSE — Onboarding vB "Twilight, bone light" — Handoff

For Claude Code. Build all 42 onboarding screens (B-01 → B-42) from:

1. `spec/COMPOSE_Onboarding_-_Version_B__Batched__No_Hope_.pdf` — the copy + flow spec. Copy is FINAL and paste-ready. All display logic, branching, and design notes live here.
2. `design-rules.md` — the visual system + screen archetypes + B-XX → archetype mapping.
3. `reference/COMPOSE - Onboarding vB.dc.html` (project root) — 6 fully-designed reference screens (option 3a): B-01 Welcome, B-10 Question, B-26 Your Map, B-28 Clinical Card, B-39 Paywall, B-41 Day Zero. These are the source of truth when the rules doc and your judgment disagree.
4. `assets/` — the 5 approved hero renders. Do NOT generate or add new imagery.

Non-negotiables (see design-rules.md for detail):
- Dark only. No warm accent colors anywhere. Severity chips (amber/red) are the sole exception, and only on Your Map / paywall recap.
- Imagery only at chapter moments: Welcome (B-01), Clinical Context block (B-28–31), Blueprint (B-32), Day Zero (B-41). Everything else is typographic.
- CTA case rule: UPPERCASE tracked pills for navigation; sentence case pills for commitment moments.
- Every question screen carries the persistent footer + MAPPING progress header per the PDF's global rules.
- Never fabricate testimonials; B-16 and the paywall testimonial row ship dark behind a remote flag.

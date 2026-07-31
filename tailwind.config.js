/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  // 'class' (not the default 'media') is required for the web dev preview:
  // react-native-css-interop's web runtime observes <html> attribute mutations
  // (which Expo's dev overlay and font injection trigger) and calls
  // colorScheme.set() — which throws when darkMode is 'media'. The app is
  // dark-only and uses no `dark:` variants, so this changes no rendered style
  // on any platform.
  darkMode: 'class',
  theme: {
    extend: {
      // ── Deepwater v1 design tokens (founder-approved 2026-07-25) ──────────
      // Supersedes Ember Dusk v2 VALUES; class names are retained so the whole
      // app reskins coherently. Direction: Ember Dusk re-lit through Breathwrk —
      // colder, deeper field; ONE luminous accent (`accent`, the aqua
      // "current") reserved for the next step and earned progress (≤4 uses per
      // screen). The old copper survives as `ember` — identity moments ONLY
      // (phase names, milestone marks, italic mirror lines; ≤2 per screen).
      // Governing spec: project doc claude/DEEPWATER-FLOW-MAP.md §1.
      // Material spec (glows, easing, dawn arc): theme/emberDusk.ts.
      colors: {
        ground: '#0A0F16',         // all screen backgrounds (blue-black, deep water)
        surface: '#121A24',        // cards, chips, inputs
        'surface-deep': '#0D141D', // secondary/nested cards [derived]
        tab: '#0B1119',            // tab bar, bottom sheets [derived]
        line: '#223140',           // card borders, hairlines, dividers
        'line-soft': '#182430',    // progress tracks, soft dividers [derived]
        radio: '#2A3A4A',          // unselected radio/checkbox borders
        accent: '#5FD4C1',         // THE current — one primary action per screen
        'accent-bright': '#8CE6D8',// text accents, CTA gradient core
        'accent-deep': '#3E9BD6',  // gradient deep end, pressed states
        'accent-soft': '#D9F4EE',  // text on accent-tinted surfaces
        'on-accent': '#06232A',    // text/icons on aqua fills
        ink: '#EDF2F5',            // headings, primary text
        body: '#93A4B0',           // body copy (weight 300)
        muted: '#6E8090',          // secondary text, labels
        faint: '#53626E',          // footers, captions, fine print
        dim: '#53626E',            // merged with faint (4 text levels)
        scrim: '#04070B',          // modal backdrop base [derived]
        ember: '#C89B6D',          // identity moments only — never a CTA
        'ember-bright': '#D9B285', // ember text accents
        'ember-deep': '#A87F58',   // italic goal echoes
        gain: '#78C99A',           // positive deltas only, always ▲ + label
        'severity-amber': '#D9A756', // semantic only, matte, never glows
        'severity-red': '#E07A5F',   // semantic only, matte, never glows
      },
      fontFamily: {
        'serif-light': ['Newsreader_300Light'],            // 40px+ numerals only
        'serif-regular': ['Newsreader_400Regular'],        // headlines, questions
        'serif-medium': ['Newsreader_500Medium'],          // scores, card titles
        'serif-italic': ['Newsreader_400Regular_Italic'],  // oath, mirror, echoes
        'serif-semi': ['Newsreader_500Medium'],            // legacy alias — prefer serif-medium
      },
    },
  },
  plugins: [],
};

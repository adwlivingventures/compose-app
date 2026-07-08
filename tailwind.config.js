/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Ember Dusk v2 design tokens — Design Authority Ruling,
      // design/design_handoff_twilight_v1/BUILD_PROMPT.md §1 (founder-approved
      // 2026-07-08). Cool dusk field; warm copper is EMISSION ONLY (≤4 uses per
      // screen, only on the next step). Non-color material spec (glows, easing,
      // dawn arc) lives in theme/emberDusk.ts.
      colors: {
        ground: '#080A0F',         // all screen backgrounds
        surface: '#151A26',        // cards, chips, inputs
        'surface-deep': '#0E1119', // secondary/nested cards [derived]
        tab: '#0C0F16',            // tab bar, bottom sheets [derived]
        line: '#232D42',           // card borders, hairlines, dividers
        'line-soft': '#1B2233',    // progress tracks, soft dividers [derived]
        radio: '#2E3B5E',          // unselected radio/checkbox borders
        accent: '#C89B6D',         // THE copper — one primary action per screen
        'accent-bright': '#D9B285',// text accents, CTA gradient core
        'accent-deep': '#A87F58',  // italic goal echoes
        'accent-soft': '#E8D8C3',  // text on accent-tinted surfaces
        'on-accent': '#0C0B09',    // text/icons on copper fills
        ink: '#E5E7EB',            // headings, primary text
        body: '#9CA3AF',           // body copy (weight 300)
        muted: '#6B7280',          // secondary text, labels
        faint: '#4B5563',          // footers, captions, fine print
        dim: '#4B5563',            // merged with faint (Dusk has 4 text levels)
        scrim: '#04050A',          // modal backdrop base [derived]
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

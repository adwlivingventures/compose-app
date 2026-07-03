/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Ember v1 design tokens — design/ember-v1/README.md
      colors: {
        ground: '#0C0B09',        // all screen backgrounds
        surface: '#161412',       // cards, inputs
        'surface-deep': '#0F0E0C', // secondary/nested cards
        tab: '#12100E',           // tab bar, bottom sheets
        line: '#262220',          // card borders
        'line-soft': '#201D19',   // dividers, progress tracks
        accent: '#C89B6D',        // THE copper — one primary action per screen
        'accent-bright': '#D4A574',
        'accent-soft': '#E8D8C3', // text on accent-tinted surfaces
        'on-accent': '#171310',   // text/icons on copper fills
        ink: '#EDE8E2',           // headings, primary text
        body: '#B9B2A6',          // body copy
        muted: '#8A8378',         // secondary text, labels
        faint: '#6E675D',         // tertiary
        dim: '#57534B',           // fine print, inactive
        scrim: '#050403',         // modal backdrop base
      },
      fontFamily: {
        'serif-light': ['SourceSerif4_300Light'],
        'serif-regular': ['SourceSerif4_400Regular'],
        'serif-italic': ['SourceSerif4_400Regular_Italic'],
        'serif-semi': ['SourceSerif4_600SemiBold'],
      },
    },
  },
  plugins: [],
};

import {
  CUE_KEYS,
  CUE_OPTIONS,
  CUE_PICKER_INTROS,
  CUE_STEP_COPY,
  DEFAULT_CUES,
  cuePickerDoneKey,
} from '../cues';

/**
 * Guardrail tests for the implementation-intention cue content. These
 * encode canon §7 (register law, never-impress-the-negative) so a future
 * copy edit can't quietly reintroduce banned framing.
 */

const allOptionTexts = CUE_KEYS.flatMap((key) => CUE_OPTIONS[key].map((o) => o.text));

describe('cue content shape', () => {
  it('covers every habit key with at least 3 authored options', () => {
    for (const key of CUE_KEYS) {
      expect(CUE_OPTIONS[key].length).toBeGreaterThanOrEqual(3);
      expect(DEFAULT_CUES[key]).toBeTruthy();
      expect(CUE_STEP_COPY[key].title).toBeTruthy();
      expect(CUE_STEP_COPY[key].subtitle).toBeTruthy();
    }
  });

  it('has globally unique option ids that never collide with the custom sentinel', () => {
    const ids = CUE_KEYS.flatMap((key) => CUE_OPTIONS[key].map((o) => o.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('custom');
  });

  it('keeps option texts card-sized', () => {
    for (const text of allOptionTexts) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text.length).toBeLessThanOrEqual(110);
    }
  });

  it('provides intro copy for both phase transitions', () => {
    for (const phase of [2, 3] as const) {
      expect(CUE_PICKER_INTROS[phase].eyebrow).toBeTruthy();
      expect(CUE_PICKER_INTROS[phase].headline).toBeTruthy();
      expect(CUE_PICKER_INTROS[phase].body).toBeTruthy();
    }
    expect(cuePickerDoneKey(2)).not.toBe(cuePickerDoneKey(3));
  });
});

describe('canon §7 register law', () => {
  it('bans Level II self-talk ("I should / I need to / I must / I will try") in first-person cues', () => {
    for (const text of allOptionTexts) {
      expect(text).not.toMatch(/\bI (should|need to|must|have to|will try|try to)\b/i);
    }
  });

  it('bans negation-framed instruction in cues and defaults (never impress the negative)', () => {
    const texts = [...allOptionTexts, ...Object.values(DEFAULT_CUES)];
    for (const text of texts) {
      expect(text).not.toMatch(/\b(don't|do not|stop|avoid|never|quit|no more|won't)\b/i);
    }
  });

  it('bans urgency and loss framing everywhere, including intros', () => {
    const texts = [
      ...allOptionTexts,
      ...Object.values(DEFAULT_CUES),
      ...Object.values(CUE_PICKER_INTROS).flatMap((i) => [i.eyebrow, i.headline, i.body]),
      ...Object.values(CUE_STEP_COPY).flatMap((c) => [c.title, c.subtitle]),
    ];
    for (const text of texts) {
      expect(text).not.toMatch(/\b(streak|lose|losing|hurry|urgent|warning|before it's too late|last chance)\b/i);
    }
  });

  it('keeps prescribed defaults in second person and authored options in first person', () => {
    for (const text of Object.values(DEFAULT_CUES)) {
      expect(text).not.toMatch(/\bI\b/);
      expect(text).toMatch(/\byour?\b/i);
    }
    for (const key of CUE_KEYS) {
      for (const option of CUE_OPTIONS[key]) {
        expect(option.text).toMatch(/\b(I|my|me)\b/i);
      }
    }
  });
});

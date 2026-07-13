import {
  CUE_KEYS,
  CUE_OPTIONS,
  CUE_PICKER_INTROS,
  cuePickerDoneKey,
  cueTextForItem,
} from '../cues';
import { LEDGER_ITEMS } from '../ledger';

/**
 * Guardrail tests for the implementation-intention cue content. These
 * encode canon §7 (register law, never-impress-the-negative) so a future
 * copy edit can't quietly reintroduce banned framing.
 */

const allOptionTexts = CUE_KEYS.flatMap((key) => CUE_OPTIONS[key].map((o) => o.text));

describe('cue content shape', () => {
  it('covers exactly the ledger keys — the picker and the ledger stay in sync', () => {
    const ledgerKeys = LEDGER_ITEMS.map((i) => i.key).sort();
    const cueKeys = Object.keys(CUE_OPTIONS).sort();
    expect(cueKeys).toEqual(ledgerKeys);
  });

  it('offers at least 3 authored options per ledger item', () => {
    for (const key of CUE_KEYS) {
      expect(CUE_OPTIONS[key].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every ledger item ships a static pre-choice suggestion', () => {
    for (const item of LEDGER_ITEMS) {
      expect(item.cue.trim().length).toBeGreaterThan(0);
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

  it('resolves the chosen cue over the static suggestion', () => {
    const key = CUE_KEYS[0];
    expect(cueTextForItem(key, 'static line', {})).toEqual({
      text: 'static line',
      isChosen: false,
    });
    expect(
      cueTextForItem(key, 'static line', { [key]: { id: 'custom', text: 'my line' } }),
    ).toEqual({ text: 'my line', isChosen: true });
  });
});

describe('canon §7 register law', () => {
  it('bans Level II self-talk ("I should / I need to / I must / I will try") in first-person cues', () => {
    for (const text of allOptionTexts) {
      expect(text).not.toMatch(/\bI (should|need to|must|have to|will try|try to)\b/i);
    }
  });

  it('bans negation-framed instruction in cue options (never impress the negative)', () => {
    for (const text of allOptionTexts) {
      expect(text).not.toMatch(/\b(don't|do not|stop|avoid|never|quit|no more|won't)\b/i);
    }
  });

  it('bans urgency and loss framing everywhere, including intros', () => {
    const texts = [
      ...allOptionTexts,
      ...LEDGER_ITEMS.map((i) => i.cue),
      ...Object.values(CUE_PICKER_INTROS).flatMap((i) => [i.eyebrow, i.headline, i.body]),
    ];
    for (const text of texts) {
      expect(text).not.toMatch(
        /\b(streak|lose|losing|hurry|urgent|warning|before it's too late|last chance)\b/i,
      );
    }
  });

  it('keeps authored options in first person — the chosen cue is an identity impression', () => {
    for (const key of CUE_KEYS) {
      for (const option of CUE_OPTIONS[key]) {
        expect(option.text).toMatch(/\b(I|my|me)\b/i);
      }
    }
  });
});

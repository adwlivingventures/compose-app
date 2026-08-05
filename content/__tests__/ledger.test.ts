import {
  CORE_LEDGER_KEYS,
  ledgerItemsForDay,
  LEDGER_ITEMS,
} from '../ledger';

describe('ledgerItemsForDay', () => {
  test('Days 1–7 expose only the core trio', () => {
    for (let day = 1; day <= 7; day++) {
      const items = ledgerItemsForDay(day);
      expect(items).toHaveLength(3);
      expect(items.map((i) => i.key).sort()).toEqual([...CORE_LEDGER_KEYS].sort());
    }
  });

  test('Day 8+ exposes the full stack', () => {
    expect(ledgerItemsForDay(8)).toHaveLength(LEDGER_ITEMS.length);
    expect(ledgerItemsForDay(40)).toHaveLength(LEDGER_ITEMS.length);
  });
});

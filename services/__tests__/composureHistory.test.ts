// Composure history invariants: local-only persistence, one entry per day
// with replace-on-rerun, and the due-milestone logic that drives the
// dashboard card (only the latest reached milestone; lapsed ones never queue).

jest.mock('../storage', () => {
  const memory = new Map<string, unknown>();
  return {
    LocalStore: {
      getItem: jest.fn(async (key: string) => memory.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: unknown) => {
        memory.set(key, value);
      }),
      __memory: memory,
    },
  };
});

import {
  COMPOSURE_MILESTONES,
  getBaseline,
  getComposureHistory,
  getDueMilestone,
  recordComposure,
  type ComposureMeasurement,
} from '../composureHistory';
import { LocalStore } from '../storage';

const memory: Map<string, unknown> = (LocalStore as any).__memory;

const entry = (day: number, score: number): ComposureMeasurement => ({
  day,
  score,
  measuredAt: '2026-07-12T00:00:00.000Z',
});

beforeEach(() => {
  memory.clear();
  jest.clearAllMocks();
});

describe('recordComposure / getComposureHistory', () => {
  test('empty history before any measurement', async () => {
    expect(await getComposureHistory()).toEqual([]);
  });

  test('records measurements sorted by day regardless of insertion order', async () => {
    await recordComposure(40, 55);
    await recordComposure(0, 41);
    await recordComposure(14, 47);
    const history = await getComposureHistory();
    expect(history.map((m) => m.day)).toEqual([0, 14, 40]);
    expect(history.map((m) => m.score)).toEqual([41, 47, 55]);
  });

  test('re-running a day replaces that entry instead of duplicating it', async () => {
    await recordComposure(14, 44);
    const history = await recordComposure(14, 48);
    expect(history).toHaveLength(1);
    expect(history[0].score).toBe(48);
  });

  test('scores are rounded to integers (whitelist-shaped: int only)', async () => {
    const history = await recordComposure(0, 41.6);
    expect(history[0].score).toBe(42);
  });

  test('corrupt storage degrades to an empty history', async () => {
    memory.set('@composure_history', 'not-an-array');
    expect(await getComposureHistory()).toEqual([]);
  });
});

describe('getBaseline', () => {
  test('finds the day-0 onboarding baseline', () => {
    expect(getBaseline([entry(0, 41), entry(14, 47)])?.score).toBe(41);
  });

  test('null when onboarding never recorded one', () => {
    expect(getBaseline([entry(14, 47)])).toBeNull();
  });
});

describe('getDueMilestone', () => {
  test('milestone schedule is Day 14, 40, 75', () => {
    expect([...COMPOSURE_MILESTONES]).toEqual([14, 40, 75]);
  });

  test('nothing due before Day 14', () => {
    expect(getDueMilestone(1, [entry(0, 41)])).toBeNull();
    expect(getDueMilestone(13, [entry(0, 41)])).toBeNull();
  });

  test('Day 14 becomes due at activeDay 14 and stays due until measured', () => {
    expect(getDueMilestone(14, [entry(0, 41)])).toBe(14);
    expect(getDueMilestone(20, [entry(0, 41)])).toBe(14);
    expect(getDueMilestone(20, [entry(0, 41), entry(14, 47)])).toBeNull();
  });

  test('only the latest reached milestone is offered — a skipped Day 14 lapses at Day 40', () => {
    expect(getDueMilestone(41, [entry(0, 41)])).toBe(40);
    expect(getDueMilestone(41, [entry(0, 41), entry(40, 55)])).toBeNull();
  });

  test('Day 75 due at protocol end, cleared once measured', () => {
    expect(getDueMilestone(75, [entry(0, 41), entry(14, 47), entry(40, 55)])).toBe(75);
    expect(
      getDueMilestone(75, [entry(0, 41), entry(14, 47), entry(40, 55), entry(75, 63)]),
    ).toBeNull();
  });

  test('a re-measurement is due even if the baseline itself is missing', () => {
    // The reading still has value on its own; the result copy handles the
    // no-baseline case rather than the trigger suppressing the milestone.
    expect(getDueMilestone(14, [])).toBe(14);
  });
});

import { describe, expect, it } from 'vitest';
import {
  createRng,
  dailySeed,
  pickSeeded,
  shuffleSeeded,
} from './seededRandom';

describe('seededRandom', () => {
  it('createRng is deterministic for the same seed', () => {
    const a = createRng('test-seed');
    const b = createRng('test-seed');
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('createRng differs for different seeds', () => {
    const a = createRng('seed-a');
    const b = createRng('seed-b');
    expect(a()).not.toBe(b());
  });

  it('shuffleSeeded is deterministic', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const rng1 = createRng('shuffle');
    const rng2 = createRng('shuffle');
    expect(shuffleSeeded(items, rng1)).toEqual(shuffleSeeded(items, rng2));
  });

  it('pickSeeded returns n items', () => {
    const rng = createRng('pick');
    const picked = pickSeeded([10, 20, 30, 40, 50], 3, rng);
    expect(picked).toHaveLength(3);
  });

  it('dailySeed returns YYYY-MM-DD format', () => {
    expect(dailySeed()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

import { describe, expect, it } from 'vitest';
import { createRng } from '../utils/seededRandom';
import { EMOJI_POOL, pickPairs } from './emojis';

describe('pickPairs', () => {
  it('returns n unique emojis', () => {
    const pairs = pickPairs(8, 'random');
    expect(pairs).toHaveLength(8);
    expect(new Set(pairs).size).toBe(8);
  });

  it('filters by animals theme', () => {
    const pairs = pickPairs(5, 'animals');
    const animalSet = new Set(
      EMOJI_POOL.filter((e) => e.category === 'animals').map((e) => e.emoji),
    );
    for (const p of pairs) {
      expect(animalSet.has(p)).toBe(true);
    }
  });

  it('is deterministic with rng', () => {
    const rng = createRng('emoji-test');
    const a = pickPairs(8, 'random', rng);
    const b = pickPairs(8, 'random', createRng('emoji-test'));
    expect(a).toEqual(b);
  });
});

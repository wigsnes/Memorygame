import { describe, expect, it } from 'vitest';
import {
  buildBoard,
  checkVersusWinner,
  getBoardSeed,
  pairsNeededToWin,
  validateBoard,
} from './board';

describe('buildBoard', () => {
  it('creates 16 cards with 8 unique emoji pairs (easy)', () => {
    const cards = buildBoard(8, 'random');
    expect(validateBoard(cards, 8)).toBe(true);
  });

  it('creates 20 cards with 10 pairs (medium)', () => {
    const cards = buildBoard(10, 'animals');
    expect(validateBoard(cards, 10)).toBe(true);
  });

  it('creates 24 cards with 12 pairs (hard)', () => {
    const cards = buildBoard(12, 'food');
    expect(validateBoard(cards, 12)).toBe(true);
  });

  it('daily seed produces identical boards', () => {
    const seed = getBoardSeed('daily', 'easy', 'random');
    expect(seed).toBeDefined();
    const a = buildBoard(8, 'random', seed);
    const b = buildBoard(8, 'random', seed);
    expect(a.map((c) => c.emoji)).toEqual(b.map((c) => c.emoji));
  });

  it('solo mode has no board seed', () => {
    expect(getBoardSeed('solo', 'easy', 'random')).toBeUndefined();
  });

  it('different daily difficulties produce different boards', () => {
    const easy = buildBoard(8, 'random', getBoardSeed('daily', 'easy', 'random'));
    const hard = buildBoard(
      12,
      'random',
      getBoardSeed('daily', 'hard', 'random'),
    );
    expect(easy.length).not.toBe(hard.length);
  });
});

describe('pairsNeededToWin', () => {
  it('requires half pairs rounded up', () => {
    expect(pairsNeededToWin(8)).toBe(4);
    expect(pairsNeededToWin(10)).toBe(5);
    expect(pairsNeededToWin(12)).toBe(6);
  });
});

describe('checkVersusWinner', () => {
  it('returns null when neither player has enough pairs', () => {
    expect(checkVersusWinner(2, 2, 8)).toBeNull();
  });

  it('player 1 wins at threshold', () => {
    expect(checkVersusWinner(4, 2, 8)).toBe(1);
  });

  it('player 2 wins at threshold', () => {
    expect(checkVersusWinner(1, 5, 10)).toBe(2);
  });
});

import { describe, expect, it } from 'vitest';
import { buildBoard, checkVersusWinner } from './board';

export function nextCombo(isMatch: boolean, currentCombo: number): number {
  return isMatch ? currentCombo + 1 : 0;
}

describe('flip logic (board-level)', () => {
  it('finds a matching pair on the board', () => {
    const cards = buildBoard(8, 'random', 'match-test-seed');
    const byEmoji = new Map<string, string[]>();
    for (const c of cards) {
      const list = byEmoji.get(c.emoji) ?? [];
      list.push(c.id);
      byEmoji.set(c.emoji, list);
    }
    const pair = [...byEmoji.values()].find((ids) => ids.length === 2);
    expect(pair).toBeDefined();
    const [id1, id2] = pair!;
    const first = cards.find((c) => c.id === id1)!;
    const second = cards.find((c) => c.id === id2)!;
    expect(first.emoji).toBe(second.emoji);
  });

  it('combo resets on mismatch', () => {
    expect(nextCombo(true, 2)).toBe(3);
    expect(nextCombo(false, 3)).toBe(0);
  });

  it('versus winner triggers at half pairs', () => {
    expect(checkVersusWinner(4, 0, 8)).toBe(1);
    expect(checkVersusWinner(0, 5, 10)).toBe(2);
    expect(checkVersusWinner(3, 3, 8)).toBeNull();
  });
});

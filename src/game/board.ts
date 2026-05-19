import { pickPairs } from '../data/emojis';
import type { CardData, DifficultyId, EmojiTheme, GameMode } from '../types/game';
import { createRng, dailySeed, shuffleSeeded, type Rng } from '../utils/seededRandom';
import { shuffle } from '../utils/shuffle';

export function getBoardSeed(
  mode: GameMode,
  diffId: DifficultyId,
  theme: EmojiTheme,
): string | undefined {
  if (mode === 'daily') return `${dailySeed()}-${diffId}-${theme}`;
  return undefined;
}

export function buildBoard(
  pairCount: number,
  theme: EmojiTheme,
  seed?: string,
): CardData[] {
  const rng: Rng | undefined = seed ? createRng(seed) : undefined;
  const emojis = pickPairs(pairCount, theme, rng);
  const pairs = emojis.flatMap((emoji, i) => [
    { emoji, patternIndex: i * 2 },
    { emoji, patternIndex: i * 2 + 1 },
  ]);
  const shuffled = rng ? shuffleSeeded(pairs, rng) : shuffle(pairs);
  return shuffled.map((card, index) => ({
    id: `card-${index}-${card.emoji}`,
    emoji: card.emoji,
    patternIndex: card.patternIndex % 8,
  }));
}

export function pairsNeededToWin(pairCount: number): number {
  return Math.ceil(pairCount / 2);
}

export function countPairsOnBoard(cards: CardData[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of cards) {
    counts.set(c.emoji, (counts.get(c.emoji) ?? 0) + 1);
  }
  return counts;
}

export function validateBoard(cards: CardData[], pairCount: number): boolean {
  if (cards.length !== pairCount * 2) return false;
  const counts = countPairsOnBoard(cards);
  if (counts.size !== pairCount) return false;
  for (const n of counts.values()) {
    if (n !== 2) return false;
  }
  return true;
}

export function checkVersusWinner(
  player1Pairs: number,
  player2Pairs: number,
  pairCount: number,
): 1 | 2 | null {
  const needed = pairsNeededToWin(pairCount);
  if (player1Pairs >= needed) return 1;
  if (player2Pairs >= needed) return 2;
  return null;
}

import type { EmojiCategory } from './emojis';

const PHRASES: Record<EmojiCategory, string[]> = {
  animals: [
    'Best friends!',
    'Squad goals!',
    'Wild match!',
    'Nature wins!',
  ],
  food: [
    'Dinner time!',
    'Yummy pair!',
    'Chef’s kiss!',
    'Snack attack!',
  ],
  objects: [
    'Perfect pair!',
    'Jackpot!',
    'Nailed it!',
    'Combo unlocked!',
  ],
  faces: [
    'Mood match!',
    'Feeling good!',
    'Happy days!',
    'Vibes aligned!',
  ],
};

export function randomQuip(category: EmojiCategory): string {
  const list = PHRASES[category];
  return list[Math.floor(Math.random() * list.length)];
}

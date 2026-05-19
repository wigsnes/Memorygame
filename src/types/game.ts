export type EmojiTheme = 'random' | 'animals' | 'food' | 'objects' | 'faces';

export type GameMode = 'solo' | 'daily' | 'versus';

export type PlayerId = 1 | 2;

export type DifficultyId = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  pairCount: number;
  cols: number;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  { id: 'easy', label: 'Easy', pairCount: 8, cols: 4 },
  { id: 'medium', label: 'Medium', pairCount: 10, cols: 5 },
  { id: 'hard', label: 'Hard', pairCount: 12, cols: 6 },
];

export interface CardData {
  id: string;
  emoji: string;
  patternIndex: number;
}

export type GamePhase =
  | 'dealing'
  | 'idle'
  | 'oneFlipped'
  | 'checking'
  | 'won';

export interface MatchEvent {
  emoji: string;
  quip: string;
}

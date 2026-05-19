export interface ScoreEntry {
  name: string;
  tries: number;
  pairs: number;
  seconds: number;
  stars: number;
  date: string;
  mode?: string;
  winner?: number;
}

const KEY = 'memory-highscores';
const NAME_KEY = 'memory-player-name';

export function getPlayerName(): string {
  return localStorage.getItem(NAME_KEY) ?? 'Player';
}

export function setPlayerName(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim() || 'Player');
}

export function getHighscores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getPersonalBest(pairs: number): number | null {
  const scores = getHighscores().filter((s) => s.pairs === pairs);
  if (scores.length === 0) return null;
  return Math.min(...scores.map((s) => s.tries));
}

export function addHighscore(entry: ScoreEntry): ScoreEntry[] {
  const next = [...getHighscores(), entry]
    .sort((a, b) => a.tries - b.tries || a.seconds - b.seconds)
    .slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function calcStars(tries: number, pairCount: number): number {
  if (tries <= pairCount + 2) return 3;
  if (tries <= pairCount + 5) return 2;
  return 1;
}

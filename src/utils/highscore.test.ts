import { beforeEach, describe, expect, it } from 'vitest';
import {
  addHighscore,
  calcStars,
  getHighscores,
  getPersonalBest,
  getPlayerName,
  setPlayerName,
  type ScoreEntry,
} from './highscore';

const entry = (tries: number, seconds: number): ScoreEntry => ({
  name: 'Test',
  tries,
  pairs: 8,
  seconds,
  stars: calcStars(tries, 8),
  date: new Date().toISOString(),
});

describe('highscore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calcStars returns 3, 2, or 1 stars', () => {
    expect(calcStars(8, 8)).toBe(3);
    expect(calcStars(10, 8)).toBe(3);
    expect(calcStars(11, 8)).toBe(2);
    expect(calcStars(13, 8)).toBe(2);
    expect(calcStars(14, 8)).toBe(1);
  });

  it('stores and retrieves player name', () => {
    setPlayerName('Alice');
    expect(getPlayerName()).toBe('Alice');
  });

  it('addHighscore sorts by tries ascending', () => {
    addHighscore(entry(12, 60));
    addHighscore(entry(8, 90));
    addHighscore(entry(10, 45));
    const scores = getHighscores();
    expect(scores.map((s) => s.tries)).toEqual([8, 10, 12]);
  });

  it('keeps only top 10 scores', () => {
    for (let i = 1; i <= 12; i++) {
      addHighscore(entry(i, i));
    }
    expect(getHighscores()).toHaveLength(10);
    expect(getHighscores()[0].tries).toBe(1);
  });

  it('getPersonalBest returns lowest tries for pair count', () => {
    addHighscore(entry(10, 30));
    addHighscore(entry(7, 40));
    expect(getPersonalBest(8)).toBe(7);
  });

  it('stores mode and winner on versus entries', () => {
    const versus: ScoreEntry = {
      ...entry(6, 120),
      mode: 'versus',
      winner: 2,
    };
    addHighscore(versus);
    const saved = getHighscores()[0];
    expect(saved.mode).toBe('versus');
    expect(saved.winner).toBe(2);
  });
});

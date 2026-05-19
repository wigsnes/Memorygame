import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkHotStreak,
  checkWinAchievements,
  getUnlocked,
  unlock,
} from './achievements';

describe('achievements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unlock persists to localStorage', () => {
    expect(unlock('speedRun')).toBe(true);
    expect(getUnlocked()).toContain('speedRun');
    expect(unlock('speedRun')).toBe(false);
  });

  it('checkWinAchievements unlocks perfectMind', () => {
    const ids = checkWinAchievements({
      tries: 8,
      pairCount: 8,
      seconds: 120,
      maxCombo: 1,
    });
    expect(ids).toContain('perfectMind');
  });

  it('checkWinAchievements unlocks speedRun under 60s', () => {
    const ids = checkWinAchievements({
      tries: 20,
      pairCount: 8,
      seconds: 45,
      maxCombo: 2,
    });
    expect(ids).toContain('speedRun');
  });

  it('checkHotStreak unlocks at combo 5', () => {
    const ids = checkHotStreak(5);
    expect(ids).toContain('hotStreak');
    expect(getUnlocked()).toContain('hotStreak');
  });
});

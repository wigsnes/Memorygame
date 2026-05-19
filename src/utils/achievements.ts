export type AchievementId = 'perfectMind' | 'speedRun' | 'hotStreak';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  perfectMind: {
    id: 'perfectMind',
    title: 'Perfect Mind',
    description: 'Win with minimum possible tries',
    icon: '🧠',
  },
  speedRun: {
    id: 'speedRun',
    title: 'Speed Run',
    description: 'Win in under 60 seconds',
    icon: '⚡',
  },
  hotStreak: {
    id: 'hotStreak',
    title: 'Hot Streak',
    description: 'Reach a 5+ match combo',
    icon: '🔥',
  },
};

const KEY = 'memory-achievements';

export function getUnlocked(): AchievementId[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AchievementId[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlock(id: AchievementId): boolean {
  const current = getUnlocked();
  if (current.includes(id)) return false;
  localStorage.setItem(KEY, JSON.stringify([...current, id]));
  return true;
}

export interface AchievementCriteria {
  tries: number;
  pairCount: number;
  seconds: number;
  maxCombo: number;
}

export function checkWinAchievements(c: AchievementCriteria): AchievementId[] {
  const newly: AchievementId[] = [];
  if (c.tries === c.pairCount && unlock('perfectMind')) newly.push('perfectMind');
  if (c.seconds < 60 && unlock('speedRun')) newly.push('speedRun');
  if (c.maxCombo >= 5 && unlock('hotStreak')) newly.push('hotStreak');
  return newly;
}

export function checkHotStreak(maxCombo: number): AchievementId[] {
  if (maxCombo >= 5 && unlock('hotStreak')) return ['hotStreak'];
  return [];
}

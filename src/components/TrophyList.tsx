import { ACHIEVEMENTS, getUnlocked, type AchievementId } from '../utils/achievements';

export function TrophyList() {
  const unlocked = getUnlocked();
  const all = Object.keys(ACHIEVEMENTS) as AchievementId[];

  return (
    <section className="trophy-section">
      <h2>Trophies</h2>
      <ul className="trophy-list">
        {all.map((id) => {
          const a = ACHIEVEMENTS[id];
          const has = unlocked.includes(id);
          return (
            <li
              key={id}
              className={`trophy-item ${has ? 'unlocked' : 'locked'}`}
              title={a.description}
            >
              <span className="trophy-icon">{has ? a.icon : '🔒'}</span>
              <span className="trophy-name">{a.title}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

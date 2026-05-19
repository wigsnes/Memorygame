import { motion } from 'framer-motion';
import type { ScoreEntry } from '../utils/highscore';

interface HighscoreTableProps {
  scores: ScoreEntry[];
  highlightIndex?: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export function HighscoreTable({ scores, highlightIndex }: HighscoreTableProps) {
  if (scores.length === 0) {
    return (
      <p className="highscore-empty">No scores yet — be the first champion!</p>
    );
  }

  return (
    <ol className="highscore-list">
      {scores.map((entry, i) => (
        <motion.li
          key={`${entry.date}-${entry.tries}-${i}`}
          className={`highscore-row ${highlightIndex === i ? 'highlight' : ''}`}
          initial={highlightIndex === i ? { scale: 0.95, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="rank">#{i + 1}</span>
          <span className="name">{entry.name}</span>
          <span className="stars" aria-label={`${entry.stars} stars`}>
            {'★'.repeat(entry.stars)}
            {'☆'.repeat(3 - entry.stars)}
          </span>
          <span className="tries">{entry.tries} tries</span>
          <span className="meta">
            {entry.pairs} pairs · {formatTime(entry.seconds)}
            {entry.mode === 'versus' && entry.winner
              ? ` · P${entry.winner} won`
              : ''}
            {entry.mode === 'daily' ? ' · daily' : ''} ·{' '}
            {formatDate(entry.date)}
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

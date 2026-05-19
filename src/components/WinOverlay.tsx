import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { PlayerId } from '../types/game';
import { burstWin } from '../utils/confetti';

interface WinOverlayProps {
  tries: number;
  seconds: number;
  stars: number;
  isNewRecord: boolean;
  versusWinner?: PlayerId | null;
  onPlayAgain: () => void;
}

export function WinOverlay({
  tries,
  seconds,
  stars,
  isNewRecord,
  versusWinner,
  onPlayAgain,
}: WinOverlayProps) {
  useEffect(() => {
    burstWin();
  }, []);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${seconds}s`;

  return (
    <motion.div
      className="win-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <motion.div
        className="win-card"
        initial={{ scale: 0.7, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      >
        {isNewRecord && (
          <motion.p
            className="new-record"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2 }}
          >
            🎉 New personal best!
          </motion.p>
        )}
        <h2 id="win-title">
          {versusWinner ? `Player ${versusWinner} wins!` : 'You did it!'}
        </h2>
        <p className="win-stars" aria-label={`${stars} out of 3 stars`}>
          {'★'.repeat(stars)}
          <span className="dim">{'☆'.repeat(3 - stars)}</span>
        </p>
        <p className="win-stats">
          <strong>{tries}</strong> tries · <strong>{timeStr}</strong>
        </p>
        <motion.button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

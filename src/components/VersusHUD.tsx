import { motion } from 'framer-motion';
import type { PlayerId } from '../types/game';

interface VersusHUDProps {
  currentPlayer: PlayerId;
  player1Pairs: number;
  player2Pairs: number;
  player1Tries: number;
  player2Tries: number;
  pairsToWin: number;
  versusWinner: PlayerId | null;
}

export function VersusHUD({
  currentPlayer,
  player1Pairs,
  player2Pairs,
  player1Tries,
  player2Tries,
  pairsToWin,
  versusWinner,
}: VersusHUDProps) {
  return (
    <div className="versus-hud" role="status" aria-live="polite">
      <motion.div
        className={`versus-player ${currentPlayer === 1 && !versusWinner ? 'active' : ''}`}
        animate={currentPlayer === 1 ? { scale: 1.02 } : { scale: 1 }}
      >
        <span className="versus-label">Player 1</span>
        <span className="versus-score">{player1Pairs} / {pairsToWin}</span>
        <span className="versus-meta">{player1Tries} tries</span>
      </motion.div>
      <span className="versus-vs">VS</span>
      <motion.div
        className={`versus-player ${currentPlayer === 2 && !versusWinner ? 'active' : ''}`}
        animate={currentPlayer === 2 ? { scale: 1.02 } : { scale: 1 }}
      >
        <span className="versus-label">Player 2</span>
        <span className="versus-score">{player2Pairs} / {pairsToWin}</span>
        <span className="versus-meta">{player2Tries} tries</span>
      </motion.div>
      {!versusWinner && (
        <p className="versus-turn">Player {currentPlayer}&apos;s turn</p>
      )}
      {versusWinner && (
        <p className="versus-winner">Player {versusWinner} wins!</p>
      )}
    </div>
  );
}

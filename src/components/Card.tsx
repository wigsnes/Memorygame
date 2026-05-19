import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { CardData } from '../types/game';

interface CardProps {
  card: CardData;
  faceUp: boolean;
  matched: boolean;
  index: number;
  dealStaggerMs: number;
  disabled: boolean;
  focused?: boolean;
  onClick: () => void;
}

export function Card({
  card,
  faceUp,
  matched,
  index,
  dealStaggerMs,
  disabled,
  focused = false,
  onClick,
}: CardProps) {
  const patternClass = `pattern-${card.patternIndex % 8}`;
  const stateClass = [
    faceUp ? 'is-face-up' : '',
    matched ? 'matched' : '',
    disabled ? 'disabled' : '',
    focused ? 'focused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className="card-slot"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: matched ? [1, 1.06, 1] : 1 }}
      transition={
        matched
          ? { duration: 0.35 }
          : { delay: index * 0.04, type: 'spring', stiffness: 260, damping: 18 }
      }
    >
      <button
        type="button"
        className={`card ${stateClass}`}
        style={{ '--stagger': `${index * dealStaggerMs}ms` } as CSSProperties}
        onClick={onClick}
        disabled={disabled}
        tabIndex={focused ? 0 : -1}
        aria-label={
          faceUp
            ? `Card showing ${card.emoji}`
            : `Card ${index + 1}, face down`
        }
      >
        <motion.div
          className="card-inner"
          initial={false}
          animate={{ rotateY: faceUp ? 180 : 0 }}
          transition={{
            duration: 0.55,
            ease: [0.4, 0, 0.2, 1],
            delay: faceUp ? 0 : parseFloat(String(index * dealStaggerMs)) / 1000,
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className={`card-face card-back ${patternClass}`}>
            <span className="card-back-gem" />
          </div>
          <div className="card-face card-front" aria-hidden={!faceUp}>
            <span className="card-emoji">{card.emoji}</span>
          </div>
        </motion.div>
      </button>
    </motion.div>
  );
}

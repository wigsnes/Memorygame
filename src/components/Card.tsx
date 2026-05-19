import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { CardData } from '../types/game';

interface CardProps {
  card: CardData;
  faceUp: boolean;
  matched: boolean;
  index: number;
  dealStaggerMs: number;
  dealReveal: boolean;
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
  dealReveal,
  disabled,
  focused = false,
  onClick,
}: CardProps) {
  const patternClass = `pattern-${card.patternIndex % 8}`;
  const stateClass = [
    faceUp ? 'flipped' : '',
    matched ? 'matched' : '',
    disabled ? 'disabled' : '',
    focused ? 'focused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
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
      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 260,
        damping: 18,
      }}
      whileHover={!disabled && !faceUp ? { y: -6, scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      data-deal={dealReveal ? 'true' : 'false'}
    >
      <motion.div
        className="card-inner"
        animate={matched ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className={`card-face card-back ${patternClass}`}
          aria-hidden={faceUp}
        >
          <span className="card-back-gem" />
        </motion.div>
        <div className="card-face card-front" aria-hidden={!faceUp}>
          <span className="card-emoji">{card.emoji}</span>
        </div>
      </motion.div>
    </motion.button>
  );
}

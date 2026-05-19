import { motion } from 'framer-motion';
import type { CardData } from '../types/game';
import { Card } from './Card';

interface BoardProps {
  cards: CardData[];
  cols: number;
  matchedIds: Set<string>;
  dealReveal: boolean;
  dealStaggerMs: number;
  mismatchShake: boolean;
  phase: string;
  focusedIndex: number;
  isFaceUp: (id: string) => boolean;
  onFlip: (id: string) => void;
}

export function Board({
  cards,
  cols,
  matchedIds,
  dealReveal,
  dealStaggerMs,
  mismatchShake,
  phase,
  focusedIndex,
  isFaceUp,
  onFlip,
}: BoardProps) {
  const locked = phase === 'checking' || phase === 'dealing' || phase === 'won';

  return (
    <motion.div
      className={`board ${mismatchShake ? 'board-shake' : ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      role="grid"
      aria-keyshortcuts="Arrow keys to move, Enter or Space to flip"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03 } },
      }}
    >
      {cards.map((card, index) => {
        const faceUp = isFaceUp(card.id);
        const matched = matchedIds.has(card.id);
        const disabled = locked || matched || faceUp;

        return (
          <Card
            key={card.id}
            card={card}
            faceUp={faceUp}
            matched={matched}
            index={index}
            dealStaggerMs={dealStaggerMs}
            dealReveal={dealReveal}
            disabled={disabled}
            focused={index === focusedIndex}
            onClick={() => onFlip(card.id)}
          />
        );
      })}
    </motion.div>
  );
}

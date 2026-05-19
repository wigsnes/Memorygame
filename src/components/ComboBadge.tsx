import { AnimatePresence, motion } from 'framer-motion';

interface ComboBadgeProps {
  combo: number;
  quip: string | null;
  emoji: string | null;
}

export function ComboBadge({ combo, quip, emoji }: ComboBadgeProps) {
  return (
    <div className="combo-area" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {combo >= 2 && (
          <motion.div
            key={`combo-${combo}`}
            className="combo-badge"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            🔥 Combo ×{combo}!
          </motion.div>
        )}
        {quip && emoji && (
          <motion.div
            key={quip}
            className="match-quip"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="match-quip-emoji">{emoji}</span>
            <span>{quip}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

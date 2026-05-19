import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ACHIEVEMENTS, type AchievementId } from '../utils/achievements';

interface AchievementToastProps {
  queue: AchievementId[];
  onDismiss: (id: AchievementId) => void;
}

function ToastItem({
  id,
  onDismiss,
}: {
  id: AchievementId;
  onDismiss: (id: AchievementId) => void;
}) {
  const a = ACHIEVEMENTS[id];

  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(id), 3000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <motion.div
      className="achievement-toast"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
    >
      <span className="achievement-icon">{a.icon}</span>
      <div>
        <strong>{a.title}</strong>
        <p>{a.description}</p>
      </div>
    </motion.div>
  );
}

export function AchievementToast({ queue, onDismiss }: AchievementToastProps) {
  return (
    <div className="achievement-toasts" aria-live="polite">
      <AnimatePresence>
        {queue.map((id) => (
          <ToastItem key={id} id={id} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

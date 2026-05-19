import { motion } from 'framer-motion';

interface ProgressBarProps {
  matched: number;
  total: number;
}

export function ProgressBar({ matched, total }: ProgressBarProps) {
  const pct = total > 0 ? (matched / total) * 100 : 0;

  return (
    <motion.div
      className="progress-wrap"
      role="progressbar"
      aria-valuenow={matched}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${matched} of ${total} pairs found`}
    >
      <motion.div
        className="progress-fill"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      <span className="progress-label">
        {matched} / {total} pairs
      </span>
    </motion.div>
  );
}

interface PowerUpsProps {
  peekUsed: boolean;
  shuffleUsed: boolean;
  disabled: boolean;
  onPeek: () => void;
  onShuffle: () => void;
}

export function PowerUps({
  peekUsed,
  shuffleUsed,
  disabled,
  onPeek,
  onShuffle,
}: PowerUpsProps) {
  return (
    <div className="power-ups">
      <button
        type="button"
        className="power-up-btn"
        disabled={peekUsed || disabled}
        onClick={onPeek}
        title="Reveal all cards briefly (once per game)"
      >
        👁️ Peek {peekUsed ? '✓' : ''}
      </button>
      <button
        type="button"
        className="power-up-btn"
        disabled={shuffleUsed || disabled}
        onClick={onShuffle}
        title="Shuffle unmatched cards (once per game)"
      >
        🔀 Shuffle {shuffleUsed ? '✓' : ''}
      </button>
    </div>
  );
}

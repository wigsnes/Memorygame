import { useEffect } from 'react';

interface UseKeyboardOptions {
  cols: number;
  cardCount: number;
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onActivate: (index: number) => void;
  disabled: boolean;
}

export function useKeyboard({
  cols,
  cardCount,
  focusedIndex,
  onFocusChange,
  onActivate,
  disabled,
}: UseKeyboardOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const rows = Math.ceil(cardCount / cols);
      let row = Math.floor(focusedIndex / cols);
      let col = focusedIndex % cols;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          col = Math.min(col + 1, cols - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          col = Math.max(col - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          row = Math.min(row + 1, rows - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          row = Math.max(row - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          onFocusChange(0);
          return;
        case 'End':
          e.preventDefault();
          onFocusChange(cardCount - 1);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onActivate(focusedIndex);
          return;
        default:
          return;
      }

      const next = Math.min(row * cols + col, cardCount - 1);
      onFocusChange(next);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cols,
    cardCount,
    focusedIndex,
    onFocusChange,
    onActivate,
    disabled,
  ]);
}

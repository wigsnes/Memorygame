import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  it('moves focus with arrow keys', () => {
    const onFocusChange = vi.fn();
    renderHook(() =>
      useKeyboard({
        cols: 4,
        cardCount: 16,
        focusedIndex: 0,
        onFocusChange,
        onActivate: vi.fn(),
        disabled: false,
      }),
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(onFocusChange).toHaveBeenCalledWith(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(onFocusChange).toHaveBeenCalledWith(4);
  });

  it('activates on Enter', () => {
    const onActivate = vi.fn();
    renderHook(() =>
      useKeyboard({
        cols: 4,
        cardCount: 16,
        focusedIndex: 3,
        onFocusChange: vi.fn(),
        onActivate,
        disabled: false,
      }),
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onActivate).toHaveBeenCalledWith(3);
  });

  it('does nothing when disabled', () => {
    const onFocusChange = vi.fn();
    renderHook(() =>
      useKeyboard({
        cols: 4,
        cardCount: 16,
        focusedIndex: 0,
        onFocusChange,
        onActivate: vi.fn(),
        disabled: true,
      }),
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(onFocusChange).not.toHaveBeenCalled();
  });
});

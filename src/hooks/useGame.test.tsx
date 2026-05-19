import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildBoard } from '../game/board';
import { useGame } from './useGame';

function finishDeal() {
  act(() => {
    vi.runAllTimers();
  });
}

function getMatchingPairIds(cards: ReturnType<typeof buildBoard>) {
  const byEmoji = new Map<string, string[]>();
  for (const c of cards) {
    const list = byEmoji.get(c.emoji) ?? [];
    list.push(c.id);
    byEmoji.set(c.emoji, list);
  }
  const pair = [...byEmoji.values()].find((ids) => ids.length === 2);
  if (!pair) throw new Error('no pair found');
  return pair as [string, string];
}

function getMismatchPairIds(
  cards: ReturnType<typeof buildBoard>,
  matchedIds: Set<string> = new Set(),
) {
  const unmatched = cards.filter((c) => !matchedIds.has(c.id));
  const byEmoji = new Map<string, string>();
  for (const c of unmatched) {
    if (!byEmoji.has(c.emoji)) {
      byEmoji.set(c.emoji, c.id);
    }
  }
  const ids = [...byEmoji.values()];
  if (ids.length < 2) throw new Error('not enough emojis');
  return [ids[0], ids[1]] as [string, string];
}

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with 16 cards on easy difficulty', () => {
    const { result } = renderHook(() => useGame());
    finishDeal();
    expect(result.current.cards).toHaveLength(16);
    expect(result.current.pairCount).toBe(8);
    expect(result.current.phase).toBe('idle');
  });

  it('increments tries after two flips', () => {
    const { result } = renderHook(() => useGame());
    finishDeal();

    const [a, b] = result.current.cards.slice(0, 2);
    act(() => {
      result.current.flipCard(a.id);
    });
    act(() => {
      result.current.flipCard(b.id);
    });

    expect(result.current.tries).toBe(1);
  });

  it('matches pairs and tracks combo', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useGame());

    await waitFor(() => expect(result.current.phase).toBe('idle'), {
      timeout: 3000,
    });

    const [id1, id2] = getMatchingPairIds(result.current.cards);
    act(() => {
      result.current.flipCard(id1);
    });
    act(() => {
      result.current.flipCard(id2);
    });

    await waitFor(
      () => {
        expect(result.current.matchedCount).toBe(1);
        expect(result.current.combo).toBe(1);
      },
      { timeout: 2000 },
    );
    vi.useFakeTimers();
  });

  it('resets combo on mismatch', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useGame());

    await waitFor(() => expect(result.current.phase).toBe('idle'), {
      timeout: 3000,
    });

    const [m1, m2] = getMatchingPairIds(result.current.cards);
    act(() => {
      result.current.flipCard(m1);
    });
    act(() => {
      result.current.flipCard(m2);
    });
    await waitFor(
      () => {
        expect(result.current.combo).toBe(1);
        expect(result.current.phase).toBe('idle');
      },
      { timeout: 2000 },
    );

    const [a, b] = getMismatchPairIds(
      result.current.cards,
      result.current.matchedIds,
    );
    act(() => {
      result.current.flipCard(a);
    });
    act(() => {
      result.current.flipCard(b);
    });
    await waitFor(() => expect(result.current.combo).toBe(0), {
      timeout: 2000,
    });
    vi.useFakeTimers();
  });

  it('daily mode uses deterministic board after new game', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.setGameMode('daily');
    });
    finishDeal();
    const layout = result.current.cards.map((c) => c.emoji);

    act(() => {
      result.current.startNewGame(undefined, undefined, 'daily');
    });
    finishDeal();
    expect(result.current.cards.map((c) => c.emoji)).toEqual(layout);
  });

  it('peek reveals all cards temporarily', () => {
    const { result } = renderHook(() => useGame());
    finishDeal();

    act(() => {
      result.current.usePeek();
    });
    expect(result.current.peekActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(result.current.peekActive).toBe(false);
    expect(result.current.peekUsed).toBe(true);
  });

  it('versus switches player on mismatch', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.setGameMode('versus');
    });

    await waitFor(() => expect(result.current.phase).toBe('idle'), {
      timeout: 3000,
    });

    const [id1, id2] = getMismatchPairIds(result.current.cards);
    act(() => {
      result.current.flipCard(id1);
    });
    act(() => {
      result.current.flipCard(id2);
    });

    await waitFor(() => expect(result.current.currentPlayer).toBe(2), {
      timeout: 2000,
    });
    vi.useFakeTimers();
  });

  it('versus match keeps same player', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.setGameMode('versus');
    });

    await waitFor(() => expect(result.current.phase).toBe('idle'), {
      timeout: 3000,
    });

    const [id1, id2] = getMatchingPairIds(result.current.cards);
    act(() => {
      result.current.flipCard(id1);
    });
    act(() => {
      result.current.flipCard(id2);
    });

    await waitFor(() => expect(result.current.player1Pairs).toBe(1), {
      timeout: 2000,
    });
    expect(result.current.currentPlayer).toBe(1);
    vi.useFakeTimers();
  });
});

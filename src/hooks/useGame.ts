import { useCallback, useEffect, useRef, useState } from 'react';
import { getCategory } from '../data/emojis';
import { randomQuip } from '../data/phrases';
import { buildBoard, getBoardSeed } from '../game/board';
import type {
  DifficultyId,
  EmojiTheme,
  GameMode,
  GamePhase,
  MatchEvent,
  PlayerId,
} from '../types/game';
import { DIFFICULTIES } from '../types/game';
import { burstMatch } from '../utils/confetti';
import { dailySeed } from '../utils/seededRandom';
import { playSound } from '../utils/sounds';
import { shuffle } from '../utils/shuffle';

const MISMATCH_MS = 850;
const DEAL_SHOW_MS = 1400;
const DEAL_STAGGER_MS = 40;
const PEEK_MS = 1200;
const FLASH_MS = 400;

export function useGame() {
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [difficultyId, setDifficultyId] = useState<DifficultyId>('easy');
  const [theme, setTheme] = useState<EmojiTheme>('random');
  const difficulty =
    DIFFICULTIES.find((d) => d.id === difficultyId) ?? DIFFICULTIES[0];

  const [cards, setCards] = useState(() =>
    buildBoard(difficulty.pairCount, theme),
  );
  const [phase, setPhase] = useState<GamePhase>('dealing');
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [tries, setTries] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [won, setWon] = useState(false);
  const [mismatchShake, setMismatchShake] = useState(false);
  const [mismatchFlash, setMismatchFlash] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchEvent | null>(null);
  const [dealReveal, setDealReveal] = useState(true);
  const [peekUsed, setPeekUsed] = useState(false);
  const [shuffleUsed, setShuffleUsed] = useState(false);
  const [peekActive, setPeekActive] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(1);
  const [player1Pairs, setPlayer1Pairs] = useState(0);
  const [player2Pairs, setPlayer2Pairs] = useState(0);
  const [player1Tries, setPlayer1Tries] = useState(0);
  const [player2Tries, setPlayer2Tries] = useState(0);
  const [versusWinner, setVersusWinner] = useState<PlayerId | null>(null);

  const lockRef = useRef(false);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchedCount = matchedIds.size / 2;
  const pairCount = difficulty.pairCount;
  const pairsToWin = Math.ceil(pairCount / 2);
  const isVersus = gameMode === 'versus';
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clearMismatchTimer = useCallback(() => {
    if (mismatchTimer.current) {
      clearTimeout(mismatchTimer.current);
      mismatchTimer.current = null;
    }
  }, []);

  const clearFlashTimer = useCallback(() => {
    if (flashTimer.current) {
      clearTimeout(flashTimer.current);
      flashTimer.current = null;
    }
  }, []);

  const triggerMismatchFeedback = useCallback(() => {
    if (!reducedMotion) {
      setMismatchShake(true);
      setMismatchFlash(true);
      window.setTimeout(() => setMismatchShake(false), 500);
      clearFlashTimer();
      flashTimer.current = setTimeout(() => {
        setMismatchFlash(false);
        flashTimer.current = null;
      }, FLASH_MS);
    }
  }, [clearFlashTimer, reducedMotion]);

  const resetVersus = useCallback(() => {
    setCurrentPlayer(1);
    setPlayer1Pairs(0);
    setPlayer2Pairs(0);
    setPlayer1Tries(0);
    setPlayer2Tries(0);
    setVersusWinner(null);
  }, []);

  const startDealAnimation = useCallback((cardCount: number) => {
    setDealReveal(true);
    playSound('deal');
    window.setTimeout(() => {
      setDealReveal(false);
      window.setTimeout(
        () => setPhase('idle'),
        cardCount * DEAL_STAGGER_MS + 200,
      );
    }, DEAL_SHOW_MS);
  }, []);

  const startNewGame = useCallback(
    (
      diffId?: DifficultyId,
      newTheme?: EmojiTheme,
      newMode?: GameMode,
    ) => {
      clearMismatchTimer();
      clearFlashTimer();
      if (peekTimer.current) clearTimeout(peekTimer.current);
      lockRef.current = false;

      const diff =
        DIFFICULTIES.find((d) => d.id === (diffId ?? difficultyId)) ??
        DIFFICULTIES[0];
      const t = newTheme ?? theme;
      const mode = newMode ?? gameMode;
      if (diffId) setDifficultyId(diffId);
      if (newTheme) setTheme(newTheme);
      if (newMode) setGameMode(newMode);

      const seed = getBoardSeed(mode, diff.id, t);
      setCards(buildBoard(diff.pairCount, t, seed));
      setPhase('dealing');
      setFlippedIds([]);
      setMatchedIds(new Set());
      setTries(0);
      setCombo(0);
      setMaxCombo(0);
      setWon(false);
      setMismatchShake(false);
      setMismatchFlash(false);
      setLastMatch(null);
      setPeekUsed(false);
      setShuffleUsed(false);
      setPeekActive(false);
      resetVersus();
      startDealAnimation(diff.pairCount * 2);
    },
    [
      clearMismatchTimer,
      clearFlashTimer,
      difficultyId,
      theme,
      gameMode,
      resetVersus,
      startDealAnimation,
    ],
  );

  const checkVersusWin = useCallback(
    (p1: number, p2: number): PlayerId | null => {
      if (p1 >= pairsToWin) return 1;
      if (p2 >= pairsToWin) return 2;
      return null;
    },
    [pairsToWin],
  );

  useEffect(() => {
    startDealAnimation(difficulty.pairCount * 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial deal only
  }, []);

  useEffect(() => {
    return () => {
      clearMismatchTimer();
      clearFlashTimer();
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
  }, [clearMismatchTimer, clearFlashTimer]);

  const isFaceUp = useCallback(
    (id: string) => {
      if (dealReveal || peekActive) return true;
      if (matchedIds.has(id)) return true;
      return flippedIds.includes(id);
    },
    [dealReveal, peekActive, flippedIds, matchedIds],
  );

  const usePeek = useCallback(() => {
    if (peekUsed || lockRef.current || phase !== 'idle' || won || peekActive) {
      return;
    }
    lockRef.current = true;
    setPeekUsed(true);
    setPeekActive(true);
    playSound('deal');
    peekTimer.current = setTimeout(() => {
      setPeekActive(false);
      lockRef.current = false;
      peekTimer.current = null;
    }, PEEK_MS);
  }, [peekUsed, phase, won, peekActive]);

  const useShufflePower = useCallback(() => {
    if (shuffleUsed || lockRef.current || phase !== 'idle' || won) return;
    setShuffleUsed(true);
    playSound('deal');

    setCards((prev) => {
      const unmatchedIndices: number[] = [];
      prev.forEach((c, i) => {
        if (!matchedIds.has(c.id)) unmatchedIndices.push(i);
      });
      if (unmatchedIndices.length < 2) return prev;

      const unmatchedCards = unmatchedIndices.map((i) => prev[i]);
      const shuffled = shuffle(unmatchedCards);
      const next = [...prev];
      unmatchedIndices.forEach((idx, i) => {
        next[idx] = { ...shuffled[i], id: `card-${idx}-${shuffled[i].emoji}` };
      });
      return next;
    });
  }, [shuffleUsed, phase, won, matchedIds]);

  const flipCard = useCallback(
    (id: string) => {
      if (
        lockRef.current ||
        phase === 'dealing' ||
        phase === 'won' ||
        won ||
        peekActive ||
        versusWinner
      ) {
        return;
      }
      if (matchedIds.has(id) || flippedIds.includes(id)) return;

      const card = cards.find((c) => c.id === id);
      if (!card) return;

      playSound('flip');

      if (flippedIds.length === 0) {
        setFlippedIds([id]);
        setPhase('oneFlipped');
        return;
      }

      if (flippedIds.length === 1) {
        const firstId = flippedIds[0];
        const first = cards.find((c) => c.id === firstId);
        if (!first) return;

        lockRef.current = true;
        setFlippedIds([firstId, id]);
        if (!isVersus) {
          setTries((t) => t + 1);
        } else if (currentPlayer === 1) {
          setPlayer1Tries((t) => t + 1);
        } else {
          setPlayer2Tries((t) => t + 1);
        }
        setPhase('checking');

        if (first.emoji === card.emoji) {
          const nextMatched = new Set(matchedIds);
          nextMatched.add(firstId);
          nextMatched.add(id);
          setMatchedIds(nextMatched);
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          setMaxCombo((m) => Math.max(m, nextCombo));
          setLastMatch({
            emoji: card.emoji,
            quip: randomQuip(getCategory(card.emoji)),
          });
          playSound('match');
          burstMatch();

          let p1 = player1Pairs;
          let p2 = player2Pairs;
          if (isVersus) {
            if (currentPlayer === 1) {
              p1 += 1;
              setPlayer1Pairs(p1);
            } else {
              p2 += 1;
              setPlayer2Pairs(p2);
            }
          }

          const totalMatched = nextMatched.size / 2;
          window.setTimeout(() => {
            setFlippedIds([]);
            setPhase('idle');
            lockRef.current = false;

            if (isVersus) {
              const winner = checkVersusWin(p1, p2);
              if (winner) {
                setVersusWinner(winner);
                setWon(true);
                setPhase('won');
                playSound('win');
                return;
              }
            }

            if (totalMatched >= pairCount) {
              setWon(true);
              setPhase('won');
              playSound('win');
            }
          }, 500);
        } else {
          setCombo(0);
          playSound('miss');
          triggerMismatchFeedback();

          mismatchTimer.current = setTimeout(() => {
            setFlippedIds([]);
            setPhase('idle');
            lockRef.current = false;
            if (isVersus) {
              setCurrentPlayer((p) => (p === 1 ? 2 : 1));
            }
            mismatchTimer.current = null;
          }, MISMATCH_MS);
        }
      }
    },
    [
      cards,
      flippedIds,
      matchedIds,
      pairCount,
      phase,
      won,
      peekActive,
      versusWinner,
      combo,
      isVersus,
      currentPlayer,
      player1Pairs,
      player2Pairs,
      checkVersusWin,
      triggerMismatchFeedback,
    ],
  );

  return {
    cards,
    cols: difficulty.cols,
    difficulty,
    difficultyId,
    theme,
    gameMode,
    dailyDate: dailySeed(),
    phase,
    tries,
    combo,
    maxCombo,
    won,
    matchedCount,
    pairCount,
    pairsToWin,
    matchedIds,
    mismatchShake,
    mismatchFlash,
    lastMatch,
    dealReveal,
    dealStaggerMs: DEAL_STAGGER_MS,
    peekUsed,
    shuffleUsed,
    peekActive,
    currentPlayer,
    player1Pairs,
    player2Pairs,
    player1Tries,
    player2Tries,
    versusWinner,
    isVersus,
    isFaceUp,
    flipCard,
    usePeek,
    useShufflePower,
    startNewGame,
    setDifficultyId,
    setTheme,
    setGameMode: (mode: GameMode) => startNewGame(undefined, undefined, mode),
  };
}

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AchievementToast } from './components/AchievementToast';
import { Board } from './components/Board';
import { ComboBadge } from './components/ComboBadge';
import { HighscoreTable } from './components/HighscoreTable';
import { PowerUps } from './components/PowerUps';
import { ProgressBar } from './components/ProgressBar';
import { TrophyList } from './components/TrophyList';
import { VersusHUD } from './components/VersusHUD';
import { WinOverlay } from './components/WinOverlay';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { useTimer } from './hooks/useTimer';
import type { DifficultyId, EmojiTheme, GameMode } from './types/game';
import { DIFFICULTIES } from './types/game';
import {
  checkHotStreak,
  checkWinAchievements,
  type AchievementId,
} from './utils/achievements';
import {
  addHighscore,
  calcStars,
  getHighscores,
  getPersonalBest,
  getPlayerName,
  setPlayerName,
  type ScoreEntry,
} from './utils/highscore';
import {
  isMusicEnabled,
  setMusicEnabled,
  startMusic,
  stopMusic,
} from './utils/music';
import { isMuted, setMuted } from './utils/sounds';

const THEMES: { id: EmojiTheme; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'animals', label: 'Animals' },
  { id: 'food', label: 'Food' },
  { id: 'objects', label: 'Objects' },
  { id: 'faces', label: 'Faces' },
];

const MODES: { id: GameMode; label: string }[] = [
  { id: 'solo', label: 'Solo' },
  { id: 'daily', label: 'Daily' },
  { id: 'versus', label: 'Versus' },
];

function App() {
  const game = useGame();
  const [scores, setScores] = useState<ScoreEntry[]>(() => getHighscores());
  const [playerName, setPlayerNameState] = useState(getPlayerName);
  const [muted, setMutedState] = useState(isMuted);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);
  const [highlightIndex, setHighlightIndex] = useState<number | undefined>();
  const [savedWin, setSavedWin] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [achievementQueue, setAchievementQueue] = useState<AchievementId[]>([]);
  const [musicStarted, setMusicStarted] = useState(false);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) {
      setMuted(true);
      setMutedState(true);
      setMusicEnabled(false);
      setMusicOn(false);
    }
  }, [reducedMotion]);

  useEffect(() => () => stopMusic(), []);

  const enqueueAchievements = useCallback((ids: AchievementId[]) => {
    if (ids.length === 0) return;
    setAchievementQueue((q) => [...q, ...ids.filter((id) => !q.includes(id))]);
  }, []);

  const dismissAchievement = useCallback((id: AchievementId) => {
    setAchievementQueue((q) => q.filter((x) => x !== id));
  }, []);

  const tryStartMusic = useCallback(() => {
    if (!musicOn || musicStarted) return;
    startMusic();
    setMusicStarted(true);
  }, [musicOn, musicStarted]);

  const timerActive =
    game.phase !== 'dealing' &&
    !game.won &&
    (game.tries > 0 ||
      game.player1Tries > 0 ||
      game.phase === 'oneFlipped');
  const timerPaused = game.phase === 'checking' || game.won;
  const { seconds, reset: resetTimer } = useTimer(timerActive, timerPaused);

  const displayTries = game.isVersus
    ? game.player1Tries + game.player2Tries
    : game.tries;

  const stars = useMemo(
    () => calcStars(displayTries, game.pairCount),
    [displayTries, game.pairCount],
  );

  const personalBest = useMemo(
    () => getPersonalBest(game.pairCount),
    [game.pairCount, game.won, scores],
  );

  const isNewRecord =
    game.won &&
    !game.isVersus &&
    displayTries > 0 &&
    (personalBest === null || displayTries < personalBest);

  useEffect(() => {
    const unlocked = checkHotStreak(game.maxCombo);
    enqueueAchievements(unlocked);
  }, [game.maxCombo, enqueueAchievements]);

  useEffect(() => {
    if (!game.won || savedWin) return;

    const winAchievements = checkWinAchievements({
      tries: displayTries,
      pairCount: game.pairCount,
      seconds,
      maxCombo: game.maxCombo,
    });
    enqueueAchievements(winAchievements);

    const entry: ScoreEntry = {
      name: playerName,
      tries: displayTries,
      pairs: game.pairCount,
      seconds,
      stars,
      date: new Date().toISOString(),
      mode: game.gameMode,
      winner: game.versusWinner ?? undefined,
    };
    const updated = addHighscore(entry);
    setScores(updated);
    const idx = updated.findIndex(
      (s) => s.date === entry.date && s.tries === entry.tries,
    );
    setHighlightIndex(idx >= 0 ? idx : undefined);
    setSavedWin(true);
  }, [
    game.won,
    displayTries,
    game.pairCount,
    game.maxCombo,
    game.gameMode,
    game.versusWinner,
    playerName,
    seconds,
    stars,
    savedWin,
    enqueueAchievements,
  ]);

  const handleNewGame = useCallback(() => {
    setSavedWin(false);
    setHighlightIndex(undefined);
    setFocusedIndex(0);
    resetTimer();
    tryStartMusic();
    game.startNewGame();
  }, [game, resetTimer, tryStartMusic]);

  const handleDifficulty = (id: DifficultyId) => {
    setSavedWin(false);
    setHighlightIndex(undefined);
    setFocusedIndex(0);
    resetTimer();
    tryStartMusic();
    game.startNewGame(id, game.theme, game.gameMode);
  };

  const handleTheme = (t: EmojiTheme) => {
    setSavedWin(false);
    setHighlightIndex(undefined);
    setFocusedIndex(0);
    resetTimer();
    tryStartMusic();
    game.startNewGame(game.difficultyId, t, game.gameMode);
  };

  const handleMode = (mode: GameMode) => {
    setSavedWin(false);
    setHighlightIndex(undefined);
    setFocusedIndex(0);
    resetTimer();
    tryStartMusic();
    game.startNewGame(game.difficultyId, game.theme, mode);
  };

  const handleNameBlur = (name: string) => {
    setPlayerName(name);
    setPlayerNameState(getPlayerName());
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicEnabled(next);
    setMusicOn(next);
    if (next) {
      tryStartMusic();
    } else {
      stopMusic();
      setMusicStarted(false);
    }
  };

  const handleFlip = (index: number) => {
    tryStartMusic();
    const card = game.cards[index];
    if (card) game.flipCard(card.id);
  };

  const keyboardDisabled =
    game.phase === 'dealing' || game.won || game.peekActive;

  useKeyboard({
    cols: game.cols,
    cardCount: game.cards.length,
    focusedIndex,
    onFocusChange: setFocusedIndex,
    onActivate: handleFlip,
    disabled: keyboardDisabled,
  });

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  };

  const appClass = [
    'app',
    game.mismatchFlash && !reducedMotion ? 'mismatch-flash' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const powerUpsDisabled =
    game.phase !== 'idle' || game.won || game.peekActive || game.isVersus;

  return (
    <motion.div className={appClass}>
      <AchievementToast queue={achievementQueue} onDismiss={dismissAchievement} />

      <motion.div
        className="blob blob-a"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob blob-b"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <header className="header">
        <h1 className="title">Memory Match</h1>
        <p className="subtitle">
          {game.gameMode === 'daily' ? (
            <>
              <span className="daily-badge">Daily</span> {game.dailyDate} — same
              board for everyone
            </>
          ) : (
            'Find every emoji pair'
          )}
        </p>
      </header>

      <div className="controls">
        <label className="control">
          <span>Mode</span>
          <select
            value={game.gameMode}
            onChange={(e) => handleMode(e.target.value as GameMode)}
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="control">
          <span>Name</span>
          <input
            type="text"
            defaultValue={playerName}
            maxLength={16}
            onBlur={(e) => handleNameBlur(e.target.value)}
            className="input-name"
          />
        </label>
        <label className="control">
          <span>Difficulty</span>
          <select
            value={game.difficultyId}
            onChange={(e) => handleDifficulty(e.target.value as DifficultyId)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.pairCount} pairs)
              </option>
            ))}
          </select>
        </label>
        <label className="control">
          <span>Theme</span>
          <select
            value={game.theme}
            onChange={(e) => handleTheme(e.target.value as EmojiTheme)}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-icon"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={toggleMusic}
          aria-label={musicOn ? 'Turn off music' : 'Turn on music'}
        >
          {musicOn ? '🎵' : '🎶'}
        </button>
        <button type="button" className="btn-secondary" onClick={handleNewGame}>
          New game
        </button>
      </div>

      {game.isVersus ? (
        <VersusHUD
          currentPlayer={game.currentPlayer}
          player1Pairs={game.player1Pairs}
          player2Pairs={game.player2Pairs}
          player1Tries={game.player1Tries}
          player2Tries={game.player2Tries}
          pairsToWin={game.pairsToWin}
          versusWinner={game.versusWinner}
        />
      ) : (
        <div className="hud">
          <motion.div
            className="hud-stat"
            key={game.tries}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            <span className="hud-label">Tries</span>
            <span className="hud-value">{game.tries}</span>
          </motion.div>
          <div className="hud-stat">
            <span className="hud-label">Time</span>
            <span className="hud-value">{formatTime(seconds)}</span>
          </div>
          {personalBest !== null && (
            <motion.div
              className="hud-stat hud-best"
              animate={isNewRecord ? { scale: [1, 1.15, 1] } : {}}
            >
              <span className="hud-label">Best</span>
              <span className="hud-value">{personalBest}</span>
            </motion.div>
          )}
        </div>
      )}

      {!game.isVersus && (
        <PowerUps
          peekUsed={game.peekUsed}
          shuffleUsed={game.shuffleUsed}
          disabled={powerUpsDisabled}
          onPeek={game.usePeek}
          onShuffle={game.useShufflePower}
        />
      )}

      <ProgressBar matched={game.matchedCount} total={game.pairCount} />

      <ComboBadge
        combo={game.combo}
        quip={game.lastMatch?.quip ?? null}
        emoji={game.lastMatch?.emoji ?? null}
      />

      <Board
        cards={game.cards}
        cols={game.cols}
        matchedIds={game.matchedIds}
        dealReveal={game.dealReveal}
        dealStaggerMs={game.dealStaggerMs}
        mismatchShake={game.mismatchShake}
        phase={game.phase}
        focusedIndex={focusedIndex}
        isFaceUp={game.isFaceUp}
        onFlip={(id) => {
          tryStartMusic();
          game.flipCard(id);
        }}
      />

      {game.won && (
        <WinOverlay
          tries={displayTries}
          seconds={seconds}
          stars={stars}
          isNewRecord={isNewRecord}
          versusWinner={game.versusWinner}
          onPlayAgain={handleNewGame}
        />
      )}

      <section className="highscore-section">
        <h2>Top 10 Highscores</h2>
        <HighscoreTable scores={scores} highlightIndex={highlightIndex} />
      </section>

      <TrophyList />
    </motion.div>
  );
}

export default App;

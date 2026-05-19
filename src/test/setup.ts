import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

vi.mock('../utils/confetti', () => ({
  burstMatch: vi.fn(),
  burstWin: vi.fn(),
}));

vi.mock('../utils/sounds', () => ({
  playSound: vi.fn(),
  setMuted: vi.fn(),
  isMuted: vi.fn(() => false),
}));

vi.mock('../utils/music', () => ({
  startMusic: vi.fn(),
  stopMusic: vi.fn(),
  setMusicEnabled: vi.fn(),
  isMusicEnabled: vi.fn(() => true),
  duckMusic: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

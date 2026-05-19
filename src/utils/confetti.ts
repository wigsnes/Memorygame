import confetti from 'canvas-confetti';

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function burstMatch(): void {
  if (reducedMotion) return;
  void confetti({
    particleCount: 28,
    spread: 55,
    startVelocity: 22,
    origin: { y: 0.55 },
    ticks: 80,
    scalar: 0.85,
  });
}

export function burstWin(): void {
  if (reducedMotion) return;

  const duration = 2800;
  const end = Date.now() + duration;

  const frame = () => {
    void confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'],
    });
    void confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'],
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  setTimeout(() => {
    void confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
    });
  }, 400);
}

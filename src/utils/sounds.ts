import { duckMusic } from './music';

type SoundId = 'flip' | 'match' | 'miss' | 'win' | 'deal';

let muted = false;
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
): void {
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export function playSound(id: SoundId): void {
  duckMusic();
  switch (id) {
    case 'flip':
      tone(520, 0.06, 'triangle', 0.05);
      break;
    case 'match':
      tone(440, 0.08, 'sine', 0.07);
      setTimeout(() => tone(660, 0.1, 'sine', 0.07), 80);
      setTimeout(() => tone(880, 0.12, 'sine', 0.06), 160);
      break;
    case 'miss':
      tone(180, 0.15, 'sawtooth', 0.04);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.2, 'sine', 0.08), i * 120);
      });
      break;
    case 'deal':
      tone(380, 0.05, 'triangle', 0.04);
      break;
  }
}

let musicEnabled = true;
let playing = false;
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let step = 0;

const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

function getCtx(): AudioContext | null {
  if (!musicEnabled) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.03;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function playNote(freq: number, duration: number, gain = 0.15): void {
  const audio = getCtx();
  if (!audio || !masterGain) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

function tickArpeggio(): void {
  const note = NOTES[step % NOTES.length];
  playNote(note, 0.35, 0.12);
  if (step % 4 === 0) playNote(note / 2, 0.5, 0.06);
  step += 1;
}

export function isMusicEnabled(): boolean {
  return musicEnabled;
}

export function setMusicEnabled(value: boolean): void {
  musicEnabled = value;
  if (!value) stopMusic();
}

export function startMusic(): void {
  if (!musicEnabled || playing) return;
  const audio = getCtx();
  if (!audio) return;
  playing = true;
  step = 0;
  tickArpeggio();
  intervalId = setInterval(tickArpeggio, 480);
}

export function stopMusic(): void {
  playing = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function duckMusic(): void {
  if (!masterGain || !ctx) return;
  const now = ctx.currentTime;
  masterGain.gain.setValueAtTime(0.015, now);
  masterGain.gain.linearRampToValueAtTime(0.03, now + 0.3);
}

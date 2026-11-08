/**
 * src/lib/sound.js
 * Minimal sound effects using the Web Audio API (no external files needed).
 * Respects system prefers-reduced-motion and user toggle.
 */

import { state } from './state.js';

let _ctx = null;
let _muted = false;

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _ctx;
}

function playTone(freq, duration = 0.15, type = 'sine', gain = 0.3) {
  if (_muted) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Autoplay policy — ignore
  }
}

export const sounds = {
  flip() { playTone(440, 0.1, 'sine'); },
  done() { playTone(660, 0.2, 'triangle'); setTimeout(() => playTone(880, 0.15, 'triangle'), 100); },
  skip() { playTone(330, 0.1, 'sawtooth', 0.15); },
  veto() { playTone(220, 0.3, 'square', 0.2); },
  reveal() { [440, 550, 660].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine'), i * 80)); },
  confetti() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 'triangle'), i * 60)); },
};

export function initSound() {
  _muted = !state.get('sound');
  updateSoundBtn();

  const btn = document.getElementById('sound-toggle');
  btn?.addEventListener('click', () => {
    _muted = !_muted;
    state.set('sound', !_muted);
    updateSoundBtn();
  });
}

export function updateSoundBtn() {
  const btn = document.getElementById('sound-toggle');
  if (btn) btn.textContent = _muted ? '🔇' : '🔊';
}

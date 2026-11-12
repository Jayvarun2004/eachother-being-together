/**
 * src/lib/sound.js
 * Minimal sound effects + Ambient Soundscapes + Speech Reader using Web Audio & Web Speech APIs.
 */

import { state } from './state.js';

let _ctx = null;
let _muted = true;
let _ambientSource = null;
let _ambientType = 'off'; // 'off' | 'rain' | 'fireplace'

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
    // Autoplay policy
  }
}

export const sounds = {
  flip() {
    // Crisp Apple-like haptic paper click + subtle harmonic chime
    playTone(1200, 0.03, 'sine', 0.15);
    setTimeout(() => playTone(880, 0.06, 'triangle', 0.1), 20);
  },
  done() {
    // Romantic warm two-tone chime
    playTone(587, 0.12, 'sine', 0.2);
    setTimeout(() => playTone(880, 0.18, 'sine', 0.25), 80);
  },
  skip() {
    playTone(330, 0.1, 'sawtooth', 0.15);
  },
  veto() {
    playTone(220, 0.3, 'square', 0.2);
  },
  reveal() {
    [440, 550, 660].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine'), i * 80));
  },
  confetti() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.12, 'triangle'), i * 60)
    );
  },
};

/**
 * Text-to-speech for cards
 */
export function speakCardText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

/**
 * Toggle cozy ambient soundscapes (Rain / Waves)
 */
export function getAmbientStatus() {
  return _ambientType;
}

export function toggleAmbientSound() {
  const ctx = getCtx();
  if (!ctx) return 'off';

  if (_ambientSource) {
    try {
      _ambientSource.stop();
      _ambientSource.disconnect();
    } catch {
      /* ignore */
    }
    _ambientSource = null;
    _ambientType = 'off';
    return 'off';
  }

  // Generate 5-second seamless soft pink noise loop for cozy rain/waves
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    data[i] = (b0 + b1 + b2 + white * 0.1) * 0.06;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Filter to warm low frequencies
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  _ambientSource = noise;
  _ambientType = 'rain';
  return 'rain';
}

export function initSound() {
  // Start muted; restore only if the user previously enabled sound
  const savedSound = state.get('sound');
  _muted = savedSound !== true;
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

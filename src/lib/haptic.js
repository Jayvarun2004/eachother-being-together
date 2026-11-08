/**
 * haptic.js — Haptic feedback library for mobile devices.
 * Wraps navigator.vibrate() with named patterns.
 * Silently fails on desktop or unsupported browsers.
 */

/** @type {Record<string, number[]>} */
const PATTERNS = {
  tap:     [15],
  success: [30, 20, 60],
  skip:    [10, 15, 10],
  veto:    [80],
  flip:    [20],
  win:     [50, 30, 50, 30, 100],
};

/**
 * Trigger a named vibration pattern (or a custom ms array).
 * @param {'tap'|'success'|'skip'|'veto'|'flip'|'win'|number[]} pattern
 */
export function vibrate(pattern = 'tap') {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }
    const sequence = Array.isArray(pattern)
      ? pattern
      : (PATTERNS[pattern] ?? PATTERNS.tap);
    navigator.vibrate(sequence);
  } catch (_err) {
    // Silently swallow — vibration is a progressive enhancement only.
  }
}

/** Shorthand: single soft tap */
export function tap() {
  vibrate('tap');
}

/** Shorthand: success burst */
export function success() {
  vibrate('success');
}

/** Shorthand: skip nudge */
export function skip() {
  vibrate('skip');
}

/** Shorthand: veto thud */
export function veto() {
  vibrate('veto');
}

/** Shorthand: card flip tick */
export function flip() {
  vibrate('flip');
}

/** Shorthand: win celebration */
export function win() {
  vibrate('win');
}

/** Default export — convenience object with all named patterns as methods */
const haptic = { tap, success, skip, veto, flip, win, vibrate };

export default haptic;

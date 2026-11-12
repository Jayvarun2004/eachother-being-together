/**
 * src/lib/theme.js
 * Multi-theme switcher for romantic couple moods:
 * - light (Classic Rose)
 * - dark (Deep Violet)
 * - midnight (Midnight Velvet & Gold)
 * - sunset (Sunset Romance)
 * - candlelight (Warm Amber Glow)
 */

import { state } from './state.js';

export const THEMES = [
  { id: 'light', name: 'Classic Rose', icon: '🌸' },
  { id: 'dark', name: 'Deep Violet', icon: '🌙' },
  { id: 'midnight', name: 'Midnight Velvet', icon: '🍷' },
  { id: 'sunset', name: 'Sunset Romance', icon: '🌅' },
  { id: 'candlelight', name: 'Candlelight', icon: '🕯️' },
];

export function initTheme() {
  applyTheme(state.get('theme') ?? 'light');
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.set('theme', theme);
}

export function cycleTheme() {
  const current = state.get('theme') ?? 'light';
  const idx = THEMES.findIndex((t) => t.id === current);
  const next = THEMES[(idx + 1) % THEMES.length];
  applyTheme(next.id);
  return next;
}

export function getCurrentThemeObj() {
  const current = state.get('theme') ?? 'light';
  return THEMES.find((t) => t.id === current) || THEMES[0];
}

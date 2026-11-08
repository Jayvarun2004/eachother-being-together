/**
 * src/lib/theme.js
 * Dark / light theme toggle — reads from state, applies to <html> element.
 */

import { state } from './state.js';

export function initTheme() {
  applyTheme(state.get('theme') ?? 'light');
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.set('theme', theme);
}

export function toggleTheme() {
  const current = state.get('theme') ?? 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
  return state.get('theme');
}

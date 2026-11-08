/**
 * src/main.js
 * App entry point. Initialises the router and renders the first view.
 */

import { router } from './lib/router.js';
import { initTheme } from './lib/theme.js';
import { initSound } from './lib/sound.js';
import { initI18n } from './lib/i18n.js';

// Boot
async function boot() {
  // Load translations first
  await initI18n('en');

  // Apply saved theme
  initTheme();

  // Wire up sound toggle button
  initSound();

  // Start router (renders correct view based on URL hash)
  router.init();
}

boot().catch(console.error);

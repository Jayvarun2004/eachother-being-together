/**
 * src/main.js
 * App entry point. Initialises the router and renders the first view.
 */

import { router } from './lib/router.js';
import { initTheme } from './lib/theme.js';
import { initSound } from './lib/sound.js';
import { initI18n } from './lib/i18n.js';
import { toast } from './lib/toast.js';
import { hasPasscode, isUnlockedThisSession } from './lib/passcode.js';
import { renderPasscodeScreen } from './views/passcode.js';

function showBootError() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
      height:100vh;padding:2rem;text-align:center;gap:1.5rem;">
      <div style="font-size:3rem;">💔</div>
      <h1 style="font-size:1.25rem;font-weight:700;color:var(--text-primary,#fff);">
        Something went wrong
      </h1>
      <p style="font-size:0.9rem;color:var(--text-muted,#aaa);max-width:280px;">
        The app couldn't start. Check your connection and try again.
      </p>
      <button onclick="window.location.reload()"
        style="padding:0.75rem 2rem;border-radius:999px;border:none;cursor:pointer;
          background:#c4556a;color:#fff;font-size:1rem;font-weight:600;">
        🔄 Retry
      </button>
    </div>
  `;
}

// Boot
async function boot() {
  // Load translations first
  await initI18n('en');

  // Apply saved theme
  initTheme();

  // Wire up sound toggle button
  initSound();

  // Check passcode lock
  if (hasPasscode() && !isUnlockedThisSession()) {
    renderPasscodeScreen(() => {
      router.init();
    });
  } else {
    // Start router (renders correct view based on URL hash)
    router.init();
  }
}

// 10-second splash timeout — if still showing splash, something stalled
const splashTimeout = setTimeout(() => {
  const splash = document.querySelector('.splash-screen');
  if (splash && document.getElementById('app')?.contains(splash)) {
    showBootError();
  }
}, 10000);

boot()
  .then(() => {
    clearTimeout(splashTimeout);
  })
  .catch((err) => {
    clearTimeout(splashTimeout);
    console.error('Boot failed:', err);
    showBootError();
  });

// Register SW in production only
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Store beforeinstallprompt for the PWA install banner
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window._deferredInstallPrompt = e;
});

// Global offline/online indicators
window.addEventListener('offline', () =>
  toast('⚠️ You\'re offline. Local play still works!', 'warning', 4000)
);
window.addEventListener('online', () => toast('✅ Back online!', 'success', 2000));

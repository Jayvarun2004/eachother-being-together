/**
 * src/views/setup.js
 * Player name input + age gate for Spicy level.
 * Saves to state and navigates to the game.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { toast } from '../lib/toast.js';

export function renderSetup() {
  const app = document.getElementById('app');
  const game = state.get('game') ?? 'truth-or-dare';
  const level = state.get('level') ?? 'wholesome';
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';

  const gameEmojis = { 'truth-or-dare': '🎲', 'never-have-i-ever': '🙋', 'would-you-rather': '🤔' };

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-setup">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
        <span class="header-logo">${gameEmojis[game] ?? '🎮'}</span>
        <div style="width:44px"></div>
      </header>

      <h2 class="player-setup-title">${t('players.title')}</h2>

      <div class="player-input-group">
        <div class="player-input-wrapper">
          <label for="setup-p1">${t('players.player1Label')}</label>
          <input id="setup-p1" type="text" value="${escHtml(p1)}"
            placeholder="${t('players.player1Default')}" maxlength="20" autocomplete="off" />
          <span class="player-emoji" aria-hidden="true">💗</span>
        </div>
        <div class="player-input-wrapper">
          <label for="setup-p2">${t('players.player2Label')}</label>
          <input id="setup-p2" type="text" value="${escHtml(p2)}"
            placeholder="${t('players.player2Default')}" maxlength="20" autocomplete="off" />
          <span class="player-emoji" aria-hidden="true">💙</span>
        </div>
      </div>

      <!-- Age gate — only shown for Spicy level -->
      <div class="age-gate ${level === 'spicy' ? 'visible' : ''}" id="age-gate" aria-live="polite">
        <p class="age-gate-title">${t('ageGate.title')}</p>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:.75rem">
          ${t('ageGate.warning')}
        </p>
        <label>
          <input type="checkbox" id="age-p1" aria-required="true" />
          <span id="age-p1-label">${t('ageGate.p1Check', { name: p1 })}</span>
        </label>
        <label>
          <input type="checkbox" id="age-p2" aria-required="true" />
          <span id="age-p2-label">${t('ageGate.p2Check', { name: p2 })}</span>
        </label>
      </div>

      <button class="btn btn-primary mt-6" id="btn-start">${t('players.btnStart')}</button>
    </div>
  `;

  // Back
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));

  // Live-update age gate labels when names change
  function updateAgeLabels() {
    const n1 = document.getElementById('setup-p1')?.value || 'Player 1';
    const n2 = document.getElementById('setup-p2')?.value || 'Player 2';
    const lbl1 = document.getElementById('age-p1-label');
    const lbl2 = document.getElementById('age-p2-label');
    if (lbl1) lbl1.textContent = t('ageGate.p1Check', { name: n1 });
    if (lbl2) lbl2.textContent = t('ageGate.p2Check', { name: n2 });
  }

  document.getElementById('setup-p1')?.addEventListener('input', e => {
    state.set('player1', e.target.value || 'Player 1');
    updateAgeLabels();
  });
  document.getElementById('setup-p2')?.addEventListener('input', e => {
    state.set('player2', e.target.value || 'Player 2');
    updateAgeLabels();
  });

  // Start game
  document.getElementById('btn-start')?.addEventListener('click', () => {
    // Validate spicy age gate
    if (level === 'spicy') {
      const p1ok = document.getElementById('age-p1')?.checked;
      const p2ok = document.getElementById('age-p2')?.checked;
      if (!p1ok || !p2ok) {
        toast('Both players must confirm they are 18+ for Spicy mode 🔞', 'warning');
        return;
      }
      state.set('spicyConfirmed', [true, true]);
    }

    // Reset session counters
    state.patch({
      currentTurn: 0,
      scores: [0, 0],
      skipsLeft: [3, 3],
      vetosLeft: [1, 1],
      cardsPlayed: 0,
      skipsUsed: [0, 0],
      vetosUsed: [0, 0],
      nhieCommonCount: 0,
      wyrMatchCount: 0,
      wyrTotalCount: 0,
    });

    navigate(`game/${game}`);
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

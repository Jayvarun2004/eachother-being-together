/**
 * src/views/home.js
 * Home screen — game picker, settings, level selector, play buttons.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { toggleTheme } from '../lib/theme.js';
import { toast } from '../lib/toast.js';

export function renderHome() {
  const app = document.getElementById('app');

  const level = state.get('level') ?? 'wholesome';
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';

  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-home">
      <header class="app-header">
        <span class="header-logo">💕 EBT</span>
        <div class="header-actions">
          <button class="btn-icon" id="btn-theme" aria-label="Toggle theme" title="Toggle theme">🌙</button>
        </div>
      </header>

      <h1 class="home-title">${t('home.title')}</h1>
      <p class="home-subtitle">${t('home.subtitle')}</p>

      <!-- Player names -->
      <div class="settings-bar glass-card mb-4">
        <div style="display:flex;gap:.5rem;width:100%;flex-wrap:wrap;">
          <div style="flex:1;min-width:120px">
            <label for="inp-p1" class="sr-only">Player 1 name</label>
            <input id="inp-p1" type="text" placeholder="${t('home.player1Placeholder')}"
              value="${escHtml(p1)}" maxlength="20" autocomplete="off" />
          </div>
          <div style="flex:1;min-width:120px">
            <label for="inp-p2" class="sr-only">Player 2 name</label>
            <input id="inp-p2" type="text" placeholder="${t('home.player2Placeholder')}"
              value="${escHtml(p2)}" maxlength="20" autocomplete="off" />
          </div>
        </div>
      </div>

      <!-- Level selector -->
      <div class="level-selector" role="group" aria-label="Game level">
        ${['wholesome', 'flirty', 'spicy'].map(lvl => `
          <button class="level-btn ${level === lvl ? 'active' : ''}" data-level="${lvl}">
            ${t(`home.levels.${lvl}`)}
          </button>
        `).join('')}
      </div>

      <!-- Game cards -->
      <div class="game-cards" role="list">
        ${gameCard('truth-or-dare', '🎲')}
        ${gameCard('never-have-i-ever', '🙋')}
        ${gameCard('would-you-rather', '🤔')}
      </div>

      <!-- Surprise us -->
      <button class="btn btn-primary surprise-btn mb-4" id="btn-surprise">
        ${t('home.btnSurprise')}
      </button>

      <!-- Play mode buttons -->
      <div class="play-buttons">
        <button class="btn btn-primary" id="btn-play-local">${t('home.btnPlayLocal')}</button>
        <button class="btn btn-secondary" id="btn-play-online">${t('home.btnPlayOnline')}</button>
      </div>

      <footer class="app-footer">${t('app.footer')}</footer>
    </div>
  `;

  // --- Interactivity ---

  // Theme toggle
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    const theme = toggleTheme();
    document.getElementById('btn-theme').textContent = theme === 'dark' ? '☀️' : '🌙';
  });
  // Set correct icon on load
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) themeBtn.textContent = state.get('theme') === 'dark' ? '☀️' : '🌙';

  // Save player names on change
  document.getElementById('inp-p1')?.addEventListener('input', e => {
    state.set('player1', e.target.value || 'Player 1');
  });
  document.getElementById('inp-p2')?.addEventListener('input', e => {
    state.set('player2', e.target.value || 'Player 2');
  });

  // Level buttons
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('level', btn.dataset.level);
    });
  });

  // Game card click — select game and go to setup
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      state.set('game', card.dataset.game);
      navigate('setup');
    });
  });

  // Surprise us — pick random game
  document.getElementById('btn-surprise')?.addEventListener('click', () => {
    const games = ['truth-or-dare', 'never-have-i-ever', 'would-you-rather'];
    state.set('game', games[Math.floor(Math.random() * games.length)]);
    navigate('setup');
  });

  // Play local
  document.getElementById('btn-play-local')?.addEventListener('click', () => {
    if (!state.get('game')) {
      toast('Pick a game first! 👆', 'warning');
      return;
    }
    state.set('mode', 'local');
    navigate('setup');
  });

  // Play online
  document.getElementById('btn-play-online')?.addEventListener('click', () => {
    if (!state.get('game')) {
      toast('Pick a game first! 👆', 'warning');
      return;
    }
    state.set('mode', 'online');
    navigate('room');
  });
}

function gameCard(game, emoji) {
  return /* html */ `
    <div class="game-card" role="listitem" data-game="${game}" tabindex="0"
      aria-label="${t(`home.games.${game}.title`)}">
      <span class="game-card-emoji" aria-hidden="true">${emoji}</span>
      <div class="game-card-info">
        <h3>${t(`home.games.${game}.title`)}</h3>
        <p>${t(`home.games.${game}.desc`)}</p>
      </div>
    </div>
  `;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

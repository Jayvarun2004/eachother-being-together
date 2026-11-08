/**
 * src/views/home.js
 * Aesthetic couples game room — luxury layout with Bento Grid, Lover's Capsule, and Atmosphere Bar.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { cycleTheme, getCurrentThemeObj } from '../lib/theme.js';
import { toggleAmbientSound } from '../lib/sound.js';
import { toast } from '../lib/toast.js';

export function renderHome() {
  const app = document.getElementById('app');

  const level = state.get('level') ?? 'wholesome';
  const vibe = state.get('vibe') ?? 'romantic';
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';
  const curTheme = getCurrentThemeObj();

  const vibeLabels = {
    romantic: '🌹 Romance',
    spicy: '🔥 Spicy',
    deep: '💭 Pillow Talk',
    playful: '🎉 Banter',
  };

  const levelLabels = {
    wholesome: '🌸 Wholesome',
    flirty: '💋 Flirty',
    spicy: '🔥 Spicy',
  };

  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-home">
      <!-- Luxury Top Bar -->
      <header class="app-header">
        <a href="#home" class="header-logo">
          <span>💕</span>
          <span>Eachother</span>
        </a>
        <div class="header-actions">
          <button class="btn-icon" id="btn-ambient" aria-label="Toggle ambient rain" title="Ambient Rain Sound">
            🌧️
          </button>
          <button class="btn-icon" id="btn-theme" aria-label="Switch aesthetic theme" title="Current Mood: ${curTheme.name}">
            ${curTheme.icon}
          </button>
        </div>
      </header>

      <!-- Lover's Capsule (Hero Card) -->
      <div class="couple-capsule">
        <div class="couple-names-pill">
          <span class="player-badge-pill">💗 <span id="display-p1">${escHtml(p1)}</span></span>
          <span class="couple-heart-divider">❤️‍🔥</span>
          <span class="player-badge-pill">💙 <span id="display-p2">${escHtml(p2)}</span></span>
        </div>
        <button class="couple-edit-btn" id="btn-toggle-edit-names" title="Edit names">
          ✏️ Edit
        </button>
      </div>

      <!-- Names Drawer (Collapsible) -->
      <div class="names-drawer" id="names-drawer">
        <div class="names-drawer-row">
          <input id="inp-p1" type="text" placeholder="Player 1" value="${escHtml(p1)}" maxlength="20" />
          <input id="inp-p2" type="text" placeholder="Player 2" value="${escHtml(p2)}" maxlength="20" />
        </div>
      </div>

      <!-- Atmosphere Controller (Level & Vibe in one unified container) -->
      <div class="atmosphere-bar">
        <div class="atmosphere-row">
          <span class="atmosphere-label">Intensity</span>
          ${['wholesome', 'flirty', 'spicy'].map(lvl => `
            <button class="segmented-pill level-pill ${level === lvl ? 'active' : ''}" data-level="${lvl}">
              ${levelLabels[lvl]}
            </button>
          `).join('')}
        </div>
        <div class="atmosphere-row">
          <span class="atmosphere-label">Atmosphere</span>
          ${Object.entries(vibeLabels).map(([key, label]) => `
            <button class="segmented-pill vibe-pill ${vibe === key ? 'active' : ''}" data-vibe="${key}">
              ${label}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 2x2 Bento Aesthetic Grid for Games -->
      <div class="game-cards-bento" role="list">
        ${renderBentoCard({
          game: 'truth-or-dare',
          emoji: '🎲',
          title: 'Truth or Dare',
          badge: 'Classic',
          desc: 'Spicy confessions & playful dares',
          accentClass: 'bento-tod',
          count: '150 Cards',
        })}
        ${renderBentoCard({
          game: 'never-have-i-ever',
          emoji: '🙋',
          title: 'Never Have I',
          badge: 'Stories',
          desc: 'Discover what you both secretly did',
          accentClass: 'bento-nhie',
          count: '75 Cards',
        })}
        ${renderBentoCard({
          game: 'would-you-rather',
          emoji: '🤔',
          title: 'Would You Rather',
          badge: 'Dilemmas',
          desc: 'Tough, funny & passionate choices',
          accentClass: 'bento-wyr',
          count: '75 Cards',
        })}
        ${renderBentoCard({
          game: 'who-is-most-likely',
          emoji: '🧠',
          title: 'Telepathy',
          badge: 'Mind Reader',
          desc: 'Who fits the description best?',
          accentClass: 'bento-wml',
          count: '75 Cards',
        })}
      </div>

      <!-- Bottom Floating Action Bar -->
      <div class="bottom-actions-stack">
        <button class="surprise-pill-btn" id="btn-surprise">
          ✨ Surprise Us (Random Pick)
        </button>
        <div class="dock-play-row">
          <button class="btn btn-primary" id="btn-play-local">
            🎮 Play On This Device
          </button>
          <button class="btn btn-secondary" id="btn-play-online">
            📡 Play Online (2 Devices)
          </button>
        </div>
      </div>

      <footer class="app-footer">${t('app.footer')}</footer>
    </div>
  `;

  // --- Wire Interactivity ---

  // Edit Names Drawer Toggle
  document.getElementById('btn-toggle-edit-names')?.addEventListener('click', () => {
    const drawer = document.getElementById('names-drawer');
    drawer?.classList.toggle('open');
  });

  // Save Names
  document.getElementById('inp-p1')?.addEventListener('input', e => {
    const val = e.target.value.trim() || 'Player 1';
    state.set('player1', val);
    const badge = document.getElementById('display-p1');
    if (badge) badge.textContent = val;
  });
  document.getElementById('inp-p2')?.addEventListener('input', e => {
    const val = e.target.value.trim() || 'Player 2';
    state.set('player2', val);
    const badge = document.getElementById('display-p2');
    if (badge) badge.textContent = val;
  });

  // Theme Cycler
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    const nextTheme = cycleTheme();
    const btn = document.getElementById('btn-theme');
    if (btn) {
      btn.textContent = nextTheme.icon;
      btn.title = `Mood: ${nextTheme.name}`;
    }
    toast(`Mood set to: ${nextTheme.name} ${nextTheme.icon}`, 'info', 1200);
  });

  // Ambient Rain
  let isAmbientOn = false;
  document.getElementById('btn-ambient')?.addEventListener('click', () => {
    const res = toggleAmbientSound();
    isAmbientOn = res !== 'off';
    const btn = document.getElementById('btn-ambient');
    if (btn) btn.style.background = isAmbientOn ? 'rgba(34, 197, 94, 0.25)' : '';
    toast(isAmbientOn ? '🌧️ Cozy rain ambiance on' : '🌧️ Ambiance off', 'info', 1200);
  });

  // Intensity (Level) Pills
  document.querySelectorAll('.level-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('level', btn.dataset.level);
    });
  });

  // Atmosphere (Vibe) Pills
  document.querySelectorAll('.vibe-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vibe-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('vibe', btn.dataset.vibe);
      toast(`Atmosphere: ${btn.textContent.trim()}`, 'success', 1000);
    });
  });

  // Bento Game Card Clicks
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('click', () => {
      state.set('game', card.dataset.game);
      navigate('setup');
    });
  });

  // Surprise Us
  document.getElementById('btn-surprise')?.addEventListener('click', () => {
    const games = ['truth-or-dare', 'never-have-i-ever', 'would-you-rather', 'who-is-most-likely'];
    state.set('game', games[Math.floor(Math.random() * games.length)]);
    navigate('setup');
  });

  // Play Local
  document.getElementById('btn-play-local')?.addEventListener('click', () => {
    if (!state.get('game')) {
      toast('Pick a game card above first! 👆', 'warning');
      return;
    }
    state.set('mode', 'local');
    navigate('setup');
  });

  // Play Online
  document.getElementById('btn-play-online')?.addEventListener('click', () => {
    if (!state.get('game')) {
      toast('Pick a game card above first! 👆', 'warning');
      return;
    }
    state.set('mode', 'online');
    navigate('room');
  });
}

function renderBentoCard({ game, emoji, title, badge, desc, accentClass, count }) {
  return /* html */ `
    <div class="bento-card ${accentClass}" role="listitem" data-game="${game}" tabindex="0" aria-label="${title}">
      <div>
        <div class="bento-card-top">
          <span class="bento-icon">${emoji}</span>
          <span class="bento-badge">${badge}</span>
        </div>
        <h3 class="bento-title">${title}</h3>
        <p class="bento-desc">${desc}</p>
      </div>
      <div class="bento-cta">
        <span>${count}</span>
        <span>Play →</span>
      </div>
    </div>
  `;
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

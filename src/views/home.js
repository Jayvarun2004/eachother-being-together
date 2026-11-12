/**
 * src/views/home.js
 * Aesthetic couples game room — Bento Grid, Lover's Capsule, Atmosphere Bar,
 * and expandable "More Romantic Activities" section.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { cycleTheme, getCurrentThemeObj } from '../lib/theme.js';
import { toggleAmbientSound } from '../lib/sound.js';
import { toast } from '../lib/toast.js';
import { getVault } from '../lib/vault.js';

export function renderHome() {
  const app = document.getElementById('app');

  const level = state.get('level') ?? 'wholesome';
  const vibe = state.get('vibe') ?? 'romantic';
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';
  const curTheme = getCurrentThemeObj();
  const vaultCount = getVault().length;
  const hasNamesSet = p1 !== 'Player 1' || p2 !== 'Player 2';

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
    mix: '🎲 Mix it Up',
  };

  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-home">
      <!-- Floating Romantic Hearts Background -->
      <div class="floating-hearts-bg" aria-hidden="true">
        <span>💕</span>
        <span>💖</span>
        <span>💗</span>
        <span>❤️‍🔥</span>
        <span>🌸</span>
        <span>🌹</span>
      </div>

      <!-- Luxury Top Bar -->
      <header class="app-header">
        <a href="#home" class="header-logo">
          <span>💕</span>
          <span>Eachother</span>
        </a>
        <div class="header-actions">
          <button class="btn-icon" id="btn-vault" aria-label="Love Vault" title="Love Vault">
            💌${vaultCount > 0 ? `<span class="vault-count-badge">${vaultCount}</span>` : ''}
          </button>
          <button class="btn-icon" id="btn-ambient" aria-label="Toggle ambient rain" title="Ambient Rain Sound">
            🌧️
          </button>
          <button class="btn-icon" id="btn-theme" aria-label="Switch aesthetic theme" title="Current Mood: ${curTheme.name}">
            ${curTheme.icon}
          </button>
          <button class="btn-icon" id="btn-settings" aria-label="Settings & Privacy" title="Settings & Privacy">
            ⚙️
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
          ${['wholesome', 'flirty', 'spicy', 'mix']
            .map(
              (lvl) => `
            <button class="segmented-pill level-pill ${level === lvl ? 'active' : ''}" data-level="${lvl}">
              ${levelLabels[lvl]}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="atmosphere-row">
          <span class="atmosphere-label">Atmosphere</span>
          ${Object.entries(vibeLabels)
            .map(
              ([key, label]) => `
            <button class="segmented-pill vibe-pill ${vibe === key ? 'active' : ''}" data-vibe="${key}">
              ${label}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- 4 Primary Bento Games (Keeps Home Clean) -->
      <div class="game-cards-bento" role="list">
        ${renderBentoCard({
          game: 'truth-or-dare',
          emoji: '🎲',
          title: 'Truth or Dare',
          badge: 'Classic',
          desc: 'Spicy confessions & playful dares',
          accentClass: 'bento-tod',
          count: '150+ Cards',
        })}
        ${renderBentoCard({
          game: 'never-have-i-ever',
          emoji: '🙋',
          title: 'Never Have I',
          badge: 'Stories',
          desc: 'Discover what you both secretly did',
          accentClass: 'bento-nhie',
          count: '75+ Cards',
        })}
        ${renderBentoCard({
          game: 'would-you-rather',
          emoji: '🤔',
          title: 'Would You Rather',
          badge: 'Dilemmas',
          desc: 'Tough, funny & passionate choices',
          accentClass: 'bento-wyr',
          count: '75+ Cards',
        })}
        ${renderBentoCard({
          game: 'who-is-most-likely',
          emoji: '🧠',
          title: 'Telepathy',
          badge: 'Mind Reader',
          desc: 'Who fits the description best?',
          accentClass: 'bento-wml',
          count: '75+ Cards',
        })}
      </div>

      <!-- Expandable More Romantic Features Section -->
      <div class="more-section glass-card mb-4" style="padding:1rem;margin-top:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" id="btn-toggle-more">
          <div style="font-weight:700;font-size:var(--text-sm);display:flex;align-items:center;gap:0.5rem;">
            <span>✨</span> More Games & Couple Moments
          </div>
          <span id="more-chevron" style="font-size:var(--text-xs);color:var(--text-muted);transition:transform 0.2s ease;">▼</span>
        </div>

        <div id="more-grid" style="display:none;grid-template-columns:1fr 1fr;gap:0.65rem;margin-top:0.85rem;">
          <button class="btn btn-ghost more-action-btn" data-nav="game/soul-sync" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);border-color:var(--color-rose);">
            <div style="font-size:1.3rem;">✨</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;color:var(--color-rose);">Soul Sync</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Deep intimacy questions</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="game/finish-the-sentence" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">✍️</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Finish Sentence</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Fill in the blanks</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="game/this-or-that" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">⚡</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">This or That</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Rapid-fire sync</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="game/how-well-do-you-know-me" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">🔮</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Know Me Quiz</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Guess partner answers</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="date-roulette" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">🎡</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Date Roulette</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Spin for dinner & film</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="days-together" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">📅</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Days Together</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Anniversary counter</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="love-notes" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">🍯</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Love Notes Jar</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">"Open when..." notes</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="memory-lane" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">📸</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Memory Lane</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Private timeline</div>
          </button>

          <button class="btn btn-ghost more-action-btn" data-nav="scoreboard" style="text-align:left;padding:0.75rem;height:auto;border-radius:var(--radius-md);">
            <div style="font-size:1.3rem;">🏆</div>
            <div style="font-weight:700;font-size:var(--text-xs);margin-top:0.2rem;">Scoreboard</div>
            <div style="font-size:0.65rem;color:var(--text-muted);">Streaks & badges</div>
          </button>
        </div>
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
            📡 Play With Friend
          </button>
        </div>
        ${
          hasNamesSet && state.get('game')
            ? `
          <button class="btn btn-ghost w-full" id="btn-fast-launch" style="font-size: var(--text-sm); border: 1.5px solid var(--accent); color: var(--accent);">
            ⚡ Fast Play (${p1} & ${p2}) →
          </button>
        `
            : ''
        }
      </div>

      <!-- PWA Install Prompt Banner container -->
      <div id="pwa-install-container"></div>

      <footer class="app-footer">${t('app.footer')}</footer>
    </div>
  `;

  // --- Wire Interactivity ---

  // Vault / Favourites
  document.getElementById('btn-vault')?.addEventListener('click', () => navigate('vault'));

  // Settings & Privacy
  document.getElementById('btn-settings')?.addEventListener('click', () => navigate('settings'));

  // Edit Names Drawer Toggle
  document.getElementById('btn-toggle-edit-names')?.addEventListener('click', () => {
    const drawer = document.getElementById('names-drawer');
    drawer?.classList.toggle('open');
  });

  // Save Names
  document.getElementById('inp-p1')?.addEventListener('input', (e) => {
    const val = e.target.value.trim() || 'Player 1';
    state.set('player1', val);
    const badge = document.getElementById('display-p1');
    if (badge) badge.textContent = val;
  });
  document.getElementById('inp-p2')?.addEventListener('input', (e) => {
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
  document.querySelectorAll('.level-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('level', btn.dataset.level);
    });
  });

  // Atmosphere (Vibe) Pills
  document.querySelectorAll('.vibe-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vibe-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.set('vibe', btn.dataset.vibe);
      toast(`Atmosphere: ${btn.textContent.trim()}`, 'success', 1000);
    });
  });

  // Bento Game Card Clicks
  document.querySelectorAll('.bento-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.set('game', card.dataset.game);
      navigate('setup');
    });
  });

  // Expandable More Section Toggle
  let moreOpen = false;
  document.getElementById('btn-toggle-more')?.addEventListener('click', () => {
    moreOpen = !moreOpen;
    const grid = document.getElementById('more-grid');
    const chevron = document.getElementById('more-chevron');
    if (grid) grid.style.display = moreOpen ? 'grid' : 'none';
    if (chevron) chevron.style.transform = moreOpen ? 'rotate(180deg)' : 'none';
  });

  // More Section Actions
  document.querySelectorAll('.more-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const navTarget = btn.dataset.nav;
      if (navTarget.startsWith('game/')) {
        const gName = navTarget.replace('game/', '');
        state.set('game', gName);
        navigate('setup');
      } else {
        navigate(navTarget);
      }
    });
  });

  // Surprise Us
  document.getElementById('btn-surprise')?.addEventListener('click', () => {
    const games = [
      'truth-or-dare',
      'never-have-i-ever',
      'would-you-rather',
      'who-is-most-likely',
      'finish-the-sentence',
      'this-or-that',
      'how-well-do-you-know-me',
    ];
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

  // Play Online / With Friend
  document.getElementById('btn-play-online')?.addEventListener('click', () => {
    if (!state.get('game')) {
      toast('Pick a game card above first! 👆', 'warning');
      return;
    }
    state.set('mode', 'online');
    navigate('room');
  });

  // Fast launch — skip setup if names already saved
  document.getElementById('btn-fast-launch')?.addEventListener('click', () => {
    state.set('mode', 'local');
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
    navigate(`game/${state.get('game')}`);
  });

  // PWA Install Prompt Wireup
  initPwaInstallPrompt();
}

function initPwaInstallPrompt() {
  const container = document.getElementById('pwa-install-container');
  if (!container) return;
  const isDismissed = localStorage.getItem('ebt_pwa_dismissed') === 'true';
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isDismissed || isStandalone) return;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  if (window._deferredInstallPrompt) {
    container.innerHTML = `
      <div class="glass-card" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;padding:0.75rem 1rem;margin:1rem 0;border-color:var(--color-rose);">
        <div style="font-size:var(--text-xs);color:var(--text-primary);line-height:1.4;">
          📲 <strong>Install App</strong> for full-screen couple gaming & offline play
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <button class="btn btn-primary btn-sm" id="btn-pwa-install" style="font-size:var(--text-xs);padding:0.35rem 0.75rem;white-space:nowrap;">Install</button>
          <button class="btn-icon" id="btn-pwa-dismiss" style="font-size:var(--text-xs);width:28px;height:28px;border:none;background:none;color:var(--text-muted);" aria-label="Dismiss">✕</button>
        </div>
      </div>
    `;

    document.getElementById('btn-pwa-install')?.addEventListener('click', async () => {
      if (window._deferredInstallPrompt) {
        window._deferredInstallPrompt.prompt();
        const choice = await window._deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          toast('Thank you for installing! 💕', 'success');
        }
        window._deferredInstallPrompt = null;
        container.innerHTML = '';
      }
    });

    document.getElementById('btn-pwa-dismiss')?.addEventListener('click', () => {
      localStorage.setItem('ebt_pwa_dismissed', 'true');
      container.innerHTML = '';
    });
  } else if (isIos) {
    container.innerHTML = `
      <div class="glass-card" style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;padding:0.75rem 1rem;margin:1rem 0;border-color:var(--color-rose);">
        <div style="font-size:var(--text-xs);color:var(--text-primary);line-height:1.4;">
          📲 Install on iPhone: Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong> 💕
        </div>
        <button class="btn-icon" id="btn-pwa-dismiss" style="font-size:var(--text-xs);width:28px;height:28px;border:none;background:none;color:var(--text-muted);" aria-label="Dismiss">✕</button>
      </div>
    `;
    document.getElementById('btn-pwa-dismiss')?.addEventListener('click', () => {
      localStorage.setItem('ebt_pwa_dismissed', 'true');
      container.innerHTML = '';
    });
  }
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
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

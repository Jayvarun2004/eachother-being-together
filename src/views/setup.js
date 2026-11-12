/**
 * src/views/setup.js
 * Player name input + age gate for Spicy level + Stakes & Rewards selector.
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
  let currentStake = state.get('stake') ?? 'None';

  const gameEmojis = {
    'truth-or-dare': '🎲',
    'never-have-i-ever': '🙋',
    'would-you-rather': '🤔',
    'who-is-most-likely': '🔮',
    'finish-the-sentence': '✍️',
    'this-or-that': '⚡',
    'how-well-do-you-know-me': '🧠',
    'soul-sync': '✨',
  };

  const presets = [
    { value: 'None', label: t('stakes.none') },
    { value: '15-Min Massage 💆', label: t('stakes.preset1') },
    { value: 'Breakfast in Bed 🥞', label: t('stakes.preset2') },
    { value: 'Movie & Snack Choice 🎬', label: t('stakes.preset3') },
    { value: 'Coffee & Pastry Run ☕', label: t('stakes.preset4') },
    { value: '10 Gentle Kisses 💋', label: t('stakes.preset5') },
    { value: '1 Free Wish 🪄', label: t('stakes.preset6') },
    { value: '__custom__', label: t('stakes.custom') },
  ];

  const isPresetValue = presets.some((p) => p.value !== '__custom__' && p.value === currentStake);
  const isCustom = !isPresetValue && currentStake !== 'None';
  let activePillValue = isCustom ? '__custom__' : currentStake;

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

      <!-- Couples Stakes & Rewards Engine -->
      <div class="stakes-section mt-4 glass-card" style="padding: 1rem; border-radius: 16px;">
        <div class="stakes-header" style="margin-bottom: 0.75rem;">
          <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>${t('stakes.title')}</span>
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
            ${t('stakes.subtitle')}
          </div>
        </div>

        <div class="stakes-pill-grid" id="stakes-pill-grid">
          ${presets
            .map(
              (p) => `
            <button type="button" class="stakes-pill ${activePillValue === p.value ? 'active' : ''}" data-stake="${p.value}">
              ${p.label}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="custom-stake-wrap ${isCustom ? 'visible' : ''}" id="custom-stake-wrap" style="margin-top: 0.75rem; display: ${isCustom ? 'block' : 'none'};">
          <input type="text" id="custom-stake-input" maxlength="60"
            class="input-field"
            style="width: 100%; padding: 0.6rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: var(--text-primary); font-size: var(--text-sm);"
            placeholder="${t('stakes.customPlaceholder')}"
            value="${isCustom ? escHtml(currentStake) : ''}" />
        </div>
      </div>

      <!-- Age gate — only shown for Spicy or Mix level (mix eventually reaches spicy) -->
      <div class="age-gate ${level === 'spicy' || level === 'mix' ? 'visible' : ''}" id="age-gate" aria-live="polite">
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

  document.getElementById('setup-p1')?.addEventListener('input', (e) => {
    state.set('player1', e.target.value || 'Player 1');
    updateAgeLabels();
  });
  document.getElementById('setup-p2')?.addEventListener('input', (e) => {
    state.set('player2', e.target.value || 'Player 2');
    updateAgeLabels();
  });

  // Stake selection
  const pillGrid = document.getElementById('stakes-pill-grid');
  const customWrap = document.getElementById('custom-stake-wrap');
  const customInput = document.getElementById('custom-stake-input');

  pillGrid?.addEventListener('click', (e) => {
    const pill = e.target.closest('.stakes-pill');
    if (!pill) return;

    pillGrid.querySelectorAll('.stakes-pill').forEach((btn) => btn.classList.remove('active'));
    pill.classList.add('active');

    const val = pill.dataset.stake;
    if (val === '__custom__') {
      customWrap.style.display = 'block';
      customInput.focus();
      const customVal = customInput.value.trim();
      state.set('stake', customVal || 'Custom romantic favor');
    } else {
      customWrap.style.display = 'none';
      state.set('stake', val);
    }
  });

  customInput?.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    state.set('stake', text || 'Custom romantic favor');
  });

  // Start game
  document.getElementById('btn-start')?.addEventListener('click', () => {
    // Validate spicy age gate
    if (level === 'spicy' || level === 'mix') {
      const p1ok = document.getElementById('age-p1')?.checked;
      const p2ok = document.getElementById('age-p2')?.checked;
      if (!p1ok || !p2ok) {
        const modeLabel = level === 'mix' ? 'Mix (reaches Spicy)' : 'Spicy';
        toast(`Both players must confirm they are 18+ for ${modeLabel} mode 🔞`, 'warning');
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
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * src/views/game.js
 * Game orchestrator — delegates to game-specific modules.
 * Shows the player bar, score bar, deck progress, and common controls.
 *
 * To add a new game:
 *   1. Create /games/<game-name>/index.js implementing the GameModule interface
 *   2. Register it in GAME_MODULES below
 *   3. Add cards in /cards/<game-name>/<level>.json
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { drawCard, deckProgress, addCustomCard } from '../lib/deck.js';
import { sounds } from '../lib/sound.js';
import { toast } from '../lib/toast.js';
import { fireConfetti } from '../lib/confetti.js';

// --- Game module registry ---
// Each module exports: { renderCardContent(card, el), onReveal(card, el), onDone() }
import { TruthOrDareGame } from '../../games/truth-or-dare/index.js';
import { NeverHaveIEverGame } from '../../games/never-have-i-ever/index.js';
import { WouldYouRatherGame } from '../../games/would-you-rather/index.js';

const GAME_MODULES = {
  'truth-or-dare':     TruthOrDareGame,
  'never-have-i-ever': NeverHaveIEverGame,
  'would-you-rather':  WouldYouRatherGame,
};

// --- State for this session ---
let _currentCard = null;
let _flipped = false;
let _gameModule = null;
let _game = null;
let _level = null;

export async function renderGame(game) {
  _game = game;
  _level = state.get('level') ?? 'wholesome';
  const ModClass = GAME_MODULES[game];

  if (!ModClass) {
    toast('Unknown game!', 'error');
    navigate('home');
    return;
  }

  _gameModule = new ModClass();
  _flipped = false;

  const app = document.getElementById('app');

  app.innerHTML = /* html */ `
    <div class="view game-view active animate-fade-in" id="view-game">
      <header class="app-header">
        <button class="btn-icon" id="btn-home" aria-label="Home" title="Go home">🏠</button>
        <span style="font-size:var(--text-sm);color:var(--text-muted)">${gameName(game)}</span>
        <button class="btn-icon" id="btn-end" aria-label="End game" title="End game">🏁</button>
      </header>

      <!-- Player bar -->
      <div class="player-bar" aria-live="polite">
        <div class="player-badge">
          <span class="player-name-badge" id="p1-badge">${escHtml(state.get('player1'))}</span>
          <span class="player-score" id="p1-score">${state.get('scores')?.[0] ?? 0}</span>
        </div>
        <div class="turn-indicator" id="turn-indicator">${t('game.turn', { name: state.get('player1') })}</div>
        <div class="player-badge">
          <span class="player-name-badge" id="p2-badge">${escHtml(state.get('player2'))}</span>
          <span class="player-score" id="p2-score">${state.get('scores')?.[1] ?? 0}</span>
        </div>
      </div>

      <!-- Score bar -->
      <div class="score-bar-wrap" aria-hidden="true">
        <div class="score-bar-fill" id="score-bar" style="width:50%"></div>
      </div>

      <!-- Deck progress -->
      <div class="deck-progress">
        <span id="deck-progress-text">Card 1</span>
        <div class="deck-progress-bar">
          <div class="deck-progress-fill" id="deck-progress-fill" style="width:0%"></div>
        </div>
      </div>

      <!-- The flip card -->
      <div class="card-area">
        <div class="flip-card" id="flip-card" role="button" tabindex="0"
          aria-label="Tap to reveal card">
          <div class="flip-card-face flip-card-front">
            <div class="flip-card-front-emoji" aria-hidden="true" id="front-emoji">🎴</div>
            <div class="flip-card-front-label" id="front-label">${gameName(game)}</div>
            <div class="flip-card-front-hint">${t('game.tap')}</div>
          </div>
          <div class="flip-card-face flip-card-back" id="card-back-face">
            <!-- filled by game module -->
          </div>
        </div>
      </div>

      <!-- Game-specific area (NHIE answers, WYR options etc.) -->
      <div id="game-specific-area"></div>

      <!-- Common action buttons -->
      <div class="card-actions" id="card-actions" style="display:none">
        <button class="btn btn-done" id="btn-done">${t('game.btnDone')}</button>
        <button class="btn btn-skip btn-sm" id="btn-skip">
          ${t('game.btnSkip', { n: state.get('skipsLeft')?.[state.get('currentTurn')] ?? 3 })}
        </button>
        <button class="btn btn-veto btn-sm" id="btn-veto">
          ${t('game.btnVeto', { n: state.get('vetosLeft')?.[state.get('currentTurn')] ?? 1 })}
        </button>
      </div>

      <div class="action-counts" id="action-counts"></div>

      <!-- Add your own card -->
      <button class="btn btn-ghost btn-sm w-full" id="btn-add-card" style="margin-bottom:.5rem">
        ${t('game.btnAddCard')}
      </button>
      <div class="add-card-form" id="add-card-form">
        <textarea id="custom-card-text" placeholder="${t('game.addCardPlaceholder')}" rows="3"></textarea>
        <div style="display:flex;gap:.5rem;margin-top:.5rem">
          <button class="btn btn-primary btn-sm" id="btn-save-card">${t('game.btnSaveCard')}</button>
          <button class="btn btn-ghost btn-sm" id="btn-cancel-card">${t('game.btnCancelCard')}</button>
        </div>
      </div>
    </div>
  `;

  // Wire up navigation
  document.getElementById('btn-home')?.addEventListener('click', () => {
    if (confirm('Go back to home? Your progress will be saved.')) navigate('home');
  });
  document.getElementById('btn-end')?.addEventListener('click', () => navigate('end'));

  // Flip card
  const flipCard = document.getElementById('flip-card');
  flipCard?.addEventListener('click', handleFlip);
  flipCard?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); });

  // Action buttons
  document.getElementById('btn-done')?.addEventListener('click', handleDone);
  document.getElementById('btn-skip')?.addEventListener('click', handleSkip);
  document.getElementById('btn-veto')?.addEventListener('click', handleVeto);

  // Add card form
  document.getElementById('btn-add-card')?.addEventListener('click', () => {
    document.getElementById('add-card-form')?.classList.toggle('visible');
  });
  document.getElementById('btn-cancel-card')?.addEventListener('click', () => {
    document.getElementById('add-card-form')?.classList.remove('visible');
  });
  document.getElementById('btn-save-card')?.addEventListener('click', () => {
    const text = document.getElementById('custom-card-text')?.value?.trim();
    if (!text || text.length < 5) { toast('Write a bit more!', 'warning'); return; }
    addCustomCard(_game, _level, text);
    toast(t('game.customCardAdded'), 'success');
    document.getElementById('custom-card-text').value = '';
    document.getElementById('add-card-form')?.classList.remove('visible');
  });

  // Load first card
  await loadNextCard();
}

async function loadNextCard() {
  _flipped = false;
  _currentCard = await drawCard(_game, _level);

  const flipCard = document.getElementById('flip-card');
  if (flipCard) flipCard.classList.remove('flipped');

  // Hide actions until card is flipped
  document.getElementById('card-actions').style.display = 'none';

  // Update front face with game icon
  updateFrontFace();

  // Update player bar
  updatePlayerBar();

  // Update deck progress
  updateDeckProgress();

  // Reset game-specific area
  document.getElementById('game-specific-area').innerHTML = '';

  // Let the game module prepare the card back (hidden until flip)
  if (_currentCard && _gameModule) {
    const backFace = document.getElementById('card-back-face');
    _gameModule.renderCardContent(_currentCard, backFace);
  }
}

async function handleFlip() {
  if (_flipped) return;
  if (!_currentCard) return;

  _flipped = true;
  sounds.flip();

  document.getElementById('flip-card')?.classList.add('flipped');

  // Show action buttons (ToD only — NHIE and WYR have their own flow)
  if (_game === 'truth-or-dare') {
    document.getElementById('card-actions').style.display = 'flex';
    updateActionCounts();
  }

  // Let game module handle reveal
  if (_gameModule) {
    const specificArea = document.getElementById('game-specific-area');
    await _gameModule.onReveal(_currentCard, specificArea, {
      onDone: handleDone,
      onNext: loadNextCard,
    });
  }
}

async function handleDone() {
  if (!_flipped) return;
  sounds.done();

  // Add score for current player
  const turn = state.get('currentTurn');
  const scores = [...(state.get('scores') ?? [0, 0])];
  scores[turn] = (scores[turn] ?? 0) + 1;
  state.set('scores', scores);
  state.set('cardsPlayed', (state.get('cardsPlayed') ?? 0) + 1);

  // Milestone confetti every 5 points
  if (scores[turn] % 5 === 0) fireConfetti();

  // Notify game module
  _gameModule?.onDone?.(_currentCard);

  // Switch turn and load next
  switchTurn();
  await loadNextCard();
}

async function handleSkip() {
  const turn = state.get('currentTurn');
  const skipsLeft = [...(state.get('skipsLeft') ?? [3, 3])];

  if (skipsLeft[turn] <= 0) {
    toast(t('game.skipOut'), 'warning');
    return;
  }

  sounds.skip();
  skipsLeft[turn]--;
  state.set('skipsLeft', skipsLeft);

  const skipsUsed = [...(state.get('skipsUsed') ?? [0, 0])];
  skipsUsed[turn]++;
  state.set('skipsUsed', skipsUsed);
  state.set('cardsPlayed', (state.get('cardsPlayed') ?? 0) + 1);

  switchTurn();
  await loadNextCard();
}

async function handleVeto() {
  const turn = state.get('currentTurn');
  const vetosLeft = [...(state.get('vetosLeft') ?? [1, 1])];

  if (vetosLeft[turn] <= 0) {
    toast(t('game.vetoOut'), 'warning');
    return;
  }

  sounds.veto();
  vetosLeft[turn]--;
  state.set('vetosLeft', vetosLeft);

  const vetosUsed = [...(state.get('vetosUsed') ?? [0, 0])];
  vetosUsed[turn]++;
  state.set('vetosUsed', vetosUsed);
  state.set('cardsPlayed', (state.get('cardsPlayed') ?? 0) + 1);

  // Don't switch turn on veto — same player gets a new card
  _flipped = false;
  await loadNextCard();
}

function switchTurn() {
  const turn = state.get('currentTurn');
  state.set('currentTurn', turn === 0 ? 1 : 0);
}

function updatePlayerBar() {
  const turn = state.get('currentTurn');
  const scores = state.get('scores') ?? [0, 0];
  const p1 = state.get('player1');
  const p2 = state.get('player2');

  const p1Score = document.getElementById('p1-score');
  const p2Score = document.getElementById('p2-score');
  const indicator = document.getElementById('turn-indicator');

  if (p1Score) p1Score.textContent = scores[0];
  if (p2Score) p2Score.textContent = scores[1];

  if (indicator) {
    const name = turn === 0 ? p1 : p2;
    indicator.textContent = t('game.turn', { name });
    indicator.className = `turn-indicator ${turn === 0 ? 'active-left' : 'active-right'}`;
  }

  // Score bar
  const total = scores[0] + scores[1];
  const pct = total === 0 ? 50 : Math.round((scores[0] / total) * 100);
  const bar = document.getElementById('score-bar');
  if (bar) bar.style.width = `${pct}%`;
}

function updateFrontFace() {
  const turn = state.get('currentTurn');
  const name = turn === 0 ? state.get('player1') : state.get('player2');
  const emojiEl = document.getElementById('front-emoji');
  const labelEl = document.getElementById('front-label');
  const emojis = { 'truth-or-dare': '🎲', 'never-have-i-ever': '🙋', 'would-you-rather': '🤔' };
  if (emojiEl) emojiEl.textContent = emojis[_game] ?? '🎴';
  if (labelEl) labelEl.textContent = t('game.turn', { name });
}

function updateActionCounts() {
  const turn = state.get('currentTurn');
  const skipsLeft = state.get('skipsLeft') ?? [3, 3];
  const vetosLeft = state.get('vetosLeft') ?? [1, 1];

  const skipBtn = document.getElementById('btn-skip');
  const vetoBtn = document.getElementById('btn-veto');
  if (skipBtn) skipBtn.textContent = t('game.btnSkip', { n: skipsLeft[turn] });
  if (vetoBtn) vetoBtn.textContent = t('game.btnVeto', { n: vetosLeft[turn] });
}

function updateDeckProgress() {
  const prog = deckProgress(_game, _level);
  const text = document.getElementById('deck-progress-text');
  const fill = document.getElementById('deck-progress-fill');
  if (text) text.textContent = `Card ${prog.current} / ${prog.total}`;
  if (fill && prog.total > 0) fill.style.width = `${(prog.current / prog.total) * 100}%`;
}

function gameName(game) {
  const names = {
    'truth-or-dare': '🎲 Truth or Dare',
    'never-have-i-ever': '🙋 Never Have I Ever',
    'would-you-rather': '🤔 Would You Rather',
  };
  return names[game] ?? game;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

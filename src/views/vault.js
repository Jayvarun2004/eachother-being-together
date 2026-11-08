/**
 * src/views/vault.js
 * Love Vault — browse and manage bookmarked game cards.
 */

import { navigate } from '../lib/router.js';
import { getVault, removeFromVault, clearVault } from '../lib/vault.js';
import { toast } from '../lib/toast.js';

const GAME_LABELS = {
  'truth-or-dare': '🎲 Truth or Dare',
  'never-have-i-ever': '🙋 Never Have I Ever',
  'would-you-rather': '🤔 Would You Rather',
  'who-is-most-likely': '🧠 Telepathy',
};

const LEVEL_LABELS = {
  wholesome: '🌸',
  flirty: '💋',
  spicy: '🔥',
};

export function renderVault() {
  const app = document.getElementById('app');
  const vault = getVault();

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-vault">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
        <span class="header-logo">💌 Love Vault</span>
        <button class="btn-icon" id="btn-clear-vault" aria-label="Clear vault" title="Clear all saved cards">🗑️</button>
      </header>

      <div style="text-align:center; margin: 1rem 0 1.25rem;">
        <div style="font-size: 2rem;">💌</div>
        <h2 style="font-size: var(--text-xl); color: var(--text-primary); margin: 0.25rem 0;">Your Love Vault</h2>
        <p style="font-size: var(--text-xs); color: var(--text-muted);">
          ${vault.length === 0 ? 'No saved cards yet — tap 💌 on a card during a game to save it here.' : `${vault.length} cherished card${vault.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      ${vault.length === 0 ? `
        <div class="glass-card" style="text-align:center; padding: 2.5rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">💝</div>
          <p style="font-size: var(--text-sm);">Your favourite moments from the game will appear here.<br>Start a game and tap <strong>💌 Save to Love Vault</strong> on any card.</p>
          <button class="btn btn-primary" id="btn-go-home" style="margin-top: 1.25rem;">🎮 Play a Game</button>
        </div>
      ` : `
        <div class="vault-card-list" id="vault-list">
          ${vault.map((card, i) => `
            <div class="vault-card glass-card" data-index="${i}">
              <div class="vault-card-meta">
                <span class="vault-game-tag">${GAME_LABELS[card.game] ?? card.game}</span>
                <span class="vault-level-tag">${LEVEL_LABELS[card.level] ?? ''} ${card.level}</span>
              </div>
              <p class="vault-card-text">${escHtml(card.text)}</p>
              <div class="vault-card-footer">
                <span class="vault-date">${formatDate(card.savedAt)}</span>
                <button class="vault-remove-btn" data-text="${escHtml(card.text)}" aria-label="Remove from vault">✕ Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-go-home')?.addEventListener('click', () => navigate('home'));

  document.getElementById('btn-clear-vault')?.addEventListener('click', () => {
    if (vault.length === 0) return;
    if (confirm('Clear all saved cards from Love Vault?')) {
      clearVault();
      toast('Love Vault cleared 🗑️', 'info');
      renderVault();
    }
  });

  document.querySelectorAll('.vault-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.target.dataset.text;
      removeFromVault(text);
      toast('Card removed from Vault', 'info');
      renderVault();
    });
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

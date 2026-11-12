/**
 * games/soul-sync/index.js
 * Soul Sync: Deep Couple Conversations
 * Designed to deepen emotional intimacy, connection, and relationship vulnerability.
 */

import { sounds } from '../../src/lib/sound.js';
import { vibrate } from '../../src/lib/haptic.js';

export class SoulSyncGame {
  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-truth" style="background: linear-gradient(135deg, rgba(255, 45, 85, 0.25), rgba(94, 92, 230, 0.25)); border: 1px solid rgba(255, 45, 85, 0.4); color: var(--color-rose);">
        ✨ SOUL SYNC & BONDING
      </span>
      <p class="card-text">${escHtml(card.text)}</p>
      <div style="margin-top: 1rem; font-size: 0.82rem; color: var(--text-muted); font-style: italic;">
        Take a breath. Look into each other's eyes and share honestly.
      </div>
    `;
  }

  async onReveal(card, specificAreaEl) {
    sounds.reveal();
    vibrate('reveal');
    specificAreaEl.innerHTML = /* html */ `
      <div style="display: flex; justify-content: center; gap: 0.75rem; margin-top: 0.5rem;">
        <button class="btn btn-ghost btn-sm" id="btn-sync-heart" style="border-radius: 9999px; font-size: 0.85rem; padding: 0.35rem 0.85rem;">
          ❤️ Felt Closer
        </button>
        <button class="btn btn-ghost btn-sm" id="btn-sync-deep" style="border-radius: 9999px; font-size: 0.85rem; padding: 0.35rem 0.85rem;">
          💬 Deep Conversation
        </button>
      </div>
    `;

    const heartBtn = document.getElementById('btn-sync-heart');
    if (heartBtn) {
      heartBtn.addEventListener('click', () => {
        sounds.confetti();
        vibrate('success');
        heartBtn.textContent = '💖 Connected!';
        heartBtn.style.borderColor = 'var(--color-rose)';
      });
    }

    const deepBtn = document.getElementById('btn-sync-deep');
    if (deepBtn) {
      deepBtn.addEventListener('click', () => {
        sounds.flip();
        vibrate('tap');
        deepBtn.textContent = '✨ Beautiful';
      });
    }
  }

  onDone() {
    // cleanup
  }
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

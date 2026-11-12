/**
 * games/this-or-that/index.js
 * This or That game module.
 *
 * Rapid-fire couple preference alignment.
 * Both players choose Option A or Option B, then reveal their alignment!
 *
 * Card format: { id, optionA, optionB, level, tags? }
 */

import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';
import { fireConfetti } from '../../src/lib/confetti.js';

export class ThisOrThatGame {
  constructor() {
    this._picks = { p1: null, p2: null };
  }

  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-wyr" style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);">
        ⚡ This or That
      </span>
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;margin-top:0.5rem;">
        <div class="wyr-option-card" style="border-color:var(--color-rose);font-weight:700;">
          ${escHtml(card.optionA)}
        </div>
        <div class="wyr-or-divider" aria-hidden="true">— OR —</div>
        <div class="wyr-option-card" style="border-color:var(--color-purple-light,#7c3aed);font-weight:700;">
          ${escHtml(card.optionB)}
        </div>
      </div>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    this._picks = { p1: null, p2: null };
    const p1 = state.get('player1') ?? 'Partner 1';
    const p2 = state.get('player2') ?? 'Partner 2';

    specificAreaEl.innerHTML = /* html */ `
      <div class="glass-card" style="padding:1rem;margin-top:0.5rem;">
        <p style="text-align:center;font-size:var(--text-sm);font-weight:600;margin-bottom:0.75rem;">
          Both partners pick your favorite:
        </p>

        <!-- Player 1 -->
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
            ${escHtml(p1)}'s Choice:
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-ghost btn-sm tot-btn" data-player="p1" data-pick="A" style="flex:1;">
              👈 ${escHtml(card.optionA)}
            </button>
            <button class="btn btn-ghost btn-sm tot-btn" data-player="p1" data-pick="B" style="flex:1;">
              👉 ${escHtml(card.optionB)}
            </button>
          </div>
        </div>

        <!-- Player 2 -->
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
            ${escHtml(p2)}'s Choice:
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-ghost btn-sm tot-btn" data-player="p2" data-pick="A" style="flex:1;">
              👈 ${escHtml(card.optionA)}
            </button>
            <button class="btn btn-ghost btn-sm tot-btn" data-player="p2" data-pick="B" style="flex:1;">
              👉 ${escHtml(card.optionB)}
            </button>
          </div>
        </div>

        <button class="btn btn-primary w-full mt-2" id="btn-tot-reveal" disabled>
          Compare Choices 💕
        </button>

        <div id="tot-result-area" style="display:none;margin-top:0.75rem;text-align:center;"></div>
      </div>
    `;

    document.querySelectorAll('.tot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.player;
        const pick = btn.dataset.pick;
        this._picks[p] = pick;

        document.querySelectorAll(`.tot-btn[data-player="${p}"]`).forEach(b => {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'transparent';
        });
        btn.style.borderColor = 'var(--color-rose)';
        btn.style.background = 'rgba(196,85,106,0.15)';

        if (this._picks.p1 && this._picks.p2) {
          const revBtn = document.getElementById('btn-tot-reveal');
          if (revBtn) revBtn.disabled = false;
        }
      });
    });

    document.getElementById('btn-tot-reveal')?.addEventListener('click', () => {
      const match = this._picks.p1 === this._picks.p2;
      sounds.reveal();
      if (match) fireConfetti(35);

      const resArea = document.getElementById('tot-result-area');
      const revBtn = document.getElementById('btn-tot-reveal');
      if (revBtn) revBtn.style.display = 'none';

      if (resArea) {
        resArea.style.display = 'block';
        resArea.innerHTML = /* html */ `
          <div style="font-size:var(--text-lg);font-weight:700;color:${match ? 'var(--color-rose)' : '#a855f7'};margin-bottom:0.5rem;">
            ${match ? '✨ 100% In Sync! Both agreed!' : '💫 Complementary opposites!'}
          </div>
          <button class="btn btn-primary w-full" id="btn-tot-next">
            Next Card →
          </button>
        `;
        document.getElementById('btn-tot-next')?.addEventListener('click', () => {
          callbacks.onDone();
        });
      }
    });
  }

  onDone(card) {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

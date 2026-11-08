/**
 * games/would-you-rather/index.js
 * Would You Rather game module.
 *
 * Both players pick secretly (Option A or B), then reveal together.
 * Tracks match percentage across the session.
 *
 * Card format: { id, optionA, optionB, level, tags? }
 */

import { t } from '../../src/lib/i18n.js';
import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';
import { toast } from '../../src/lib/toast.js';
import { fireConfetti } from '../../src/lib/confetti.js';

export class WouldYouRatherGame {
  constructor() {
    this._picks = { p1: null, p2: null };
  }

  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-wyr">Would You Rather</span>
      <div style="display:flex;flex-direction:column;gap:.75rem;width:100%">
        <div class="wyr-option-card" style="border-color:var(--color-rose-light)">
          ${escHtml(card.optionA)}
        </div>
        <div class="wyr-or-divider" aria-hidden="true">— OR —</div>
        <div class="wyr-option-card" style="border-color:var(--color-purple-light)">
          ${escHtml(card.optionB)}
        </div>
      </div>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    this._picks = { p1: null, p2: null };
    this._callbacks = callbacks;

    const p1 = state.get('player1');
    const p2 = state.get('player2');

    specificAreaEl.innerHTML = /* html */ `
      <p style="text-align:center;font-size:var(--text-sm);color:var(--text-muted);margin-bottom:.5rem">
        ${t('wyr.pick')}
      </p>

      <!-- Player 1 picks -->
      <div style="margin-bottom:.75rem">
        <p style="font-size:var(--text-xs);color:var(--text-muted);text-align:center;margin-bottom:.25rem">
          ${escHtml(p1)}
        </p>
        <div style="display:flex;gap:.5rem">
          <button class="wyr-option-card" id="wyr-p1-a" data-player="p1" data-pick="A"
            style="flex:1;padding:.75rem;font-size:var(--text-sm)">
            💗 Option A
          </button>
          <button class="wyr-option-card" id="wyr-p1-b" data-player="p1" data-pick="B"
            style="flex:1;padding:.75rem;font-size:var(--text-sm)">
            💙 Option B
          </button>
        </div>
      </div>

      <!-- Player 2 picks -->
      <div style="margin-bottom:.75rem">
        <p style="font-size:var(--text-xs);color:var(--text-muted);text-align:center;margin-bottom:.25rem">
          ${escHtml(p2)}
        </p>
        <div style="display:flex;gap:.5rem">
          <button class="wyr-option-card" id="wyr-p2-a" data-player="p2" data-pick="A"
            style="flex:1;padding:.75rem;font-size:var(--text-sm)">
            💗 Option A
          </button>
          <button class="wyr-option-card" id="wyr-p2-b" data-player="p2" data-pick="B"
            style="flex:1;padding:.75rem;font-size:var(--text-sm)">
            💙 Option B
          </button>
        </div>
      </div>

      <div id="wyr-status" style="text-align:center;color:var(--text-muted);font-size:var(--text-sm);margin:.5rem 0"></div>

      <button class="btn btn-primary" id="wyr-reveal-btn" disabled style="margin-top:.5rem">
        ${t('wyr.btnReveal')}
      </button>

      <!-- Match percentage -->
      <div class="wyr-match-bar-wrap">
        <p class="wyr-match-label">${t('wyr.matchPct', { n: this._calcMatchPct() })}</p>
      </div>

      <div id="wyr-reveal-area"></div>
    `;

    // Wire pick buttons
    ['wyr-p1-a','wyr-p1-b','wyr-p2-a','wyr-p2-b'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', e => {
        const btn = e.currentTarget;
        const player = btn.dataset.player;
        const pick = btn.dataset.pick;
        this._picks[player] = pick;

        // Highlight selected
        document.querySelectorAll(`[data-player="${player}"]`).forEach(b => {
          b.classList.remove('selected-a', 'selected-b');
        });
        btn.classList.add(pick === 'A' ? 'selected-a' : 'selected-b');

        this._updateRevealBtn();
      });
    });

    document.getElementById('wyr-reveal-btn')?.addEventListener('click', () => {
      this._doReveal(card, callbacks);
    });
  }

  _updateRevealBtn() {
    const { p1, p2 } = this._picks;
    const revealBtn = document.getElementById('wyr-reveal-btn');
    const status = document.getElementById('wyr-status');
    if (!revealBtn) return;

    if (p1 && p2) {
      revealBtn.disabled = false;
      if (status) status.textContent = 'Both picked — reveal! 💕';
    } else if (p1 && !p2) {
      if (status) status.textContent = t('wyr.waitingPartner', { name: state.get('player2') });
    } else if (!p1 && p2) {
      if (status) status.textContent = t('wyr.waitingPartner', { name: state.get('player1') });
    }
  }

  _doReveal(card, callbacks) {
    const { p1, p2 } = this._picks;
    sounds.reveal();

    const matched = p1 === p2;

    // Update session match stats
    const matchCount = (state.get('wyrMatchCount') ?? 0) + (matched ? 1 : 0);
    const totalCount = (state.get('wyrTotalCount') ?? 0) + 1;
    state.patch({ wyrMatchCount: matchCount, wyrTotalCount: totalCount });

    if (matched) fireConfetti(40);

    const pct = this._calcMatchPct();

    const revealArea = document.getElementById('wyr-reveal-area');
    if (!revealArea) return;
    revealArea.innerHTML = /* html */ `
      <div style="text-align:center;margin:.75rem 0">
        <p style="font-size:var(--text-xl);font-weight:700;color:${matched ? 'var(--color-rose)' : 'var(--color-purple-mid)'}">
          ${matched ? t('wyr.matched') : t('wyr.differed')}
        </p>
        <p class="wyr-match-pct">${t('wyr.matchPct', { n: pct })}</p>
      </div>
      <button class="btn btn-primary w-full mt-4" id="wyr-next-btn">
        ${t('game.btnNext')}
      </button>
    `;

    // Disable pick buttons
    document.querySelectorAll('.wyr-option-card').forEach(b => { if (b.tagName === 'BUTTON') b.disabled = true; });
    document.getElementById('wyr-reveal-btn').style.display = 'none';

    document.getElementById('wyr-next-btn')?.addEventListener('click', () => {
      callbacks.onDone();
    });
  }

  _calcMatchPct() {
    const matched = state.get('wyrMatchCount') ?? 0;
    const total = state.get('wyrTotalCount') ?? 0;
    return total > 0 ? Math.round((matched / total) * 100) : 0;
  }

  onDone(card) {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

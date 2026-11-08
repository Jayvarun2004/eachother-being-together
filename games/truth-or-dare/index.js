/**
 * games/truth-or-dare/index.js
 * Truth or Dare game module.
 *
 * Card format: { id, text, type: 'truth'|'dare', level, tags?, timerSeconds? }
 */

import { t } from '../../src/lib/i18n.js';
import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';

export class TruthOrDareGame {
  constructor() {
    this._timer = null;
  }

  renderCardContent(card, backFaceEl) {
    const badgeClass = card.type === 'truth' ? 'badge-truth' : 'badge-dare';
    const label = card.type === 'truth' ? t('game.truth') : t('game.dare');

    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge ${badgeClass}">${label}</span>
      <p class="card-text">${escHtml(card.text)}</p>
      ${card.timerSeconds ? `<div class="card-timer" id="card-timer" aria-live="polite">${card.timerSeconds}s</div>` : ''}
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    // ToD uses the common Done/Skip/Veto buttons — nothing extra needed
    // Start optional timer if card has one
    if (card.timerSeconds) {
      this._startTimer(card.timerSeconds);
    }
    specificAreaEl.innerHTML = '';
  }

  onDone(card) {
    this._clearTimer();
  }

  _startTimer(seconds) {
    this._clearTimer();
    let remaining = seconds;
    const update = () => {
      const el = document.getElementById('card-timer');
      if (el) el.textContent = t('game.timerLabel', { n: remaining });
    };
    this._timer = setInterval(() => {
      remaining--;
      update();
      if (remaining <= 0) {
        this._clearTimer();
        sounds.confetti();
      }
    }, 1000);
    update();
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

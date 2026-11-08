/**
 * games/never-have-i-ever/index.js
 * Never Have I Ever game module.
 *
 * Both players answer privately (I Have / Never), then reveal together.
 * A "things in common" counter tracks matching answers.
 *
 * Card format: { id, text, level, tags? }
 */

import { t } from '../../src/lib/i18n.js';
import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';
import { toast } from '../../src/lib/toast.js';
import { fireConfetti } from '../../src/lib/confetti.js';

export class NeverHaveIEverGame {
  constructor() {
    this._answers = { p1: null, p2: null }; // null | 'yes' | 'no'
  }

  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-nhie">Never Have I Ever</span>
      <p class="card-text">${escHtml(card.text)}</p>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    this._answers = { p1: null, p2: null };
    this._callbacks = callbacks;

    const p1 = state.get('player1');
    const p2 = state.get('player2');

    specificAreaEl.innerHTML = /* html */ `
      <div class="nhie-answer-row" aria-label="Private answers">
        <button class="nhie-answer-btn" id="nhie-btn-p1-yes" aria-pressed="false">
          <span class="answer-emoji">🙋</span>
          <span>${p1}: ${t('nhie.btnYes')}</span>
        </button>
        <button class="nhie-answer-btn" id="nhie-btn-p2-yes" aria-pressed="false">
          <span class="answer-emoji">🙋</span>
          <span>${p2}: ${t('nhie.btnYes')}</span>
        </button>
      </div>
      <div class="nhie-answer-row" style="margin-top:.5rem">
        <button class="nhie-answer-btn" id="nhie-btn-p1-no" aria-pressed="false">
          <span class="answer-emoji">🙅</span>
          <span>${p1}: ${t('nhie.btnNo')}</span>
        </button>
        <button class="nhie-answer-btn" id="nhie-btn-p2-no" aria-pressed="false">
          <span class="answer-emoji">🙅</span>
          <span>${p2}: ${t('nhie.btnNo')}</span>
        </button>
      </div>
      <div id="nhie-status" style="text-align:center;color:var(--text-muted);font-size:var(--text-sm);margin:.75rem 0"></div>
      <button class="btn btn-primary" id="nhie-btn-reveal" disabled style="margin-top:.5rem">
        ${t('nhie.btnReveal')}
      </button>
      <div class="nhie-reveal-area" id="nhie-reveal-area"></div>
    `;

    // Wire up answer buttons
    this._wireAnswerBtn('nhie-btn-p1-yes', 'p1', 'yes');
    this._wireAnswerBtn('nhie-btn-p1-no', 'p1', 'no');
    this._wireAnswerBtn('nhie-btn-p2-yes', 'p2', 'yes');
    this._wireAnswerBtn('nhie-btn-p2-no', 'p2', 'no');

    document.getElementById('nhie-btn-reveal')?.addEventListener('click', () => {
      this._reveal(card, specificAreaEl, callbacks);
    });
  }

  _wireAnswerBtn(id, player, answer) {
    document.getElementById(id)?.addEventListener('click', () => {
      this._answers[player] = answer;

      // Visually confirm selection (show ✔ but hide which)
      const pBtns = document.querySelectorAll(`[id^="nhie-btn-${player}"]`);
      pBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      document.getElementById(id)?.classList.add('selected');
      document.getElementById(id)?.setAttribute('aria-pressed', 'true');

      this._updateRevealBtn();
    });
  }

  _updateRevealBtn() {
    const { p1, p2 } = this._answers;
    const revealBtn = document.getElementById('nhie-btn-reveal');
    const status = document.getElementById('nhie-status');
    if (!revealBtn) return;

    if (p1 && p2) {
      revealBtn.disabled = false;
      if (status) status.textContent = 'Both answered — ready to reveal! 💕';
    } else if (p1 && !p2) {
      if (status) status.textContent = t('nhie.waitingPartner', { name: state.get('player2') });
    } else if (!p1 && p2) {
      if (status) status.textContent = t('nhie.waitingPartner', { name: state.get('player1') });
    }
  }

  _reveal(card, specificAreaEl, callbacks) {
    const { p1, p2 } = this._answers;
    sounds.reveal();

    const matched = p1 === p2;
    if (matched) {
      // Update common counter
      const count = (state.get('nhieCommonCount') ?? 0) + 1;
      state.set('nhieCommonCount', count);
      fireConfetti(40);
    }

    const p1Name = state.get('player1');
    const p2Name = state.get('player2');
    const emojiMap = { yes: '🙋 I have!', no: '🙅 Never!' };
    const common = state.get('nhieCommonCount') ?? 0;

    const revealArea = document.getElementById('nhie-reveal-area');
    if (!revealArea) return;
    revealArea.classList.add('visible');
    revealArea.innerHTML = /* html */ `
      <div class="nhie-result-row">
        <div class="nhie-result-box">
          <strong>${escHtml(p1Name)}</strong><br>${emojiMap[p1] ?? '?'}
        </div>
        <div class="nhie-result-box">
          <strong>${escHtml(p2Name)}</strong><br>${emojiMap[p2] ?? '?'}
        </div>
      </div>
      <div class="nhie-common-counter">
        ${t('nhie.common', { n: common })} ❤️
      </div>
      ${matched && (p1 === 'yes') ? `
        <button class="nhie-story-btn" id="nhie-story-btn">
          ${t('nhie.btnTellStory')}
        </button>
      ` : ''}
      <button class="btn btn-primary w-full mt-4" id="nhie-next-btn">
        ${t('game.btnNext')}
      </button>
    `;

    // Story prompt
    document.getElementById('nhie-story-btn')?.addEventListener('click', () => {
      toast('Tell each other the story! 📖', 'info', 4000);
    });

    // Disable answer buttons after reveal
    document.querySelectorAll('.nhie-answer-btn').forEach(b => { b.disabled = true; });
    document.getElementById('nhie-btn-reveal').style.display = 'none';

    document.getElementById('nhie-next-btn')?.addEventListener('click', () => {
      callbacks.onDone();
    });
  }

  onDone(card) {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * games/how-well-do-you-know-me/index.js
 * How Well Do You Know Me?
 * Both players answer choices in secret, then reveal to test intuition and compatibility!
 *
 * Card format: { id, question, options: [string, string, string], level, tags? }
 */

import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';
import { fireConfetti } from '../../src/lib/confetti.js';

export class HowWellDoYouKnowMeGame {
  constructor() {
    this._p1Answer = null;
    this._p2Answer = null;
  }

  renderCardContent(card, backFaceEl) {
    const question = card.question || card.text;
    const options = card.options || ['Option A', 'Option B', 'Option C'];

    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge" style="background:rgba(59,130,246,0.15);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);">
        🧠 How Well Do You Know Me?
      </span>
      <p class="card-text" style="font-size:clamp(1.1rem, 3.5vw, 1.45rem);line-height:1.45;font-weight:700;">
        ${escHtml(question)}
      </p>
      <div style="display:flex;flex-direction:column;gap:0.4rem;width:100%;margin-top:0.75rem;text-align:left;">
        ${options.map((opt, i) => `
          <div style="font-size:var(--text-xs);padding:0.4rem 0.65rem;border-radius:var(--radius-sm);background:rgba(255,255,255,0.05);border:1px solid var(--border);">
            <strong style="color:var(--color-rose);">${String.fromCharCode(65 + i)}:</strong> ${escHtml(opt)}
          </div>
        `).join('')}
      </div>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    this._p1Answer = null;
    this._p2Answer = null;
    const p1 = state.get('player1') ?? 'Partner 1';
    const p2 = state.get('player2') ?? 'Partner 2';
    const options = card.options || ['Option A', 'Option B', 'Option C'];

    specificAreaEl.innerHTML = /* html */ `
      <div class="glass-card" style="padding:1rem;margin-top:0.5rem;">
        <p style="text-align:center;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.75rem;">
          Secretly select the answer that fits best:
        </p>

        <!-- Player 1 Guess/Pick -->
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);margin-bottom:0.25rem;">
            ${escHtml(p1)}'s Answer:
          </div>
          <div style="display:flex;gap:0.4rem;">
            ${options.map((_, i) => `
              <button class="btn btn-ghost btn-sm hwd-p1-btn" data-choice="${i}" style="flex:1;">
                ${String.fromCharCode(65 + i)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Player 2 Guess/Pick -->
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);margin-bottom:0.25rem;">
            ${escHtml(p2)}'s Answer:
          </div>
          <div style="display:flex;gap:0.4rem;">
            ${options.map((_, i) => `
              <button class="btn btn-ghost btn-sm hwd-p2-btn" data-choice="${i}" style="flex:1;">
                ${String.fromCharCode(65 + i)}
              </button>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary w-full mt-2" id="btn-hwd-reveal" disabled>
          Reveal Answers 💕
        </button>

        <div id="hwd-result-area" style="display:none;margin-top:0.75rem;text-align:center;"></div>
      </div>
    `;

    document.querySelectorAll('.hwd-p1-btn').forEach(b => {
      b.addEventListener('click', () => {
        this._p1Answer = parseInt(b.dataset.choice, 10);
        document.querySelectorAll('.hwd-p1-btn').forEach(btn => {
          btn.style.borderColor = 'var(--border)';
          btn.style.background = 'transparent';
        });
        b.style.borderColor = 'var(--color-rose)';
        b.style.background = 'rgba(196,85,106,0.15)';
        this._checkReady();
      });
    });

    document.querySelectorAll('.hwd-p2-btn').forEach(b => {
      b.addEventListener('click', () => {
        this._p2Answer = parseInt(b.dataset.choice, 10);
        document.querySelectorAll('.hwd-p2-btn').forEach(btn => {
          btn.style.borderColor = 'var(--border)';
          btn.style.background = 'transparent';
        });
        b.style.borderColor = 'var(--color-rose)';
        b.style.background = 'rgba(196,85,106,0.15)';
        this._checkReady();
      });
    });

    document.getElementById('btn-hwd-reveal')?.addEventListener('click', () => {
      const match = this._p1Answer === this._p2Answer;
      sounds.reveal();
      if (match) fireConfetti(45);

      const resArea = document.getElementById('hwd-result-area');
      const revBtn = document.getElementById('btn-hwd-reveal');
      if (revBtn) revBtn.style.display = 'none';

      const opt1 = options[this._p1Answer];
      const opt2 = options[this._p2Answer];

      if (resArea) {
        resArea.style.display = 'block';
        resArea.innerHTML = /* html */ `
          <div style="font-size:var(--text-base);font-weight:700;color:${match ? 'var(--color-rose)' : '#3b82f6'};margin-bottom:0.35rem;">
            ${match ? '🎉 Telepathic Match! You both picked the same!' : '💭 Interesting contrast!'}
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.75rem;">
            ${escHtml(p1)}: <strong>${escHtml(opt1)}</strong> | ${escHtml(p2)}: <strong>${escHtml(opt2)}</strong>
          </div>
          <button class="btn btn-primary w-full" id="btn-hwd-next">
            Next Question →
          </button>
        `;
        document.getElementById('btn-hwd-next')?.addEventListener('click', () => {
          callbacks.onDone();
        });
      }
    });
  }

  _checkReady() {
    if (this._p1Answer !== null && this._p2Answer !== null) {
      const btn = document.getElementById('btn-hwd-reveal');
      if (btn) btn.disabled = false;
    }
  }

  onDone(card) {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

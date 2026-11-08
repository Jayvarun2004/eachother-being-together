/**
 * games/who-is-most-likely/index.js
 * Who's More Likely To (Couples Telepathy) game module.
 *
 * Both players secretly pick who fits the card better: [Player 1] or [Player 2].
 * Reveal together to see if you agree, scoring your telepathy agreement score!
 */

import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';
import { fireConfetti } from '../../src/lib/confetti.js';

export class WhoIsMostLikelyGame {
  constructor() {
    this._votes = { p1: null, p2: null }; // 'p1' | 'p2'
  }

  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-wyr" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
        🧠 Who's More Likely To
      </span>
      <p class="card-text">${escHtml(card.text)}</p>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    this._votes = { p1: null, p2: null };

    const p1 = state.get('player1');
    const p2 = state.get('player2');

    specificAreaEl.innerHTML = /* html */ `
      <p style="text-align:center;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:.5rem;text-transform:uppercase;font-weight:700;">
        Secretly tap who fits this best:
      </p>

      <!-- Player 1 Vote Box -->
      <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);padding:.6rem;margin-bottom:.5rem;">
        <p style="font-size:var(--text-xs);color:var(--color-rose);font-weight:700;margin-bottom:.3rem;text-align:center;">
          💗 ${escHtml(p1)}'s Vote:
        </p>
        <div style="display:flex;gap:.4rem;">
          <button class="btn btn-ghost btn-sm" id="wml-p1-votes-p1" style="flex:1;">
            ${escHtml(p1)}
          </button>
          <button class="btn btn-ghost btn-sm" id="wml-p1-votes-p2" style="flex:1;">
            ${escHtml(p2)}
          </button>
        </div>
      </div>

      <!-- Player 2 Vote Box -->
      <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);padding:.6rem;margin-bottom:.5rem;">
        <p style="font-size:var(--text-xs);color:var(--color-purple-light);font-weight:700;margin-bottom:.3rem;text-align:center;">
          💙 ${escHtml(p2)}'s Vote:
        </p>
        <div style="display:flex;gap:.4rem;">
          <button class="btn btn-ghost btn-sm" id="wml-p2-votes-p1" style="flex:1;">
            ${escHtml(p1)}
          </button>
          <button class="btn btn-ghost btn-sm" id="wml-p2-votes-p2" style="flex:1;">
            ${escHtml(p2)}
          </button>
        </div>
      </div>

      <div id="wml-status" style="text-align:center;color:var(--text-muted);font-size:var(--text-sm);margin:.5rem 0;">
        Waiting for both votes...
      </div>

      <button class="btn btn-primary" id="wml-reveal-btn" disabled style="margin-top:.3rem;">
        Reveal Telepathy! 🔮
      </button>

      <div id="wml-reveal-area"></div>
    `;

    // Wire voting buttons
    const wireVote = (btnId, player, target) => {
      document.getElementById(btnId)?.addEventListener('click', () => {
        this._votes[player] = target;

        // Visual selection
        const otherBtnId = target === 'p1' ? btnId.replace('-p1', '-p2') : btnId.replace('-p2', '-p1');
        document.getElementById(btnId)?.classList.add('selected');
        document.getElementById(btnId)?.style.setProperty('border-color', 'var(--color-rose)');
        document.getElementById(otherBtnId)?.classList.remove('selected');
        document.getElementById(otherBtnId)?.style.removeProperty('border-color');

        this._updateRevealState();
      });
    };

    wireVote('wml-p1-votes-p1', 'p1', 'p1');
    wireVote('wml-p1-votes-p2', 'p1', 'p2');
    wireVote('wml-p2-votes-p1', 'p2', 'p1');
    wireVote('wml-p2-votes-p2', 'p2', 'p2');

    document.getElementById('wml-reveal-btn')?.addEventListener('click', () => {
      this._doReveal(callbacks);
    });
  }

  _updateRevealState() {
    const { p1, p2 } = this._votes;
    const btn = document.getElementById('wml-reveal-btn');
    const status = document.getElementById('wml-status');
    if (!btn) return;

    if (p1 && p2) {
      btn.disabled = false;
      if (status) status.textContent = 'Both locked in! Ready to reveal! 💕';
    } else if (p1 && !p2) {
      if (status) status.textContent = `Waiting for ${state.get('player2')}...`;
    } else if (!p1 && p2) {
      if (status) status.textContent = `Waiting for ${state.get('player1')}...`;
    }
  }

  _doReveal(callbacks) {
    const { p1, p2 } = this._votes;
    sounds.reveal();

    const matched = p1 === p2;
    const p1Name = state.get('player1');
    const p2Name = state.get('player2');

    const chosenName = p1 === 'p1' ? p1Name : p2Name;

    // Update match counts
    const telepathyMatches = (state.get('telepathyMatches') ?? 0) + (matched ? 1 : 0);
    const telepathyTotal = (state.get('telepathyTotal') ?? 0) + 1;
    state.patch({ telepathyMatches, telepathyTotal });

    if (matched) {
      fireConfetti(45);
    }

    const pct = Math.round((telepathyMatches / telepathyTotal) * 100);

    const revealArea = document.getElementById('wml-reveal-area');
    if (!revealArea) return;

    let verdictMsg = '';
    if (matched) {
      verdictMsg = `✨ Total Agreement! You both picked <strong>${escHtml(chosenName)}</strong>! 💕`;
    } else {
      verdictMsg = `😂 Different picks! ${escHtml(p1Name)} picked ${p1 === 'p1' ? p1Name : p2Name}, while ${escHtml(p2Name)} picked ${p2 === 'p1' ? p1Name : p2Name}!`;
    }

    revealArea.innerHTML = /* html */ `
      <div style="text-align:center;margin:.8rem 0;padding:.8rem;background:var(--bg-glass);border-radius:var(--radius-lg);border:1px solid var(--border);">
        <p style="font-size:var(--text-base);color:var(--text-primary);margin-bottom:.5rem;">
          ${verdictMsg}
        </p>
        <p style="font-size:var(--text-sm);font-weight:700;color:var(--color-rose);">
          🔮 Telepathy Sync: ${pct}% (${telepathyMatches}/${telepathyTotal} agreed)
        </p>
      </div>
      <button class="btn btn-primary w-full mt-2" id="wml-next-btn">
        Next Question →
      </button>
    `;

    // Disable vote buttons
    document.querySelectorAll('[id^="wml-p"]').forEach(b => { if (b.tagName === 'BUTTON') b.disabled = true; });
    document.getElementById('wml-reveal-btn').style.display = 'none';

    document.getElementById('wml-next-btn')?.addEventListener('click', () => {
      callbacks.onDone();
    });
  }

  onDone() {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

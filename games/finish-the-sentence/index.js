/**
 * games/finish-the-sentence/index.js
 * Finish the Sentence game module.
 *
 * One player finishes a romantic, funny, or vulnerable sentence starter,
 * then hands over to partner.
 *
 * Card format: { id, text, level, tags? }
 */

import { sounds } from '../../src/lib/sound.js';
import { state } from '../../src/lib/state.js';

export class FinishTheSentenceGame {
  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-nhie" style="background:rgba(236,72,153,0.15);color:#ec4899;border:1px solid rgba(236,72,153,0.3);">
        ✍️ Finish the Sentence
      </span>
      <p class="card-text" style="font-size:clamp(1.2rem, 4vw, 1.6rem);line-height:1.5;font-family:var(--font-display);">
        "${escHtml(card.text)}"
      </p>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:0.75rem;font-style:italic;">
        Say your honest answer out loud 💕
      </div>
    `;
  }

  async onReveal(card, specificAreaEl, callbacks) {
    const turn = state.get('currentTurn');
    const speaker = turn === 0 ? state.get('player1') : state.get('player2');
    const listener = turn === 0 ? state.get('player2') : state.get('player1');

    specificAreaEl.innerHTML = /* html */ `
      <div class="glass-card" style="padding:1rem;margin-top:0.5rem;text-align:center;">
        <p style="font-size:var(--text-sm);color:var(--text-primary);margin-bottom:0.35rem;">
          <strong>${escHtml(speaker)}</strong> completes the sentence.
        </p>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1rem;">
          ${escHtml(listener)}, listen closely with an open heart!
        </p>
        <button class="btn btn-primary w-full" id="btn-fts-done">
          💖 Sentence Completed (+1)
        </button>
      </div>
    `;

    document.getElementById('btn-fts-done')?.addEventListener('click', () => {
      sounds.done();
      callbacks.onDone();
    });
  }

  onDone(card) {}
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * src/views/end.js
 * End screen — recap stats, winner announcement, Cupid Decree stake award, and play-again button.
 */

import { t } from '../lib/i18n.js';
import { state } from '../lib/state.js';
import { navigate } from '../lib/router.js';
import { fireConfetti } from '../lib/confetti.js';
import { sounds } from '../lib/sound.js';

export function renderEnd() {
  const app = document.getElementById('app');
  const scores = state.get('scores') ?? [0, 0];
  const p1 = state.get('player1') ?? 'Player 1';
  const p2 = state.get('player2') ?? 'Player 2';
  const game = state.get('game') ?? 'truth-or-dare';
  const stake = state.get('stake') ?? 'None';

  // Determine winner
  const trophy = '🏆';
  let subtitle = '';
  if (scores[0] > scores[1]) subtitle = `${p1} wins! 🎉`;
  else if (scores[1] > scores[0]) subtitle = `${p2} wins! 🎉`;
  else subtitle = 'It\'s a tie! You\'re both winners 💕';

  // Decree message if stake active
  const hasStake = stake && stake !== 'None';
  let stakeDecree = '';
  if (hasStake) {
    if (scores[0] > scores[1]) {
      stakeDecree = t('stakes.winnerDecree', { winner: p1, loser: p2, stake });
    } else if (scores[1] > scores[0]) {
      stakeDecree = t('stakes.winnerDecree', { winner: p2, loser: p1, stake });
    } else {
      stakeDecree = t('stakes.tieDecree', { p1, p2, stake });
    }
  }

  // Build recap rows
  const recapRows = [
    [t('end.player1Score', { name: p1 }), scores[0]],
    [t('end.player2Score', { name: p2 }), scores[1]],
    [t('end.cardsPlayed'), state.get('cardsPlayed') ?? 0],
    [t('end.skipsUsed'), (state.get('skipsUsed') ?? [0,0]).join(' / ')],
    [t('end.vetosUsed'), (state.get('vetosUsed') ?? [0,0]).join(' / ')],
  ];

  if (game === 'never-have-i-ever') {
    recapRows.push([t('end.commonThings'), state.get('nhieCommonCount') ?? 0]);
  }
  if (game === 'would-you-rather') {
    const matched = state.get('wyrMatchCount') ?? 0;
    const total = state.get('wyrTotalCount') ?? 0;
    const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
    recapRows.push([t('end.wyrMatchPct'), `${pct}%`]);
  }
  if (game === 'who-is-most-likely') {
    const matched = state.get('telepathyMatches') ?? 0;
    const total = state.get('telepathyTotal') ?? 0;
    const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
    recapRows.push(['Telepathy Agreement', `${pct}% (${matched}/${total} agreed)`]);
  }

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-end">
      <div class="end-screen" style="padding-top:2rem">
        <div class="end-trophy" aria-hidden="true">${trophy}</div>
        <h1 class="end-title">${t('end.title')}</h1>
        <p style="color:var(--text-secondary);font-size:var(--text-xl);font-family:var(--font-display)">${subtitle}</p>

        ${hasStake ? `
          <div class="stake-decree-card glass-card animate-scale-up" style="margin: 1.25rem 0; padding: 1.25rem; border-radius: 18px; border: 1px solid var(--accent); background: linear-gradient(135deg, rgba(255,107,157,0.12), rgba(124,58,237,0.12)); text-align: center;">
            <div style="font-size: 1.75rem; margin-bottom: 0.25rem;">📜</div>
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('stakes.certificateTitle')}
            </div>
            <div style="font-size: var(--text-md); margin-top: 0.5rem; color: var(--text-primary); line-height: 1.5; font-family: var(--font-display);">
              ${escHtml(stakeDecree)}
            </div>
          </div>
        ` : ''}

        <div class="end-recap glass-card">
          ${recapRows.map(([label, val]) => `
            <div class="end-recap-row">
              <span>${label}</span>
              <strong>${val}</strong>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-primary" id="btn-play-again">${t('end.btnPlayAgain')}</button>
        <button class="btn btn-ghost w-full" id="btn-home">${t('end.btnHome')}</button>
      </div>

      <footer class="app-footer">${t('app.footer')}</footer>
    </div>
  `;

  // Fire confetti on load
  setTimeout(() => {
    sounds.confetti();
    fireConfetti(80);
  }, 300);

  document.getElementById('btn-play-again')?.addEventListener('click', () => {
    state.reset(true); // keep names/settings/stake
    navigate(`game/${game}`);
  });

  document.getElementById('btn-home')?.addEventListener('click', () => {
    state.reset(true);
    navigate('home');
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

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

  // Fun couple awards
  const skipsUsed = state.get('skipsUsed') ?? [0, 0];
  const bravestPlayer =
    skipsUsed[0] < skipsUsed[1] ? p1 : skipsUsed[1] < skipsUsed[0] ? p2 : 'Both of you 🦁';
  const honestPlayer = scores[0] > scores[1] ? p1 : scores[1] > scores[0] ? p2 : 'Both of you 💕';

  // Build recap rows
  const recapRows = [
    [t('end.player1Score', { name: p1 }), scores[0]],
    [t('end.player2Score', { name: p2 }), scores[1]],
    ['🦁 Bravest Player', bravestPlayer],
    ['💬 Most Honest', honestPlayer],
    [t('end.cardsPlayed'), state.get('cardsPlayed') ?? 0],
    [t('end.skipsUsed'), (state.get('skipsUsed') ?? [0, 0]).join(' / ')],
    [t('end.vetosUsed'), (state.get('vetosUsed') ?? [0, 0]).join(' / ')],
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

        ${
          hasStake
            ? `
          <div class="stake-decree-card glass-card animate-scale-up" style="margin: 1.25rem 0; padding: 1.25rem; border-radius: 18px; border: 1px solid var(--accent); background: linear-gradient(135deg, rgba(255,107,157,0.12), rgba(124,58,237,0.12)); text-align: center;">
            <div style="font-size: 1.75rem; margin-bottom: 0.25rem;">📜</div>
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('stakes.certificateTitle')}
            </div>
            <div style="font-size: var(--text-md); margin-top: 0.5rem; color: var(--text-primary); line-height: 1.5; font-family: var(--font-display);">
              ${escHtml(stakeDecree)}
            </div>
          </div>
        `
            : ''
        }

        <div class="end-recap glass-card">
          ${recapRows
            .map(
              ([label, val]) => `
            <div class="end-recap-row">
              <span>${label}</span>
              <strong>${val}</strong>
            </div>
          `
            )
            .join('')}
        </div>

        <button class="btn btn-secondary w-full" id="btn-save-recap" style="margin-bottom:.75rem">
          📸 Save Shareable Recap Card
        </button>
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

  document.getElementById('btn-save-recap')?.addEventListener('click', () => {
    downloadRecapCard(p1, p2, scores, { bravest: bravestPlayer, honest: honestPlayer });
  });

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
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadRecapCard(p1, p2, scores, awards) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, 750);
  grad.addColorStop(0, '#1c101c');
  grad.addColorStop(1, '#0d0a12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 750);

  // Border
  ctx.strokeStyle = '#c4556a';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 560, 710);

  // Header
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Eachother Being Together 💕', 300, 80);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#c4556a';
  ctx.fillText('Couples Game Night Recap', 300, 115);

  // Line
  ctx.strokeStyle = 'rgba(196,85,106,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 140);
  ctx.lineTo(520, 140);
  ctx.stroke();

  // Scores
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${p1}: ${scores[0]} pts`, 200, 210);
  ctx.fillText(`${p2}: ${scores[1]} pts`, 400, 210);

  // Awards box
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(80, 260, 440, 180);
  ctx.strokeStyle = 'rgba(196,85,106,0.2)';
  ctx.strokeRect(80, 260, 440, 180);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#c4556a';
  ctx.fillText('👑 Tonight\'s Fun Awards', 300, 300);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`🦁 Bravest: ${awards.bravest}`, 300, 350);
  ctx.fillText(`💬 Most Honest: ${awards.honest}`, 300, 395);

  // Quote
  ctx.font = 'italic 16px serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('"In all the world, there is no heart for me like yours."', 300, 550);

  // Footer date
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText(
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    300,
    660
  );

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EBT-Recap-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

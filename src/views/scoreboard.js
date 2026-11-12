/**
 * src/views/scoreboard.js
 * Scoreboard & Trophy Shelf — Tracks games played, dares completed, streaks, and badges.
 */

import { navigate } from '../lib/router.js';
import { getStats } from '../lib/stats.js';

const BADGES = [
  {
    id: 'first_game',
    icon: '🎯',
    title: 'First Spark',
    desc: 'Played your first game together',
    check: (s) => s.gamesPlayed >= 1,
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: 'On Fire',
    desc: '3-day romance streak',
    check: (s) => s.streak >= 3 || s.longestStreak >= 3,
  },
  {
    id: 'streak_7',
    icon: '💍',
    title: 'Inseparable',
    desc: '7-day playing streak',
    check: (s) => s.streak >= 7 || s.longestStreak >= 7,
  },
  {
    id: 'dares_10',
    icon: '🦁',
    title: 'Fearless Lovers',
    desc: 'Completed 10 dares together',
    check: (s) => s.daresCompleted >= 10,
  },
  {
    id: 'games_25',
    icon: '👑',
    title: 'True Soulmates',
    desc: 'Played 25 game sessions',
    check: (s) => s.gamesPlayed >= 25,
  },
  {
    id: 'games_50',
    icon: '🏆',
    title: 'Couple Legends',
    desc: 'Played 50 games together',
    check: (s) => s.gamesPlayed >= 50,
  },
];

export function renderScoreboard() {
  const app = document.getElementById('app');
  const stats = getStats();

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-scoreboard">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
        <span class="header-logo">🏆 Couple Scoreboard</span>
        <div style="width:44px;"></div>
      </header>

      <div style="padding:0.75rem 0;">
        <!-- Streak Banner -->
        <div class="glass-card mb-4" style="text-align:center;padding:1.5rem;background:linear-gradient(135deg,rgba(196,85,106,0.15),rgba(124,58,237,0.1));border-color:var(--color-rose);">
          <div style="font-size:3rem;line-height:1;margin-bottom:0.35rem;">🔥</div>
          <div style="font-size:var(--text-3xl);font-weight:900;color:var(--text-primary);line-height:1;">
            ${stats.streak ?? 0}
          </div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-rose);margin:0.25rem 0;">
            Days Played in a Row
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);">
            Longest streak: ${stats.longestStreak ?? 0} days
          </div>
        </div>

        <!-- 3 Key Stats Counters -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
          <div class="glass-card" style="padding:1rem;text-align:center;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--text-primary);">
              ${stats.gamesPlayed ?? 0}
            </div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:0.25rem;">
              Games Played
            </div>
          </div>
          <div class="glass-card" style="padding:1rem;text-align:center;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--text-primary);">
              ${stats.daresCompleted ?? 0}
            </div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:0.25rem;">
              Dares Completed
            </div>
          </div>
        </div>

        <!-- Trophy Shelf -->
        <div class="glass-card mb-4" style="padding:1.25rem;">
          <h2 style="font-size:var(--text-md);font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
            <span>🏅</span> Trophy Shelf
          </h2>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            ${BADGES.map((b) => {
              const unlocked = b.check(stats);
              return `
                <div class="badge-card glass-card" style="padding:0.85rem;text-align:center;border-color:${unlocked ? 'var(--color-rose)' : 'var(--border)'};opacity:${unlocked ? '1' : '0.45'};background:${unlocked ? 'rgba(196,85,106,0.08)' : 'transparent'};">
                  <div style="font-size:2rem;margin-bottom:0.25rem;filter:${unlocked ? 'none' : 'grayscale(100%)'};">${b.icon}</div>
                  <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);">${b.title}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.2rem;line-height:1.3;">${b.desc}</div>
                  <div style="margin-top:0.4rem;">
                    <span style="font-size:0.65rem;padding:2px 6px;border-radius:999px;font-weight:700;background:${unlocked ? '#16a34a' : 'var(--border)'};color:#fff;">
                      ${unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
}

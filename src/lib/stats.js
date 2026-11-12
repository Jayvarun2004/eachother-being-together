/**
 * src/lib/stats.js
 * Scoreboard & Streaks — tracks gameplay statistics in localStorage.
 */

const STATS_KEY = 'ebt_stats';

function getStats() {
  try {
    return (
      JSON.parse(localStorage.getItem(STATS_KEY) ?? 'null') ?? {
        gamesPlayed: 0,
        daresCompleted: 0,
        lastPlayedDate: null,
        streak: 0,
        longestStreak: 0,
      }
    );
  } catch {
    return { gamesPlayed: 0, daresCompleted: 0, lastPlayedDate: null, streak: 0, longestStreak: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Update stats when a game session ends.
 * @param {{ daresCompleted?: number }} opts
 */
export function updateStats({ daresCompleted = 0 } = {}) {
  const stats = getStats();
  const today = new Date().toISOString().slice(0, 10);

  stats.gamesPlayed = (stats.gamesPlayed ?? 0) + 1;
  stats.daresCompleted = (stats.daresCompleted ?? 0) + daresCompleted;

  // Streak logic
  if (stats.lastPlayedDate === today) {
    // Already played today — streak unchanged
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (stats.lastPlayedDate === yesterdayStr) {
      stats.streak = (stats.streak ?? 0) + 1;
    } else {
      stats.streak = 1;
    }
    stats.lastPlayedDate = today;
  }

  stats.longestStreak = Math.max(stats.longestStreak ?? 0, stats.streak ?? 0);
  saveStats(stats);
  return stats;
}

export { getStats };

/**
 * src/views/days-together.js
 * Days Together Counter — hero counter, anniversary date, milestones, countdown.
 */

import { navigate } from '../lib/router.js';
import { fireConfetti } from '../lib/confetti.js';
import { toast } from '../lib/toast.js';

const KEY = 'ebt_anniversary';

const MILESTONES = [
  { days: 100, emoji: '💯', msg: '100 days! A hundred reasons to love you! 💕' },
  { days: 365, emoji: '🎂', msg: 'One whole year together! You are my favourite adventure. 🎉' },
  { days: 500, emoji: '🌟', msg: '500 days! Half a thousand days of magic with you. ✨' },
  { days: 1000, emoji: '🏆', msg: '1000 days! A thousand days stronger, deeper, more in love. 💍' },
];

function getAnniversary() {
  return localStorage.getItem(KEY) ?? null;
}

function saveAnniversary(dateStr) {
  localStorage.setItem(KEY, dateStr);
}

function daysBetween(d1, d2) {
  const ms = d2.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function nextAnniversaryDays(startDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(startDate);
  next.setFullYear(today.getFullYear());
  next.setHours(0, 0, 0, 0);
  if (next <= today) next.setFullYear(today.getFullYear() + 1);
  return daysBetween(today, next);
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDaysTogether() {
  const app = document.getElementById('app');
  const ann = getAnniversary();

  if (!ann) {
    renderDateInput(app);
  } else {
    renderCounter(app, ann);
  }
}

function renderDateInput(app) {
  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-days-together">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">🏠</button>
        <span style="font-size:var(--text-sm);color:var(--text-muted)">📅 Days Together</span>
        <span></span>
      </header>
      <div style="padding:2rem 1.5rem;text-align:center">
        <div style="font-size:4rem;margin-bottom:1rem">📅</div>
        <h1 style="font-size:var(--text-xl);font-weight:800;margin-bottom:.5rem">When did your story begin?</h1>
        <p style="color:var(--text-muted);margin-bottom:2rem;font-size:var(--text-sm)">
          Enter your anniversary date and we'll count every beautiful day together.
        </p>
        <div class="glass-card" style="padding:1.5rem;max-width:360px;margin:0 auto">
          <label style="display:block;font-size:var(--text-sm);color:var(--text-muted);margin-bottom:.5rem">
            Our anniversary date
          </label>
          <input type="date" id="inp-anniversary"
            style="width:100%;padding:.6rem 1rem;border-radius:var(--radius-sm);
                   border:1.5px solid var(--border);background:var(--bg-glass);
                   font-size:var(--text-base);margin-bottom:1rem;color:var(--text)"
            max="${new Date().toISOString().slice(0, 10)}" />
          <button class="btn btn-primary w-full" id="btn-save-date">
            💕 Set Our Date
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-save-date')?.addEventListener('click', () => {
    const val = document.getElementById('inp-anniversary')?.value;
    if (!val) {
      toast('Please pick a date 📅', 'warning');
      return;
    }
    if (new Date(val) > new Date()) {
      toast('Date can\'t be in the future!', 'warning');
      return;
    }
    saveAnniversary(val);
    renderCounter(document.getElementById('app'), val);
  });
}

function renderCounter(app, annDateStr) {
  const start = new Date(annDateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = daysBetween(start, today);
  const daysToAnn = nextAnniversaryDays(start);

  // Check milestones
  const milestone = MILESTONES.find((m) => m.days === days);

  app.innerHTML = /* html */ `
    <div class="view active animate-fade-in" id="view-days-together">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">🏠</button>
        <span style="font-size:var(--text-sm);color:var(--text-muted)">📅 Days Together</span>
        <button class="btn-icon" id="btn-edit-date" title="Edit anniversary date">✏️</button>
      </header>

      <div style="padding:1.5rem;text-align:center">
        <!-- Hero counter -->
        <div class="glass-card" style="padding:2.5rem 1.5rem;margin-bottom:1.5rem;position:relative;overflow:hidden">
          <div style="font-size:5rem;font-weight:900;line-height:1;
                      background:linear-gradient(135deg,var(--color-rose),var(--color-purple-mid));
                      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                      background-clip:text" id="counter-number">
            ${days.toLocaleString()}
          </div>
          <div style="font-size:var(--text-xl);font-weight:600;margin:.5rem 0;color:var(--text)">
            days together 💕
          </div>
          <div style="color:var(--text-muted);font-size:var(--text-sm)">
            Since ${new Date(annDateStr).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        ${
          milestone
            ? /* html */ `
          <div class="glass-card" id="milestone-card"
               style="padding:1.5rem;margin-bottom:1.5rem;border-color:var(--color-rose);
                      background:linear-gradient(135deg,rgba(196,85,106,.12),rgba(107,79,160,.12))">
            <div style="font-size:3rem;margin-bottom:.5rem">${escHtml(milestone.emoji)}</div>
            <p style="font-size:var(--text-base);font-weight:700;color:var(--color-rose)">
              ${escHtml(milestone.msg)}
            </p>
          </div>
        `
            : ''
        }

        <!-- Next milestone progress -->
        ${renderMilestoneProgress(days)}

        <!-- Next anniversary countdown -->
        <div class="glass-card" style="padding:1.25rem;margin-bottom:1.5rem">
          <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:.25rem">
            🗓️ Next anniversary in
          </div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--color-purple-mid)">
            ${daysToAnn} days
          </div>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
          <div class="glass-card" style="padding:1rem">
            <div style="font-size:1.75rem;font-weight:800">${Math.floor(days / 7)}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">weeks together</div>
          </div>
          <div class="glass-card" style="padding:1rem">
            <div style="font-size:1.75rem;font-weight:800">${Math.floor(days / 30)}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">months together</div>
          </div>
        </div>

        <button class="btn btn-ghost w-full" id="btn-edit-date-bottom">
          ✏️ Edit Date
        </button>
        <button class="btn btn-ghost w-full" style="margin-top:.5rem" id="btn-back-bottom">
          🏠 Back to Home
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-back-bottom')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-edit-date')?.addEventListener('click', () => renderDateInput(app));
  document
    .getElementById('btn-edit-date-bottom')
    ?.addEventListener('click', () => renderDateInput(app));

  // Fire milestone confetti
  if (milestone) {
    setTimeout(() => fireConfetti(80), 300);
    toast(milestone.msg, 'success', 4000);
  }
}

function renderMilestoneProgress(days) {
  const next = MILESTONES.find((m) => m.days > days);
  if (!next) {
    return /* html */ `
      <div class="glass-card" style="padding:1rem;margin-bottom:1rem;text-align:center">
        <span style="font-size:var(--text-sm);color:var(--color-rose)">🏆 You've hit all milestones!</span>
      </div>
    `;
  }
  const pct = Math.min(100, Math.round((days / next.days) * 100));
  return /* html */ `
    <div class="glass-card" style="padding:1rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);
                  color:var(--text-muted);margin-bottom:.5rem">
        <span>Next milestone: ${next.emoji} ${next.days} days</span>
        <span>${next.days - days} days to go</span>
      </div>
      <div style="background:var(--border);border-radius:9999px;height:8px;overflow:hidden">
        <div style="width:${pct}%;height:100%;
                    background:linear-gradient(90deg,var(--color-rose),var(--color-purple-mid));
                    border-radius:9999px;transition:width .6s ease"></div>
      </div>
    </div>
  `;
}

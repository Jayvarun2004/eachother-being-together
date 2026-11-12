/**
 * src/views/date-roulette.js
 * Date Night Roulette — spinning slot columns with filters and editable lists.
 */

import { navigate } from '../lib/router.js';
import { toast } from '../lib/toast.js';

const LS_KEY = 'ebt_roulette';

const DEFAULTS = {
  indoor: [
    'Movie marathon',
    'Cook together',
    'Board games',
    'Spa night',
    'Dance in the kitchen',
    'Puzzle night',
    'Bake something',
    'Watch old photos',
    'Play video games',
    'Read together',
  ],
  outdoor: [
    'Picnic',
    'Sunset walk',
    'Stargazing',
    'Visit a café',
    'Farmers market',
    'Bike ride',
    'Explore a new neighbourhood',
    'Street food tour',
    'Visit a bookshop',
    'Mini golf',
  ],
  food: [
    'Pizza',
    'Pasta',
    'Sushi',
    'Tacos',
    'Indian',
    'Thai',
    'Sandwiches',
    'Ramen',
    'Greek',
    'Burgers',
  ],
  genre: [
    'Romance',
    'Comedy',
    'Thriller',
    'Action',
    'Sci-Fi',
    'Documentary',
    'Horror',
    'Fantasy',
    'Animation',
    'Drama',
  ],
};

function getLists() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') ?? { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveLists(lists) {
  localStorage.setItem(LS_KEY, JSON.stringify(lists));
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function renderDateRoulette() {
  const app = document.getElementById('app');

  let lists = getLists();
  let indoor = true;
  let budget = 'free';
  let locks = [false, false, false]; // [activity, food, genre]
  let results = ['?', '?', '?'];
  let spinning = false;
  let editMode = null; // null | 'activity' | 'food' | 'genre'

  function getActivities() {
    return indoor ? lists.indoor : lists.outdoor;
  }

  function render() {
    app.innerHTML = /* html */ `
      <div class="view active animate-fade-in" id="view-date-roulette">
        <header class="app-header">
          <button class="btn-icon" id="btn-back" aria-label="Back">🏠</button>
          <span style="font-size:var(--text-sm);color:var(--text-muted)">🎡 Date Night Roulette</span>
          <span></span>
        </header>

        <div style="padding:1rem 1rem 2rem">
          <!-- Filters -->
          <div class="glass-card" style="padding:1rem;margin-bottom:1rem">
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:.75rem">
              <span style="font-size:var(--text-xs);color:var(--text-muted)">Budget:</span>
              ${['free', 'cheap', 'treat']
                .map(
                  (b) => `
                <button class="segmented-pill ${budget === b ? 'active' : ''}" data-budget="${b}">
                  ${b === 'free' ? 'Free 🆓' : b === 'cheap' ? 'Cheap 💰' : 'Treat Yourself 💎'}
                </button>
              `
                )
                .join('')}
            </div>
            <div style="display:flex;gap:.5rem;align-items:center">
              <span style="font-size:var(--text-xs);color:var(--text-muted)">Setting:</span>
              <button class="segmented-pill ${indoor ? 'active' : ''}" id="btn-indoor">🏠 Indoor</button>
              <button class="segmented-pill ${!indoor ? 'active' : ''}" id="btn-outdoor">🌳 Outdoor</button>
            </div>
          </div>

          <!-- Slot columns -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1.5rem">
            ${renderSlot(0, '🎯 Activity', results[0], locks[0])}
            ${renderSlot(1, '🍽️ Food', results[1], locks[1])}
            ${renderSlot(2, '🎬 Genre', results[2], locks[2])}
          </div>

          <!-- Spin button -->
          <button class="btn btn-primary w-full" id="btn-spin"
                  style="font-size:var(--text-lg);padding:1rem;margin-bottom:1rem"
                  ${spinning ? 'disabled' : ''}>
            🎡 Spin!
          </button>

          <!-- Edit lists -->
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
            <button class="btn btn-ghost btn-sm" id="btn-edit-activity">✏️ Edit Activities</button>
            <button class="btn btn-ghost btn-sm" id="btn-edit-food">✏️ Edit Food</button>
            <button class="btn btn-ghost btn-sm" id="btn-edit-genre">✏️ Edit Genres</button>
          </div>

          ${editMode ? renderEditPanel(editMode, lists) : ''}

          <button class="btn btn-ghost w-full" id="btn-back-bottom">🏠 Back to Home</button>
        </div>
      </div>
    `;

    // Wire events
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
    document.getElementById('btn-back-bottom')?.addEventListener('click', () => navigate('home'));
    document.getElementById('btn-indoor')?.addEventListener('click', () => {
      indoor = true;
      render();
    });
    document.getElementById('btn-outdoor')?.addEventListener('click', () => {
      indoor = false;
      render();
    });

    document.querySelectorAll('[data-budget]').forEach((btn) => {
      btn.addEventListener('click', () => {
        budget = btn.dataset.budget;
        render();
      });
    });

    // Lock toggles
    [0, 1, 2].forEach((i) => {
      document.getElementById(`btn-lock-${i}`)?.addEventListener('click', () => {
        locks[i] = !locks[i];
        render();
      });
    });

    // Spin
    document.getElementById('btn-spin')?.addEventListener('click', () => {
      if (spinning) return;
      doSpin();
    });

    // Edit buttons
    document.getElementById('btn-edit-activity')?.addEventListener('click', () => {
      editMode = editMode === 'activity' ? null : 'activity';
      render();
    });
    document.getElementById('btn-edit-food')?.addEventListener('click', () => {
      editMode = editMode === 'food' ? null : 'food';
      render();
    });
    document.getElementById('btn-edit-genre')?.addEventListener('click', () => {
      editMode = editMode === 'genre' ? null : 'genre';
      render();
    });

    // Edit panel events
    if (editMode) {
      wireEditPanel(editMode);
    }
  }

  function renderSlot(idx, label, value, locked) {
    return /* html */ `
      <div class="glass-card" style="padding:.75rem;text-align:center;position:relative">
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:.5rem">${escHtml(label)}</div>
        <div id="slot-${idx}"
             style="font-size:var(--text-sm);font-weight:700;min-height:3rem;
                    display:flex;align-items:center;justify-content:center;
                    color:var(--color-rose);line-height:1.3;padding:.25rem">
          ${escHtml(value)}
        </div>
        <button id="btn-lock-${idx}"
                class="btn btn-ghost btn-sm"
                style="font-size:var(--text-xs);margin-top:.5rem;padding:.25rem .5rem;
                       ${locked ? 'background:rgba(196,85,106,.2);border-color:var(--color-rose)' : ''}">
          ${locked ? '🔒 Locked' : '🔓 Lock'}
        </button>
      </div>
    `;
  }

  function renderEditPanel(mode, lists) {
    const key =
      mode === 'activity' ? (indoor ? 'indoor' : 'outdoor') : mode === 'food' ? 'food' : 'genre';
    const items = lists[key] ?? [];
    return /* html */ `
      <div class="glass-card" style="padding:1rem;margin-bottom:1rem" id="edit-panel">
        <h3 style="font-size:var(--text-sm);font-weight:700;margin-bottom:.75rem">
          Edit ${mode === 'activity' ? (indoor ? 'Indoor' : 'Outdoor') + ' Activities' : mode === 'food' ? 'Food Options' : 'Movie Genres'}
        </h3>
        <div id="edit-list">
          ${items
            .map(
              (item, i) => `
            <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">
              <span style="flex:1;font-size:var(--text-sm)">${escHtml(item)}</span>
              <button class="btn-icon" style="font-size:.875rem" data-del="${i}" data-key="${key}">🗑️</button>
            </div>
          `
            )
            .join('')}
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.75rem">
          <input id="inp-new-item" type="text" placeholder="Add new item…"
                 style="flex:1;padding:.45rem .75rem;border-radius:var(--radius-sm);
                        border:1.5px solid var(--border);background:var(--bg-glass);
                        font-size:var(--text-sm)" maxlength="60" />
          <button class="btn btn-primary btn-sm" id="btn-add-item" data-key="${key}">Add</button>
        </div>
      </div>
    `;
  }

  function wireEditPanel(mode) {
    const key =
      mode === 'activity' ? (indoor ? 'indoor' : 'outdoor') : mode === 'food' ? 'food' : 'genre';

    document.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.del, 10);
        const k = btn.dataset.key;
        lists[k].splice(idx, 1);
        saveLists(lists);
        render();
      });
    });

    document.getElementById('btn-add-item')?.addEventListener('click', () => {
      const inp = document.getElementById('inp-new-item');
      const val = inp?.value?.trim();
      if (!val) return;
      if (!lists[key]) lists[key] = [];
      lists[key].push(val);
      saveLists(lists);
      inp.value = '';
      render();
    });

    document.getElementById('inp-new-item')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-add-item')?.click();
    });
  }

  function doSpin() {
    spinning = true;
    const spinBtn = document.getElementById('btn-spin');
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.textContent = '🌀 Spinning…';
    }

    const frames = 12;
    let frame = 0;
    const activities = getActivities();

    const interval = setInterval(() => {
      frame++;
      if (!locks[0]) {
        const el = document.getElementById('slot-0');
        if (el) el.textContent = rand(activities);
      }
      if (!locks[1]) {
        const el = document.getElementById('slot-1');
        if (el) el.textContent = rand(lists.food);
      }
      if (!locks[2]) {
        const el = document.getElementById('slot-2');
        if (el) el.textContent = rand(lists.genre);
      }

      if (frame >= frames) {
        clearInterval(interval);
        spinning = false;
        results[0] = locks[0] ? results[0] : rand(activities);
        results[1] = locks[1] ? results[1] : rand(lists.food);
        results[2] = locks[2] ? results[2] : rand(lists.genre);

        const el0 = document.getElementById('slot-0');
        const el1 = document.getElementById('slot-1');
        const el2 = document.getElementById('slot-2');
        if (el0) el0.textContent = results[0];
        if (el1) el1.textContent = results[1];
        if (el2) el2.textContent = results[2];

        if (spinBtn) {
          spinBtn.disabled = false;
          spinBtn.textContent = '🎡 Spin Again!';
        }
        toast(`Tonight: ${results[0]} 🍽️ ${results[1]} 🎬 ${results[2]}`, 'success', 3500);
      }
    }, 80);
  }

  render();
}

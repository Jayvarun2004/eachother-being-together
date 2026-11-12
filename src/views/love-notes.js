/**
 * src/views/love-notes.js
 * Love Notes Jar — Write secret love notes, select "Open When..." triggers,
 * and draw sealed notes with a delightful unfolding animation.
 */

import { navigate } from '../lib/router.js';
import { state } from '../lib/state.js';
import { sounds } from '../lib/sound.js';
import { fireConfetti } from '../lib/confetti.js';
import { toast } from '../lib/toast.js';

const NOTES_KEY = 'ebt_love_notes';

const TRIGGERS = [
  { id: 'anytime', label: 'Anytime 💌', desc: 'Can be opened anytime' },
  { id: 'miss_me', label: 'When you miss me 🥺', desc: 'For lonely moments' },
  { id: 'sad', label: 'When you had a rough day 🌧️', desc: 'A warm hug in words' },
  { id: 'smile', label: 'When you need a laugh 😂', desc: 'Inside jokes & silly love' },
  { id: 'butterflies', label: 'When you want butterflies 🦋', desc: 'Flirty & romantic sparks' },
  { id: 'anniversary', label: 'On our next anniversary 🥂', desc: 'Special milestone note' },
];

function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderLoveNotes() {
  const app = document.getElementById('app');
  const p1 = state.get('player1') ?? 'Partner 1';
  const p2 = state.get('player2') ?? 'Partner 2';
  const notes = getNotes();

  let activeTab = 'draw'; // 'draw' | 'write' | 'jar'
  let drawnNote = null;
  let selectedFilter = 'all';

  function render() {
    app.innerHTML = /* html */ `
      <div class="view active animate-slide-up" id="view-love-notes">
        <header class="app-header">
          <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
          <span class="header-logo">🍯 Love Notes Jar</span>
          <div style="width:44px;"></div>
        </header>

        <div style="padding:0.75rem 0;">
          <!-- Tab selector -->
          <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;">
            <button class="segmented-pill ${activeTab === 'draw' ? 'active' : ''}" id="tab-draw" style="flex:1;">
              🎁 Draw a Note
            </button>
            <button class="segmented-pill ${activeTab === 'write' ? 'active' : ''}" id="tab-write" style="flex:1;">
              ✍️ Write a Note
            </button>
            <button class="segmented-pill ${activeTab === 'jar' ? 'active' : ''}" id="tab-jar" style="flex:1;">
              🫙 The Jar (${notes.length})
            </button>
          </div>

          ${activeTab === 'draw' ? renderDrawView() : ''}
          ${activeTab === 'write' ? renderWriteView() : ''}
          ${activeTab === 'jar' ? renderJarView() : ''}
        </div>
      </div>
    `;

    document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));

    document.getElementById('tab-draw')?.addEventListener('click', () => {
      activeTab = 'draw';
      drawnNote = null;
      render();
    });
    document.getElementById('tab-write')?.addEventListener('click', () => {
      activeTab = 'write';
      render();
    });
    document.getElementById('tab-jar')?.addEventListener('click', () => {
      activeTab = 'jar';
      render();
    });

    wireEvents();
  }

  function renderDrawView() {
    return /* html */ `
      <div class="glass-card mb-4" style="text-align:center;padding:2rem 1.25rem;">
        <div style="font-size:3.5rem;margin-bottom:0.75rem;" class="animate-pulse">🫙</div>
        <h2 style="font-size:var(--text-lg);font-weight:700;margin-bottom:0.35rem;">
          Pick from the Love Jar
        </h2>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1.5rem;">
          Choose a mood or pick a random love note written by your partner
        </p>

        <!-- Filter trigger -->
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;justify-content:center;margin-bottom:1.5rem;">
          <button class="btn btn-ghost btn-sm ${selectedFilter === 'all' ? 'active' : ''}" data-filter="all" style="font-size:var(--text-xs);border-radius:var(--radius-full);">
            ✨ Any Note
          </button>
          ${TRIGGERS.map(
            (t) => `
            <button class="btn btn-ghost btn-sm ${selectedFilter === t.id ? 'active' : ''}" data-filter="${t.id}" style="font-size:var(--text-xs);border-radius:var(--radius-full);">
              ${t.label}
            </button>
          `
          ).join('')}
        </div>

        <button class="btn btn-primary" id="btn-draw-note" style="font-size:var(--text-base);padding:0.85rem 2rem;">
          💌 Pull a Love Note
        </button>

        <!-- Unfolded Note Modal -->
        ${
          drawnNote
            ? `
          <div class="glass-card animate-scale-up" style="margin-top:2rem;padding:1.5rem;border-color:var(--color-rose);background:linear-gradient(135deg,rgba(196,85,106,0.12),rgba(124,58,237,0.08));text-align:left;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
              <span style="font-size:var(--text-xs);font-weight:700;color:var(--color-rose);">
                ${escHtml(TRIGGERS.find((t) => t.id === drawnNote.trigger)?.label ?? '💌 Love Note')}
              </span>
              <span style="font-size:var(--text-xs);color:var(--text-muted);">From ${escHtml(drawnNote.author)}</span>
            </div>
            <p style="font-size:var(--text-lg);line-height:1.6;font-family:var(--font-display);color:var(--text-primary);margin-bottom:1rem;">
              "${escHtml(drawnNote.text)}"
            </p>
            <div style="font-size:var(--text-xs);color:var(--text-muted);text-align:right;">
              Written on ${new Date(drawnNote.date).toLocaleDateString()}
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  function renderWriteView() {
    return /* html */ `
      <div class="glass-card mb-4" style="padding:1.25rem;">
        <h2 style="font-size:var(--text-md);font-weight:700;margin-bottom:0.35rem;">
          Drop a Secret Note into the Jar
        </h2>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1.25rem;">
          Write something sweet, spicy, or encouraging for your partner to open later.
        </p>

        <label for="inp-note-author" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.35rem;">
          Who is writing this note?
        </label>
        <select id="inp-note-author" style="width:100%;padding:0.6rem 0.85rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:1rem;">
          <option value="${escHtml(p1)}">${escHtml(p1)}</option>
          <option value="${escHtml(p2)}">${escHtml(p2)}</option>
        </select>

        <label for="inp-note-trigger" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.35rem;">
          "Open when..." trigger:
        </label>
        <select id="inp-note-trigger" style="width:100%;padding:0.6rem 0.85rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:1rem;">
          ${TRIGGERS.map(
            (t) => `
            <option value="${t.id}">${t.label} — ${t.desc}</option>
          `
          ).join('')}
        </select>

        <label for="inp-note-text" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.35rem;">
          Your Message (10 to 500 characters):
        </label>
        <textarea id="inp-note-text" rows="4" placeholder="Write from the heart... e.g. Just remembering the way your eyes lit up on our walk yesterday. You are my favorite person."
          style="width:100%;padding:0.75rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:1.25rem;line-height:1.5;resize:vertical;" maxlength="500"></textarea>

        <button class="btn btn-primary w-full" id="btn-save-note">
          💌 Seal & Drop Into Jar
        </button>
      </div>
    `;
  }

  function renderJarView() {
    return /* html */ `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="font-size:var(--text-md);font-weight:700;">Jar Contents (${notes.length})</h2>
          ${
            notes.length > 0
              ? `
            <button class="btn btn-ghost btn-sm" id="btn-clear-notes" style="font-size:var(--text-xs);color:#ef4444;">
              Clear Jar
            </button>
          `
              : ''
          }
        </div>

        ${
          notes.length === 0
            ? `
          <div class="glass-card" style="text-align:center;padding:2.5rem 1rem;color:var(--text-muted);">
            <div style="font-size:3rem;margin-bottom:0.5rem;">🫙</div>
            <p style="font-size:var(--text-sm);">The love jar is empty!</p>
            <p style="font-size:var(--text-xs);margin-top:0.25rem;">Switch to "Write a Note" to slip the first sweet thought into the jar.</p>
          </div>
        `
            : `
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            ${notes
              .map(
                (n, i) => `
              <div class="glass-card" style="padding:1rem;position:relative;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                  <span style="font-size:var(--text-xs);font-weight:700;color:var(--color-rose);">
                    ${escHtml(TRIGGERS.find((t) => t.id === n.trigger)?.label ?? '💌 Note')}
                  </span>
                  <span style="font-size:var(--text-xs);color:var(--text-muted);">By ${escHtml(n.author)}</span>
                </div>
                <p style="font-size:var(--text-sm);color:var(--text-primary);line-height:1.5;margin-bottom:0.5rem;">
                  "${escHtml(n.text)}"
                </p>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:var(--text-xs);color:var(--text-muted);">${new Date(n.date).toLocaleDateString()}</span>
                  <button class="btn-icon" data-del-note="${i}" style="width:28px;height:28px;font-size:0.75rem;" aria-label="Delete note">🗑️</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
        }
      </div>
    `;
  }

  function wireEvents() {
    // Filter click
    document.querySelectorAll('[data-filter]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedFilter = b.dataset.filter;
        render();
      });
    });

    // Draw note
    document.getElementById('btn-draw-note')?.addEventListener('click', () => {
      const candidates =
        selectedFilter === 'all'
          ? notes
          : notes.filter((n) => n.trigger === selectedFilter || n.trigger === 'anytime');

      if (candidates.length === 0) {
        toast('No notes found for this trigger yet! Write one first.', 'info');
        return;
      }

      sounds.reveal();
      vibrate('success');
      fireConfetti(40);

      drawnNote = candidates[Math.floor(Math.random() * candidates.length)];
      render();
    });

    // Save note
    document.getElementById('btn-save-note')?.addEventListener('click', () => {
      const author = document.getElementById('inp-note-author')?.value ?? p1;
      const trigger = document.getElementById('inp-note-trigger')?.value ?? 'anytime';
      const text = document.getElementById('inp-note-text')?.value?.trim() ?? '';

      if (text.length < 10) {
        toast('Please write at least 10 characters 💕', 'warning');
        return;
      }

      const newNote = {
        id: `note_${Date.now()}`,
        author,
        trigger,
        text,
        date: new Date().toISOString(),
      };

      notes.push(newNote);
      saveNotes(notes);

      sounds.done();
      toast('💌 Love note sealed into the jar!', 'success');
      activeTab = 'jar';
      render();
    });

    // Delete single note
    document.querySelectorAll('[data-del-note]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.delNote, 10);
        notes.splice(idx, 1);
        saveNotes(notes);
        toast('Note deleted', 'info');
        render();
      });
    });

    // Clear all notes
    document.getElementById('btn-clear-notes')?.addEventListener('click', () => {
      if (window.confirm('Clear all notes in the Love Jar?')) {
        saveNotes([]);
        toast('Jar cleared', 'info');
        renderLoveNotes();
      }
    });
  }

  render();
}

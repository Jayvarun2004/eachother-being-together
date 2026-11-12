/**
 * src/views/memory-lane.js
 * Memory Lane — A romantic timeline of shared couple moments.
 * Photos are stored safely on-device in IndexedDB (zero silent cloud uploads).
 */

import { navigate } from '../lib/router.js';
import { toast } from '../lib/toast.js';

const DB_NAME = 'ebt_memory_lane_db';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllMemories() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result ?? [];
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function saveMemory(memory) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(memory);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteMemory(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderMemoryLane() {
  const app = document.getElementById('app');
  let memories = await getAllMemories();
  let showAddForm = false;

  function render() {
    app.innerHTML = /* html */ `
      <div class="view active animate-slide-up" id="view-memory-lane">
        <header class="app-header">
          <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
          <span class="header-logo">📸 Memory Lane</span>
          <button class="btn-icon" id="btn-toggle-add" aria-label="Add memory" title="Add Memory">
            ${showAddForm ? '✕' : '➕'}
          </button>
        </header>

        <div style="padding:0.75rem 0;">
          <!-- Add Memory Form Drawer -->
          ${
            showAddForm
              ? `
            <div class="glass-card mb-4 animate-scale-up" style="padding:1.25rem;border-color:var(--color-rose);">
              <h2 style="font-size:var(--text-md);font-weight:700;margin-bottom:0.75rem;">
                Capture a Cherished Moment
              </h2>

              <label for="mem-title" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
                Title of Moment:
              </label>
              <input type="text" id="mem-title" placeholder="e.g. Midnight drive on the coast" maxlength="60"
                style="width:100%;padding:0.55rem 0.75rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:0.75rem;" />

              <label for="mem-date" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
                When did it happen?
              </label>
              <input type="date" id="mem-date" value="${new Date().toISOString().slice(0, 10)}"
                style="width:100%;padding:0.55rem 0.75rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:0.75rem;" />

              <label for="mem-photo" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
                Optional Photo (Saved on this device only 🔒):
              </label>
              <input type="file" id="mem-photo" accept="image/*"
                style="width:100%;font-size:var(--text-xs);margin-bottom:0.75rem;" />

              <div id="photo-preview-wrap" style="display:none;margin-bottom:0.75rem;">
                <img id="photo-preview" style="max-height:160px;border-radius:var(--radius-md);object-fit:cover;border:1px solid var(--border);" alt="Preview" />
              </div>

              <label for="mem-note" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.25rem;">
                Short note:
              </label>
              <textarea id="mem-note" rows="3" placeholder="What made this moment unforgettable..." maxlength="300"
                style="width:100%;padding:0.55rem 0.75rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-sm);margin-bottom:1rem;resize:vertical;"></textarea>

              <div style="display:flex;gap:0.5rem;">
                <button class="btn btn-primary btn-sm" id="btn-save-memory" style="flex:1;">
                  💖 Save to Memory Lane
                </button>
                <button class="btn btn-ghost btn-sm" id="btn-cancel-memory">Cancel</button>
              </div>
            </div>
          `
              : ''
          }

          <!-- Timeline View -->
          ${
            memories.length === 0
              ? `
            <div class="glass-card" style="text-align:center;padding:3rem 1.5rem;color:var(--text-muted);">
              <div style="font-size:3.5rem;margin-bottom:0.75rem;">🎞️</div>
              <p style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">Your Memory Lane is ready for stories.</p>
              <p style="font-size:var(--text-xs);margin-top:0.35rem;line-height:1.5;">Tap <strong>➕</strong> at the top to save your first date, funny adventure, or special trip.</p>
            </div>
          `
              : `
            <div class="timeline-container" style="position:relative;padding-left:1.5rem;">
              <div style="position:absolute;left:8px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom, var(--color-rose), transparent);"></div>
              ${memories
                .map(
                  (m) => `
                <div class="timeline-item glass-card mb-4" style="padding:1rem;position:relative;margin-left:0.5rem;">
                  <div style="position:absolute;left:-1.8rem;top:1rem;width:12px;height:12px;border-radius:50%;background:var(--color-rose);border:2px solid var(--bg-card,#0d0a12);"></div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.35rem;">
                    <h3 style="font-size:var(--text-base);font-weight:700;color:var(--text-primary);margin:0;">
                      ${escHtml(m.title)}
                    </h3>
                    <button class="btn-icon" data-del-mem="${m.id}" style="width:24px;height:24px;font-size:0.7rem;background:none;border:none;" aria-label="Delete">🗑️</button>
                  </div>
                  <div style="font-size:var(--text-xs);color:var(--color-rose);margin-bottom:0.5rem;font-weight:600;">
                    🗓️ ${new Date(m.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  ${
                    m.photoData
                      ? `
                    <div style="margin-bottom:0.6rem;overflow:hidden;border-radius:var(--radius-md);">
                      <img src="${m.photoData}" alt="${escHtml(m.title)}" style="width:100%;max-height:220px;object-fit:cover;display:block;" />
                    </div>
                  `
                      : ''
                  }
                  <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;margin:0;">
                    ${escHtml(m.note)}
                  </p>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>
      </div>
    `;

    document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));

    document.getElementById('btn-toggle-add')?.addEventListener('click', () => {
      showAddForm = !showAddForm;
      render();
    });

    document.getElementById('btn-cancel-memory')?.addEventListener('click', () => {
      showAddForm = false;
      render();
    });

    // Handle photo preview
    let uploadedPhotoBase64 = null;
    const photoInput = document.getElementById('mem-photo');
    photoInput?.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadedPhotoBase64 = reader.result;
          const previewWrap = document.getElementById('photo-preview-wrap');
          const previewImg = document.getElementById('photo-preview');
          if (previewWrap && previewImg) {
            previewImg.src = uploadedPhotoBase64;
            previewWrap.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Save memory
    document.getElementById('btn-save-memory')?.addEventListener('click', async () => {
      const title = document.getElementById('mem-title')?.value?.trim() ?? '';
      const date =
        document.getElementById('mem-date')?.value ?? new Date().toISOString().slice(0, 10);
      const note = document.getElementById('mem-note')?.value?.trim() ?? '';

      if (!title) {
        toast('Please enter a title for the moment', 'warning');
        return;
      }

      const memory = {
        id: `mem_${Date.now()}`,
        title,
        date,
        note,
        photoData: uploadedPhotoBase64,
        createdAt: new Date().toISOString(),
      };

      await saveMemory(memory);
      toast('Moment saved to Memory Lane! 📸', 'success');
      showAddForm = false;
      memories = await getAllMemories();
      render();
    });

    // Delete memory
    document.querySelectorAll('[data-del-mem]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.delMem;
        if (window.confirm('Remove this moment from Memory Lane?')) {
          await deleteMemory(id);
          toast('Memory removed', 'info');
          memories = await getAllMemories();
          render();
        }
      });
    });
  }

  render();
}

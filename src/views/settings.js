/**
 * src/views/settings.js
 * Settings & Privacy View — Passcode Lock, Sound Preferences, and Wipe Device Data.
 */

import { navigate } from '../lib/router.js';
import { hasPasscode, setPasscode, clearPasscode, clearAllDeviceData } from '../lib/passcode.js';
import { toast } from '../lib/toast.js';

export function renderSettings() {
  const app = document.getElementById('app');
  const locked = hasPasscode();

  app.innerHTML = /* html */ `
    <div class="view active animate-slide-up" id="view-settings">
      <header class="app-header">
        <button class="btn-icon" id="btn-back" aria-label="Back">←</button>
        <span class="header-logo">⚙️ Settings & Privacy</span>
        <div style="width:44px;"></div>
      </header>

      <div style="padding:1rem 0;">
        <!-- Privacy & Passcode Lock -->
        <div class="glass-card mb-4" style="padding:1.25rem;">
          <h2 style="font-size:var(--text-md);font-weight:700;margin-bottom:0.35rem;display:flex;align-items:center;gap:0.5rem;">
            <span>🔒</span> Couple Passcode Lock
          </h2>
          <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1rem;line-height:1.4;">
            Keep memories, notes, and spicy games completely private if someone else borrows your device.
          </p>

          ${
            locked
              ? `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:rgba(34,197,94,0.1);border-radius:var(--radius-md);margin-bottom:1rem;">
              <span style="font-size:var(--text-sm);font-weight:600;color:#16a34a;">✅ Passcode is Active</span>
              <button class="btn btn-ghost btn-sm" id="btn-remove-pin" style="color:var(--color-rose);border-color:var(--color-rose);">
                Remove PIN
              </button>
            </div>
          `
              : `
            <div id="pin-setup-box">
              <label for="inp-new-pin" style="display:block;font-size:var(--text-xs);color:var(--text-muted);margin-bottom:0.35rem;">
                Set 4 to 6-digit PIN:
              </label>
              <div style="display:flex;gap:0.5rem;">
                <input type="password" id="inp-new-pin" maxlength="6" inputmode="numeric" pattern="[0-9]*" placeholder="e.g. 1234"
                  style="flex:1;padding:0.6rem 0.85rem;border-radius:var(--radius-sm);background:var(--bg-glass);border:1.5px solid var(--border);color:var(--text-primary);font-size:var(--text-base);" />
                <button class="btn btn-primary btn-sm" id="btn-save-pin">Set Lock</button>
              </div>
            </div>
          `
          }
        </div>

        <!-- About & Privacy Guarantee -->
        <div class="glass-card mb-4" style="padding:1.25rem;">
          <h2 style="font-size:var(--text-md);font-weight:700;margin-bottom:0.35rem;display:flex;align-items:center;gap:0.5rem;">
            <span>🛡️</span> Zero-Tracker Privacy
          </h2>
          <p style="font-size:var(--text-xs);color:var(--text-muted);line-height:1.5;">
            "Eachother Being Together" is an intimate, private app for two. We never collect analytics, run ads, or sell data. All local games, notes, and memories stay safely encrypted on your device.
          </p>
        </div>

        <!-- Danger Zone: Wipe Data -->
        <div class="glass-card mb-4" style="padding:1.25rem;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.03);">
          <h2 style="font-size:var(--text-md);font-weight:700;color:#ef4444;margin-bottom:0.35rem;display:flex;align-items:center;gap:0.5rem;">
            <span>🗑️</span> Danger Zone
          </h2>
          <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1rem;line-height:1.4;">
            Wipe all saved card favourites, love notes, custom cards, anniversary dates, and passcode from this browser.
          </p>
          <button class="btn w-full" id="btn-clear-all" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid #ef4444;font-size:var(--text-sm);font-weight:600;">
            Clear My Data on This Device
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));

  document.getElementById('btn-save-pin')?.addEventListener('click', async () => {
    const input = document.getElementById('inp-new-pin');
    const pin = input?.value?.trim() ?? '';
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      toast('PIN must be 4 to 6 numbers', 'warning');
      return;
    }
    await setPasscode(pin);
    toast('Passcode lock activated! 🔒', 'success');
    renderSettings();
  });

  document.getElementById('btn-remove-pin')?.addEventListener('click', () => {
    if (
      window.confirm('Remove passcode lock? Anyone with this device will be able to open the app.')
    ) {
      clearPasscode();
      toast('Passcode removed', 'info');
      renderSettings();
    }
  });

  document.getElementById('btn-clear-all')?.addEventListener('click', async () => {
    const firstConfirm = window.confirm(
      'Are you sure you want to erase all data on this device? This cannot be undone.'
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      'Final confirmation: Wipe all notes, photos, anniversaries, and favorites now?'
    );
    if (secondConfirm) {
      await clearAllDeviceData();
    }
  });
}

/**
 * src/views/passcode.js
 * Couple Passcode Lock Screen — clean number pad, lockout protection, and unlock callback.
 */

import { verifyPasscode, clearAllDeviceData } from '../lib/passcode.js';
import { sounds } from '../lib/sound.js';
import { vibrate } from '../lib/haptic.js';
import { toast } from '../lib/toast.js';

let _failAttempts = 0;
let _lockoutUntil = 0;

export function renderPasscodeScreen(onSuccess) {
  const app = document.getElementById('app');
  let currentPin = '';

  function render() {
    const isLockedOut = Date.now() < _lockoutUntil;
    const remainingLockout = isLockedOut ? Math.ceil((_lockoutUntil - Date.now()) / 1000) : 0;

    app.innerHTML = /* html */ `
      <div class="view active animate-fade-in" id="view-passcode" style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100dvh;padding:1.5rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:0.75rem;">🔒</div>
        <h1 style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary);margin-bottom:0.35rem;">
          Private Game Room
        </h1>
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:1.5rem;">
          Enter your 4-6 digit couple PIN to unlock
        </p>

        <!-- PIN Dots Display -->
        <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;justify-content:center;">
          ${Array.from({ length: 4 })
            .map(
              (_, i) => `
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--color-rose);background:${i < currentPin.length ? 'var(--color-rose)' : 'transparent'};transition:all 0.15s ease;"></div>
          `
            )
            .join('')}
        </div>

        ${
          isLockedOut
            ? `
          <div class="glass-card" style="padding:0.75rem 1rem;color:var(--color-rose);margin-bottom:1rem;font-size:var(--text-sm);">
            Too many attempts! Wait ${remainingLockout}s before trying again.
          </div>
        `
            : ''
        }

        <!-- Number Pad Grid -->
        <div style="display:grid;grid-template-columns:repeat(3, 72px);gap:0.75rem;margin-bottom:1.5rem;">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
            .map(
              (num) => `
            <button class="btn btn-secondary numpad-btn" data-val="${num}" style="height:64px;font-size:1.5rem;font-weight:700;border-radius:var(--radius-lg);padding:0;" ${isLockedOut ? 'disabled' : ''}>
              ${num}
            </button>
          `
            )
            .join('')}
          <button class="btn btn-ghost numpad-btn" id="btn-pin-clear" style="height:64px;font-size:var(--text-xs);font-weight:600;padding:0;" ${isLockedOut ? 'disabled' : ''}>
            Clear
          </button>
          <button class="btn btn-secondary numpad-btn" data-val="0" style="height:64px;font-size:1.5rem;font-weight:700;border-radius:var(--radius-lg);padding:0;" ${isLockedOut ? 'disabled' : ''}>
            0
          </button>
          <button class="btn btn-ghost numpad-btn" id="btn-pin-backspace" style="height:64px;font-size:1.25rem;padding:0;" ${isLockedOut ? 'disabled' : ''}>
            ⌫
          </button>
        </div>

        <button id="btn-forgot-pin" class="btn-ghost btn-sm" style="font-size:var(--text-xs);color:var(--text-muted);text-decoration:underline;">
          Forgot Passcode?
        </button>
      </div>
    `;

    // Wire numpad buttons
    document.querySelectorAll('[data-val]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (Date.now() < _lockoutUntil) return;
        if (currentPin.length >= 6) return;
        currentPin += btn.dataset.val;
        vibrate('flip');
        render();

        if (currentPin.length >= 4) {
          const isValid = await verifyPasscode(currentPin);
          if (isValid) {
            sounds.done();
            vibrate('success');
            _failAttempts = 0;
            onSuccess();
          } else if (currentPin.length === 6) {
            _failAttempts++;
            sounds.skip();
            vibrate('veto');
            toast('Incorrect passcode', 'error');
            currentPin = '';
            if (_failAttempts >= 5) {
              _lockoutUntil = Date.now() + 30000;
              toast('Locked out for 30 seconds', 'error');
            }
            render();
          }
        }
      });
    });

    document.getElementById('btn-pin-clear')?.addEventListener('click', () => {
      currentPin = '';
      render();
    });

    document.getElementById('btn-pin-backspace')?.addEventListener('click', () => {
      currentPin = currentPin.slice(0, -1);
      render();
    });

    document.getElementById('btn-forgot-pin')?.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Forgot passcode? To protect couple privacy, resetting will wipe local app data on this device. Proceed?'
      );
      if (confirmed) {
        clearAllDeviceData();
      }
    });
  }

  render();
}

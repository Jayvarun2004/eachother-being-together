/**
 * src/lib/toast.js
 * Lightweight toast notification system.
 */

/**
 * Show a toast message.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} [type]
 * @param {number} [durationMs]
 */
export function toast(message, type = 'info', durationMs = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${type !== 'info' ? type : ''}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, durationMs - 300);
}

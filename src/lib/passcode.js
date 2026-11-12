/**
 * src/lib/passcode.js
 * Optional 4-6 digit passcode lock for couples privacy.
 * Uses Web Crypto API (SHA-256 + unique salt stored in localStorage).
 */

const PASSCODE_HASH_KEY = 'ebt_passcode_hash';
const PASSCODE_SALT_KEY = 'ebt_passcode_salt';
const SESSION_UNLOCKED_KEY = 'ebt_unlocked_this_session';

/**
 * Hash a PIN with a salt using SHA-256
 * @param {string} pin
 * @param {string} salt
 * @returns {Promise<string>}
 */
async function hashPin(pin, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(salt + pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Check if a passcode has been set */
export function hasPasscode() {
  return Boolean(localStorage.getItem(PASSCODE_HASH_KEY));
}

/** Check if current session is already unlocked */
export function isUnlockedThisSession() {
  if (!hasPasscode()) return true;
  return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
}

/** Mark current session as unlocked */
export function markUnlocked() {
  sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
}

/** Lock the app again */
export function lockApp() {
  sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
}

/**
 * Set a new 4-6 digit passcode
 * @param {string} pin
 * @returns {Promise<boolean>}
 */
export async function setPasscode(pin) {
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return false;
  }
  const salt = crypto.randomUUID();
  const hash = await hashPin(pin, salt);
  localStorage.setItem(PASSCODE_SALT_KEY, salt);
  localStorage.setItem(PASSCODE_HASH_KEY, hash);
  markUnlocked();
  return true;
}

/**
 * Verify passcode
 * @param {string} pin
 * @returns {Promise<boolean>}
 */
export async function verifyPasscode(pin) {
  const salt = localStorage.getItem(PASSCODE_SALT_KEY);
  const storedHash = localStorage.getItem(PASSCODE_HASH_KEY);
  if (!salt || !storedHash) return true;

  const hash = await hashPin(pin, salt);
  const ok = hash === storedHash;
  if (ok) markUnlocked();
  return ok;
}

/** Clear passcode */
export function clearPasscode() {
  localStorage.removeItem(PASSCODE_HASH_KEY);
  localStorage.removeItem(PASSCODE_SALT_KEY);
  sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
}

/**
 * Complete data wipe on this device
 */
export async function clearAllDeviceData() {
  localStorage.clear();
  sessionStorage.clear();

  // Clear IndexedDB databases
  if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
    } catch {
      /* ignore */
    }
  }

  // Clear service worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
    } catch {
      /* ignore */
    }
  }

  window.location.reload();
}

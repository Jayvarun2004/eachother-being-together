/**
 * vault.js — Love Vault bookmarks system.
 * Saves memorable game cards to localStorage, keyed by card text.
 * All operations are synchronous and safe — errors are swallowed gracefully.
 */

const VAULT_KEY = 'ebt_love_vault';

/**
 * Load all saved cards from localStorage.
 * @returns {Array<{text: string, game: string, level: string|number, savedAt: string}>}
 */
export function getVault() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

/**
 * Persist the given array back to localStorage.
 * @param {Array<object>} cards
 */
function _saveVault(cards) {
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(cards));
  } catch (_err) {
    // localStorage may be full or unavailable — fail silently.
  }
}

/**
 * Save a card to the vault.
 * Prevents duplicates by card text (case-sensitive).
 * @param {{ text: string, game: string, level: string|number, savedAt?: string }} card
 * @returns {boolean} true if added, false if it was already in the vault.
 */
export function saveToVault(card) {
  if (!card || typeof card.text !== 'string' || card.text.trim() === '') {
    return false;
  }
  const vault = getVault();
  const alreadyExists = vault.some((c) => c.text === card.text);
  if (alreadyExists) {
    return false;
  }
  const entry = {
    text: card.text,
    game: card.game ?? '',
    level: card.level ?? '',
    savedAt: card.savedAt ?? new Date().toISOString(),
  };
  vault.push(entry);
  _saveVault(vault);
  return true;
}

/**
 * Remove a card from the vault by its exact text.
 * @param {string} cardText
 * @returns {boolean} true if a card was removed, false if it wasn't found.
 */
export function removeFromVault(cardText) {
  if (typeof cardText !== 'string') return false;
  const vault = getVault();
  const nextVault = vault.filter((c) => c.text !== cardText);
  if (nextVault.length === vault.length) {
    return false; // nothing was removed
  }
  _saveVault(nextVault);
  return true;
}

/**
 * Check whether a card is already saved in the vault.
 * @param {string} cardText
 * @returns {boolean}
 */
export function isVaulted(cardText) {
  if (typeof cardText !== 'string') return false;
  const vault = getVault();
  return vault.some((c) => c.text === cardText);
}

/**
 * Clear every card from the vault.
 */
export function clearVault() {
  try {
    localStorage.removeItem(VAULT_KEY);
  } catch (_err) {
    // Fail silently.
  }
}

/**
 * src/lib/deck.js
 * Card deck manager — loads JSON card files, shuffles, tracks played cards,
 * and prevents repeats until the whole deck is used.
 *
 * To add a new game: add cards to /cards/<game>/<level>.json
 * and register the game slug here (or it auto-discovers from the filename).
 */

import { toast } from './toast.js';
import { t } from './i18n.js';

const cardDecks = import.meta.glob('../../cards/*/*.json', { eager: true });

/** In-memory deck state per game session */
const _decks = {}; // { 'truth-or-dare|wholesome': { cards: [], index: 0 } }

/**
 * Load a card deck for a game+level combination.
 * Falls back to a previous deck if already loaded.
 * @param {string} game  - e.g. 'truth-or-dare'
 * @param {string} level - 'wholesome' | 'flirty' | 'spicy'
 * @returns {Promise<Card[]>}
 */
export async function loadDeck(game, level) {
  const key = `${game}|${level}`;
  if (_decks[key]) return _decks[key].cards;

  try {
    const mod = cardDecks[`../../cards/${game}/${level}.json`];
    const cards = [...(mod?.default ?? mod ?? [])];

    // Merge custom cards saved by the user
    const customKey = `ebt_custom_${game}_${level}`;
    try {
      const custom = JSON.parse(localStorage.getItem(customKey) ?? '[]');
      cards.push(...custom);
    } catch {
      /* ignore */
    }

    // Merge secret partner cards
    const secretKey = `ebt_secret_${game}_${level}`;
    try {
      const secrets = JSON.parse(localStorage.getItem(secretKey) ?? '[]');
      cards.push(...secrets);
    } catch {
      /* ignore */
    }

    _decks[key] = { cards: shuffle(cards), index: 0 };
    return _decks[key].cards;
  } catch (e) {
    console.error('deck: failed to load', key, e);
    return [];
  }
}

/**
 * Draw the next card. Reshuffles when deck is exhausted.
 * @param {string} game
 * @param {string} level
 * @returns {Promise<Card|null>}
 */
export async function drawCard(game, level) {
  const key = `${game}|${level}`;
  if (!_decks[key]) await loadDeck(game, level);
  const deck = _decks[key];
  if (!deck || deck.cards.length === 0) return null;

  if (deck.index >= deck.cards.length) {
    deck.cards = shuffle(deck.cards);
    deck.index = 0;
    toast(t('game.deckDone'), 'info', 2500);
  }

  return deck.cards[deck.index++];
}

/** Progress info for the deck progress bar */
export function deckProgress(game, level) {
  const key = `${game}|${level}`;
  const deck = _decks[key];
  if (!deck) return { current: 0, total: 0 };
  return { current: deck.index, total: deck.cards.length };
}

/**
 * Save a user-added card to localStorage and the current deck.
 * @param {string} game
 * @param {string} level
 * @param {string} text
 */
export function addCustomCard(game, level, text) {
  const card = {
    id: `custom_${Date.now()}`,
    text: text.trim(),
    level,
    tags: ['custom'],
  };

  const storageKey = `ebt_custom_${game}_${level}`;
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    existing.push(card);
    localStorage.setItem(storageKey, JSON.stringify(existing));
  } catch {
    /* ignore */
  }

  // Add to live deck too
  const key = `${game}|${level}`;
  if (_decks[key]) {
    _decks[key].cards.push(card);
  }
}

/**
 * Save a secret card for partner to discover.
 * @param {string} game
 * @param {string} level
 * @param {string} text
 * @param {string} [type]
 * @returns {{ ok: boolean, error?: string }}
 */
export function addSecretCard(game, level, text, type = 'truth') {
  const cleanText = text.trim();
  if (cleanText.length < 10) return { ok: false, error: 'Write at least 10 characters' };
  if (cleanText.length > 300) return { ok: false, error: 'Max 300 characters' };

  const storageKey = `ebt_secret_${game}_${level}`;
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  } catch {
    existing = [];
  }

  const isDuplicate = existing.some((c) => c.text.toLowerCase() === cleanText.toLowerCase());
  if (isDuplicate) {
    return { ok: false, error: 'You already added this secret card!' };
  }

  const card = {
    id: `secret_${Date.now()}`,
    text: cleanText,
    level,
    type,
    fromPartner: true,
    tags: ['secret', 'custom'],
  };

  existing.push(card);
  try {
    localStorage.setItem(storageKey, JSON.stringify(existing));
  } catch {
    /* ignore */
  }

  const key = `${game}|${level}`;
  if (_decks[key]) {
    _decks[key].cards.push(card);
  }

  return { ok: true };
}

/** Fisher-Yates shuffle (in-place, returns array) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

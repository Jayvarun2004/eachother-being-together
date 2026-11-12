/**
 * src/lib/deck.js
 * Card deck manager — loads JSON card files, shuffles, tracks played cards,
 * permanently remembers seen cards so they NEVER repeat across sessions,
 * and seamlessly auto-generates fresh partner-bonding cards when needed.
 */

import { toast } from './toast.js';
import { getSeenCardIds, markCardSeen, generateProceduralCards } from './card-generator.js';

const cardDecks = import.meta.glob('../../cards/*/*.json', { eager: true });

/** In-memory deck state per game session */
const _decks = {}; // { 'truth-or-dare|wholesome': { cards: [], index: 0 } }

/**
 * Load a card deck for a game+level combination.
 * Filters out ANY card that has ever been seen before.
 * Auto-generates new unique cards if unplayed count is low.
 * @param {string} game  - e.g. 'truth-or-dare', 'soul-sync'
 * @param {string} level - 'wholesome' | 'flirty' | 'spicy'
 * @returns {Promise<Card[]>}
 */
export async function loadDeck(game, level) {
  const key = `${game}|${level}`;
  if (_decks[key] && _decks[key].cards.length > 0) return _decks[key].cards;

  try {
    const mod = cardDecks[`../../cards/${game}/${level}.json`];
    const rawCards = [...(mod?.default ?? mod ?? [])];

    // Merge custom cards saved by the user
    const customKey = `ebt_custom_${game}_${level}`;
    try {
      const custom = JSON.parse(localStorage.getItem(customKey) ?? '[]');
      rawCards.push(...custom);
    } catch {
      /* ignore */
    }

    // Merge secret partner cards
    const secretKey = `ebt_secret_${game}_${level}`;
    try {
      const secrets = JSON.parse(localStorage.getItem(secretKey) ?? '[]');
      rawCards.push(...secrets);
    } catch {
      /* ignore */
    }

    // Filter out cards that have been seen in ANY past session
    const seenIds = getSeenCardIds();
    let unplayedCards = rawCards.filter((c) => !seenIds.has(c.id));

    // Truth or Dare specific requirement:
    // User requested: "in t or d i want max of them as truths and partner based questions to make our bond more stronger"
    if (game === 'truth-or-dare') {
      const truths = unplayedCards.filter((c) => c.type === 'truth');
      const dares = unplayedCards.filter((c) => c.type === 'dare');

      // Keep ~85% truths, ~15% dares
      const maxDares = Math.max(2, Math.floor(truths.length * 0.18));
      const balancedDares = shuffle(dares).slice(0, maxDares);
      unplayedCards = shuffle([...truths, ...balancedDares]);
    } else {
      unplayedCards = shuffle(unplayedCards);
    }

    // If deck has fewer than 15 unplayed cards, auto-generate fresh partner-bonding cards!
    if (unplayedCards.length < 15) {
      const freshCards = generateProceduralCards(game, level, 25);
      unplayedCards.push(...freshCards);
    }

    _decks[key] = { cards: unplayedCards, index: 0 };
    return _decks[key].cards;
  } catch (e) {
    console.error('deck: failed to load', key, e);
    // Even if load fails, provide fresh procedural cards
    const fallbackCards = generateProceduralCards(game, level, 25);
    _decks[key] = { cards: fallbackCards, index: 0 };
    return fallbackCards;
  }
}

/**
 * Draw the next card.
 * Permanently saves the card ID to localStorage so it is NEVER shown again.
 * Dynamically replenishes the deck when approaching the end.
 * @param {string} game
 * @param {string} level
 * @returns {Promise<Card|null>}
 */
export async function drawCard(game, level) {
  const key = `${game}|${level}`;
  if (!_decks[key]) await loadDeck(game, level);
  const deck = _decks[key];
  if (!deck || deck.cards.length === 0) return null;

  // If we reached the end or have fewer than 3 left, auto-generate more!
  if (deck.index >= deck.cards.length - 2) {
    const extraCards = generateProceduralCards(game, level, 20);
    deck.cards.push(...extraCards);
    toast('✦ Auto-generated fresh romantic prompts for you', 'info', 2000);
  }

  const card = deck.cards[deck.index++];
  if (card && card.id) {
    // Permanently record that this card was seen
    markCardSeen(card.id);
  }

  return card;
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

/**
 * src/lib/state.js
 * Global in-memory app state + localStorage persistence.
 * This is the single source of truth for the local game session.
 */

const STORAGE_KEY = 'ebt_state';

/** @type {AppState} */
const defaults = {
  // Players
  player1: 'Player 1',
  player2: 'Player 2',

  // Game settings
  game: null,          // 'truth-or-dare' | 'never-have-i-ever' | 'would-you-rather'
  level: 'wholesome',  // 'wholesome' | 'flirty' | 'spicy'
  mode: 'local',       // 'local' | 'online'
  theme: 'light',      // 'light' | 'dark'
  sound: true,

  // Session state
  currentTurn: 0,      // 0 = player1, 1 = player2
  scores: [0, 0],
  skipsLeft: [3, 3],   // 3 skips per player per session
  vetosLeft: [1, 1],   // 1 veto per player per session

  // End recap
  cardsPlayed: 0,
  skipsUsed: [0, 0],
  vetosUsed: [0, 0],

  // NHIE specific
  nhieCommonCount: 0,

  // WYR specific
  wyrMatchCount: 0,
  wyrTotalCount: 0,

  // Online room
  roomId: null,
  roomCode: null,
  playerId: null,  // Supabase auth user id

  // Spicy age gate
  spicyConfirmed: [false, false],

  // Stakes & Rewards Engine
  stake: 'None',
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

function saveToStorage(stateObj) {
  try {
    // Don't persist sensitive online data
    const rest = { ...stateObj };
    delete rest.roomId;
    delete rest.roomCode;
    delete rest.playerId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // Storage full or blocked — silent fail
  }
}

let _state = loadFromStorage();

export const state = {
  get(key) {
    return _state[key];
  },

  set(key, value) {
    _state[key] = value;
    saveToStorage(_state);
  },

  patch(partial) {
    Object.assign(_state, partial);
    saveToStorage(_state);
  },

  reset(keepSettings = true) {
    const settings = keepSettings
      ? {
          player1: _state.player1,
          player2: _state.player2,
          level: _state.level,
          theme: _state.theme,
          sound: _state.sound,
          stake: _state.stake,
        }
      : {};
    _state = { ...defaults, ...settings };
    saveToStorage(_state);
  },

  all() {
    return { ..._state };
  },
};

/**
 * src/lib/router.js
 * Hash-based client-side router.
 * Routes: #home, #setup, #room, #game/truth-or-dare, #game/never-have-i-ever,
 *         #game/would-you-rather, #game/who-is-most-likely, #vault, #end
 */

import { renderHome } from '../views/home.js';
import { renderSetup } from '../views/setup.js';
import { renderRoom } from '../views/room.js';
import { renderGame } from '../views/game.js';
import { renderEnd } from '../views/end.js';
import { renderVault } from '../views/vault.js';
import { renderDaysTogether } from '../views/days-together.js';
import { renderDateRoulette } from '../views/date-roulette.js';
import { renderLoveNotes } from '../views/love-notes.js';
import { renderMemoryLane } from '../views/memory-lane.js';
import { renderScoreboard } from '../views/scoreboard.js';
import { renderSettings } from '../views/settings.js';

const ROUTES = {
  '': renderHome,
  home: renderHome,
  setup: renderSetup,
  room: renderRoom,
  'game/truth-or-dare': () => renderGame('truth-or-dare'),
  'game/never-have-i-ever': () => renderGame('never-have-i-ever'),
  'game/would-you-rather': () => renderGame('would-you-rather'),
  'game/who-is-most-likely': () => renderGame('who-is-most-likely'),
  'game/finish-the-sentence': () => renderGame('finish-the-sentence'),
  'game/this-or-that': () => renderGame('this-or-that'),
  'game/how-well-do-you-know-me': () => renderGame('how-well-do-you-know-me'),
  'days-together': renderDaysTogether,
  'date-roulette': renderDateRoulette,
  'love-notes': renderLoveNotes,
  'memory-lane': renderMemoryLane,
  scoreboard: renderScoreboard,
  settings: renderSettings,
  vault: renderVault,
  end: renderEnd,
};

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '');
}

function navigate(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const route = getRoute();
  const handler = ROUTES[route] ?? renderHome;
  document.getElementById('app').innerHTML = '';
  handler();
}

export const router = {
  init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  },
  go: navigate,
};

export { navigate };

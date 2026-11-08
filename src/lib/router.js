/**
 * src/lib/router.js
 * Hash-based client-side router.
 * Routes: #home, #setup, #room, #game/truth-or-dare, #game/never-have-i-ever,
 *         #game/would-you-rather, #end
 *
 * To add a new game: register its view here and in /games/<name>/index.js
 */

import { renderHome } from '../views/home.js';
import { renderSetup } from '../views/setup.js';
import { renderRoom } from '../views/room.js';
import { renderGame } from '../views/game.js';
import { renderEnd } from '../views/end.js';

const ROUTES = {
  '':                        renderHome,
  'home':                    renderHome,
  'setup':                   renderSetup,
  'room':                    renderRoom,
  'game/truth-or-dare':      () => renderGame('truth-or-dare'),
  'game/never-have-i-ever':  () => renderGame('never-have-i-ever'),
  'game/would-you-rather':   () => renderGame('would-you-rather'),
  'game/who-is-most-likely': () => renderGame('who-is-most-likely'),
  'end':                     renderEnd,
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

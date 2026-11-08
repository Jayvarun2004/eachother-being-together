/**
 * games/_template/index.js
 * Template for adding a new game module.
 *
 * HOW TO ADD A NEW GAME:
 * 1. Copy this folder to /games/<your-game-name>/
 * 2. Implement the three methods below.
 * 3. Add cards to /cards/<your-game-name>/wholesome.json (and flirty, spicy).
 * 4. Register the module in /src/views/game.js (import + GAME_MODULES entry).
 * 5. Add a game card to /src/views/home.js.
 * 6. Add i18n strings to /i18n/en.json.
 */

export class TemplateGame {
  /**
   * Render the content on the back face of the flip card.
   * @param {Card} card - the drawn card object
   * @param {HTMLElement} backFaceEl - the back face element to populate
   */
  renderCardContent(card, backFaceEl) {
    backFaceEl.innerHTML = /* html */ `
      <span class="card-type-badge badge-nhie">Your Game</span>
      <p class="card-text">${card.text}</p>
    `;
  }

  /**
   * Called when the card is flipped over.
   * Use this to show interactive elements (answer buttons, timers, etc.)
   * @param {Card} card
   * @param {HTMLElement} specificAreaEl - the #game-specific-area element
   * @param {{ onDone: Function, onNext: Function }} callbacks
   */
  async onReveal(card, specificAreaEl, callbacks) {
    // Show a simple "Next" button
    specificAreaEl.innerHTML = /* html */ `
      <button class="btn btn-primary mt-4" id="btn-next-tpl">
        Next →
      </button>
    `;
    document.getElementById('btn-next-tpl')?.addEventListener('click', callbacks.onNext);
  }

  /**
   * Called when the current player taps "Done (+1)".
   * @param {Card} card
   */
  onDone(card) {
    // e.g. update game-specific counters
  }
}

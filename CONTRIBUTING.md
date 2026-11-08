# Contributing to Eachother Being Together 💕

Thank you for wanting to help make this better! This guide covers everything you need to contribute.

## Table of Contents
- [Getting Started](#getting-started)
- [Branch & PR Workflow](#branch--pr-workflow)
- [Adding Cards](#adding-cards)
- [Adding a New Game](#adding-a-new-game)
- [Adding a Translation](#adding-a-translation)
- [Running Tests & Checks](#running-tests--checks)

---

## Getting Started

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/eachother-being-together.git
cd eachother-being-together
npm install
cp .env.example .env   # optional for online mode
npm run dev
```

Requirements: Node.js 18+, npm.

---

## Branch & PR Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   # or: fix/bug-description, cards/add-flirty-cards, i18n/add-hindi
   ```
2. Make your changes.
3. **Run checks** before pushing:
   ```bash
   npm run lint
   npm run validate-cards   # if you changed card files
   ```
4. Commit with a clear message: `git commit -m "feat: add 10 wholesome NHIE cards"`
5. Push and open a Pull Request against `main`.
6. Fill in the PR template.

Maintainers will review within a few days. We're friendly! 😊

---

## Adding Cards

Cards live in `/cards/<game>/<level>.json`. Each is a JSON object.

### Card formats

**Truth or Dare:**
```json
{
  "id": "tod-w-t-999",
  "text": "What is your happiest memory?",
  "type": "truth",
  "level": "wholesome",
  "tags": ["memories"]
}
```

**Never Have I Ever:**
```json
{
  "id": "nhie-f-042",
  "text": "stayed up all night talking to someone I had feelings for",
  "level": "flirty",
  "tags": ["romantic"]
}
```

**Would You Rather:**
```json
{
  "id": "wyr-w-030",
  "optionA": "always have the perfect comeback",
  "optionB": "never say anything you regret",
  "level": "wholesome",
  "tags": []
}
```

### Rules for cards
- Read [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) first.
- IDs must be unique within a file. Use format: `<game-abbr>-<level-abbr>-<number>`.
- Text must be 10–300 characters.
- Level in the JSON must match the filename.
- Run `npm run validate-cards` and fix all errors.

---

## Adding a New Game

1. Copy `/games/_template/` to `/games/<your-game-name>/`
2. Implement the three methods in `index.js` (see template comments)
3. Create card files:
   - `/cards/<your-game-name>/wholesome.json` (min. 25 cards)
   - `/cards/<your-game-name>/flirty.json`
   - `/cards/<your-game-name>/spicy.json`
4. Register the module in `/src/views/game.js`:
   ```js
   import { YourGame } from '../games/your-game/index.js';
   const GAME_MODULES = {
     // ... existing entries ...
     'your-game': YourGame,
   };
   ```
5. Add a game card to `/src/views/home.js` in the `game-cards` section
6. Add i18n strings to `/i18n/en.json` under `home.games`
7. Add issue template to `.github/ISSUE_TEMPLATE/`

---

## Adding a Translation

1. Copy `/i18n/en.json` to `/i18n/<locale>.json` (e.g. `hi.json` for Hindi)
2. Translate all values (keep the keys unchanged)
3. In `/src/lib/i18n.js`, the app will auto-load the locale if you pass it to `initI18n()`
4. Open a PR — someone will wire up the locale selector in the UI

---

## Running Tests & Checks

```bash
npm run lint            # ESLint
npm run validate-cards  # JSON card validation
npm run build           # Ensure the app builds without errors
```

The GitHub Actions CI runs these automatically on every PR. It must be green before merge.

---

Questions? Open an issue or start a discussion. We'd love to hear from you! 💕

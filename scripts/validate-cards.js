/**
 * scripts/validate-cards.js
 * Run with: npm run validate-cards
 *
 * Checks all /cards/<game>/<level>.json files for:
 * - Valid JSON
 * - Required fields
 * - Valid level value
 * - No duplicate IDs within a file
 * - No duplicate text (case-insensitive) within a file
 * - Text length limits
 * - Minimum card count
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_DIR = path.resolve(__dirname, '../cards');

const VALID_LEVELS = ['wholesome', 'flirty', 'spicy'];
const VALID_GAMES = ['truth-or-dare', 'never-have-i-ever', 'would-you-rather', 'who-is-most-likely'];
const MIN_CARDS = 25;
const MAX_TEXT_LENGTH = 300;
const MIN_TEXT_LENGTH = 10;

let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;

function error(file, msg) {
  console.error(`  ❌ ERROR [${file}]: ${msg}`);
  totalErrors++;
}

function warn(file, msg) {
  console.warn(`  ⚠️  WARN  [${file}]: ${msg}`);
  totalWarnings++;
}

function checkFile(filePath, game, level) {
  const relPath = path.relative(process.cwd(), filePath);
  totalFiles++;
  console.log(`\nChecking: ${relPath}`);

  // 1. Parse JSON
  let cards;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    cards = JSON.parse(raw);
  } catch (e) {
    error(relPath, `Invalid JSON: ${e.message}`);
    return;
  }

  if (!Array.isArray(cards)) {
    error(relPath, 'Root must be a JSON array');
    return;
  }

  // 2. Minimum count
  if (cards.length < MIN_CARDS) {
    warn(relPath, `Only ${cards.length} cards (minimum ${MIN_CARDS})`);
  } else {
    console.log(`  ✅ ${cards.length} cards`);
  }

  const seenIds = new Set();
  const seenTexts = new Set();

  cards.forEach((card, i) => {
    const prefix = `card[${i}]`;

    // 3. Required fields
    if (!card.id) error(relPath, `${prefix}: missing 'id'`);
    if (!card.level) error(relPath, `${prefix}: missing 'level'`);
    if (!card.text && !card.optionA) error(relPath, `${prefix}: missing 'text' (or 'optionA'/'optionB' for WYR)`);

    // 4. Valid level
    if (card.level && !VALID_LEVELS.includes(card.level)) {
      error(relPath, `${prefix}: invalid level '${card.level}' — must be one of: ${VALID_LEVELS.join(', ')}`);
    }

    // 5. Level must match file
    if (card.level && card.level !== level) {
      error(relPath, `${prefix}: card level '${card.level}' doesn't match file level '${level}'`);
    }

    // 6. Truth-or-Dare must have type field
    if (game === 'truth-or-dare' && !card.type) {
      error(relPath, `${prefix}: truth-or-dare cards must have 'type' ("truth" or "dare")`);
    }
    if (game === 'truth-or-dare' && card.type && !['truth', 'dare'].includes(card.type)) {
      error(relPath, `${prefix}: invalid type '${card.type}' — must be "truth" or "dare"`);
    }

    // 7. Would You Rather must have optionA and optionB
    if (game === 'would-you-rather') {
      if (!card.optionA) error(relPath, `${prefix}: WYR cards must have 'optionA'`);
      if (!card.optionB) error(relPath, `${prefix}: WYR cards must have 'optionB'`);
    }

    // 8. Text length
    const textFields = [card.text, card.optionA, card.optionB].filter(Boolean);
    textFields.forEach(t => {
      if (t.length > MAX_TEXT_LENGTH) {
        error(relPath, `${prefix}: text too long (${t.length} chars, max ${MAX_TEXT_LENGTH})`);
      }
      if (t.length < MIN_TEXT_LENGTH) {
        warn(relPath, `${prefix}: text very short (${t.length} chars)`);
      }
    });

    // 9. Duplicate IDs
    if (card.id) {
      if (seenIds.has(card.id)) {
        error(relPath, `${prefix}: duplicate id '${card.id}'`);
      }
      seenIds.add(card.id);
    }

    // 10. Duplicate text
    const textKey = (card.text || `${card.optionA}|${card.optionB}`).toLowerCase().trim();
    if (seenTexts.has(textKey)) {
      warn(relPath, `${prefix}: duplicate text detected`);
    }
    seenTexts.add(textKey);
  });
}

// --- Walk the cards directory ---
let found = false;
for (const game of VALID_GAMES) {
  const gameDir = path.join(CARDS_DIR, game);
  if (!fs.existsSync(gameDir)) {
    console.warn(`\n⚠️  Missing directory: cards/${game}/`);
    continue;
  }

  for (const level of VALID_LEVELS) {
    const filePath = path.join(gameDir, `${level}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`\n⚠️  Missing file: cards/${game}/${level}.json`);
      continue;
    }
    found = true;
    checkFile(filePath, game, level);
  }
}

if (!found) {
  console.error('\n❌ No card files found! Make sure /cards/ directory is populated.');
  process.exit(1);
}

// --- Summary ---
console.log('\n' + '='.repeat(50));
console.log(`Validated ${totalFiles} files`);
if (totalErrors > 0) {
  console.error(`\n❌ ${totalErrors} error(s) found — please fix before merging.`);
  process.exit(1);
} else if (totalWarnings > 0) {
  console.warn(`\n⚠️  ${totalWarnings} warning(s) — consider reviewing.`);
  console.log('✅ Validation passed with warnings.');
} else {
  console.log('\n✅ All card files are valid!');
}

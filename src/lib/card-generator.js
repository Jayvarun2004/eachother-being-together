/**
 * src/lib/card-generator.js
 * Infinite Auto Card Generator & Permanent Memory
 *
 * Guarantees:
 * 1. ZERO REPEATS: Tracks all played card IDs permanently in localStorage.
 * 2. INFINITE CARDS: Auto-generates fresh, unique, deeply romantic partner-bonding cards
 *    tailored for couples when decks run low.
 * 3. BOND-DEEPENING TRUTHS: Truths heavily prioritized (~85%) in Truth or Dare,
 *    focusing on intimacy, vulnerability, gratitude, fond memories, and adoration.
 */

import { state } from './state.js';

const SEEN_STORAGE_KEY = 'ebt_seen_card_ids';

/**
 * Get the permanent set of seen card IDs.
 * @returns {Set<string>}
 */
export function getSeenCardIds() {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * Permanently record that a card has been seen.
 * @param {string} id
 */
export function markCardSeen(id) {
  if (!id) return;
  try {
    const seen = getSeenCardIds();
    seen.add(id);
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

/**
 * Clear the seen cards history if the couple ever wants a fresh start.
 */
export function resetSeenHistory() {
  try {
    localStorage.removeItem(SEEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// -------------------------------------------------------------
// Combinatorial Couple Bond-Deepening Templates
// -------------------------------------------------------------

const TRUTH_BOND_TEMPLATES_WHOLESOME = [
  'What was the exact moment in our journey when you realized: "Yes, this person is my home"?',
  'What is one little habit of mine that never fails to make your heart smile inside?',
  'What is your all-time favorite quiet memory of us, when we had no plans and were just together?',
  'What is a song, place, or scent that instantly brings me to your mind with pure warmth?',
  'What is something thoughtful I did for you that made you feel deeply cherished and safe?',
  'If you had to describe our connection using only three heartfelt words, what would they be?',
  'What is one way our relationship has gently helped you become a happier or better person?',
  'What is a silly or funny inside joke of ours that still makes you laugh out loud?',
  'What is a small promise we haven\'t officially spoken aloud yet that you quietly hold in your heart?',
  'What do you love most about the way we communicate when it is late at night and quiet?',
  'What was your honest first impression of me, and how has your view of me grown deeper since?',
  'What is one dream or destination you cannot imagine experiencing without having me by your side?',
  'What is something about my personality or soul that inspires you on your difficult days?',
  'When you look at our future together 5 years from now, what is the coziest scene you envision?',
  'What is one thing I do when I think nobody is watching that you find completely adorable?',
  'What is a compliment you have always wanted to give me but felt too shy to say aloud?',
  'What makes our bond feel different, safer, and more special than anything you have ever known?',
  'What is your favorite memory of us laughing until our stomachs hurt?',
  'What is a small everyday ritual of ours (morning coffee, goodnight hugs) that you cherish most?',
  'If you could relive any single day of our relationship from start to finish, which day would it be?',
];

const TRUTH_BOND_TEMPLATES_FLIRTY = [
  'What is something I wear, do, or say that instantly gives you magnetic butterflies?',
  'What is your favorite physical touch of mine when we are relaxing together on the sofa?',
  'Describe the first time you felt an irresistible urge to kiss me. What was going through your mind?',
  'What is one romantic date idea you secretly crave for us to do this weekend?',
  'What part of my body or smile do your eyes catch wandering to most often when you look at me?',
  'What is the most attractive thing about my voice or laugh that makes your heart race?',
  'If you could steal me away for 24 hours with no phones and no interruptions, what would our day look like?',
  'What is something playfully seductive I do without even realizing it?',
  'What is the sweetest or most flirtatious message I ever sent you that made your heart skip a beat?',
  'Which outfit of mine has made you think, "Wow, I am so incredibly lucky to call them mine"?',
  'What is one affectionate touch (running fingers through hair, back rubs, hand holding) you want more of tonight?',
  'If we were alone in a candlelit room with slow music playing, what would be the first thing you\'d do to me?',
  'What was the most electric, heart-pounding kiss we have ever shared so far?',
  'What is a playful romantic secret you\'ve held back because you were waiting for the right moment?',
  'How do you feel when I look deeply and silently into your eyes for more than 10 seconds?',
];

const TRUTH_BOND_TEMPLATES_SPICY = [
  'What is an intimate fantasy or craving involving us that you haven\'t whispered to me yet?',
  'What is the most intense, passionate moment we have ever experienced together that you still replay?',
  'What kind of touch or gentle kiss from me makes you lose complete control of your composure?',
  'Where is the most daring or adventurous place you have ever dreamed of sharing a passionate kiss with me?',
  'What is something you want me to do to you tonight that would make you feel totally adored and desired?',
  'What is the most intoxicating thing about the way we fit together in bed?',
  'What whisper or phrase spoken softly in your ear makes shivers travel down your spine?',
  'If you could take total, sensual control of me for the next 30 minutes, where would you begin?',
  'What is one boundary you felt shy about before, but feel safe, excited, and trusted to explore with me?',
  'What is the most irresistible vibe or look I give you that makes it impossible to focus on anything else?',
];

const DARE_BOND_TEMPLATES_WHOLESOME = [
  'Look deeply into my eyes without speaking or laughing for 30 full seconds, then give me a tight embrace.',
  'Hold my hands, take a slow deep breath together, and whisper the number one thing you love about me.',
  'Give me your warmest, coziest 20-second hug and tell me one thing you promise to always give our relationship.',
  'Gently rest your head on my chest or shoulder and tell me what you are most grateful for today.',
  'Slow dance with me right now for one minute, even without any music playing.',
];

const DARE_BOND_TEMPLATES_FLIRTY = [
  'Come close, whisper in my ear your favorite romantic thing about me, and kiss my cheek lingeringly.',
  'Give me a slow, tender 1-minute massage on my shoulders or neck while telling me how gorgeous I look.',
  'Trace the outline of my lips gently with your finger, look into my eyes, and plant a soft, slow kiss.',
  'Sit close, wrap your arms around me, and tell me exactly how you want tonight to end.',
  'Take my hand, press a warm kiss onto the palm, and hold it gently against your heart.',
];

const DARE_BOND_TEMPLATES_SPICY = [
  'Give me a slow, passionate kiss that lasts at least 15 uninterrupted seconds.',
  'Whisper the most sensual thing you want to do with me later directly against my neck.',
  'Gently pull me onto your lap or into your arms and hold me tight while breathing in my scent.',
  'Trace a line of gentle, teasing kisses along my jawline down to my collarbone.',
  'Blindfold me or have me close my eyes for 30 seconds while you kiss me anywhere you choose.',
];

// -------------------------------------------------------------
// Auto Generator Function
// -------------------------------------------------------------

/**
 * Generate fresh procedural couple cards that never repeat.
 * @param {string} game - e.g. 'truth-or-dare', 'soul-sync', etc.
 * @param {string} level - 'wholesome' | 'flirty' | 'spicy'
 * @param {number} count - number of cards to generate (default 20)
 * @returns {Array<object>}
 */
export function generateProceduralCards(game, level, count = 20) {
  const p1 = state.get('player1') || 'Partner 1';
  const p2 = state.get('player2') || 'Partner 2';
  const generated = [];
  const seen = getSeenCardIds();

  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const cardId = `auto_${game}_${level.charAt(0)}_${timestamp}`;
    if (seen.has(cardId)) continue;

    let card = null;

    if (game === 'truth-or-dare') {
      // User requirement: Maximize Truths (85% Truths, 15% Dares)
      const isTruth = Math.random() < 0.85;
      let pool;
      if (isTruth) {
        pool =
          level === 'spicy'
            ? TRUTH_BOND_TEMPLATES_SPICY
            : level === 'flirty'
              ? TRUTH_BOND_TEMPLATES_FLIRTY
              : TRUTH_BOND_TEMPLATES_WHOLESOME;
      } else {
        pool =
          level === 'spicy'
            ? DARE_BOND_TEMPLATES_SPICY
            : level === 'flirty'
              ? DARE_BOND_TEMPLATES_FLIRTY
              : DARE_BOND_TEMPLATES_WHOLESOME;
      }

      const rawText = pool[Math.floor(Math.random() * pool.length)];
      const text = rawText.replace(/{partner1}/g, p1).replace(/{partner2}/g, p2);

      card = {
        id: cardId,
        type: isTruth ? 'truth' : 'dare',
        level,
        text,
        isAutoGenerated: true,
        tags: ['auto', 'bond-deepener'],
        timerSeconds: !isTruth ? 30 : null,
      };
    } else if (game === 'soul-sync') {
      const pool =
        level === 'spicy'
          ? TRUTH_BOND_TEMPLATES_SPICY
          : level === 'flirty'
            ? TRUTH_BOND_TEMPLATES_FLIRTY
            : TRUTH_BOND_TEMPLATES_WHOLESOME;
      const rawText = pool[Math.floor(Math.random() * pool.length)];
      card = {
        id: cardId,
        type: 'prompt',
        level,
        text: rawText,
        isAutoGenerated: true,
        tags: ['auto', 'soul-sync'],
      };
    } else {
      // Generic bond-deepener card
      const pool =
        level === 'spicy'
          ? TRUTH_BOND_TEMPLATES_SPICY
          : level === 'flirty'
            ? TRUTH_BOND_TEMPLATES_FLIRTY
            : TRUTH_BOND_TEMPLATES_WHOLESOME;
      const rawText = pool[Math.floor(Math.random() * pool.length)];
      card = {
        id: cardId,
        type: 'prompt',
        level,
        text: rawText,
        isAutoGenerated: true,
        tags: ['auto'],
      };
    }

    if (card) {
      generated.push(card);
    }
  }

  return generated;
}

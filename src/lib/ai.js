/**
 * src/lib/ai.js
 * AI Assistant for "Eachother Being Together"
 *
 * Powers dynamic, personalized question generation and live card re-writing
 * using the Google Gemini API (with smart fallback templates when offline/no key).
 */

import { state } from './state.js';

const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Get active API key (from state, localStorage, or environment variable)
 */
export function getApiKey() {
  return (
    state.get('geminiApiKey') ||
    localStorage.getItem('ebt_gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

/**
 * Save user API key
 */
export function setApiKey(key) {
  const cleanKey = key.trim();
  state.set('geminiApiKey', cleanKey);
  try {
    if (cleanKey) {
      localStorage.setItem('ebt_gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('ebt_gemini_api_key');
    }
  } catch {
    /* ignore */
  }
}

/**
 * Generate a personalized card based on couple's preferences
 */
export async function generateAICard({ game, level, vibe = 'romantic', customNote = '' }) {
  const p1 = state.get('player1') || 'Partner 1';
  const p2 = state.get('player2') || 'Partner 2';
  const key = getApiKey();

  if (!key) {
    // Return curated spicy/deep generative fallback if no API key is provided
    return getLocalCuratedCard(game, level, vibe);
  }

  const systemPrompt = `You are Cupid AI, a romantic, witty, and emotionally intelligent couples game assistant for a web app named "Eachother Being Together".
Players: "${p1}" and "${p2}".
Game type: "${game}" (choices: "truth-or-dare", "never-have-i-ever", "would-you-rather").
Desired Level: "${level}" (wholesome, flirty, or spicy).
Desired Vibe: "${vibe}" (e.g. passionate, funny, deep, adventurous, provocative, playful).
User custom guidance: "${customNote}".

CRITICAL GUIDELINES:
- Make questions engaging, surprising, intimate, and authentic to adult couples. Avoid boring clichés.
- For "truth-or-dare", decide whether it's a Truth or Dare. Dares must be creative, fun, and safe.
- For "never-have-i-ever", produce a compelling "I have never..." statement that sparks stories.
- For "would-you-rather", provide two distinct, intriguing dilemmas (optionA and optionB).
- Spicy questions should be passionate, suggestive, and exciting, while strictly staying safe, consensual, non-degrading, and non-explicit.

Return ONLY a valid JSON object matching one of these schemas without any markdown or backticks:

If truth-or-dare:
{"type": "truth"|"dare", "text": "card text here", "timerSeconds": null or number}

If never-have-i-ever:
{"text": "never-have-i-ever statement here"}

If would-you-rather:
{"optionA": "first choice", "optionB": "second choice"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.95,
            topP: 0.9,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      id: `ai_${Date.now()}`,
      level,
      tags: ['ai-generated', vibe],
      ...parsed,
    };
  } catch (err) {
    console.warn('Gemini API call failed, using creative fallback:', err);
    return getLocalCuratedCard(game, level, vibe);
  }
}

/**
 * Modify an existing card to be spicier, deeper, or funnier
 */
export async function modifyCardWithAI(card, direction = 'spicier') {
  const p1 = state.get('player1') || 'Partner 1';
  const p2 = state.get('player2') || 'Partner 2';
  const key = getApiKey();

  if (!key) {
    return getModifiedFallback(card, direction);
  }

  const prompt = `You are a couples game assistant. Rewrite the following card to make it **${direction.toUpperCase()}** for couple ${p1} and ${p2}.
Original card: ${JSON.stringify(card)}
Return ONLY a valid JSON object with the exact same structure as the original card (e.g. keeping "text" or "optionA"/"optionB", "type" if present).
No markdown, no fences.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      ...card,
      ...parsed,
      id: `ai_mod_${Date.now()}`,
      tags: [...(card.tags || []), `ai-${direction}`],
    };
  } catch (err) {
    console.warn('AI modify failed, fallback used:', err);
    return getModifiedFallback(card, direction);
  }
}

/**
 * Curated offline generative templates when no API key is supplied
 */
function getLocalCuratedCard(game, level, vibe) {
  const now = Date.now();
  if (game === 'truth-or-dare') {
    const isDare = Math.random() > 0.5;
    if (isDare) {
      const dares = [
        'Whisper in your partner\'s ear the exact outfit or look of theirs that drove you crazy.',
        'Give your partner a slow 60-second massage on the spot of their choice without breaking eye contact.',
        'Show your partner your camera roll\'s hidden or favorite photo of them and tell the secret story behind it.',
        'Kiss your partner in 3 places other than their lips, each slower than the last.',
        'Describe in 30 seconds how you would spend an unplanned 24 hours locked together in a penthouse suite.',
      ];
      return {
        id: `local_ai_${now}`,
        type: 'dare',
        text: dares[Math.floor(Math.random() * dares.length)],
        level,
        tags: ['curated', vibe],
      };
    } else {
      const truths = [
        'What was the single most electrifying moment of physical or emotional tension between us?',
        'What is something you secretly hoped would happen on our very first date that didn\'t?',
        'If we had a secret rule that we could do anything together for one night without consequences, what would you ask for?',
        'What is a quality of mine that makes you feel instantly safe, and one that makes your heart race?',
        'What thought about me kept you awake the longest when we first started catching feelings?',
      ];
      return {
        id: `local_ai_${now}`,
        type: 'truth',
        text: truths[Math.floor(Math.random() * truths.length)],
        level,
        tags: ['curated', vibe],
      };
    }
  } else if (game === 'never-have-i-ever') {
    const nhie = [
      'fantasized about running away with my partner to a remote cabin with no phones for a week',
      're-read our old text messages late at night just to relive the initial butterflies',
      'felt an overwhelming rush of jealousy seeing someone else flirt with my partner',
      'planned an entire romantic surprise in my head that I was secretly too nervous to execute',
      'known I was falling in love before I ever dared to say the three words out loud',
    ];
    return {
      id: `local_ai_${now}`,
      text: nhie[Math.floor(Math.random() * nhie.length)],
      level,
      tags: ['curated', vibe],
    };
  } else {
    // Would You Rather
    const wyr = [
      {
        optionA: 'Spend a candlelit night whispering every secret desire you haven\'t confessed',
        optionB: 'Take off right now on an impromptu midnight drive with nowhere to be',
      },
      {
        optionA: 'Have a romance where the physical spark only grows wilder every decade',
        optionB: 'Have an emotional telepathy where you understand every glance across a crowded room',
      },
      {
        optionA: 'Relive our most passionate evening together as if it were happening right now',
        optionB: 'Get a sneak peek of our happiest vacation together 5 years in the future',
      },
    ];
    const pick = wyr[Math.floor(Math.random() * wyr.length)];
    return {
      id: `local_ai_${now}`,
      optionA: pick.optionA,
      optionB: pick.optionB,
      level,
      tags: ['curated', vibe],
    };
  }
}

function getModifiedFallback(card, direction) {
  if (card.text) {
    return {
      ...card,
      id: `mod_${Date.now()}`,
      text: `[${direction.toUpperCase()} EDITION] ${card.text} — Now take it one step further and answer with complete, raw honesty.`,
    };
  }
  return card;
}

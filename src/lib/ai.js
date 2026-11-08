/**
 * src/lib/ai.js
 * AI Assistant for "Eachother Being Together"
 *
 * Multi-tier AI architecture:
 * 1. ⚡ Local Ollama (100% private, runs on GPU, zero cost, e.g. gemma3:4b)
 * 2. 🌐 Free Public AI Endpoint (Pollinations AI, zero-signup, zero-key)
 * 3. 🔑 Google Gemini API (optional custom key)
 * 4. 📴 Curated smart local fallback templates (offline)
 */

import { state } from './state.js';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const GEMINI_MODEL = 'gemini-1.5-flash';

let _cachedOllamaModel = null;

/**
 * Check if local Ollama is running and get model name
 */
export async function checkOllamaAvailable() {
  if (_cachedOllamaModel) return _cachedOllamaModel;
  try {
    const res = await fetch('/api/ollama/api/tags');
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];
      if (models.length > 0) {
        // Prefer gemma, llama, mistral if present, or take first
        const best =
          models.find(m => /gemma|llama|mistral/i.test(m.name)) || models[0];
        _cachedOllamaModel = best.name;
        return _cachedOllamaModel;
      }
    }
  } catch {
    /* Ollama not reachable */
  }
  return null;
}

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
 * Save user API key (optional)
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
 * Generate a personalized card based on couple's preferences.
 */
export async function generateAICard({ game, level, vibe = 'romantic', customNote = '' }) {
  const p1 = state.get('player1') || 'Partner 1';
  const p2 = state.get('player2') || 'Partner 2';
  const customKey = getApiKey();

  const systemInstructions = `You are Cupid AI, a romantic, witty, and emotionally intelligent couples game assistant for a web app named "Eachother Being Together".
Players: "${p1}" and "${p2}".
Game: "${game}" ("truth-or-dare", "never-have-i-ever", "would-you-rather").
Level: "${level}" (wholesome, flirty, or spicy).
Vibe: "${vibe}" (passionate, funny, deep, adventurous, provocative, playful).
User custom prompt: "${customNote}".

CRITICAL INSTRUCTIONS:
- Tailor the question specifically for adult couples. Avoid boring or generic clichés.
- For "truth-or-dare": choose either a Truth or Dare. Dares must be creative, fun, safe to do at home.
- For "never-have-i-ever": output a spicy, fun, or deep "I have never..." statement.
- For "would-you-rather": provide two distinct, intriguing options ("optionA" and "optionB").
- Spicy cards must be passionate, suggestive, and thrilling, but always consensual, respectful, safe, and not graphically explicit.

Respond ONLY with a valid JSON object (no markdown, no backticks):

If truth-or-dare:
{"type": "truth"|"dare", "text": "...", "timerSeconds": null or number}

If never-have-i-ever:
{"text": "..."}

If would-you-rather:
{"optionA": "...", "optionB": "..."}`;

  // 1. Check Local Ollama first (Fastest, 100% private on GPU!)
  const ollamaModel = await checkOllamaAvailable();
  if (ollamaModel) {
    try {
      const res = await fetch('/api/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: `${systemInstructions}\nGenerate one fresh couple card now in raw JSON.`,
          stream: false,
          format: 'json',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = cleanAndParseJSON(data.response);
        if (parsed) {
          return { id: `ollama_${Date.now()}`, level, tags: ['ollama', ollamaModel, vibe], ...parsed };
        }
      }
    } catch (e) {
      console.warn('Ollama query error, falling back to cloud AI:', e);
    }
  }

  // 2. Custom Gemini Key if configured
  if (customKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${customKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstructions }] }],
            generationConfig: {
              temperature: 0.95,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = cleanAndParseJSON(raw);
        if (parsed) {
          return { id: `gemini_${Date.now()}`, level, tags: ['gemini', vibe], ...parsed };
        }
      }
    } catch (e) {
      console.warn('Gemini error, falling back to open AI:', e);
    }
  }

  // 3. Free Open AI Endpoint (Zero signup, zero key)
  try {
    const res = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: 'Generate one fresh couple card now in raw JSON.' },
        ],
        jsonMode: true,
        model: 'openai',
      }),
    });

    if (res.ok) {
      const rawText = await res.text();
      const parsed = cleanAndParseJSON(rawText);
      if (parsed) {
        return { id: `ai_free_${Date.now()}`, level, tags: ['free-ai', vibe], ...parsed };
      }
    }
  } catch (err) {
    console.warn('Free AI endpoint error, using curated template:', err);
  }

  // 4. Instant local fallback
  return getLocalCuratedCard(game, level, vibe);
}

/**
 * Modify an existing card to be spicier, deeper, or funnier
 */
export async function modifyCardWithAI(card, direction = 'spicier') {
  const p1 = state.get('player1') || 'Partner 1';
  const p2 = state.get('player2') || 'Partner 2';
  const customKey = getApiKey();

  const prompt = `Rewrite this couple's game card to make it **${direction.toUpperCase()}** (more exciting, intimate, raw, and fun) for ${p1} and ${p2}.
Original card: ${JSON.stringify(card)}
Return ONLY a valid JSON object matching the exact original structure (fields: text, or optionA & optionB, and type if present). No markdown fences.`;

  // 1. Local Ollama
  const ollamaModel = await checkOllamaAvailable();
  if (ollamaModel) {
    try {
      const res = await fetch('/api/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: `${prompt}\nReturn raw JSON only.`,
          stream: false,
          format: 'json',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = cleanAndParseJSON(data.response);
        if (parsed) {
          return { ...card, ...parsed, id: `ollama_mod_${Date.now()}` };
        }
      }
    } catch (e) {
      console.warn('Ollama modify error, falling back:', e);
    }
  }

  // 2. Custom Gemini Key
  if (customKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${customKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = cleanAndParseJSON(raw);
        if (parsed) {
          return { ...card, ...parsed, id: `gemini_mod_${Date.now()}` };
        }
      }
    } catch {
      /* fallback */
    }
  }

  // 3. Free AI Endpoint
  try {
    const res = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a couples card game modifier. Return raw JSON only.' },
          { role: 'user', content: prompt },
        ],
        jsonMode: true,
        model: 'openai',
      }),
    });

    if (res.ok) {
      const rawText = await res.text();
      const parsed = cleanAndParseJSON(rawText);
      if (parsed) {
        return { ...card, ...parsed, id: `ai_mod_free_${Date.now()}` };
      }
    }
  } catch (err) {
    console.warn('AI modify failed, fallback used:', err);
  }

  return getModifiedFallback(card, direction);
}

/** Helper to safely parse JSON */
function cleanAndParseJSON(raw) {
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Curated offline generative templates
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

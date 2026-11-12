/**
 * src/lib/i18n.js
 * Minimal internationalisation helper.
 * To add a language: add a JSON file to /i18n/ and call initI18n('xx').
 */

let _strings = {};
const localeFiles = import.meta.glob('../../i18n/*.json', { eager: true });

/**
 * Load a locale JSON file. Called once at boot.
 * @param {string} locale - e.g. 'en', 'hi'
 */
export async function initI18n(locale = 'en') {
  try {
    const mod = localeFiles[`../../i18n/${locale}.json`] ?? localeFiles['../../i18n/en.json'];
    _strings = mod?.default ?? mod ?? {};
  } catch (e) {
    console.warn('i18n: could not load locale', locale, e);
    _strings = {};
  }
}

/**
 * Get a string by dot-separated key.
 * Supports {placeholder} interpolation.
 * @param {string} key
 * @param {Record<string,string|number>} [vars]
 * @returns {string}
 */
export function t(key, vars = {}) {
  const parts = key.split('.');
  let value = _strings;
  for (const p of parts) {
    value = value?.[p];
    if (value === undefined) return key; // fallback: return key itself
  }
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}

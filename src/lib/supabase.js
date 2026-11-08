/**
 * src/lib/supabase.js
 * Supabase client wrapper.
 * Only the public anon key is used here — the service role key is NEVER
 * included in the frontend.
 *
 * Environment variables (set in .env locally, in Netlify dashboard for prod):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

let _supabase = null;

/** Lazy-init the Supabase client. Returns null if not configured. */
export async function getSupabase() {
  if (_supabase) return _supabase;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project-ref')) {
    console.warn('Supabase not configured. Online mode disabled.');
    return null;
  }

  try {
    // Dynamic import keeps the bundle small when Supabase isn't used
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    _supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (e) {
    console.error('Failed to create Supabase client', e);
    return null;
  }

  return _supabase;
}

/** Sign in anonymously (creates a new user each session unless already signed in) */
export async function signInAnonymously() {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) { console.error('anon sign-in', error); return null; }
  return data.user;
}

/** Get the currently signed-in user */
export async function getCurrentUser() {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data?.user ?? null;
}

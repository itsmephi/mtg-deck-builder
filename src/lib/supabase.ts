// Supabase browser client.
//
// The app is fully client-rendered, so a plain `@supabase/supabase-js` client
// (session persisted in localStorage, OAuth redirect picked up from the URL via
// `detectSessionInUrl`) is all we need — no SSR cookie handling, no callback
// route. See docs/specs/v2.0.0-google-auth-cloud-sync.md.
//
// Both env vars are public-safe: access is enforced by Postgres Row-Level
// Security, not by key secrecy. When they are absent (e.g. local dev without a
// Supabase project, or before setup), `supabase` is null and the app runs in
// pure local-only mode exactly as it did pre-v2.0.0 — sign-in is unavailable,
// nothing else changes.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase env vars are present — gates all auth/sync surfaces. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

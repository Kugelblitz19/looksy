/**
 * Whether Supabase is configured. Until the project's env keys are set, the app
 * gracefully falls back to the temporary built-in auth so nothing breaks.
 * Both vars are NEXT_PUBLIC_, so this is readable on the client and the server.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

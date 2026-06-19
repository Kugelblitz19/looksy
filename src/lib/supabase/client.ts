import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in browser ("use client") components.
 * Reads the public env vars (safe to expose).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

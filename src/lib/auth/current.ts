import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * True if the current request has an authenticated user — via Supabase when
 * configured, otherwise via the built-in fallback session. Used to guard the
 * image/shop APIs so they work under whichever auth system is active.
 */
export async function isAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  }

  const { getSessionUser } = await import("@/lib/auth/session");
  return Boolean(await getSessionUser());
}

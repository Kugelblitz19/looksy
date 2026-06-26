import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User } from "@supabase/supabase-js";

/**
 * The current authenticated user (Supabase), or null. Looksy uses Supabase Auth
 * exclusively — there is no fallback session, so an unconfigured/absent Supabase
 * simply means "not authenticated". This removes any locally-forgeable session
 * as a path to access.
 */
export async function currentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Convenience boolean guard for API routes. */
export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await currentUser());
}

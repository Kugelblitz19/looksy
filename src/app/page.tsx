import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import Landing from "@/components/Landing";

export default async function Home() {
  // Public landing page. We only check auth to tailor the call-to-action —
  // no redirect, so logged-out visitors see the landing.
  let isAuthed = false;
  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthed = Boolean(user);
  } else {
    isAuthed = Boolean(await getSessionUser());
  }

  return <Landing isAuthed={isAuthed} />;
}

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import Studio from "@/components/Studio";

export default async function StudioPage() {
  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const name = (user.user_metadata?.full_name as string) || undefined;
    return <Studio userEmail={user.email ?? ""} userName={name} supabaseAuth />;
  }

  // Fallback: built-in auth until Supabase keys are set.
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <Studio userEmail={user.email} userName={user.name} />;
}

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import SavedLooksView from "@/components/studio/SavedLooksView";

export default async function SavedPage() {
  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } else {
    if (!(await getSessionUser())) redirect("/login");
  }
  return <SavedLooksView />;
}

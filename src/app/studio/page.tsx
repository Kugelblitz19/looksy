import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import Studio from "@/components/Studio";

export default async function StudioPage() {
  // Real face generation only when a (billed) Gemini key is set; otherwise the
  // free generator styles a generic model.
  const realGeneration = Boolean(process.env.GEMINI_API_KEY);

  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const name = (user.user_metadata?.full_name as string) || undefined;
    return (
      <Studio
        userEmail={user.email ?? ""}
        userName={name}
        supabaseAuth
        realGeneration={realGeneration}
      />
    );
  }

  // Fallback: built-in auth until Supabase keys are set.
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <Studio
      userEmail={user.email}
      userName={user.name}
      realGeneration={realGeneration}
    />
  );
}

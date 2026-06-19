import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import AuthForm from "@/components/AuthForm";
import SupabaseAuthForm from "@/components/SupabaseAuthForm";

export default async function SignupPage() {
  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
    return <SupabaseAuthForm mode="signup" />;
  }

  // Fallback: built-in auth until Supabase keys are set.
  if (await getSessionUser()) redirect("/");
  return <AuthForm mode="signup" />;
}

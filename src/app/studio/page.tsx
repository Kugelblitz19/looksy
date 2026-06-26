import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current";
import Studio from "@/components/Studio";

export default async function StudioPage() {
  // Real face generation only when a (billed) Gemini key is set; otherwise the
  // free generator styles a generic model.
  const realGeneration = Boolean(process.env.GEMINI_API_KEY);

  const user = await currentUser();
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

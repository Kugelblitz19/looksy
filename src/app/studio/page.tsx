import { currentUser } from "@/lib/auth/current";
import Studio from "@/components/Studio";

export default async function StudioPage() {
  // Real face generation only when a (billed) Gemini key is set; otherwise the
  // free generator styles a generic model.
  const realGeneration = Boolean(process.env.GEMINI_API_KEY);

  const user = await currentUser();

  // Guest trial: let a logged-out visitor shoot ONE free look before signing up
  // (huge conversion lift vs. forcing signup first). The generate API enforces
  // the one-look limit; saving and "make more" require an account.
  if (!user) {
    return <Studio guest userEmail="" realGeneration={realGeneration} />;
  }

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

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current";
import SupabaseAuthForm from "@/components/SupabaseAuthForm";

export default async function LoginPage() {
  if (await currentUser()) redirect("/studio");
  return <SupabaseAuthForm mode="login" />;
}

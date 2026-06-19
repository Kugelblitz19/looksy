import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AuthForm from "@/components/AuthForm";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/");
  return <AuthForm mode="login" />;
}

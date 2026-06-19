import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import Studio from "@/components/Studio";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <Studio userEmail={user.email} userName={user.name} />;
}

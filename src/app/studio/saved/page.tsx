import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current";
import SavedLooksView from "@/components/studio/SavedLooksView";

export default async function SavedPage() {
  if (!(await currentUser())) redirect("/login");
  return <SavedLooksView />;
}

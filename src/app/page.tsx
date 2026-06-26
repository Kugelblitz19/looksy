import { currentUser } from "@/lib/auth/current";
import Landing from "@/components/Landing";

export default async function Home() {
  // Public landing page. We only check auth to tailor the call-to-action —
  // no redirect, so logged-out visitors see the landing.
  const isAuthed = Boolean(await currentUser());
  return <Landing isAuthed={isAuthed} />;
}

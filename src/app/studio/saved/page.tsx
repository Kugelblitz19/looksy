import { redirect } from "next/navigation";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SavedLooksGrid from "@/components/SavedLooksGrid";
import type { GeneratedLook } from "@/lib/types";

export default async function SavedLooksPage() {
  if (!isSupabaseConfigured) redirect("/studio");

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("saved_looks")
    .select("*")
    .order("created_at", { ascending: false });

  const looks: GeneratedLook[] = (data ?? []).map((row) => ({
    id: row.id as string,
    imageUrl: row.image_url as string,
    prompt: (row.prompt as string) ?? "",
    aesthetics: (row.aesthetics as string[]) ?? [],
  }));

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] animate-float rounded-full bg-[#5f27cd]/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/studio" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm shadow ring-1 ring-white/10">
                ✨
              </span>
              <span className="text-lg font-bold tracking-tight">Looksy</span>
            </Link>
            <Link
              href="/studio"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
            >
              ✨ New look
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
          <h1 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            My Looks
          </h1>
          <SavedLooksGrid initialLooks={looks} />
        </div>
      </div>
    </main>
  );
}

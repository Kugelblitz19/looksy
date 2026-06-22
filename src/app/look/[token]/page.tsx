import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAesthetic } from "@/lib/aesthetics";

export const runtime = "nodejs";

async function getLook(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("saved_looks")
    .select("public_image_url, prompt, aesthetics, is_public")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();
  return data;
}

export default async function PublicLookPage({
  params,
}: {
  params: { token: string };
}) {
  const look = await getLook(params.token);
  if (!look || !look.public_image_url) notFound();

  const chips = ((look.aesthetics as string[]) || [])
    .map(getAesthetic)
    .filter(Boolean)
    .map((a) => `${a!.emoji} ${a!.label}`);

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] animate-float rounded-full bg-[#5f27cd]/30 blur-[150px]" />
        <div className="absolute -right-40 bottom-0 h-[32rem] w-[32rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-5 py-8">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-base ring-1 ring-white/10">
            ✨
          </span>
          <span className="text-lg font-bold tracking-tight">Looksy</span>
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.public_image_url as string}
            alt={(look.prompt as string) || "A look made with Looksy"}
            className="aspect-[3/4] w-full object-cover"
          />
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 bg-panel p-3">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-white/60">
          {look.prompt ? `“${look.prompt}”` : "A look styled by AI."}
        </p>

        <div className="mt-7 text-center">
          <p className="mb-3 text-sm text-white/45">
            Made with <span className="font-semibold text-white/70">Looksy</span>{" "}
            — see yourself in any look.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black shadow-[0_0_55px_-10px_rgba(255,255,255,0.6)] transition hover:scale-[1.02]"
          >
            Make your own look →
          </Link>
        </div>
      </div>
    </main>
  );
}

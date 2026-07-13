import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAesthetic } from "@/lib/aesthetics";
import { issueLabel } from "@/lib/issue";

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
    .map((a) => a!.label);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="mb-8 flex items-baseline justify-between border-b border-ink/15 pb-4">
          <Link
            href="/"
            className="font-display text-xl tracking-tight transition-colors hover:text-vermilion"
          >
            LOOKSY
          </Link>
          <span className="font-mono text-sm text-vermilion">
            {issueLabel()}
          </span>
        </div>

        <div className="border border-ink/15 bg-paper-2 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.public_image_url as string}
            alt={(look.prompt as string) || "A look made with Looksy"}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

        <p className="mt-5 text-center font-serif text-lg italic text-ink-60">
          {look.prompt ? `“${look.prompt}”` : "A look styled by AI."}
        </p>

        {chips.length > 0 && (
          <p className="mt-3 text-center font-sans text-sm text-ink-60">
            {chips.join(" · ")}
          </p>
        )}

        <div className="mt-10 border-t border-ink/15 pt-8 text-center">
          <p className="mb-4 kicker text-ink-30">
            Made with Looksy — pick a vibe, shop the look
          </p>
          <Link
            href="/signup"
            className="inline-block bg-vermilion px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-paper transition-colors hover:bg-vermilion-ink"
          >
            Make your own look →
          </Link>
        </div>
      </div>
    </main>
  );
}

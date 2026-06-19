"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoUpload, { type UploadedPhoto } from "@/components/PhotoUpload";
import AestheticPicker from "@/components/AestheticPicker";
import LookCard from "@/components/LookCard";
import type { GeneratedLook, GenerateResponse } from "@/lib/types";

const COUNT_OPTIONS = [1, 2, 4];

export default function Studio({
  userEmail,
  userName,
  supabaseAuth = false,
}: {
  userEmail: string;
  userName?: string;
  supabaseAuth?: boolean;
}) {
  const router = useRouter();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [looks, setLooks] = useState<GeneratedLook[]>([]);

  const toggleAesthetic = (id: string) =>
    setAesthetics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canGenerate =
    !loading && (aesthetics.length > 0 || prompt.trim().length > 0);

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("prompt", prompt);
      form.set("aesthetics", JSON.stringify(aesthetics));
      form.set("count", String(count));
      for (const p of photos) form.append("photos", p.file);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data: GenerateResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed.");
      setLooks((prev) => [...(data.looks ?? []), ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (supabaseAuth) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    } else {
      await fetch("/api/auth/logout", { method: "POST" });
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen">
      {/* Floating gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] animate-float rounded-full bg-[#5f27cd]/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-80 w-80 animate-float rounded-full bg-[#ff6b6b]/12 blur-[130px]" />
      </div>

      <div className="relative z-10">
        {/* Top bar */}
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/studio" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm shadow ring-1 ring-white/10">
                ✨
              </span>
              <span className="text-lg font-bold tracking-tight">Looksy</span>
            </Link>
            <div className="flex items-center gap-3">
              {supabaseAuth && (
                <Link
                  href="/studio/saved"
                  className="rounded-lg px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
                >
                  My looks
                </Link>
              )}
              <span className="hidden text-sm text-white/55 sm:inline">
                Hi, {userName || userEmail}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* LEFT: profile + styling controls */}
            <aside className="self-start space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-xl lg:sticky lg:top-[84px]">
              <div>
                <h2 className="text-lg font-semibold">Your profile</h2>
                <p className="mt-0.5 text-xs text-white/50">
                  Add a selfie and pick a style — we’ll create looks of you to shop.
                </p>
              </div>

              <PhotoUpload photos={photos} onChange={setPhotos} />

              <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Style it your way{" "}
                  <span className="text-white/40">(optional)</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. black jacket, blue jeans, white sneakers, on a city street"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">How many?</span>
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={[
                      "h-9 w-9 rounded-lg border text-sm font-medium transition",
                      count === n
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={!canGenerate}
                className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Creating your looks…" : "✨ Create my looks"}
              </button>

              {!canGenerate && !loading && (
                <p className="text-center text-xs text-white/40">
                  Pick a style (or type details) to start.
                </p>
              )}
              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}
            </aside>

            {/* RIGHT: generated pictures + buy links */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your looks</h2>
                {looks.length > 0 && (
                  <span className="text-xs text-white/40">
                    Tap any item to shop ↗
                  </span>
                )}
              </div>

              {(loading || looks.length > 0) && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {loading &&
                    Array.from({ length: count }).map((_, i) => (
                      <div
                        key={`sk-${i}`}
                        className="skeleton h-[32rem] animate-shimmer rounded-3xl"
                      />
                    ))}
                  {looks.map((look) => (
                    <LookCard key={look.id} look={look} saveable={supabaseAuth} />
                  ))}
                </div>
              )}

              {!loading && looks.length === 0 && (
                <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/40 sm:min-h-[26rem]">
                  <div>
                    <div className="mb-3 text-4xl">🪄</div>
                    Your looks appear here — each with buy links for everything
                    you’re wearing.
                  </div>
                </div>
              )}

              {looks.length > 0 && (
                <p className="mt-8 text-center text-xs text-white/35">
                  Looksy may earn a small commission from purchases made through
                  these links.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

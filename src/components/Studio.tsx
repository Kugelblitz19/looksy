"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload, { type UploadedPhoto } from "@/components/PhotoUpload";
import AestheticPicker from "@/components/AestheticPicker";
import LookCard from "@/components/LookCard";
import ProfileMenu from "@/components/studio/ProfileMenu";
import SavedLooks from "@/components/studio/SavedLooks";
import OccasionPacks from "@/components/studio/OccasionPacks";
import { OCCASIONS, PROMPT_IDEAS, type Occasion } from "@/lib/occasions";
import type { GeneratedLook, GenerateResponse } from "@/lib/types";

const COUNT_OPTIONS = [1, 2, 4];

export default function Studio({
  userEmail,
  userName,
  supabaseAuth = false,
  realGeneration = false,
}: {
  userEmail: string;
  userName?: string;
  supabaseAuth?: boolean;
  realGeneration?: boolean;
}) {
  const router = useRouter();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [looks, setLooks] = useState<GeneratedLook[]>([]);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [savedReload, setSavedReload] = useState(0);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  // Load any persisted selfie so it powers the avatar (and survives refresh).
  useEffect(() => {
    if (!supabaseAuth) return;
    fetch("/api/selfie")
      .then((r) => r.json())
      .then((d) => {
        if (d?.url) setSelfieUrl(d.url);
      })
      .catch(() => {});
  }, [supabaseAuth]);

  async function handlePhotoChange(next: UploadedPhoto[]) {
    setPhotos(next);
    const first = next[0];
    if (!first || !supabaseAuth) return;
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(first.file);
      });
      const res = await fetch("/api/selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: dataUrl }),
      });
      const d = await res.json();
      if (res.ok && d?.url) setSelfieUrl(d.url);
    } catch {
      /* selfie persistence is best-effort */
    }
  }

  const toggleAesthetic = (id: string) =>
    setAesthetics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canGenerate =
    !loading && (aesthetics.length > 0 || prompt.trim().length > 0);

  async function runGenerate(opts: {
    prompt: string;
    aesthetics: string[];
    count: number;
  }) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("prompt", opts.prompt);
      form.set("aesthetics", JSON.stringify(opts.aesthetics));
      form.set("count", String(opts.count));
      for (const p of photos) form.append("photos", p.file);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data: GenerateResponse = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Generation failed.");
      setLooks((prev) => [...(data.looks ?? []), ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const generate = () => {
    if (!canGenerate) return;
    runGenerate({ prompt, aesthetics, count });
  };

  const makeVariation = (look: GeneratedLook) => {
    if (loading) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    runGenerate({ prompt: look.prompt, aesthetics: look.aesthetics, count: 1 });
  };

  const remix = (look: GeneratedLook) => {
    setPrompt(look.prompt);
    setAesthetics(look.aesthetics);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyOccasion = (o: Occasion) => {
    setAesthetics(o.aesthetics);
    setPrompt(o.prompt);
  };

  const appendIdea = (idea: string) =>
    setPrompt((p) => (p.trim() ? `${p.trim()}, ${idea}` : idea));

  const surprise = () => applyOccasion(OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)]);

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

  const scrollToSaved = () =>
    document
      .getElementById("saved-looks")
      ?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] animate-float rounded-full bg-[#5f27cd]/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm shadow ring-1 ring-white/10">
                ✨
              </span>
              <span className="text-lg font-bold tracking-tight">Looksy</span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={[
                  "hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline",
                  realGeneration
                    ? "bg-emerald-400/10 text-emerald-200"
                    : "bg-amber-400/10 text-amber-200/90",
                ].join(" ")}
              >
                {realGeneration ? "✨ Real face" : "🎭 Demo"}
              </span>
              <ProfileMenu
                userName={userName}
                userEmail={userEmail}
                realGeneration={realGeneration}
                avatarUrl={selfieUrl}
                onOpenPhoto={() => setPhotoOpen(true)}
                onScrollToSaved={scrollToSaved}
                onLogout={logout}
              />
            </div>
          </div>
        </header>

        {/* Create */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                ✨ Create a look
              </h1>
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {photos.length > 0 || selfieUrl
                  ? "📸 Photo added"
                  : "📸 Add your photo"}
              </button>
            </div>

            {!realGeneration && (
              <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-2.5 py-1.5 text-[11px] leading-snug text-amber-200/80">
                🎭 Demo styles a model, not your face — your face needs a billed
                Gemini key.
              </p>
            )}

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5 backdrop-blur-xl">
              <OccasionPacks onPick={applyOccasion} />

              <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="Style it your way (optional) — e.g. black jacket, blue jeans, city street"
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={surprise}
                  className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20"
                >
                  🎲 Surprise me
                </button>
                {PROMPT_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => appendIdea(idea)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                  >
                    + {idea}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/55">How many?</span>
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={[
                        "h-8 w-8 rounded-lg border text-sm font-medium transition",
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
                  className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.7)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {loading ? "Creating…" : "✨ Create my looks"}
                </button>
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}
            </div>

            {(loading || looks.length > 0) && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {loading &&
                  Array.from({ length: count }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="skeleton h-[30rem] animate-shimmer rounded-3xl"
                    />
                  ))}
                {looks.map((look) => (
                  <LookCard
                    key={look.id}
                    look={look}
                    saveable={supabaseAuth}
                    onSaved={() => setSavedReload((x) => x + 1)}
                    onVariation={makeVariation}
                  />
                ))}
              </div>
            )}

            {!loading && looks.length === 0 && (
              <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/40 sm:min-h-[18rem]">
                <div>
                  <div className="mb-3 text-4xl">🪄</div>
                  Pick a style and hit Create — your looks (with buy links) show
                  up here.
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Saved looks (bottom) */}
        {supabaseAuth && (
          <SavedLooks reloadToken={savedReload} onRemix={remix} />
        )}
      </div>

      {/* Photo modal */}
      {photoOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPhotoOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-panel p-5 shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">📸 Your photo</h2>
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <PhotoUpload
              photos={photos}
              onChange={handlePhotoChange}
              hint={
                realGeneration
                  ? "Add a clear selfie so your looks actually look like you."
                  : "In demo mode your photo isn’t used yet — add a billed Gemini key to put your real face in the looks."
              }
            />
          </div>
        </div>
      )}
    </main>
  );
}

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
      <div className="studio-light pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-ink/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm shadow ring-1 ring-white/10">
                ✨
              </span>
              <span className="text-lg font-semibold tracking-tight">Looksy</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/40 sm:flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${realGeneration ? "bg-champagne" : "bg-amber-300/70"}`}
                />
                {realGeneration ? "Real face" : "Demo"}
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
          {/* Hairline header rule — the only place the brand gradient appears, faintly. */}
          <div className="relative h-px w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          </div>
        </header>

        {/* Create */}
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          {/* Masthead */}
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-[0.25em] text-white/35">
                The Studio
              </p>
              <h1 className="font-display text-4xl font-medium leading-none tracking-tight sm:text-5xl">
                Create a look
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              className="shrink-0 rounded-full px-4 py-2 text-sm text-white/60 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
            >
              {photos.length > 0 || selfieUrl ? "✓ Photo added" : "Add your photo"}
            </button>
          </div>

          {!realGeneration && (
            <p className="mb-10 flex items-center gap-2 text-[12px] text-amber-200/55">
              <span className="h-1 w-1 rounded-full bg-amber-300/70" />
              Demo mode styles a model, not your face — add a billed Gemini key
              for your real face.
            </p>
          )}

          <div className="space-y-8">
            <Section letter="A" label="Occasion">
              <OccasionPacks onPick={applyOccasion} />
            </Section>

            <Section letter="B" label="Style">
              <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />
            </Section>

            <Section letter="C" label="In your words">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="Describe your look — e.g. black tailored blazer, ivory silk, city evening"
                className="w-full resize-none rounded-none border-0 border-b border-white/[0.12] bg-transparent px-0 py-2 text-base leading-relaxed text-white placeholder:text-white/25 focus:border-champagne-deep/60 focus:outline-none focus:ring-0"
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
                <button
                  type="button"
                  onClick={surprise}
                  className="text-champagne transition hover:text-white"
                >
                  🎲 Surprise me
                </button>
                {PROMPT_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => appendIdea(idea)}
                    className="text-white/40 transition hover:text-champagne"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </Section>

            <Section letter="D" label="Render">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    Quantity
                  </span>
                  <div className="flex gap-1.5">
                    {COUNT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={[
                          "h-9 w-9 rounded-full text-sm transition duration-300",
                          count === n
                            ? "bg-cta font-medium text-black"
                            : "text-white/55 ring-1 ring-white/[0.08] hover:text-white",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generate}
                  disabled={!canGenerate}
                  className="group relative overflow-hidden rounded-full bg-cta px-8 py-3.5 text-base font-medium text-black shadow-[0_0_50px_-12px_rgba(232,227,207,0.5)] ring-1 ring-champagne-deep/40 transition duration-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  <span className="relative">
                    {loading ? "Creating…" : "Create my looks"}
                  </span>
                </button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-300/80">{error}</p>
              )}
            </Section>
          </div>

          {/* Results */}
          {(loading || looks.length > 0) && (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {loading &&
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="skeleton h-[34rem] animate-shimmer rounded-2xl"
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
            <div className="mt-16 grid place-items-center border-t border-white/[0.07] py-20 text-center">
              <div className="max-w-xs">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-lg text-champagne ring-1 ring-champagne-deep/25">
                  ✦
                </div>
                <p className="font-display text-xl text-white/80">
                  Your gallery is empty
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Choose a style and create — your looks, with shoppable pieces,
                  appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Saved looks (bottom) */}
        {supabaseAuth && (
          <SavedLooks reloadToken={savedReload} onRemix={remix} />
        )}
      </div>

      {/* Photo modal */}
      {photoOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setPhotoOpen(false)}
        >
          <div
            className="w-full max-w-md animate-fade-up rounded-2xl border border-white/[0.08] bg-ink/95 p-6 ring-1 ring-white/[0.04]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">Your photo</h2>
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/50 ring-1 ring-white/[0.08] transition hover:text-white"
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

/** An editorial section: a lettered micro-label in the gutter + content. */
function Section({
  letter,
  label,
  children,
}: {
  letter: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-white/[0.07] pt-8 sm:grid-cols-[7rem_1fr] sm:gap-8">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/35">
        <span className="text-champagne-deep">{letter}</span>
        <span className="px-1.5 text-white/20">·</span>
        {label}
      </div>
      <div>{children}</div>
    </section>
  );
}

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
import type { Gender, GeneratedLook, GenerateResponse } from "@/lib/types";

const COUNT_OPTIONS = [1, 2, 4];
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
];

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
  const [gender, setGender] = useState<Gender>("woman");
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

  // Remember who the looks are styled for across visits.
  useEffect(() => {
    const saved = localStorage.getItem("looksy:gender");
    if (saved === "woman" || saved === "man") setGender(saved);
  }, []);

  const chooseGender = (g: Gender) => {
    setGender(g);
    localStorage.setItem("looksy:gender", g);
  };

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
      form.set("gender", gender);
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

        {/* Create — one calm centered column */}
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          {/* Masthead */}
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Create a look
            </h1>
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              className="shrink-0 rounded-full px-4 py-2 text-sm text-white/60 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
            >
              {photos.length > 0 || selfieUrl ? "✓ Photo" : "Add photo"}
            </button>
          </div>

          {/* Composer */}
          <div className="mx-auto mt-12 max-w-xl space-y-10">
            <Group label="Occasion">
              <OccasionPacks onPick={applyOccasion} />
            </Group>

            <Group label="Style">
              <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />
            </Group>

            <Group label="Describe it — optional">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="e.g. black tailored blazer, ivory silk, city evening"
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
                {PROMPT_IDEAS.slice(0, 3).map((idea) => (
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
            </Group>

            {/* Control deck — model, quantity and the one action, grouped */}
            <div className="flex flex-col gap-5 rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <Control label="Model">
                  {GENDER_OPTIONS.map((g) => (
                    <Pill
                      key={g.value}
                      active={gender === g.value}
                      onClick={() => chooseGender(g.value)}
                    >
                      {g.label}
                    </Pill>
                  ))}
                </Control>
                <Control label="Count">
                  {COUNT_OPTIONS.map((n) => (
                    <Pill key={n} active={count === n} onClick={() => setCount(n)} round>
                      {n}
                    </Pill>
                  ))}
                </Control>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={!canGenerate}
                className="group relative shrink-0 overflow-hidden rounded-full bg-cta px-7 py-3 text-base font-medium text-black shadow-[0_0_50px_-12px_rgba(232,227,207,0.5)] ring-1 ring-champagne-deep/40 transition duration-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <span className="relative">
                  {loading ? "Creating…" : "Create"}
                </span>
              </button>
            </div>

            {!realGeneration && (
              <p className="text-center text-[12px] text-white/30">
                Demo styles a model, not your face.
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-red-300/80">{error}</p>
            )}
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

/** A calm group: just a quiet label and its content — no dividers or gutters. */
function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-3.5 text-[11px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>
      {children}
    </section>
  );
}

/** A labelled cluster of pills inside the control deck. */
function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

/** A single selectable pill — text by default, circular when `round`. */
function Pill({
  active,
  onClick,
  round,
  children,
}: {
  active: boolean;
  onClick: () => void;
  round?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 text-sm transition duration-300",
        round ? "w-9 rounded-full" : "rounded-full px-4",
        active
          ? "bg-cta font-medium text-black"
          : "text-white/55 ring-1 ring-white/[0.08] hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

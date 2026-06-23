"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload, { type UploadedPhoto } from "@/components/PhotoUpload";
import AestheticPicker from "@/components/AestheticPicker";
import LookCard from "@/components/LookCard";
import ProfileMenu from "@/components/studio/ProfileMenu";
import SavedLooks from "@/components/studio/SavedLooks";
import OccasionPacks from "@/components/studio/OccasionPacks";
import { OCCASIONS, PROMPT_IDEAS, type Occasion } from "@/lib/occasions";
import { issueLabel } from "@/lib/issue";
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
  const abortRef = useRef<AbortController | null>(null);
  const issue = issueLabel();

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
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const form = new FormData();
      form.set("prompt", opts.prompt);
      form.set("aesthetics", JSON.stringify(opts.aesthetics));
      form.set("count", String(opts.count));
      form.set("gender", gender);
      for (const p of photos) form.append("photos", p.file);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
        signal: ctrl.signal,
      });
      const data: GenerateResponse = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Generation failed.");
      setLooks((prev) => [...(data.looks ?? []), ...prev]);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        /* user stopped the shoot — no error */
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  const generate = () => {
    if (!canGenerate) return;
    runGenerate({ prompt, aesthetics, count });
  };

  const stop = () => abortRef.current?.abort();

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

  const surprise = () =>
    applyOccasion(OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)]);

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
    document.getElementById("saved-looks")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl edge-rules">
        {/* Masthead */}
        <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-semibold tracking-tight">
                Looksy
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-vermilion">
                The Issue {issue}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-30 sm:flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${realGeneration ? "bg-vermilion" : "bg-ink-30"}`}
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
          <div className="h-px w-full bg-ink/15" />
        </header>

        {/* The Layout Desk */}
        <div className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto flex max-w-xl items-end justify-between gap-4">
            <div>
              <p className="kicker mb-2">The Layout Desk</p>
              <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                Shoot your cover.
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              className="shrink-0 border border-ink/15 px-4 py-2 text-sm text-ink-60 transition hover:border-ink hover:text-ink"
            >
              {photos.length > 0 || selfieUrl ? "✓ Photo" : "Add photo"}
            </button>
          </div>

          {/* Composer */}
          <div className="mx-auto mt-12 max-w-xl space-y-10">
            <Group label="The Edit">
              <OccasionPacks onPick={applyOccasion} />
            </Group>

            <Group label="Vibe">
              <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />
            </Group>

            <Group label="Style note — optional">
              <div className="flex items-baseline gap-2 border-b border-ink/20 focus-within:border-vermilion">
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-30">
                  Note —
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="black tailored blazer, ivory silk, city evening…"
                  style={{ caretColor: "rgb(var(--c-vermilion))" }}
                  className="w-full resize-none border-0 bg-transparent px-0 py-2 font-serif text-base italic leading-relaxed text-ink placeholder:not-italic placeholder:text-ink-30 focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <button
                  type="button"
                  onClick={surprise}
                  className="font-medium text-vermilion transition hover:text-vermilion-ink"
                >
                  Surprise me
                </button>
                {PROMPT_IDEAS.slice(0, 3).map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => appendIdea(idea)}
                    className="text-ink-60 transition hover:text-ink"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </Group>

            {/* Control deck */}
            <div className="flex flex-col gap-6 border-t border-ink/15 pt-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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
                <Control label="Plates">
                  {COUNT_OPTIONS.map((n) => (
                    <Pill key={n} active={count === n} onClick={() => setCount(n)} round>
                      {n}
                    </Pill>
                  ))}
                </Control>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-4">
                  {loading && (
                    <button
                      type="button"
                      onClick={stop}
                      className="text-sm text-ink-60 underline-offset-4 transition hover:text-vermilion hover:underline"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={generate}
                    disabled={!canGenerate}
                    className="bg-vermilion px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {loading ? "Developing…" : "Shoot the cover →"}
                  </button>
                </div>
                {!canGenerate && !loading && (
                  <p className="text-[12px] text-ink-30">
                    Pick a vibe, or write a style note.
                  </p>
                )}
              </div>
            </div>

            {!realGeneration && (
              <p className="text-center font-serif text-[13px] italic text-ink-30">
                Demo styles a model, not your face yet.
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-vermilion-ink">{error}</p>
            )}
          </div>

          {/* The plates */}
          {(loading || looks.length > 0) && (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {loading &&
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="skeleton aspect-[3/4] w-full animate-shimmer border border-ink/10"
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

        {/* Contents (saved looks) */}
        {supabaseAuth && <SavedLooks reloadToken={savedReload} onRemix={remix} />}
      </div>

      {/* Photo modal */}
      {photoOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setPhotoOpen(false)}
        >
          <div
            className="w-full max-w-md animate-fade-up border border-ink/15 bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">Your photo</h2>
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="grid h-8 w-8 place-items-center border border-ink/15 text-ink-60 transition hover:border-ink hover:text-ink"
              >
                ✕
              </button>
            </div>
            <PhotoUpload
              photos={photos}
              onChange={handlePhotoChange}
              hint={
                realGeneration
                  ? "Add a clear selfie so your covers actually look like you."
                  : "In demo mode your photo isn’t used yet — add a billed Gemini key to put your real face on the cover."
              }
            />
          </div>
        </div>
      )}
    </main>
  );
}

/** A calm group: a quiet editorial kicker and its content. */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="kicker mb-3.5">{label}</p>
      {children}
    </section>
  );
}

/** A labelled cluster of toggles in the control deck. */
function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="kicker">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

/** A single selectable toggle — ink fill when active, hairline when not. */
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
      aria-pressed={active}
      className={[
        "h-9 font-sans text-sm transition",
        round ? "grid w-9 place-items-center" : "px-4",
        active
          ? "bg-ink text-paper"
          : "border border-ink/15 text-ink-60 hover:border-ink hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

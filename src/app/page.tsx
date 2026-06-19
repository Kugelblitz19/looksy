"use client";

import { useState } from "react";
import PhotoUpload, { type UploadedPhoto } from "@/components/PhotoUpload";
import AestheticPicker from "@/components/AestheticPicker";
import LookCard from "@/components/LookCard";
import type { GeneratedLook, GenerateResponse } from "@/lib/types";

const COUNT_OPTIONS = [1, 2, 4];

const STEPS = [
  { icon: "📸", text: "Add your photo" },
  { icon: "🎨", text: "Pick a style" },
  { icon: "🛍️", text: "Shop the look" },
];

export default function Home() {
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

      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed.");
      }

      setLooks((prev) => [...(data.looks ?? []), ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aurora min-h-screen">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Looksy
          </h1>
          <p className="mx-auto mt-3 max-w-md text-balance text-white/60">
            See yourself in any outfit — then tap to buy what you’re wearing.
          </p>

          {/* How it works — plain, 3 steps */}
          <div className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-2 text-sm text-white/70">
            {STEPS.map((s, i) => (
              <div key={s.text} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3 py-1.5">
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.text}</span>
                </span>
                {i < STEPS.length - 1 && <span className="text-white/30">→</span>}
              </div>
            ))}
          </div>
        </header>

        {/* Composer */}
        <section className="mx-auto max-w-2xl rounded-3xl border border-line bg-panel/70 p-5 backdrop-blur sm:p-7">
          <div className="space-y-6">
            <PhotoUpload photos={photos} onChange={setPhotos} />

            <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Add any details{" "}
                <span className="text-white/40">(optional)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="e.g. black jacket, blue jeans, white sneakers, on a city street"
                className="w-full resize-none rounded-xl border border-line bg-black/30 p-3.5 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                        : "border-line bg-white/5 text-white/70 hover:text-white",
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
                className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Creating your looks…" : "✨ Create my looks"}
              </button>
            </div>

            {!canGenerate && !loading && (
              <p className="text-center text-xs text-white/40">
                Pick a style above (or type details) to get started.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Feed */}
        <section className="mt-12">
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
                <LookCard key={look.id} look={look} />
              ))}
            </div>
          )}

          {!loading && looks.length === 0 && (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-line p-10 text-center text-white/40">
              Your looks will show up here — each one with buy links for
              everything you’re wearing.
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
    </main>
  );
}

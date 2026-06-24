"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAesthetic } from "@/lib/aesthetics";
import { plateLabel } from "@/lib/issue";
import type { GeneratedLook } from "@/lib/types";

/** A user's saved looks, on their own page — a grid of lit cover plates with
 *  Re-style / Share / Remove. Dark-luxe to match the Studio. */
export default function SavedLooksView() {
  const router = useRouter();
  const [looks, setLooks] = useState<GeneratedLook[] | null>(null);
  const [share, setShare] = useState<{ id: string; msg: string } | null>(null);

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/looks", { signal: ctrl.signal });
        const data = await res.json();
        const mapped: GeneratedLook[] = (data.looks ?? []).map(
          (r: { id: string; image_url: string; prompt?: string; aesthetics?: string[] }) => ({
            id: r.id,
            imageUrl: r.image_url,
            prompt: r.prompt ?? "",
            aesthetics: r.aesthetics ?? [],
          }),
        );
        if (active) setLooks(mapped);
      } catch {
        if (active) setLooks([]);
      }
    })();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  function restyle(look: GeneratedLook) {
    sessionStorage.setItem(
      "looksy:remix",
      JSON.stringify({ prompt: look.prompt, aesthetics: look.aesthetics }),
    );
    router.push("/studio");
  }

  async function remove(id: string) {
    setLooks((prev) => prev?.filter((l) => l.id !== id) ?? []);
    try {
      await fetch(`/api/looks/${id}`, { method: "DELETE" });
    } catch {
      /* removed optimistically */
    }
  }

  async function shareLook(look: GeneratedLook) {
    setShare({ id: look.id, msg: "Creating link…" });
    try {
      const res = await fetch(`/api/looks/${look.id}/share`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "Couldn't share");
      try {
        await navigator.clipboard.writeText(d.url);
      } catch {
        /* clipboard may be blocked */
      }
      window.open(d.url, "_blank", "noopener");
      setShare({ id: look.id, msg: "Link copied!" });
    } catch (e) {
      setShare({ id: look.id, msg: e instanceof Error ? e.message.slice(0, 40) : "Failed" });
    }
    setTimeout(() => setShare((s) => (s?.id === look.id ? null : s)), 2600);
  }

  const count = looks?.length ?? 0;

  return (
    <main data-theme="night" className="min-h-screen bg-[#0E0B08] text-ink">
      <div className="mx-auto max-w-5xl edge-rules">
        {/* Masthead */}
        <header className="sticky top-0 z-40 bg-[#0E0B08]/85 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
              Looksy
            </Link>
            <Link
              href="/studio"
              className="text-sm text-ink-60 transition hover:text-vermilion"
            >
              ← Studio
            </Link>
          </div>
          <div className="rule-iris opacity-50" />
        </header>

        <div className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-10">
            <p className="kicker mb-2">Your collection</p>
            <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Saved looks{" "}
              {count > 0 && (
                <span className="align-middle font-mono text-2xl text-vermilion">
                  {String(count).padStart(2, "0")}
                </span>
              )}
            </h1>
          </div>

          {looks === null ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="skeleton aspect-[3/4] w-full animate-shimmer border border-white/10"
                />
              ))}
            </div>
          ) : count === 0 ? (
            <div className="grid place-items-center border-t border-ink/15 py-24 text-center">
              <div>
                <p className="font-display text-2xl text-ink">Nothing saved yet</p>
                <p className="mt-2 font-serif italic text-ink-60">
                  Tap <span className="not-italic text-vermilion">♡ Save</span> on a
                  cover and it lands here.
                </p>
                <Link
                  href="/studio"
                  className="mt-8 inline-block bg-vermilion px-6 py-3 text-sm font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink"
                >
                  Shoot a cover →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {looks.map((look) => {
                const credits = look.aesthetics
                  .map(getAesthetic)
                  .filter(Boolean)
                  .map((a) => a!.label)
                  .join(" · ");
                const desc = look.prompt?.trim() || credits || "Untitled study";
                return (
                  <div
                    key={look.id}
                    className="group relative border border-white/10 bg-[#16120D] p-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-white/10"
                    />
                    <div className="relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={look.imageUrl}
                        alt={desc}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 bg-paper/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-60">
                        Plate {plateLabel(look.id)}
                      </span>
                    </div>

                    <p className="mt-2 truncate px-1 font-serif text-xs italic text-ink-60">
                      {desc}
                    </p>

                    <div className="flex items-center gap-3 px-1 pb-1 pt-2 text-[11px] text-ink-60">
                      {share?.id === look.id ? (
                        <span className="font-serif italic text-vermilion">{share.msg}</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => restyle(look)}
                            className="transition hover:text-vermilion"
                          >
                            Re-style
                          </button>
                          <button
                            type="button"
                            onClick={() => shareLook(look)}
                            className="transition hover:text-vermilion"
                          >
                            Share
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(look.id)}
                            className="ml-auto text-ink-30 transition hover:text-vermilion"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

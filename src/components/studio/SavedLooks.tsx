"use client";

import { useEffect, useState } from "react";
import { getAesthetic } from "@/lib/aesthetics";
import { plateLabel } from "@/lib/issue";
import type { GeneratedLook } from "@/lib/types";

const COLLAPSED = 8;

function ContentsRow({
  look,
  onRemove,
  onRemix,
  onShare,
  shareMsg,
}: {
  look: GeneratedLook;
  onRemove: (id: string) => void;
  onRemix: (look: GeneratedLook) => void;
  onShare: (look: GeneratedLook) => void;
  shareMsg: string | null;
}) {
  const credits = look.aesthetics
    .map(getAesthetic)
    .filter(Boolean)
    .map((a) => a!.label)
    .join(", ");
  const description = look.prompt?.trim() || credits || "Untitled study";

  return (
    <li className="group flex items-center gap-4 border-b border-ink/10 py-4">
      <span className="w-12 shrink-0 font-mono text-sm text-ink-30">
        {plateLabel(look.id)}
      </span>

      <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-paper-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={look.imageUrl}
          alt="Saved look"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <span className="min-w-0 truncate font-serif italic text-ink-60">
        {description}
      </span>

      <span className="leader hidden sm:block" aria-hidden="true" />

      <div className="ml-auto flex shrink-0 items-center gap-4 sm:ml-0 text-sm">
        {shareMsg ? (
          <span className="font-serif italic text-vermilion">{shareMsg}</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onRemix(look)}
              className="text-ink-60 transition hover:text-vermilion"
              title="Load this look back into Create"
            >
              Re-style
            </button>
            <button
              type="button"
              onClick={() => onShare(look)}
              className="text-ink-60 transition hover:text-vermilion"
              title="Get a public share link"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => onRemove(look.id)}
              className="text-ink-30 transition hover:text-vermilion"
              title="Remove"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function SavedLooks({
  reloadToken,
  onRemix,
}: {
  reloadToken: number;
  onRemix: (look: GeneratedLook) => void;
}) {
  const [looks, setLooks] = useState<GeneratedLook[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [shareState, setShareState] = useState<{ id: string; msg: string } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/looks");
        const data = await res.json();
        const mapped: GeneratedLook[] = (data.looks ?? []).map(
          (r: {
            id: string;
            image_url: string;
            prompt?: string;
            aesthetics?: string[];
          }) => ({
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
    };
  }, [reloadToken]);

  async function remove(id: string) {
    setLooks((prev) => prev?.filter((l) => l.id !== id) ?? []);
    try {
      await fetch(`/api/looks/${id}`, { method: "DELETE" });
    } catch {
      /* already removed optimistically */
    }
  }

  async function share(look: GeneratedLook) {
    setShareState({ id: look.id, msg: "Creating link…" });
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
      setShareState({ id: look.id, msg: "Link copied!" });
    } catch (e) {
      setShareState({
        id: look.id,
        msg: e instanceof Error ? e.message.slice(0, 44) : "Failed",
      });
    }
    setTimeout(
      () => setShareState((s) => (s?.id === look.id ? null : s)),
      2800,
    );
  }

  const count = looks?.length ?? 0;
  const shown = expanded ? looks ?? [] : (looks ?? []).slice(0, COLLAPSED);

  return (
    <section id="saved-looks" className="border-t border-ink/15 bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="kicker mb-2">Your Collection</p>
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Contents{" "}
              {count > 0 && (
                <span className="font-mono text-2xl text-vermilion align-middle">
                  {String(count).padStart(2, "0")}
                </span>
              )}
            </h2>
          </div>
          {count > COLLAPSED && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-ink-60 transition hover:text-vermilion"
            >
              {expanded ? "Show less" : `Show all (${count})`}
            </button>
          )}
        </div>

        {looks === null ? (
          <ul className="border-t border-ink/15">
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="flex items-center gap-4 border-b border-ink/10 py-4"
              >
                <span className="skeleton h-4 w-12 shrink-0 animate-shimmer" />
                <span className="skeleton h-16 w-12 shrink-0 animate-shimmer" />
                <span className="skeleton h-4 flex-1 animate-shimmer" />
              </li>
            ))}
          </ul>
        ) : count === 0 ? (
          <div className="grid place-items-center border-t border-ink/15 py-16 text-center">
            <div>
              <p className="font-display text-xl text-ink">
                Nothing saved yet
              </p>
              <p className="mt-2 font-serif italic text-ink-60">
                Tap <span className="text-vermilion not-italic">Save</span> on a
                look to enter it into your collection.
              </p>
            </div>
          </div>
        ) : (
          <ol className="border-t border-ink/15">
            {shown.map((look) => (
              <ContentsRow
                key={look.id}
                look={look}
                onRemove={remove}
                onRemix={onRemix}
                onShare={share}
                shareMsg={shareState?.id === look.id ? shareState.msg : null}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

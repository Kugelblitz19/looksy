"use client";

import { useEffect, useState } from "react";
import { getAesthetic } from "@/lib/aesthetics";
import type { GeneratedLook } from "@/lib/types";

const COLLAPSED = 8;

function CompactLook({
  look,
  expanded,
  onRemove,
  onRemix,
  onShare,
  shareMsg,
}: {
  look: GeneratedLook;
  expanded: boolean;
  onRemove: (id: string) => void;
  onRemix: (look: GeneratedLook) => void;
  onShare: (look: GeneratedLook) => void;
  shareMsg: string | null;
}) {
  const chips = look.aesthetics
    .map(getAesthetic)
    .filter(Boolean)
    .slice(0, 2)
    .map((a) => a!.emoji)
    .join(" ");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-panel ${
        expanded ? "" : "w-40 shrink-0"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.imageUrl}
        alt="Saved look"
        loading="lazy"
        className="aspect-[3/4] w-full object-cover"
      />

      <button
        type="button"
        onClick={() => onShare(look)}
        className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-xs text-white backdrop-blur transition hover:bg-white/30"
        title="Get a public share link"
      >
        🔗
      </button>
      <button
        type="button"
        onClick={() => onRemove(look.id)}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-xs text-white backdrop-blur transition hover:bg-red-500/80"
        title="Remove"
      >
        ✕
      </button>

      {shareMsg && (
        <div className="absolute inset-x-2 top-11 rounded-lg bg-black/80 px-2 py-1 text-center text-[11px] font-medium text-white backdrop-blur">
          {shareMsg}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8">
        <span className="text-sm">{chips}</span>
        <button
          type="button"
          onClick={() => onRemix(look)}
          className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur transition hover:bg-white/25"
          title="Load this look back into Create"
        >
          ↻ Re-style
        </button>
      </div>
    </div>
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
    <section id="saved-looks" className="border-t border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">
            🤍 Your saved looks{" "}
            {count > 0 && <span className="text-white/40">({count})</span>}
          </h2>
          {count > COLLAPSED && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-white/60 transition hover:text-white"
            >
              {expanded ? "Show less" : `Show all (${count})`}
            </button>
          )}
        </div>

        {looks === null ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton h-52 w-40 shrink-0 animate-shimmer rounded-2xl"
              />
            ))}
          </div>
        ) : count === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/45">
            <div>
              <div className="mb-2 text-3xl">🤍</div>
              No saved looks yet. Tap{" "}
              <span className="font-medium text-white/70">♡ Save</span> on a look
              above to keep it here.
            </div>
          </div>
        ) : (
          <div
            className={
              expanded
                ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
                : "flex gap-3 overflow-x-auto pb-2"
            }
          >
            {shown.map((look) => (
              <CompactLook
                key={look.id}
                look={look}
                expanded={expanded}
                onRemove={remove}
                onRemix={onRemix}
                onShare={share}
                shareMsg={shareState?.id === look.id ? shareState.msg : null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

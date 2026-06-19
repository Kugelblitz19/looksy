"use client";

import { useEffect, useState } from "react";
import { getAesthetic } from "@/lib/aesthetics";
import type { GeneratedLook } from "@/lib/types";
import type { ShoppableGarment, ShopResponse } from "@/lib/garments";

/** Friendly icon for each item so non-technical users grok it at a glance. */
function itemIcon(g: { name: string; searchQuery: string; category: string }): string {
  const n = `${g.name} ${g.searchQuery}`.toLowerCase();
  if (/watch/.test(n)) return "⌚";
  if (/sunglass|glass|shades/.test(n)) return "🕶️";
  if (/bag|backpack|purse/.test(n)) return "👜";
  if (/cap|hat|beanie/.test(n)) return "🧢";
  if (/jutti|heel|sandal/.test(n)) return "👡";
  switch (g.category) {
    case "footwear":
      return "👟";
    case "bottom":
      return "👖";
    case "outerwear":
      return "🧥";
    case "dress":
      return "👗";
    case "accessory":
      return "💍";
    case "top":
      return "👕";
    default:
      return "🛍️";
  }
}

export default function LookCard({
  look,
  saveable = false,
  onRemove,
}: {
  look: GeneratedLook;
  saveable?: boolean;
  onRemove?: (id: string) => void;
}) {
  const [garments, setGarments] = useState<ShoppableGarment[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [removing, setRemoving] = useState(false);

  const labels = look.aesthetics
    .map(getAesthetic)
    .filter(Boolean)
    .map((a) => `${a!.emoji} ${a!.label}`);

  // Auto-detect what the person is wearing and surface buy links inline.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl: look.imageUrl,
            aesthetics: look.aesthetics,
            prompt: look.prompt,
          }),
        });
        const data: ShopResponse = await res.json();
        if (active && res.ok && data.garments) setGarments(data.garments);
      } catch {
        /* leave list empty on failure */
      } finally {
        if (active) setLoadingShop(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [look]);

  const download = () => {
    const a = document.createElement("a");
    a.href = look.imageUrl;
    a.download = `looksy-${look.id}.png`;
    a.click();
  };

  async function saveLook() {
    if (saveState !== "idle") return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: look.imageUrl,
          prompt: look.prompt,
          aesthetics: look.aesthetics,
        }),
      });
      setSaveState(res.ok ? "saved" : "idle");
    } catch {
      setSaveState("idle");
    }
  }

  async function removeLook() {
    if (removing) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/looks/${look.id}`, { method: "DELETE" });
      if (res.ok) onRemove?.(look.id);
      else setRemoving(false);
    } catch {
      setRemoving(false);
    }
  }

  return (
    <div className="animate-fade-up overflow-hidden rounded-3xl border border-line bg-panel">
      {/* The look photo */}
      <div className="group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={look.imageUrl}
          alt="Your look"
          className="aspect-[3/4] w-full object-cover"
        />

        {look.demo && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            Demo
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <span
                key={l}
                className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white backdrop-blur"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          {saveable && (
            <button
              type="button"
              onClick={saveLook}
              disabled={saveState !== "idle"}
              className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80"
            >
              {saveState === "saved"
                ? "✓ Saved"
                : saveState === "saving"
                  ? "Saving…"
                  : "♡ Save"}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={removeLook}
              disabled={removing}
              className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-red-500/80"
            >
              {removing ? "Removing…" : "✕ Remove"}
            </button>
          )}
          <button
            type="button"
            onClick={download}
            className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100"
          >
            ↓ Download
          </button>
        </div>
      </div>

      {/* Shop the look — inline, right under the photo */}
      <div className="p-3.5">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
          🛍️ Shop this look
        </h3>

        {loadingShop ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-12 animate-shimmer rounded-xl" />
            ))}
          </div>
        ) : garments.length === 0 ? (
          <p className="text-xs text-white/40">Couldn’t find items for this look.</p>
        ) : (
          <ul className="space-y-2.5">
            {garments.map((g, i) => (
              <li key={`${g.searchQuery}-${i}`}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-lg leading-none">{itemIcon(g)}</span>
                  <span className="text-sm font-medium text-white/90">{g.name}</span>
                </div>

                {g.products && g.products.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {g.products.map((p, pi) => (
                      <a
                        key={`${p.buyUrl}-${pi}`}
                        href={p.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-white/5 transition hover:border-white/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="aspect-[4/5] w-full object-cover"
                        />
                        <div className="p-1.5">
                          <div className="text-[9px] uppercase tracking-wide text-white/40">
                            {p.merchant}
                          </div>
                          {p.priceDisplay && (
                            <div className="text-xs font-semibold">
                              {p.priceDisplay}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {g.shopLinks.map((link) => (
                      <a
                        key={link.merchantId}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
                      >
                        {link.merchant}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

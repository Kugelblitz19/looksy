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
  onSaved,
  onVariation,
}: {
  look: GeneratedLook;
  saveable?: boolean;
  onRemove?: (id: string) => void;
  onSaved?: () => void;
  onVariation?: (look: GeneratedLook) => void;
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
      if (res.ok) {
        setSaveState("saved");
        onSaved?.();
      } else {
        setSaveState("idle");
      }
    } catch {
      setSaveState("idle");
    }
  }

  async function share() {
    const caption = `My ${labels[0]?.replace(/^\S+\s/, "") || "new"} look, styled by Looksy ✨`;
    try {
      const resp = await fetch(look.imageUrl);
      const blob = await resp.blob();
      const file = new File([blob], `looksy-${look.id}.png`, {
        type: blob.type || "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: caption });
        return;
      }
    } catch {
      /* fall through to WhatsApp web */
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(caption)}`,
      "_blank",
      "noopener",
    );
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

  // "Shop the whole look": cheapest real product per garment, summed.
  const cheapest = garments
    .filter((g) => g.products.length > 0)
    .map((g) =>
      g.products.reduce((a, b) =>
        (b.price ?? Infinity) < (a.price ?? Infinity) ? b : a,
      ),
    )
    .filter((p) => typeof p.price === "number");
  const bundleTotal = cheapest.reduce((s, p) => s + (p.price ?? 0), 0);

  function openAll() {
    cheapest.forEach((p) => window.open(p.buyUrl, "_blank", "noopener"));
  }

  return (
    <div className="group animate-fade-up rounded-2xl bg-[#101015] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.06] transition duration-500 hover:-translate-y-1">
      {/* The look photo — matted like a framed print */}
      <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={look.imageUrl}
          alt="Your look"
          className="aspect-[3/4] w-full object-cover"
        />

        {look.demo && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-champagne backdrop-blur">
            Demo
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-12">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {labels.map((l) => (
              <span
                key={l}
                className="text-[10px] uppercase tracking-[0.15em] text-champagne"
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
              className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:text-champagne"
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
              className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:text-red-300"
            >
              {removing ? "Removing…" : "✕ Remove"}
            </button>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-2 px-1.5 pt-3.5">
        {onVariation && (
          <button
            type="button"
            onClick={() => onVariation(look)}
            className="rounded-full px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
          >
            ↻ Variation
          </button>
        )}
        <button
          type="button"
          onClick={share}
          className="rounded-full px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
        >
          ↗ Share
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-full px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
        >
          ↓ Save image
        </button>
      </div>

      {/* Shop the look — inline, right under the photo */}
      <div className="px-1.5 pb-1 pt-4">
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/40">
          Shop this look
        </h3>

        {!loadingShop && cheapest.length > 1 && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-champagne-deep/[0.06] px-3 py-2 ring-1 ring-champagne-deep/20">
            <div className="min-w-0">
              <div className="text-sm font-medium text-champagne">
                Shop the whole look
              </div>
              <div className="text-xs text-white/55">
                {cheapest.length} pieces · from ₹
                {bundleTotal.toLocaleString("en-IN")}
              </div>
            </div>
            <button
              type="button"
              onClick={openAll}
              className="shrink-0 rounded-full bg-cta px-3 py-1.5 text-xs font-medium text-black transition hover:brightness-105"
            >
              Open all →
            </button>
          </div>
        )}

        {!loadingShop && garments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
            <span>COD</span>
            <span className="text-white/20">·</span>
            <span>No-cost EMI</span>
            <span className="text-white/20">·</span>
            <span>Easy returns</span>
          </div>
        )}

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
                  <span className="text-sm font-medium text-white/85">{g.name}</span>
                </div>

                {g.products && g.products.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {g.products.map((p, pi) => (
                      <a
                        key={`${p.buyUrl}-${pi}`}
                        href={p.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="relative w-24 shrink-0 overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/[0.06] transition duration-300 hover:ring-champagne-deep/40"
                      >
                        {p.mrp && p.price && p.mrp > p.price && (
                          <span className="absolute left-1 top-1 z-10 rounded bg-champagne-deep px-1 py-0.5 text-[9px] font-bold text-black">
                            -{Math.round((1 - p.price / p.mrp) * 100)}%
                          </span>
                        )}
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
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs font-semibold">
                                {p.priceDisplay}
                              </span>
                              {p.mrp && p.price && p.mrp > p.price && (
                                <span className="text-[9px] text-white/40 line-through">
                                  ₹{p.mrp.toLocaleString("en-IN")}
                                </span>
                              )}
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
                        className="rounded-full px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
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

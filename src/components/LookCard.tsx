"use client";

import { useEffect, useState } from "react";
import { getAesthetic } from "@/lib/aesthetics";
import { issueLabel, plateLabel } from "@/lib/issue";
import type { GeneratedLook } from "@/lib/types";
import type { ShoppableGarment, ShopResponse } from "@/lib/garments";

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
  const [lookScore, setLookScore] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [removing, setRemoving] = useState(false);

  const labels = look.aesthetics
    .map(getAesthetic)
    .filter(Boolean)
    .map((a) => a!.label);
  const plate = plateLabel(look.id);
  const issue = issueLabel();
  const caption = labels.length
    ? `${labels.join(" · ")} — photographed by Looksy.`
    : "Photographed by Looksy.";

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
            gender: look.gender,
          }),
        });
        const data: ShopResponse = await res.json();
        if (active && res.ok && data.garments) {
          setGarments(data.garments);
          if (typeof data.lookMatch === "number") setLookScore(data.lookMatch);
        }
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
    a.download = `looksy-cover-${look.id}.png`;
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
    const caption = `My ${labels[0] || "new"} cover, shot by Looksy — The Issue ${issue}`;
    try {
      const resp = await fetch(look.imageUrl);
      const blob = await resp.blob();
      const file = new File([blob], `looksy-cover-${look.id}.png`, {
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

  // "Cop the whole cover": cheapest real product per garment, summed.
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
    <div className="group animate-fade-up border border-ink/15 bg-paper-2 p-2.5">
      {/* The plate — develops like a cover going to print */}
      <div className="rule-sweep relative overflow-hidden border border-ink/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={look.imageUrl}
          alt="Your cover"
          className="cover-develop aspect-[3/4] w-full object-cover"
        />

        {/* Baked masthead strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <div className="flex items-center gap-1.5">
            <span className="bg-paper/85 px-2 py-0.5 font-display text-xs tracking-tight text-ink">
              LOOKSY
            </span>
            <span className="bg-paper/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-vermilion">
              {issue}
            </span>
          </div>
          <span className="bg-paper/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-60">
            Plate {plate}
          </span>
        </div>

        {look.demo && (
          <span className="absolute bottom-3 left-3 bg-paper/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-60">
            Demo
          </span>
        )}
      </div>

      {/* Editor's caption */}
      <p className="px-1 pt-3 font-serif text-sm italic text-ink-60">{caption}</p>

      {/* Post this cover — the hero action */}
      <button
        type="button"
        onClick={share}
        className="mt-3 w-full bg-vermilion py-2.5 text-sm font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink"
      >
        Post this cover →
      </button>

      {/* Secondary actions — plain ink links */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 pt-3 text-xs text-ink-60">
        {onVariation && (
          <button
            type="button"
            onClick={() => onVariation(look)}
            className="transition hover:text-vermilion"
          >
            ↻ Variation
          </button>
        )}
        {saveable && (
          <button
            type="button"
            onClick={saveLook}
            disabled={saveState !== "idle"}
            className={
              saveState === "saved"
                ? "font-medium text-vermilion"
                : "transition hover:text-vermilion"
            }
          >
            {saveState === "saved"
              ? "✓ Saved"
              : saveState === "saving"
                ? "Saving…"
                : "♡ Save"}
          </button>
        )}
        <button
          type="button"
          onClick={download}
          className="transition hover:text-vermilion"
        >
          ↓ Image
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={removeLook}
            disabled={removing}
            className="transition hover:text-vermilion-ink"
          >
            {removing ? "Removing…" : "✕ Remove"}
          </button>
        )}
      </div>

      {/* Credits — get the look */}
      <div className="mt-4 border-t border-ink/12 px-1 pt-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="kicker">Credits — get the look</p>
          {lookScore != null && (
            <span
              title="How closely the surfaced products match the detected colour, fabric & cut."
              className="font-mono text-[11px] font-semibold tracking-tight text-ink"
            >
              {lookScore}% match
            </span>
          )}
        </div>

        {!loadingShop && cheapest.length > 1 && (
          <button
            type="button"
            onClick={openAll}
            className="mb-3 flex w-full items-center justify-between gap-2 bg-vermilion px-3 py-2 text-left text-paper transition hover:bg-vermilion-ink"
          >
            <span className="text-sm font-medium uppercase tracking-wide">
              Cop the whole cover
            </span>
            <span className="font-mono text-xs">
              {cheapest.length} pcs · ₹{bundleTotal.toLocaleString("en-IN")} →
            </span>
          </button>
        )}

        {!loadingShop && garments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-30">
            <span>COD</span>
            <span>·</span>
            <span>No-cost EMI</span>
            <span>·</span>
            <span>Easy returns</span>
          </div>
        )}

        {loadingShop ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-12 animate-shimmer border border-ink/10" />
            ))}
          </div>
        ) : garments.length === 0 ? (
          <p className="font-serif text-sm italic text-ink-30">
            No credits found for this cover.
          </p>
        ) : (
          <ul className="space-y-3">
            {garments.map((g, i) => (
              <li key={`${g.searchQuery}-${i}`}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 border-b border-ink/10 pb-1">
                  <span className="font-serif text-sm text-ink">
                    {g.name}
                    <span className="ml-2 font-sans text-[10px] uppercase tracking-[0.12em] text-ink-30">
                      {g.category}
                    </span>
                  </span>
                  {typeof g.match === "number" && (
                    <span className="shrink-0 font-mono text-[11px] tracking-tight text-ink-60">
                      {g.match}% match
                    </span>
                  )}
                </div>

                {g.products && g.products.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {g.products.map((p, pi) => (
                      <a
                        key={`${p.buyUrl}-${pi}`}
                        href={p.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="relative w-24 shrink-0 overflow-hidden border border-ink/12 bg-paper transition hover:border-ink"
                      >
                        {p.mrp && p.price && p.mrp > p.price && (
                          <span className="absolute left-1 top-1 z-10 bg-vermilion px-1 py-0.5 font-mono text-[9px] font-bold text-paper">
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
                          <div className="font-mono text-[9px] uppercase tracking-wide text-ink-30">
                            {p.merchant}
                          </div>
                          {p.priceDisplay && (
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono text-xs font-semibold text-ink">
                                {p.priceDisplay}
                              </span>
                              {p.mrp && p.price && p.mrp > p.price && (
                                <span className="font-mono text-[9px] text-ink-30 line-through">
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
                        className="border border-ink/15 px-3 py-1.5 text-xs text-ink-60 transition hover:border-ink hover:text-ink"
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

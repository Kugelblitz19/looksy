"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { GeneratedLook } from "@/lib/types";
import type { ShoppableGarment, ShopResponse } from "@/lib/garments";

export default function ShopModal({
  look,
  onClose,
}: {
  look: GeneratedLook;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garments, setGarments] = useState<ShoppableGarment[]>([]);
  const [demo, setDemo] = useState(false);
  const [monetized, setMonetized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
        if (!res.ok || data.error) throw new Error(data.error || "Failed");
        if (active) {
          setGarments(data.garments ?? []);
          setDemo(Boolean(data.demo));
          setMonetized(Boolean(data.monetized));
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [look]);

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-panel sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Look preview */}
        <div className="relative shrink-0 sm:w-2/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.imageUrl}
            alt="Look"
            className="h-48 w-full object-cover sm:h-full"
          />
        </div>

        {/* Shop list */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div>
              <h3 className="text-lg font-semibold">Shop this look</h3>
              <p className="text-xs text-white/50">
                {monetized
                  ? "Affiliate links active"
                  : "Similar items on Indian fashion sites"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton h-20 animate-shimmer rounded-xl"
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {!loading && !error && (
              <ul className="space-y-3">
                {garments.map((g, i) => (
                  <li
                    key={`${g.searchQuery}-${i}`}
                    className="rounded-xl border border-line bg-black/20 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium">{g.name}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
                        {g.category}
                        {g.color ? ` · ${g.color}` : ""}
                      </span>
                    </div>

                    {g.products && g.products.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {g.products.map((p, pi) => (
                          <a
                            key={`${p.buyUrl}-${pi}`}
                            href={p.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className="group/card overflow-hidden rounded-lg border border-line bg-white/5 transition hover:border-white/40"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="aspect-[4/5] w-full object-cover"
                            />
                            <div className="p-2">
                              <div className="text-[10px] uppercase tracking-wide text-white/40">
                                {p.merchant}
                              </div>
                              <div className="line-clamp-2 text-xs text-white/80">
                                {p.title}
                              </div>
                              {p.priceDisplay && (
                                <div className="mt-1 text-sm font-semibold">
                                  {p.priceDisplay}
                                </div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {g.shopLinks.map((link) => (
                          <a
                            key={link.merchantId}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className="rounded-lg border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
                          >
                            {link.merchant} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!loading && garments.length > 0 && (
            <div className="border-t border-line p-3 text-center">
              <p className="text-[11px] text-white/45">
                {monetized
                  ? "As an affiliate, Looksy may earn a commission on qualifying purchases."
                  : "Links open similar real products. Set an affiliate template to monetize them."}
              </p>
              {demo && (
                <p className="mt-1 text-[11px] text-amber-300/80">
                  Demo items from your chosen vibe — with a Gemini key, items are
                  read from the actual generated photo.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

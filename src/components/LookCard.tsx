"use client";

import { getAesthetic } from "@/lib/aesthetics";
import type { GeneratedLook } from "@/lib/types";

export default function LookCard({ look }: { look: GeneratedLook }) {
  const labels = look.aesthetics
    .map(getAesthetic)
    .filter(Boolean)
    .map((a) => `${a!.emoji} ${a!.label}`);

  const download = () => {
    const a = document.createElement("a");
    a.href = look.imageUrl;
    a.download = `styleglance-${look.id}.png`;
    a.click();
  };

  return (
    <div className="group relative animate-fade-up overflow-hidden rounded-2xl border border-line bg-panel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.imageUrl}
        alt="Generated look"
        className="aspect-[3/4] w-full object-cover"
      />

      {look.demo && (
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          Demo
        </span>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10">
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

      <button
        type="button"
        onClick={download}
        className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
      >
        ↓ Save
      </button>
    </div>
  );
}

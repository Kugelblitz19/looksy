"use client";

import { useEffect, useState } from "react";
import LookCard from "@/components/LookCard";
import type { GeneratedLook } from "@/lib/types";

export default function WishlistPanel() {
  const [looks, setLooks] = useState<GeneratedLook[] | null>(null);

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
  }, []);

  if (looks === null) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="skeleton h-[28rem] animate-shimmer rounded-3xl"
          />
        ))}
      </div>
    );
  }

  if (looks.length === 0) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/45 sm:min-h-[24rem]">
        <div>
          <div className="mb-3 text-4xl">🤍</div>
          No saved looks yet. Tap{" "}
          <span className="font-medium text-white/70">♡ Save</span> on any look
          to keep it here.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {looks.map((look) => (
        <LookCard
          key={look.id}
          look={look}
          onRemove={(id) =>
            setLooks((prev) => prev?.filter((l) => l.id !== id) ?? [])
          }
        />
      ))}
    </div>
  );
}

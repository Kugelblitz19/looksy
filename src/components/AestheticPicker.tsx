"use client";

import { AESTHETICS } from "@/lib/aesthetics";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function AestheticPicker({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {AESTHETICS.map((a) => {
        const active = selected.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onToggle(a.id)}
            title={a.blurb}
            className={[
              "rounded-full px-3 py-1.5 text-sm transition duration-300",
              active
                ? "bg-champagne-deep/[0.08] text-champagne ring-1 ring-champagne-deep/30"
                : "text-white/55 hover:bg-white/[0.04] hover:text-white",
            ].join(" ")}
          >
            <span className="mr-1.5">{a.emoji}</span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

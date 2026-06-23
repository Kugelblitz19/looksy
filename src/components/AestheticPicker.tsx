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
            aria-pressed={active}
            title={a.blurb}
            className={[
              "rounded-sm px-3 py-1.5 text-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-vermilion",
              active
                ? "bg-ink text-paper"
                : "text-ink-60 border-b border-transparent hover:border-ink hover:text-ink",
            ].join(" ")}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

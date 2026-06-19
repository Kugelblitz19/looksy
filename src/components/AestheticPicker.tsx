"use client";

import { AESTHETICS } from "@/lib/aesthetics";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function AestheticPicker({ selected, onToggle }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        Pick a style
      </label>
      <div className="flex flex-wrap gap-2">
        {AESTHETICS.map((a) => {
          const active = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onToggle(a.id)}
              title={a.blurb}
              className={[
                "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "border-white bg-white text-black"
                  : "border-line bg-white/5 text-white/70 hover:border-white/40 hover:text-white",
              ].join(" ")}
            >
              <span className="mr-1.5">{a.emoji}</span>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

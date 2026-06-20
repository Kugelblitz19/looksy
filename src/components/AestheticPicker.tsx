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
                "rounded-full border px-2.5 py-1 text-[13px] font-medium transition",
                active
                  ? "border-transparent bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/20"
                  : "border-white/10 bg-white/5 text-white/65 hover:border-white/30 hover:text-white",
              ].join(" ")}
            >
              <span className="mr-1">{a.emoji}</span>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

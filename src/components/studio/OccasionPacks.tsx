import { OCCASIONS, type Occasion } from "@/lib/occasions";

/** Horizontal scroller of occasion shortcuts that pre-fill the create form. */
export default function OccasionPacks({
  onPick,
}: {
  onPick: (o: Occasion) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-white/55">Dress for an occasion</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <span className="text-base leading-none">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

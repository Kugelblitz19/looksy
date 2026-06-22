import { OCCASIONS, type Occasion } from "@/lib/occasions";

/** Horizontal scroller of occasion shortcuts that pre-fill the create form. */
export default function OccasionPacks({
  onPick,
}: {
  onPick: (o: Occasion) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]">
      {OCCASIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o)}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-white/60 ring-1 ring-white/[0.08] transition duration-300 hover:text-champagne hover:ring-champagne-deep/40"
        >
          <span className="text-base leading-none">{o.emoji}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

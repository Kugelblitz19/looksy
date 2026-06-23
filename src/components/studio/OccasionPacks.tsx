import { OCCASIONS, type Occasion } from "@/lib/occasions";

/** Editorial "EDITS" run — scrollable set-names that pre-fill the create form. */
export default function OccasionPacks({
  onPick,
}: {
  onPick: (o: Occasion) => void;
}) {
  return (
    <div className="-mx-1 flex items-stretch overflow-x-auto px-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]">
      {OCCASIONS.map((o, i) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o)}
          className={`group shrink-0 px-4 py-1 text-sm text-ink-60 transition-colors duration-300 hover:text-ink ${
            i === 0 ? "" : "border-l border-ink/15"
          }`}
        >
          <span className="border-b border-transparent pb-0.5 group-hover:border-vermilion">
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}

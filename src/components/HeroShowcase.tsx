const CARDS = [
  {
    label: "Streetwear",
    emoji: "🧢",
    price: "₹2,449",
    from: "#fb7185",
    to: "#6d28d9",
    cls: "-rotate-6 z-10",
    delay: "0s",
  },
  {
    label: "Old Money",
    emoji: "🥂",
    price: "₹3,199",
    from: "#fbbf24",
    to: "#92400e",
    cls: "z-20 -mx-4 -translate-y-3 scale-105",
    delay: "1.2s",
  },
  {
    label: "Techwear",
    emoji: "🩶",
    price: "₹1,899",
    from: "#22d3ee",
    to: "#1e3a8a",
    cls: "rotate-6 z-10",
    delay: "2.4s",
  },
];

/** A floating stack of shoppable "look" cards — the hero's visual centerpiece. */
export default function HeroShowcase() {
  return (
    <div className="flex items-center justify-center">
      {CARDS.map((c) => (
        <div
          key={c.label}
          className={`relative w-28 shrink-0 animate-float overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:w-36 ${c.cls}`}
          style={{ animationDelay: c.delay }}
        >
          <div
            className="relative aspect-[3/4]"
            style={{ backgroundImage: `linear-gradient(150deg, ${c.from}, ${c.to})` }}
          >
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-xl sm:h-28 sm:w-28" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-black/35 px-2.5 py-2 backdrop-blur-md">
            <div className="truncate text-xs font-medium text-white">
              {c.emoji} {c.label}
            </div>
            <div className="text-[11px] text-white/70">{c.price} · Shop ↗</div>
          </div>
        </div>
      ))}
    </div>
  );
}

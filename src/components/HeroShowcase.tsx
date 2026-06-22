const CARDS = [
  {
    img: "streetwear",
    label: "Streetwear",
    emoji: "🧢",
    price: "₹2,449",
    cls: "-rotate-6 z-10",
    delay: "0s",
  },
  {
    img: "oldmoney",
    label: "Old Money",
    emoji: "🥂",
    price: "₹6,990",
    cls: "z-20 -mx-4 -translate-y-3 scale-105",
    delay: "1.2s",
  },
  {
    img: "techwear",
    label: "Techwear",
    emoji: "🩶",
    price: "₹2,899",
    cls: "rotate-6 z-10",
    delay: "2.4s",
  },
];

/** A floating stack of real, shoppable "look" cards — the hero's centerpiece. */
export default function HeroShowcase() {
  return (
    <div className="flex items-center justify-center">
      {CARDS.map((c) => (
        <div
          key={c.label}
          className={`relative w-28 shrink-0 animate-float overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:w-36 ${c.cls}`}
          style={{ animationDelay: c.delay }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/examples/${c.img}.jpg`}
            alt={`${c.label} look`}
            className="aspect-[3/4] w-full object-cover"
          />
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

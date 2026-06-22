import { AESTHETICS } from "@/lib/aesthetics";

/** A seamless, auto-scrolling strip of the available styles — pure vibe. */
export default function StyleMarquee() {
  const items = [...AESTHETICS, ...AESTHETICS];
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-3">
        {items.map((a, i) => (
          <div
            key={`${a.id}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 backdrop-blur"
          >
            <span className="text-lg leading-none">{a.emoji}</span>
            {a.label}
          </div>
        ))}
      </div>
    </div>
  );
}

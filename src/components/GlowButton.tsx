import Link from "next/link";
import type { ReactNode } from "react";

/** Primary CTA: white pill with a glow and a shine-sweep on hover. */
export default function GlowButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_55px_-10px_rgba(255,255,255,0.6)] transition hover:scale-[1.02] active:scale-[0.99]"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-fuchsia-300/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </Link>
  );
}

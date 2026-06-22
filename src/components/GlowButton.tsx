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
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-cta px-8 py-4 text-base font-medium text-black shadow-[0_0_55px_-12px_rgba(232,227,207,0.55)] ring-1 ring-champagne-deep/40 transition duration-300 hover:scale-[1.02] active:scale-[0.99]"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </Link>
  );
}

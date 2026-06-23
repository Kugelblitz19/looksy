import Link from "next/link";
import type { ReactNode } from "react";

/** Primary CTA: a sharp-cornered vermilion rectangle that darkens on hover and nudges down on press. */
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
      className="inline-flex items-center justify-center bg-vermilion px-7 py-4 font-sans text-sm font-medium uppercase tracking-wide text-paper shadow-[0_10px_40px_-10px_rgba(229,52,27,0.5)] transition hover:bg-vermilion-ink active:translate-y-px"
    >
      {children}
    </Link>
  );
}

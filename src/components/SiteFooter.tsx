import Link from "next/link";

/**
 * Shared colophon footer with the legal/brand nav + affiliate disclosure.
 * Renders with no outer max-width — drop it inside a width-constrained column.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/15 px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <span className="font-display text-base text-ink">Looksy</span>
          <nav className="flex items-center gap-5 text-sm text-ink-60">
            <Link href="/about" className="transition hover:text-vermilion">
              About
            </Link>
            <Link href="/privacy" className="transition hover:text-vermilion">
              Privacy
            </Link>
            <Link href="/contact" className="transition hover:text-vermilion">
              Contact
            </Link>
          </nav>
        </div>
        <p className="font-serif text-sm italic text-ink-60">
          An AI fashion weekly. Shot in India. Stocked at Myntra · Flipkart ·
          Ajio · Amazon.
        </p>
        <p className="text-[11px] leading-relaxed text-ink-30">
          Some links are affiliated — Looksy may earn a commission when you buy,
          at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}

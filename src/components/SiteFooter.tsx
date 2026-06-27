import Link from "next/link";
import { issueLabel } from "@/lib/issue";

/**
 * Shared colophon footer. Opens with the one animated iridescent hairline —
 * the page closes on the exact palette the liquid hero opened with. Adapts to
 * the surrounding theme (bone-on-black under the landing's night column, ink on
 * paper elsewhere). No outer max-width — drop it inside a constrained column.
 */
export default function SiteFooter({ issue }: { issue?: string }) {
  const iss = issue ?? issueLabel();
  return (
    <footer className="px-5 pb-10 sm:px-8">
      <div className="rule-iris rule-iris--live mb-8" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 font-display text-lg text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" aria-hidden />
            Looksy
          </span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-60">
            <Link href="/about" className="transition hover:text-vermilion">
              About
            </Link>
            <Link href="/privacy" className="transition hover:text-vermilion">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-vermilion">
              Terms
            </Link>
            <Link href="/refund" className="transition hover:text-vermilion">
              Refund
            </Link>
            <Link href="/contact" className="transition hover:text-vermilion">
              Contact
            </Link>
          </nav>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-30">
          AI Fashion Weekly · {iss} · Shot in India
        </p>
        <p className="font-serif text-sm italic text-ink-60">
          Stocked at Myntra · Flipkart · Ajio · Amazon.
        </p>
        <p className="text-[11px] leading-relaxed text-ink-30">
          Some links are affiliated — Looksy may earn a commission when you buy,
          at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}

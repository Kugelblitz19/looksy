"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#contents", label: "How it works" },
  { href: "/#gallery", label: "Covers" },
  { href: "/about", label: "About" },
];

/**
 * The landing masthead nav — editorial but alive: a "live issue" pulse, links
 * with a sliding vermilion underline, a nudging Create CTA, and a full-screen
 * Fraunces menu on mobile. Stays in the paper/ink/vermilion system.
 */
export default function LandingNav({
  isAuthed,
  issue,
  primaryHref,
}: {
  isAuthed: boolean;
  issue: string;
  primaryHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cta = isAuthed ? "Open Studio" : "Create";

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-paper/80 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(20,17,15,0.14)]" : ""
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
          {/* Wordmark + live issue ticker */}
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
              Looksy
            </Link>
            <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion sm:flex">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vermilion opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-vermilion" />
              </span>
              The Issue <span className="issue-flip">{issue}</span> · Live
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-sm text-ink-60 transition-colors duration-300 hover:text-ink"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-vermilion transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
            {!isAuthed && (
              <Link
                href="/login"
                className="text-sm text-ink-60 transition-colors duration-300 hover:text-ink"
              >
                Log in
              </Link>
            )}
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-1.5 bg-vermilion px-4 py-2 text-xs font-medium uppercase tracking-wide text-paper transition-colors duration-300 hover:bg-vermilion-ink"
            >
              {cta}
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className="h-px w-5 bg-ink" />
            <span className="h-px w-5 bg-ink" />
          </button>
        </div>
        <div className="h-px w-full bg-ink/15" />
      </header>

      {/* Mobile full-screen menu — rendered outside the header so `fixed`
          covers the viewport (the header's backdrop-blur is a containing block). */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-paper px-5 py-3.5 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-semibold tracking-tight">Looksy</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center border border-ink/15 text-ink-60 transition hover:border-ink hover:text-ink"
            >
              ✕
            </button>
          </div>

          <nav className="mt-12 flex flex-col gap-7">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="animate-fade-up font-display text-4xl tracking-tight text-ink"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4 pb-2">
            {!isAuthed && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm text-ink-60 transition hover:text-vermilion"
              >
                Already a subscriber? Log in
              </Link>
            )}
            <Link
              href={primaryHref}
              onClick={() => setOpen(false)}
              className="bg-vermilion py-3.5 text-center text-sm font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink"
            >
              {cta} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

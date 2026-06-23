"use client";

import { useEffect, useState } from "react";
import Typeset from "@/components/Typeset";

/**
 * The title sequence — Looksy "goes to press" the moment you land: the masthead
 * sets, a vermilion press-seal stamps down, then the whole cover lifts away to
 * reveal the site. Fast, skippable (click / Esc / Skip), once per session, and
 * skipped entirely under reduced-motion.
 */
export default function IntroCover({ issue }: { issue: string }) {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Decide once whether the title sequence plays.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("looksy:intro") === "seen") return;
    sessionStorage.setItem("looksy:intro", "seen");
    setShow(true);
  }, []);

  function dismiss() {
    setExiting(true);
    window.setTimeout(() => setShow(false), 450);
  }

  // While showing: lock scroll, schedule the lift-away, listen for Esc. Tying
  // this to `show` (not the mount) keeps the timers alive through React's
  // StrictMode double-invoke in dev — otherwise the intro would never dismiss.
  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    const exitAt = window.setTimeout(() => setExiting(true), 2500);
    const doneAt = window.setTimeout(() => setShow(false), 3000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(exitAt);
      clearTimeout(doneAt);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      role="presentation"
      onClick={dismiss}
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-paper ${
        exiting ? "intro-out" : ""
      }`}
    >
      {/* Crop marks, to match the printed-proof frame */}
      <span className="pointer-events-none absolute left-4 top-4 h-4 w-px bg-ink/30" />
      <span className="pointer-events-none absolute left-4 top-4 h-px w-4 bg-ink/30" />
      <span className="pointer-events-none absolute right-4 top-4 h-4 w-px bg-ink/30" />
      <span className="pointer-events-none absolute right-4 top-4 h-px w-4 bg-ink/30" />
      <span className="pointer-events-none absolute bottom-4 left-4 h-4 w-px bg-ink/30" />
      <span className="pointer-events-none absolute bottom-4 left-4 h-px w-4 bg-ink/30" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-px bg-ink/30" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-px w-4 bg-ink/30" />

      <div className="px-6 text-center">
        <p
          className="kicker animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          An AI Fashion Weekly · Shot in India
        </p>

        <h1 className="mt-5 font-display font-semibold leading-none tracking-tight text-[clamp(3.5rem,16vw,11rem)]">
          <Typeset text="LOOKSY" delay={0.25} />
        </h1>

        <div
          className="mt-5 flex animate-fade-up items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-vermilion"
          style={{ animationDelay: "0.8s" }}
        >
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vermilion opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-vermilion" />
          </span>
          The Issue {issue} · Live
        </div>

        {/* Vermilion press-seal */}
        <div className="mt-9 flex justify-center">
          <svg
            viewBox="0 0 200 200"
            className="animate-stamp h-32 w-32 text-vermilion"
            fill="none"
            aria-hidden
          >
            <defs>
              <path id="seal-top" d="M40,100 a60,60 0 0,1 120,0" />
            </defs>
            <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="66" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
            <text
              fill="currentColor"
              className="font-mono"
              fontSize="9"
              letterSpacing="2"
            >
              <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
                LOOKSY · EST · INDIA
              </textPath>
            </text>
            <text
              x="100"
              y="118"
              textAnchor="middle"
              fill="currentColor"
              className="font-display"
              fontSize="40"
              fontStyle="italic"
            >
              {issue}
            </text>
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="absolute bottom-6 right-6 animate-fade-up font-mono text-[11px] uppercase tracking-[0.2em] text-ink-30 transition hover:text-vermilion"
        style={{ animationDelay: "1.2s" }}
      >
        Skip →
      </button>
    </div>
  );
}

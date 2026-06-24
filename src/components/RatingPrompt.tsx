"use client";

import { useEffect, useState } from "react";

/** A quiet post-use rating card — appears once, after the user has made a look,
 *  collects 1–5 stars + an optional line, and posts to /api/feedback. */
export default function RatingPrompt({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (localStorage.getItem("looksy:rated")) return;
    const t = setTimeout(() => setOpen(true), 2000); // let them admire the cover first
    return () => clearTimeout(t);
  }, [show]);

  async function submit() {
    if (!rating) return;
    localStorage.setItem("looksy:rated", "1");
    setSent(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
    } catch {
      /* best-effort */
    }
    setTimeout(() => setOpen(false), 1600);
  }

  function dismiss() {
    localStorage.setItem("looksy:rated", "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="animate-fade-up fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 border border-white/10 bg-[#16120D] p-5 text-ink shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]">
      {sent ? (
        <p className="py-2 text-center font-serif italic text-ink-60">
          Thank you — noted. ♥
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker mb-1">Two seconds</p>
              <p className="font-display text-lg">Enjoying Looksy?</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-ink-30 transition hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex gap-1.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={`text-2xl leading-none transition ${
                  n <= (hover || rating) ? "text-vermilion" : "text-ink-30"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="One line for us (optional)"
            style={{ caretColor: "rgb(var(--c-vermilion))" }}
            className="mt-4 w-full border-b border-ink/20 bg-transparent py-1.5 font-serif text-sm italic text-ink placeholder:not-italic placeholder:text-ink-30 focus:border-vermilion focus:outline-none"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!rating}
            className="mt-4 w-full bg-vermilion py-2.5 text-sm font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send rating →
          </button>
        </>
      )}
    </div>
  );
}

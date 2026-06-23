"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "streetwear",
  "old money",
  "techwear",
  "Y2K",
  "Sangeet fits",
  "Diwali lunch",
  "date night",
];

export default function RotatingWord() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setI((p) => (p + 1) % WORDS.length);
        setShow(true);
      }, 280);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        className={[
          "inline-block font-display italic text-ink transition-all duration-300",
          show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        ].join(" ")}
      >
        {WORDS[i]}
      </span>
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute -bottom-0.5 left-0 h-0.5 bg-vermilion transition-all duration-300",
          show ? "w-full opacity-100" : "w-0 opacity-0",
        ].join(" ")}
      />
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "streetwear",
  "old money",
  "techwear",
  "party fits",
  "Y2K",
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
    <span
      className={[
        "inline-block whitespace-nowrap bg-gradient-to-r from-[#f5e6c8] via-champagne to-champagne-deep bg-clip-text italic text-transparent transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      {WORDS[i]}
    </span>
  );
}

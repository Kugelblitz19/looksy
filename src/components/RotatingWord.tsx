"use client";

import { useEffect, useState } from "react";

const WORDS = [
  { text: "streetwear", grad: "from-orange-400 to-pink-500" },
  { text: "old money", grad: "from-amber-200 to-yellow-500" },
  { text: "techwear", grad: "from-slate-200 to-cyan-400" },
  { text: "party fits", grad: "from-fuchsia-400 to-violet-500" },
  { text: "Y2K", grad: "from-pink-400 to-indigo-400" },
  { text: "date night", grad: "from-rose-400 to-red-500" },
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
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const w = WORDS[i];
  return (
    <span
      className={[
        "inline-block whitespace-nowrap bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
        w.grad,
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      {w.text}
    </span>
  );
}

"use client";

import { useRef, type ReactNode } from "react";

/** Wraps content with a subtle mouse-tracking 3D tilt on hover (desktop). */
export default function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) scale(1.03)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

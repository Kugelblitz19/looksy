"use client";

import { useRef, type ReactNode } from "react";

/**
 * A cover plate that behaves like glossy printed stock: it tilts toward the
 * cursor in 3D and a foil/holographic sheen sweeps across it under the light.
 * Pure pointer math + a gradient overlay — no dependencies. Touch devices just
 * get the static plate.
 */
export default function HoloCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const coords = useRef({ px: 0.5, py: 0.5 });
  const raf = useRef(0);

  function apply() {
    raf.current = 0;
    const el = ref.current;
    if (!el) return;
    const { px, py } = coords.current;
    el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 9).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg) scale(1.02)`;
    if (sheen.current) {
      const x = (px * 100).toFixed(0);
      const y = (py * 100).toFixed(0);
      sheen.current.style.opacity = "1";
      sheen.current.style.background = `radial-gradient(60% 60% at ${x}% ${y}%, rgba(255,255,255,0.5), rgba(255,255,255,0.08) 40%, transparent 70%), linear-gradient(${(px * 120 + 60).toFixed(0)}deg, rgba(120,180,255,0.18), rgba(255,170,210,0.14) 45%, rgba(255,230,160,0.16) 70%, transparent)`;
    }
  }

  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    coords.current = {
      px: (e.clientX - r.left) / r.width,
      py: (e.clientY - r.top) / r.height,
    };
    // Coalesce to one DOM write per frame instead of per pointer event.
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  }

  function reset() {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    if (ref.current) ref.current.style.transform = "";
    if (sheen.current) sheen.current.style.opacity = "0";
  }

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
      <div
        ref={sheen}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-soft-light transition-opacity duration-200"
      />
    </div>
  );
}

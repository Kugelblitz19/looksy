"use client";

import { useEffect, useRef } from "react";

type GarmentKind = "coat" | "tee" | "dress";

const GARMENTS: Array<{ x: number; kind: GarmentKind; dur: string; delay: string }> = [
  { x: 85,   kind: "coat",  dur: "7.4s",  delay: "0s"   },
  { x: 228,  kind: "tee",   dur: "9.2s",  delay: "1.4s" },
  { x: 374,  kind: "dress", dur: "11.8s", delay: "0.6s" },
  { x: 520,  kind: "coat",  dur: "8.5s",  delay: "2.3s" },
  { x: 665,  kind: "tee",   dur: "10.4s", delay: "0.3s" },
  { x: 808,  kind: "dress", dur: "7.9s",  delay: "1.8s" },
  { x: 952,  kind: "coat",  dur: "12.2s", delay: "1.0s" },
  { x: 1096, kind: "tee",   dur: "9.7s",  delay: "3.1s" },
];

const SWAY: Record<GarmentKind, { values: string; keyTimes: string }> = {
  coat:  { values: "0 0 60;-2.0 0 60;0.8 0 60;1.8 0 60;-0.9 0 60;0 0 60", keyTimes: "0;0.20;0.40;0.65;0.82;1" },
  tee:   { values: "0 0 60;-1.8 0 60;0.5 0 60;2.1 0 60;-0.7 0 60;0 0 60", keyTimes: "0;0.22;0.42;0.68;0.84;1" },
  dress: { values: "0 0 60;-1.4 0 60;0.4 0 60;1.6 0 60;-0.5 0 60;0 0 60", keyTimes: "0;0.18;0.38;0.62;0.80;1" },
};
const KEY_SPLINES = "0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1";

const PATHS: Record<GarmentKind, string> = {
  coat:  "M-34 60 L-52 78 L-42 92 L-32 86 L-32 176 L32 176 L32 86 L42 92 L52 78 L34 60 Z",
  tee:   "M-34 60 L-50 74 L-40 85 L-31 79 L-31 158 L31 158 L31 79 L40 85 L50 74 L34 60 Z",
  dress: "M-29 60 L-37 74 L-29 81 L-25 75 L-46 168 L46 168 L25 75 L29 81 L37 74 L29 60 Z",
};

function GarmentPath({ kind, dur, delay }: { kind: GarmentKind; dur: string; delay: string }) {
  const s = SWAY[kind];
  return (
    <path d={PATHS[kind]}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={s.values}
        keyTimes={s.keyTimes}
        calcMode="spline"
        keySplines={KEY_SPLINES}
        dur={dur}
        begin={delay}
        repeatCount="indefinite"
      />
    </path>
  );
}

export default function ClosetBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const motes = Array.from({ length: 52 }, () => ({
      x: canvas.width * (0.3 + Math.random() * 0.4),
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.25,
      vy: -(Math.random() * 0.14 + 0.04),
      vx: (Math.random() - 0.5) * 0.05,
      op: Math.random() * 0.32 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width * 0.5;
      const hw = canvas.width * 0.24;

      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -3) { m.y = canvas.height + 3; m.x = cx + (Math.random() - 0.5) * hw * 2; }
        const dist = Math.abs(m.x - cx) / hw;
        if (dist > 1) continue;
        const yFade = Math.max(0, Math.min(1, (canvas.height - m.y) / (canvas.height * 0.1)));
        const a = m.op * (1 - dist * 0.8) * yFade;
        if (a < 0.005) continue;

        // Spectral tint: electric-purple on left → warm gold at centre → electric-cyan on right
        const leftness  = Math.max(0, (cx - m.x) / hw);
        const rightness = Math.max(0, (m.x - cx) / hw);
        const r = Math.max(0,   Math.round(248 - leftness * 88  - rightness * 168));
        const g = Math.max(0,   Math.round(234 - leftness * 134 - rightness * 14));
        const b = Math.min(255, Math.round(196 + leftness * 59  + rightness * 59));

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <>
      {/* Electric room ambience — white centre, indigo corners */}
      <div className="fitting-room pointer-events-none fixed inset-0 z-0" />

      {/* Drifting jewel-tone colour orbs */}
      <div className="vibe-a pointer-events-none fixed inset-0 z-0" />
      <div className="vibe-b pointer-events-none fixed inset-0 z-0" />
      <div className="vibe-c pointer-events-none fixed inset-0 z-0" />

      {/* Architectural ceiling coffers */}
      <div className="showroom-walls pointer-events-none fixed inset-0 z-0" />

      {/* Iridescent oil-slick shimmer — slowly rotates through the spectrum */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.06] mix-blend-color"
      >
        <filter id="iris-veil">
          <feTurbulence type="fractalNoise" baseFrequency="0.28 0.14" numOctaves={3} seed={7} />
          <feColorMatrix type="saturate" values="8" />
          <feColorMatrix type="hueRotate" values="0">
            <animate attributeName="values" values="0;360" dur="38s" repeatCount="indefinite" />
          </feColorMatrix>
        </filter>
        <rect width="100%" height="100%" filter="url(#iris-veil)" />
      </svg>

      {/* Three animated track-light beams — colours shift on independent cycles */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      >
        <defs>
          {/* Centre: warm white → blushes lavender and back */}
          <radialGradient id="b-ctr" cx="50%" cy="0%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%">
              <animate attributeName="stop-color"
                values="#fffceb;#ffffff;#e6d7ff;#fffceb"
                dur="20s" repeatCount="indefinite" />
              <animate attributeName="stop-opacity"
                values="0.24;0.30;0.22;0.24"
                dur="20s" repeatCount="indefinite" />
            </stop>
            <stop offset="45%">
              <animate attributeName="stop-color"
                values="#f5e6be;#d2c8ff;#f5e6be"
                dur="20s" repeatCount="indefinite" />
              <animate attributeName="stop-opacity" values="0.07;0.07;0.07" dur="20s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </radialGradient>

          {/* Left: electric magenta ↔ deep purple */}
          <radialGradient id="b-lft" cx="50%" cy="0%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%">
              <animate attributeName="stop-color"
                values="#c850ff;#ff3cb4;#8c28ff;#c850ff"
                dur="16s" repeatCount="indefinite" />
              <animate attributeName="stop-opacity"
                values="0.22;0.20;0.24;0.22"
                dur="16s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#c050ff" stopOpacity={0} />
          </radialGradient>

          {/* Right: electric cyan ↔ teal */}
          <radialGradient id="b-rgt" cx="50%" cy="0%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%">
              <animate attributeName="stop-color"
                values="#00e6ff;#00c8be;#3cd2ff;#00e6ff"
                dur="24s" repeatCount="indefinite" />
              <animate attributeName="stop-opacity"
                values="0.20;0.18;0.22;0.20"
                dur="24s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#00dcff" stopOpacity={0} />
          </radialGradient>

          <filter id="bsft"><feGaussianBlur stdDeviation="2.8" /></filter>
        </defs>

        {/* Centre beam */}
        <ellipse cx="50" cy="-4" rx="20" ry="84" fill="url(#b-ctr)" filter="url(#bsft)">
          <animate attributeName="rx" values="20;24;17;22;20" dur="15s" repeatCount="indefinite" />
        </ellipse>
        <rect x="48.5" y="0" width="3" height="6" rx="0.8" fill="rgba(255,245,210,0.22)" />
        <ellipse cx="50" cy="6" rx="2.4" ry="1.3" fill="rgba(255,250,220,0.32)" />

        {/* Left magenta/purple beam */}
        <ellipse cx="22" cy="-4" rx="12" ry="62" fill="url(#b-lft)" filter="url(#bsft)">
          <animate attributeName="cx" values="22;26;19;24;22" dur="22s" repeatCount="indefinite" />
        </ellipse>
        <rect x="21.2" y="0" width="2.4" height="5" rx="0.7" fill="#c050ff" fillOpacity={0.28} />
        <ellipse cx="22.4" cy="5.2" rx="1.9" ry="1.0" fill="#c050ff" fillOpacity={0.38} />

        {/* Right cyan/teal beam */}
        <ellipse cx="78" cy="-4" rx="12" ry="62" fill="url(#b-rgt)" filter="url(#bsft)">
          <animate attributeName="cx" values="78;74;81;76;78" dur="26s" repeatCount="indefinite" />
        </ellipse>
        <rect x="77.2" y="0" width="2.4" height="5" rx="0.7" fill="#00dcff" fillOpacity={0.25} />
        <ellipse cx="78.4" cy="5.2" rx="1.9" ry="1.0" fill="#00dcff" fillOpacity={0.34} />
      </svg>

      {/* Garment rail with per-piece sway */}
      <svg
        aria-hidden
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[27rem] w-full"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="0" y1="32" x2="1200" y2="32" stroke="rgba(236,214,163,0.16)" strokeWidth={1.7} />
        {GARMENTS.map(({ x, kind, dur, delay }) => (
          <g key={x} transform={`translate(${x} 0)`} stroke="rgba(236,214,163,0.12)" strokeWidth={1.4}>
            <path d="M0 32 V22 a7 6 0 0 1 11 -4" />
            <path d="M0 32 L-34 60 L34 60 Z" />
            <GarmentPath kind={kind} dur={dur} delay={delay} />
          </g>
        ))}
      </svg>

      {/* Spectral dust motes — purple/gold/cyan by beam zone */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />

      {/* Polished lacquer floor */}
      <div className="showroom-floor pointer-events-none fixed inset-x-0 bottom-0 z-0 h-72" />

      {/* Film grain */}
      <svg aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.036] mix-blend-soft-light">
        <filter id="vfr-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vfr-grain)" />
      </svg>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const WORDS = [
  "streetwear",
  "old money",
  "Sangeet fits",
  "techwear",
  "Diwali lunch",
  "Y2K",
  "date night",
];

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Iridescent flowing "liquid couture": domain-warped fbm noise tinted through a
// violet / vermilion / teal / gold oil-slick palette, bending toward the cursor.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

vec2 hash(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i + vec2(0,0)), f - vec2(0,0)),
                 dot(hash(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(hash(i + vec2(0,1)), f - vec2(0,1)),
                 dot(hash(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  float t = u_time * 0.05;
  vec2 m = (u_mouse - 0.5);

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + 0.15 * t + m * 0.5),
                fbm(p + 1.6 * q + vec2(8.3, 2.8) - 0.12 * t));
  float f = fbm(p + 2.2 * r);

  // Iridescent cosine palette — violet · magenta · gold · teal oil-slick.
  float field = f + 0.7 * length(r) + 0.18 * t;
  vec3 a = vec3(0.50, 0.40, 0.55);
  vec3 b = vec3(0.45, 0.42, 0.50);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.10, 0.55, 0.85);
  vec3 col = a + b * cos(6.28318 * (c * field + d));

  // Liquid silk sheen.
  float sheen = 0.5 + 0.5 * sin((r.x - r.y) * 9.0 + t * 5.0);
  col += sheen * 0.07;

  // Depth, and keep the left side readable for the headline.
  float leftShade = 0.5 + 0.5 * smoothstep(0.0, 0.62, uv.x);
  col *= (0.55 + 0.6 * f) * leftShade;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export default function LiquidHero({
  isAuthed,
  primaryHref,
}: {
  isAuthed: boolean;
  primaryHref: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  // Rotating vibe word.
  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setI((p) => (p + 1) % WORDS.length);
        setShow(true);
      }, 280);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  // The WebGL shader.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return; // CSS gradient fallback stays visible

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = [0.5, 0.5];
    const target = [0.5, 0.5];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("mousemove", onMove);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const draw = (ms: number) => {
      mouse[0] += (target[0] - mouse[0]) * 0.05;
      mouse[1] += (target[1] - mouse[1]) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 8 : ms * 0.001);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-[linear-gradient(135deg,#2a0f4a,#7a1f1f_45%,#0a4a52_80%)]">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {/* legibility + film grain handled globally */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

      <div className="relative z-10 w-full px-5 py-20 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/65">
          An AI Fashion Weekly · Shot in India
        </p>
        <h1 className="mt-6 font-display font-medium leading-[0.9] tracking-tight text-white text-[clamp(3.5rem,11vw,9rem)] [text-shadow:0_2px_40px_rgba(0,0,0,0.35)]">
          <span className="block">Try on</span>
          <span
            className={`inline-block italic transition-all duration-300 ${
              show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {WORDS[i]}
          </span>
        </h1>
        <p className="mt-8 max-w-md font-serif text-lg leading-relaxed text-white/80">
          Upload a selfie. Pick a vibe. Get a cover so good it’s basically a
          personality — instantly shoppable. Free.
        </p>
        <div className="mt-10 flex items-center gap-6">
          <Link
            href={primaryHref}
            className="group inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-medium uppercase tracking-wide text-ink shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition hover:bg-vermilion hover:text-white"
          >
            {isAuthed ? "Open Studio" : "Open this issue"}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
          {!isAuthed && (
            <Link
              href="/login"
              className="text-sm text-white/70 underline-offset-4 transition hover:text-white hover:underline"
            >
              Already a subscriber?
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

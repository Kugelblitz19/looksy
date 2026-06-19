import Link from "next/link";
import RotatingWord from "@/components/RotatingWord";

const FLOATERS = [
  { e: "🧢", c: "left-[12%] top-[20%]", a: "animate-float", d: "0s" },
  { e: "🥂", c: "right-[13%] top-[26%]", a: "animate-float-slow", d: "1.4s" },
  { e: "👟", c: "left-[16%] bottom-[18%]", a: "animate-float", d: "2.8s" },
  { e: "🕶️", c: "right-[18%] bottom-[22%]", a: "animate-float-slow", d: "0.8s" },
  { e: "✨", c: "left-[46%] top-[12%]", a: "animate-float", d: "3.6s" },
  { e: "👜", c: "right-[40%] bottom-[14%]", a: "animate-float-slow", d: "2.2s" },
];

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5">
      {/* Ambient backdrop + drifting fashion bits */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] animate-float rounded-full bg-[#5f27cd]/30 blur-[140px]" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] animate-float-slow rounded-full bg-[#0abde3]/25 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-float rounded-full bg-[#ff6b6b]/15 blur-[140px]" />
        {FLOATERS.map((f) => (
          <span
            key={f.e + f.c}
            className={`absolute text-4xl opacity-20 ${f.c} ${f.a}`}
            style={{ animationDelay: f.d }}
          >
            {f.e}
          </span>
        ))}
      </div>

      {/* Top-right account action */}
      <div className="absolute right-5 top-5 z-20">
        {isAuthed ? (
          <Link
            href="/studio"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Open Studio
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white"
          >
            Log in
          </Link>
        )}
      </div>

      {/* Centered hero */}
      <div className="relative z-10 -mt-6 flex max-w-2xl flex-col items-center text-center">
        <div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-3xl shadow-xl shadow-indigo-500/40 ring-1 ring-white/10">
          ✨
        </div>

        <h1 className="text-6xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          <span className="block text-white/90">Try on</span>
          <RotatingWord />
        </h1>

        <p className="mt-6 text-lg text-white/55">
          Your selfie, restyled by AI — and instantly shoppable.
        </p>

        <Link
          href={isAuthed ? "/studio" : "/signup"}
          className="mt-9 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_50px_-8px_rgba(255,255,255,0.55)] transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.99]"
        >
          {isAuthed ? "Open Studio →" : "Get started free →"}
        </Link>

        {!isAuthed && (
          <p className="mt-4 text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

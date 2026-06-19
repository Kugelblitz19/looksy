import Link from "next/link";
import RotatingWord from "@/components/RotatingWord";
import HeroShowcase from "@/components/HeroShowcase";

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5 py-16">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] animate-float rounded-full bg-[#5f27cd]/30 blur-[150px]" />
        <div className="absolute -bottom-44 -right-32 h-[34rem] w-[34rem] animate-float-slow rounded-full bg-[#0abde3]/22 blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 animate-float rounded-full bg-[#ff6b6b]/14 blur-[150px]" />
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

      {/* Hero */}
      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/60 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI FASHION STUDIO
        </div>

        <h1 className="text-6xl font-bold leading-[1.0] tracking-tight sm:text-7xl">
          <span className="block text-white/90">Try on</span>
          <RotatingWord />
        </h1>

        <p className="mt-6 max-w-md text-lg text-white/55">
          Your selfie, restyled by AI — and instantly shoppable.
        </p>

        {/* Visual centerpiece */}
        <div className="mt-12">
          <HeroShowcase />
        </div>

        {/* Shoppable trust line */}
        <div className="mt-10 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/35">
          <span>Shop from</span>
          <span className="text-white/55">Myntra</span>
          <span className="text-white/20">·</span>
          <span className="text-white/55">Flipkart</span>
          <span className="text-white/20">·</span>
          <span className="text-white/55">Ajio</span>
          <span className="text-white/20">·</span>
          <span className="text-white/55">Amazon</span>
        </div>

        <Link
          href={isAuthed ? "/studio" : "/signup"}
          className="mt-8 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_55px_-8px_rgba(255,255,255,0.6)] transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.99]"
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

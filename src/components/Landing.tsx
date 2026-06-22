import Link from "next/link";
import RotatingWord from "@/components/RotatingWord";
import HeroShowcase from "@/components/HeroShowcase";
import StyleMarquee from "@/components/StyleMarquee";

const STEPS = [
  { n: "1", icon: "📸", title: "Add your selfie", body: "One clear photo — or skip it and we’ll style a model." },
  { n: "2", icon: "🎨", title: "Pick a vibe", body: "Streetwear, old money, party, techwear… or describe your own." },
  { n: "3", icon: "🛍️", title: "Shop the look", body: "Tap any piece to buy it on Myntra, Flipkart, Ajio or Amazon." },
];

const FEATURES = [
  { icon: "🪄", title: "Photoreal, not cartoon", body: "Editorial-quality images that genuinely look like you wearing the outfit." },
  { icon: "👗", title: "Every aesthetic", body: "Ten curated vibes plus free-text prompts — dressed for any moment." },
  { icon: "💸", title: "Instantly shoppable", body: "Every item links to real products, so inspiration turns into a cart." },
];

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  const primaryHref = isAuthed ? "/studio" : "/signup";
  const primaryLabel = isAuthed ? "Open Studio" : "Get started free";

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] animate-float rounded-full bg-[#5f27cd]/30 blur-[150px]" />
        <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 animate-float rounded-full bg-[#ff6b6b]/14 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/50 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-base shadow ring-1 ring-white/10">
                ✨
              </span>
              <span className="text-lg font-bold tracking-tight">Looksy</span>
            </div>
            <nav className="flex items-center gap-2">
              {isAuthed ? (
                <Link
                  href="/studio"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Open Studio
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-16 text-center sm:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI FASHION STUDIO
          </div>

          <h1 className="text-6xl font-bold leading-[1.0] tracking-tight sm:text-8xl">
            <span className="block text-white/90">Try on</span>
            <RotatingWord />
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
            Your selfie, restyled by AI — and instantly shoppable.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black shadow-[0_0_55px_-10px_rgba(255,255,255,0.6)] transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.99]"
            >
              {primaryLabel} →
            </Link>
            {!isAuthed && (
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-7 py-3.5 text-base text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Log in
              </Link>
            )}
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            <HeroShowcase />
          </div>
        </section>

        {/* Style marquee */}
        <section className="border-y border-white/5 bg-white/[0.02] py-6">
          <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Try any vibe
          </p>
          <StyleMarquee />
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Three taps to a new look
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-white/20"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-lg ring-1 ring-white/10">
                    {s.icon}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/35">
                    Step {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-10 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-xl sm:p-14">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Your next outfit is{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                one selfie
              </span>{" "}
              away.
            </h2>
            <Link
              href={primaryHref}
              className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_55px_-10px_rgba(255,255,255,0.6)] transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.99]"
            >
              {isAuthed ? "Open Studio" : "Create your first look"} →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-5 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-white/40 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-xs ring-1 ring-white/10">
                ✨
              </span>
              <span className="font-semibold text-white/60">Looksy</span>
            </div>
            <p>See yourself in any look · Shop Myntra · Flipkart · Ajio · Amazon</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

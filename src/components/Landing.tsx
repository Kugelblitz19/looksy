import Link from "next/link";
import RotatingWord from "@/components/RotatingWord";
import HeroShowcase from "@/components/HeroShowcase";
import StyleMarquee from "@/components/StyleMarquee";
import LookGallery from "@/components/LookGallery";
import Reveal from "@/components/Reveal";
import GlowButton from "@/components/GlowButton";

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
      {/* One warm gallery spotlight */}
      <div className="studio-light pointer-events-none fixed inset-0 z-0" />

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
                  className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-black ring-1 ring-champagne-deep/40 transition duration-300 hover:brightness-105"
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
                    className="rounded-full bg-cta px-4 py-2 text-sm font-medium text-black ring-1 ring-champagne-deep/40 transition duration-300 hover:brightness-105"
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
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/50 ring-1 ring-white/[0.08]">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
            AI Fashion Studio
          </div>

          <h1 className="font-display text-6xl font-medium leading-[1.02] tracking-tight sm:text-8xl">
            <span className="block text-white/90">Try on</span>
            <RotatingWord />
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
            Your selfie, restyled by AI — and instantly shoppable.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3">
            <GlowButton href={primaryHref}>{primaryLabel} →</GlowButton>
            {!isAuthed && (
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-7 py-4 text-base text-white/80 transition hover:border-white/40 hover:text-white"
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

        {/* Real looks gallery */}
        <section className="mx-auto max-w-5xl px-5 py-20">
          <Reveal>
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Real looks, made with Looksy
              </h2>
              <p className="mt-3 text-white/55">
                Every one is AI-generated — and every piece is shoppable.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LookGallery />
          </Reveal>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-5 py-20">
          <Reveal>
            <h2 className="mb-12 text-center font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Three taps to a new look
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-white/20">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-champagne-deep/[0.12] text-lg ring-1 ring-champagne-deep/25">
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
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 120}>
                <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-10 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-xl sm:p-14">
              <h2 className="text-balance font-display text-3xl font-medium tracking-tight sm:text-5xl">
                Your next outfit is{" "}
                <span className="bg-gradient-to-r from-[#fbf0cf] via-champagne to-champagne-deep bg-clip-text italic text-transparent">
                  one selfie
                </span>{" "}
                away.
              </h2>
              <div className="mt-8">
                <GlowButton href={primaryHref}>
                  {isAuthed ? "Open Studio" : "Create your first look"} →
                </GlowButton>
              </div>
            </div>
          </Reveal>
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

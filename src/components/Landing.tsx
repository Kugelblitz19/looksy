import Link from "next/link";

const STEPS = [
  { n: "1", icon: "📸", title: "Add your photo", body: "A clear selfie is all it takes — or skip it and we'll style a model." },
  { n: "2", icon: "🎨", title: "Pick a style", body: "Streetwear, old money, party, techwear… or describe your own." },
  { n: "3", icon: "🛍️", title: "Shop the look", body: "Tap any piece to buy it on Myntra, Flipkart, Ajio or Amazon." },
];

const FEATURES = [
  { icon: "🪄", title: "Photoreal, not cartoon", body: "High-end editorial images that actually look like you wearing the outfit." },
  { icon: "👗", title: "Every aesthetic", body: "Ten curated vibes plus free-text prompts — dress for any moment." },
  { icon: "💸", title: "Shoppable instantly", body: "Each item links to real products, so inspiration turns into a cart." },
];

const MOCKS = [
  { from: "#ff6b6b", to: "#5f27cd", label: "🧢 Streetwear" },
  { from: "#0abde3", to: "#341f97", label: "🥂 Old Money" },
];

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] animate-float rounded-full bg-[#5f27cd]/25 blur-[130px]" />
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 animate-float rounded-full bg-[#ff6b6b]/15 blur-[130px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
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
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 text-center sm:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI fashion studio
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              See yourself in any look.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
            Upload a selfie, pick a vibe, and Looksy generates photoreal images
            of <em>you</em> wearing it — then tap to shop every piece.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href={isAuthed ? "/studio" : "/signup"}
              className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
            >
              {isAuthed ? "Open Studio →" : "Get started free →"}
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

          {/* Hero mock */}
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4">
              {MOCKS.map((m) => (
                <div
                  key={m.label}
                  className="overflow-hidden rounded-2xl border border-white/10"
                >
                  <div
                    className="relative flex aspect-[3/4] items-end justify-center"
                    style={{
                      backgroundImage: `linear-gradient(140deg, ${m.from}, ${m.to})`,
                    }}
                  >
                    <span className="absolute top-1/2 -translate-y-1/2 text-5xl opacity-90">
                      🧍
                    </span>
                    <span className="mb-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {m.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2.5">
                    {["Myntra", "Ajio", "Amazon"].map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold sm:text-3xl">
            Three taps to a new look
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg">
                    {s.icon}
                  </span>
                  <span className="text-sm font-semibold text-white/40">
                    Step {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-white/55">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-white/55">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Your next outfit is one selfie away.
          </h2>
          <Link
            href={isAuthed ? "/studio" : "/signup"}
            className="mt-7 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
          >
            {isAuthed ? "Open Studio →" : "Create your first look →"}
          </Link>
        </section>

        <footer className="border-t border-white/5 px-5 py-8 text-center text-xs text-white/30">
          Looksy · See yourself in any look
        </footer>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-5">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] animate-float rounded-full bg-[#5f27cd]/30 blur-[140px]" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] animate-float-slow rounded-full bg-[#0abde3]/25 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-float rounded-full bg-[#ff6b6b]/15 blur-[140px]" />
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
        <div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-3xl shadow-xl shadow-indigo-900/40 ring-1 ring-white/10">
          ✨
        </div>

        <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            Try on any look.
          </span>
        </h1>

        <p className="mt-5 text-lg text-white/55">
          Your selfie, restyled by AI — and instantly shoppable.
        </p>

        <Link
          href={isAuthed ? "/studio" : "/signup"}
          className="mt-9 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
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

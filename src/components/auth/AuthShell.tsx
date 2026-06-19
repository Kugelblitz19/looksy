import type { ReactNode } from "react";

/**
 * Shared, polished visual shell for all auth screens (login, signup, forgot,
 * reset). Floating gradient orbs + a glass card keep every auth page on-brand.
 */
export default function AuthShell({
  subtitle,
  children,
  footer,
}: {
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-[#5f27cd]/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 animate-float-slow rounded-full bg-[#0abde3]/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/4 h-72 w-72 animate-float rounded-full bg-[#ff6b6b]/20 blur-[110px]" />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-2xl shadow-lg shadow-indigo-900/40 ring-1 ring-white/10">
            ✨
          </div>
          <h1 className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Looksy
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-white/55">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-xl">
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-white/50">{footer}</div>
        )}
      </div>
    </main>
  );
}

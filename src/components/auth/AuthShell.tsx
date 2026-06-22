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
      {/* One warm gallery spotlight */}
      <div className="studio-light pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <div className="mb-9 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-2xl shadow-lg shadow-indigo-900/40 ring-1 ring-white/10">
            ✨
          </div>
          <h1 className="font-display text-5xl font-medium tracking-tight">
            Looksy
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm text-white/55">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.04] backdrop-blur-xl">
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-white/50">{footer}</div>
        )}
      </div>
    </main>
  );
}

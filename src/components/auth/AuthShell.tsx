import type { ReactNode } from "react";
import { issueLabel } from "@/lib/issue";

/**
 * Shared editorial shell for all auth screens (login, signup, forgot, reset).
 * "THE COVER" subscription card: warm printed paper, ink, one rationed
 * vermilion accent. An issue strip runs along the top; the brand block and a
 * hairline-ruled paper card sit centered beneath it.
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
    <main className="relative flex min-h-screen flex-col bg-paper">
      {/* Issue strip */}
      <div className="px-6 pt-5">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg text-ink">LOOKSY</span>
          <span className="font-mono text-xs text-vermilion">
            {issueLabel()} · ₹FREE
          </span>
        </div>
      </div>
      <div className="mt-4 h-px bg-ink/15" />

      {/* Subscription card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Brand block */}
          <div className="mb-9 text-center">
            <h1 className="font-display text-5xl font-medium tracking-tight text-ink">
              Looksy
            </h1>
            <p className="kicker mt-4 text-ink-30">
              {subtitle ?? "Subscribe — it's free"}
            </p>
          </div>

          {/* Card */}
          <div className="border border-ink/15 bg-paper-2 p-6">{children}</div>

          {footer && (
            <div className="mt-6 text-center text-sm text-ink-60">{footer}</div>
          )}
        </div>
      </div>
    </main>
  );
}

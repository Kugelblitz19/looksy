import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { issueLabel } from "@/lib/issue";

/**
 * The editorial shell for static pages (about, privacy, contact): the masthead
 * strip, a titled content column, and the shared colophon footer. The global
 * Pressroom grain + crop marks come from the root layout.
 */
export default function PageShell({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children: React.ReactNode;
}) {
  const issue = issueLabel();
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl edge-rules">
        <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              Looksy
            </Link>
            <div className="flex items-center gap-5">
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-vermilion sm:inline">
                The Issue {issue}
              </span>
              <Link
                href="/"
                className="text-sm text-ink-60 transition hover:text-vermilion"
              >
                ← Home
              </Link>
            </div>
          </div>
          <div className="h-px w-full bg-ink/15" />
        </header>

        <article className="px-5 py-14 sm:px-8 sm:py-20">
          {kicker && <p className="kicker mb-4">{kicker}</p>}
          <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="prose-editorial mt-10">{children}</div>
        </article>

        <SiteFooter />
      </div>
    </main>
  );
}

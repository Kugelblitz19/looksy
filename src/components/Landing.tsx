import LookGallery from "@/components/LookGallery";
import Reveal from "@/components/Reveal";
import GlowButton from "@/components/GlowButton";
import SiteFooter from "@/components/SiteFooter";
import LandingNav from "@/components/LandingNav";
import IntroCover from "@/components/IntroCover";
import LiquidHero from "@/components/LiquidHero";
import { issueLabel } from "@/lib/issue";

const CONTENTS = [
  { n: "№01", title: "Add your selfie", page: "or skip — we’ll cast a model" },
  { n: "№02", title: "Pick the vibe", page: "streetwear, old money, Sangeet…" },
  { n: "№03", title: "Post & cop", page: "share the cover, shop the look" },
];

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  const primaryHref = isAuthed ? "/studio" : "/signup";
  const issue = issueLabel();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <IntroCover issue={issue} />
      <div className="mx-auto max-w-6xl edge-rules">
        {/* Masthead nav */}
        <LandingNav isAuthed={isAuthed} issue={issue} primaryHref={primaryHref} />

        {/* Liquid Couture hero — a living WebGL shader */}
        <LiquidHero isAuthed={isAuthed} primaryHref={primaryHref} />

        <div className="h-px w-full bg-ink/15" />

        {/* Contents */}
        <section id="contents" className="scroll-mt-20 px-5 py-14 sm:px-8">
          <p className="kicker mb-6">Contents</p>
          <ul>
            {CONTENTS.map((c) => (
              <li
                key={c.n}
                className="flex items-baseline border-b border-ink/10 py-4 last:border-0"
              >
                <span className="w-16 shrink-0 font-mono text-sm text-vermilion">{c.n}</span>
                <span className="font-display text-xl tracking-tight sm:text-2xl">
                  {c.title}
                </span>
                <span className="leader" />
                <span className="shrink-0 font-serif text-sm italic text-ink-60">
                  {c.page}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="h-px w-full bg-ink/15" />

        {/* This week's covers */}
        <section id="gallery" className="scroll-mt-20 px-5 py-16 sm:px-8">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="kicker mb-2">The Gallery</p>
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  This week’s covers
                </h2>
              </div>
              <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-30 sm:block">
                Every piece shoppable
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LookGallery />
          </Reveal>
          <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.18em] text-ink-30">
            1,20,000+ covers shot this week
          </p>
        </section>

        <div className="h-px w-full bg-ink/15" />

        {/* Closing cover line */}
        <section className="px-5 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-medium leading-[1.02] tracking-tight sm:text-6xl">
              Your next cover is{" "}
              <span className="italic text-vermilion">one selfie</span> away.
            </h2>
            <div className="mt-10 flex justify-center">
              <GlowButton href={primaryHref}>
                {isAuthed ? "Open Studio" : "Shoot your first cover"} →
              </GlowButton>
            </div>
          </Reveal>
        </section>

        {/* Colophon */}
        <SiteFooter />
      </div>
    </main>
  );
}

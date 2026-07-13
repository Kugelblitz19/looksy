import LookGallery from "@/components/LookGallery";
import Reveal from "@/components/Reveal";
import GlowButton from "@/components/GlowButton";
import SiteFooter from "@/components/SiteFooter";
import LandingNav from "@/components/LandingNav";
import IntroCover from "@/components/IntroCover";
import LiquidHero from "@/components/LiquidHero";
import { issueLabel } from "@/lib/issue";

const CONTENTS = [
  { n: "01", title: "Add your selfie", page: "or skip — we’ll cast a model" },
  { n: "02", title: "Pick the vibe", page: "streetwear, old money, Sangeet…" },
  { n: "03", title: "Post & cop", page: "share the cover, shop the look" },
];

export default function Landing({ isAuthed }: { isAuthed: boolean }) {
  // Always route the primary CTA to the Studio — logged-out visitors get the
  // guest one-look trial there, logged-in users get their full Studio.
  const primaryHref = "/studio";
  const issue = issueLabel();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <IntroCover issue={issue} />

      {/* Light — masthead + the liquid cover */}
      <div className="mx-auto max-w-6xl edge-rules">
        <LandingNav isAuthed={isAuthed} issue={issue} primaryHref={primaryHref} />
        <LiquidHero isAuthed={isAuthed} primaryHref={primaryHref} />
      </div>

      {/* Night — the issue, after the cover. Full-bleed warm black; the framed
          column inherits the bone rule so its edges glow on the dark. */}
      <div data-theme="night" className="bg-[#0E0B08] text-ink">
        <div className="mx-auto max-w-6xl edge-rules">
          {/* Dissolve — the wet cover dries into the page floor */}
          <div className="relative h-24 sm:h-28">
            <span
              aria-hidden
              className="absolute bottom-6 left-1/2 h-7 w-0.5 -translate-x-1/2 bg-vermilion"
            />
          </div>

          {/* Contents — an editorial index */}
          <section id="contents" className="scroll-mt-24 px-5 sm:px-8">
            <div className="mb-6 flex items-baseline justify-between">
              <p className="kicker">Contents</p>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-30">
                In this issue · {issue}
              </span>
            </div>
            <div className="rule-iris mb-2 opacity-70" />
            <ul>
              {CONTENTS.map((c) => (
                <li
                  key={c.n}
                  className="group flex items-baseline gap-4 border-b border-ink/12 py-6 last:border-0 sm:gap-8"
                >
                  <span className="numeral-ghost w-16 shrink-0 font-display text-5xl leading-none transition-colors duration-300 group-hover:text-vermilion sm:w-28 sm:text-6xl">
                    {c.n}
                  </span>
                  <span className="font-display text-2xl tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
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

          <div className="my-4 px-5 sm:px-8">
            <div className="rule-iris opacity-60" />
          </div>

          {/* This week's covers — lit plates on black */}
          <section id="gallery" className="scroll-mt-24 px-5 py-14 sm:px-8 sm:py-16">
            <Reveal>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="kicker mb-2">The Gallery</p>
                  <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
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
            <p className="mt-10 text-center font-serif text-sm italic text-ink-30">
              1,20,000+ covers shot this week.
            </p>
          </section>

          <div className="my-4 px-5 sm:px-8">
            <div className="rule-iris opacity-60" />
          </div>

          {/* Closing — a left-anchored pull-quote glowing on the wash */}
          <section className="relative overflow-hidden px-5 py-28 sm:px-8">
            <div className="liquid-wash pointer-events-none absolute inset-0" aria-hidden />
            <Reveal>
              <div className="relative max-w-4xl">
                <span
                  aria-hidden
                  className="block font-display text-8xl leading-[0.6] text-ink/20"
                >
                  “
                </span>
                <h2 className="font-display text-5xl font-medium leading-[1.0] tracking-tight text-ink [text-shadow:0_2px_40px_rgba(0,0,0,0.5)] sm:text-7xl">
                  Your next cover is{" "}
                  <span className="italic text-vermilion">one tap</span> away.
                </h2>
                <div className="rule-iris mt-10 max-w-xs opacity-70" />
                <div className="mt-8">
                  <GlowButton href={primaryHref}>
                    {isAuthed ? "Open Studio" : "Shoot your first cover"} →
                  </GlowButton>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Colophon */}
          <SiteFooter issue={issue} />
        </div>
      </div>
    </main>
  );
}

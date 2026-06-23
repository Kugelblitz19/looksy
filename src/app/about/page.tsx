import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "About — Looksy",
  description:
    "Looksy is an AI fashion weekly: upload a selfie, pick a vibe, get a cover-quality look of yourself — instantly shoppable across India's top stores.",
};

export default function AboutPage() {
  return (
    <PageShell kicker="About" title="A fashion magazine that shoots you.">
      <p className="lead">
        Looksy turns a selfie and a vibe into a cover-quality photo of you in a
        whole new look — and makes every piece on it instantly shoppable.
      </p>

      <p>
        Getting dressed for the big stuff — a Sangeet, a reception, a first day
        at work, a night out — usually means a hundred open tabs and a guess at
        what actually suits you. Looksy collapses that into three taps: add your
        selfie, pick a vibe, and see yourself on the cover before you spend a
        rupee.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>
          <strong>Add your selfie</strong> — or skip it, and we’ll cast a model
          for the look instead.
        </li>
        <li>
          <strong>Pick a vibe</strong> — streetwear, old money, Sangeet,
          techwear, Contemporary Desi and more, or write your own style note.
        </li>
        <li>
          <strong>Post &amp; cop</strong> — share the finished cover, then shop
          each piece, matched to real products at Myntra, Flipkart, Ajio and
          Amazon.
        </li>
      </ul>

      <h2>Built for India</h2>
      <p>
        The occasions, the aesthetics and the stores are all tuned for how India
        actually shops — occasion-first and value-conscious — so the look you
        love is a look you can actually buy.
      </p>

      <h2>How we make money</h2>
      <p>
        Looksy is free. When you buy something through a shop link, the retailer
        may pay us a small affiliate commission — at no extra cost to you. It
        never changes the price you pay or which products we surface; we rank by
        how closely each one matches your look. See our{" "}
        <a href="/privacy">Privacy Policy</a> for more.
      </p>
    </PageShell>
  );
}

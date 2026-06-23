import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact — Looksy",
  description: "Get in touch with the Looksy team — support, feedback, press and partnerships.",
};

const CONTACT_EMAIL = "hello@looksy.app"; // TODO: replace with your real contact address

export default function ContactPage() {
  return (
    <PageShell kicker="Contact" title="Get in touch.">
      <p className="lead">
        Questions, feedback, a bug, or a partnership? We read everything.
      </p>

      <p>
        The fastest way to reach us is email —{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We usually reply
        within a couple of working days.
      </p>

      <h2>What to write about</h2>
      <ul>
        <li>
          <strong>Support</strong> — trouble with a look, your account, or a shop
          link.
        </li>
        <li>
          <strong>Feedback</strong> — a vibe or occasion you wish we had.
        </li>
        <li>
          <strong>Press &amp; partnerships</strong> — brands, retailers and
          collaborations.
        </li>
        <li>
          <strong>Privacy &amp; data</strong> — see our{" "}
          <a href="/privacy">Privacy Policy</a>, or email us to delete your data.
        </li>
      </ul>
    </PageShell>
  );
}

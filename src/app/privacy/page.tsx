import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Looksy",
  description:
    "How Looksy collects, uses and protects your data — account info, photos, generated looks, and affiliate links.",
};

const CONTACT_EMAIL = "hello@looksy.app"; // TODO: replace with your real contact address

export default function PrivacyPage() {
  return (
    <PageShell kicker="Legal" title="Privacy Policy">
      <p className="lead">
        This policy explains what Looksy collects, why, and the control you have
        over it. We keep it short and plain.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — your email (and name, if you add
          one) when you sign up, handled by our auth provider, Supabase.
        </li>
        <li>
          <strong>Photos you upload</strong> — any selfie you add, stored
          privately so it can power your looks and your avatar.
        </li>
        <li>
          <strong>Looks &amp; choices</strong> — the vibes, prompts and looks you
          generate or save.
        </li>
        <li>
          <strong>Basic usage data</strong> — standard logs your browser and our
          hosting send (e.g. device, approximate location, pages viewed).
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To generate your looks and run your account.</li>
        <li>To surface shoppable products that match each look.</li>
        <li>To keep Looksy secure, working and improving.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We don’t sell your data. We use a few trusted services to run Looksy:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — database, authentication and photo storage.
        </li>
        <li>
          <strong>Google (Gemini)</strong> — the AI that generates your looks
          from your selfie and prompt.
        </li>
        <li>
          <strong>Retailers &amp; affiliate networks</strong> — when you tap a
          shop link, you’re taken to the retailer (Myntra, Flipkart, Ajio,
          Amazon) via an affiliate link so any purchase can be credited to us.
        </li>
      </ul>

      <h2>Affiliate links</h2>
      <p>
        Some links on Looksy are affiliated. If you buy through one, the retailer
        may pay us a commission at no extra cost to you. This never changes the
        price you pay or how we rank products.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only the cookies needed to keep you logged in and the app
        working. Affiliate networks may set their own cookies to attribute a
        purchase when you visit a retailer.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can remove a saved look or your uploaded photo at any time.</li>
        <li>
          You can ask us to delete your account and associated data — email us
          and we’ll take care of it.
        </li>
      </ul>

      <h2>Data retention &amp; security</h2>
      <p>
        We keep your data only as long as your account is active or as needed to
        run the service, and we rely on our providers’ industry-standard
        security. No method is ever 100% secure, but we work to protect it.
      </p>

      <h2>Children</h2>
      <p>Looksy isn’t directed at children under 13, and we don’t knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        We may update this policy as Looksy grows; material changes will be
        reflected here.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or data requests? Email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </PageShell>
  );
}

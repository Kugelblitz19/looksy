"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Submit, Notice } from "@/components/auth/fields";

/**
 * Passwordless email login via a magic link. Uses Supabase's DEFAULT email
 * template (no template editing / custom SMTP required) and the same
 * /auth/callback the Google OAuth flow already uses. Free, no SMS, no new deps.
 */
export default function EmailOtp({ onBack }: { onBack: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function sendLink() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/studio`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {sent ? (
        <Notice kind="success">
          Check your inbox — we sent a login link to {email.trim()}. Open it on
          this device to log in. (Check spam if it&apos;s not there in a minute.)
        </Notice>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendLink();
          }}
          className="space-y-3"
        >
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Submit loading={loading}>Email me a login link</Submit>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-ink-60 underline-offset-4 hover:text-vermilion hover:underline"
      >
        ← Other ways to log in
      </button>

      {error && <Notice kind="error">{error}</Notice>}
    </div>
  );
}

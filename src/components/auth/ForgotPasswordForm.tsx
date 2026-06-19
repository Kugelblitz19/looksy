"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { Field, Submit, Notice } from "@/components/auth/fields";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      subtitle="Reset your password"
      footer={
        <Link
          href="/login"
          className="font-medium text-white underline-offset-4 hover:underline"
        >
          ← Back to login
        </Link>
      }
    >
      {!isSupabaseConfigured ? (
        <Notice kind="success">
          Email password reset turns on as soon as Supabase is connected. Once
          your keys are set, entering your email here sends a reset link to that
          address.
        </Notice>
      ) : sent ? (
        <Notice kind="success">
          If an account exists for <strong>{email}</strong>, a reset link is on
          its way. Check your inbox and follow the link to set a new password.
        </Notice>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-white/60">
            Enter your email and we’ll send you a link to set a new password.
          </p>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          {error && <Notice kind="error">{error}</Notice>}
          <Submit loading={loading}>Send reset link</Submit>
        </form>
      )}
    </AuthShell>
  );
}

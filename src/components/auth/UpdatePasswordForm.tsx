"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { Field, Submit, Notice } from "@/components/auth/fields";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch {
      setError(
        "Couldn’t update the password. Please open the reset link from your email again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell subtitle="Choose a new password">
      {done ? (
        <Notice kind="success">Password updated! Taking you in…</Notice>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
          />
          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />
          {error && <Notice kind="error">{error}</Notice>}
          <Submit loading={loading}>Update password</Submit>
        </form>
      )}
    </AuthShell>
  );
}

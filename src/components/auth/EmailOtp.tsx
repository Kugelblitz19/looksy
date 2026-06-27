"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Submit, Notice } from "@/components/auth/fields";

/**
 * Passwordless email login — Supabase sends a 6-digit code, the user types it
 * back. Free (no SMS), no extra service. For the code to appear in the email,
 * the Supabase "Magic Link" template must include {{ .Token }}.
 */
export default function EmailOtp({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStep("code");
      setNotice(`We emailed a 6-digit code to ${email.trim()}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      router.push("/studio");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wrong or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "email" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
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
          <Submit loading={loading}>Email me a code</Submit>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode();
          }}
          className="space-y-3"
        >
          <Field
            label="6-digit code"
            type="text"
            value={code}
            onChange={setCode}
            placeholder="123456"
            autoComplete="one-time-code"
            required
          />
          <Submit loading={loading}>Verify &amp; log in</Submit>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
            }}
            className="text-xs text-ink-60 underline-offset-4 hover:text-vermilion hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-ink-60 underline-offset-4 hover:text-vermilion hover:underline"
      >
        ← Other ways to log in
      </button>

      {notice && <Notice kind="success">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  );
}

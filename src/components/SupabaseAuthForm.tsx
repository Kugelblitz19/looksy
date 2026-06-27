"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth/AuthShell";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { Field, Submit, Notice } from "@/components/auth/fields";
import EmailOtp from "@/components/auth/EmailOtp";

export default function SupabaseAuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const router = useRouter();
  const supabase = createClient();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Only show "Continue with Google" when the provider is actually enabled in
  // Supabase — avoids the "provider is not enabled" dead-end. Auto-appears the
  // moment Google is switched on in the dashboard.
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [view, setView] = useState<"main" | "emailotp">("main");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => r.json())
      .then((d) => setGoogleEnabled(Boolean(d?.external?.google)))
      .catch(() => {});
  }, []);

  function done() {
    router.push("/studio");
    router.refresh();
  }

  async function withLoading(fn: () => Promise<void>) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const submitEmail = () =>
    withLoading(async () => {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/studio`,
          },
        });
        if (error) throw error;
        if (data.session) done();
        else setNotice("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        done();
      }
    });

  const signInWithGoogle = () =>
    withLoading(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/studio`,
        },
      });
      if (error) throw error;
    });

  return (
    <AuthShell
      subtitle={
        isSignup
          ? "Create an account to start styling."
          : "Welcome back — log in to your looks."
      }
      footer={
        <>
          {isSignup ? "Already have an account? " : "New to Looksy? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-medium text-ink-60 underline-offset-4 hover:text-vermilion hover:underline"
          >
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </>
      }
    >
      {view === "emailotp" ? (
        <EmailOtp onBack={() => setView("main")} />
      ) : (
      <div className="space-y-4">
        {googleEnabled && (
          <>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-sm border border-ink/20 bg-paper py-3 text-sm font-medium text-ink transition hover:border-ink active:scale-[0.99] disabled:opacity-50"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="flex items-center gap-3 text-xs text-ink-30">
              <span className="h-px flex-1 bg-ink/15" /> or
              <span className="h-px flex-1 bg-ink/15" />
            </div>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitEmail();
          }}
          className="space-y-3"
        >
          {isSignup && (
            <Field
              label="Your name"
              optional
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Priya"
              autoComplete="name"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={isSignup ? "At least 6 characters" : "Your password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
          />
          {!isSignup && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-ink-60 underline-offset-4 hover:text-vermilion hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}
          <Submit loading={loading}>
            {isSignup ? "Create account" : "Log in"}
          </Submit>
        </form>

        <button
          type="button"
          onClick={() => setView("emailotp")}
          className="w-full text-center text-sm font-medium text-ink-60 underline-offset-4 transition hover:text-vermilion hover:underline"
        >
          Email me a login link
        </button>

        {notice && <Notice kind="success">{notice}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </div>
      )}
    </AuthShell>
  );
}

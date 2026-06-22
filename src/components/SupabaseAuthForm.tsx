"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth/AuthShell";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { Field, Submit, Notice } from "@/components/auth/fields";

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
            className="font-medium text-champagne underline-offset-4 hover:underline"
          >
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.99] disabled:opacity-50"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="h-px flex-1 bg-white/10" /> or
          <span className="h-px flex-1 bg-white/10" />
        </div>

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
                className="text-xs text-white/55 underline-offset-4 hover:text-champagne hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}
          <Submit loading={loading}>
            {isSignup ? "Create account" : "Log in"}
          </Submit>
        </form>

        {notice && <Notice kind="success">{notice}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </div>
    </AuthShell>
  );
}

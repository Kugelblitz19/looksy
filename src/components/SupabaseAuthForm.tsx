"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth/AuthShell";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { Field, Submit, Notice } from "@/components/auth/fields";

type Method = "email" | "phone";

export default function SupabaseAuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const router = useRouter();
  const supabase = createClient();
  const isSignup = mode === "signup";

  const [method, setMethod] = useState<Method>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function done() {
    router.push("/");
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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  const sendOtp = () =>
    withLoading(async () => {
      const normalized = phone.trim().startsWith("+")
        ? phone.trim()
        : `+${phone.trim()}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (error) throw error;
      setPhone(normalized);
      setOtpSent(true);
      setNotice("We sent a 6-digit code by SMS.");
    });

  const verifyOtp = () =>
    withLoading(async () => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      done();
    });

  const signInWithGoogle = () =>
    withLoading(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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
            className="font-medium text-white underline-offset-4 hover:underline"
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

        {/* Segmented method toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/30 p-1">
          {(["email", "phone"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMethod(m);
                setError(null);
                setNotice(null);
              }}
              className={[
                "rounded-lg py-2 text-sm font-medium transition",
                method === m
                  ? "bg-white text-black shadow"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              {m === "email" ? "📧 Email" : "📱 Phone"}
            </button>
          ))}
        </div>

        {method === "email" ? (
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
                  className="text-xs text-white/55 underline-offset-4 hover:text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
            <Submit loading={loading}>
              {isSignup ? "Create account" : "Log in"}
            </Submit>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (otpSent) verifyOtp();
              else sendOtp();
            }}
            className="space-y-3"
          >
            <Field
              label="Phone number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              required
              disabled={otpSent}
            />
            {otpSent && (
              <Field
                label="6-digit code"
                type="text"
                value={otp}
                onChange={setOtp}
                placeholder="123456"
                autoComplete="one-time-code"
                required
              />
            )}
            <Submit loading={loading}>
              {otpSent ? "Verify code" : "Send code"}
            </Submit>
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setNotice(null);
                }}
                className="w-full text-center text-xs text-white/50 hover:text-white"
              >
                Use a different number
              </button>
            )}
          </form>
        )}

        {notice && <Notice kind="success">{notice}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </div>
    </AuthShell>
  );
}

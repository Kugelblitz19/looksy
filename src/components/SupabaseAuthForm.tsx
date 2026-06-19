"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
      setNotice("We sent you a 6-digit code by SMS.");
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
      // Browser redirects to Google from here.
    });

  return (
    <main className="aurora flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Looksy
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {isSignup
              ? "Create an account to start styling."
              : "Welcome back — log in to your looks."}
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-line bg-panel/70 p-6 backdrop-blur">
          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            <span className="text-base">🇬</span> Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="h-px flex-1 bg-line" /> or{" "}
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Method toggle */}
          <div className="flex gap-2">
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
                  "flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition",
                  method === m
                    ? "border-white bg-white text-black"
                    : "border-line bg-white/5 text-white/70 hover:text-white",
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
                <Input
                  label="Your name (optional)"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. Priya"
                />
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={isSignup ? "At least 6 characters" : "Your password"}
                required
              />
              <Submit loading={loading}>
                {isSignup ? "Create account" : "Log in"}
              </Submit>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                otpSent ? verifyOtp() : sendOtp();
              }}
              className="space-y-3"
            >
              <Input
                label="Phone number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98765 43210"
                required
                disabled={otpSent}
              />
              {otpSent && (
                <Input
                  label="6-digit code"
                  type="text"
                  value={otp}
                  onChange={setOtp}
                  placeholder="123456"
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

          {notice && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-sm text-emerald-300">
              {notice}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-white/50">
          {isSignup ? "Already have an account? " : "New to Looksy? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </div>
    </main>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl border border-line bg-black/30 p-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}

function Submit({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

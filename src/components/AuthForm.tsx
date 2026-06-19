"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

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

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-line bg-panel/70 p-6 backdrop-blur"
        >
          {isSignup && (
            <Field
              label="Your name"
              optional
              type="text"
              value={name}
              autoComplete="name"
              placeholder="e.g. Priya"
              onChange={setName}
            />
          )}

          <Field
            label="Email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            required
            onChange={setEmail}
          />

          <Field
            label="Password"
            type="password"
            value={password}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 6 characters" : "Your password"}
            required
            onChange={setPassword}
          />

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : isSignup
                ? "Create account"
                : "Log in"}
          </button>
        </form>

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

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  optional,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">
        {label}{" "}
        {optional && <span className="text-white/40">(optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-line bg-black/30 p-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
      />
    </label>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { Field, Submit, Notice } from "@/components/auth/fields";

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
      <form onSubmit={submit} className="space-y-3">
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
        {error && <Notice kind="error">{error}</Notice>}
        <Submit loading={loading}>
          {isSignup ? "Create account" : "Log in"}
        </Submit>
      </form>
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload, { type UploadedPhoto } from "@/components/PhotoUpload";
import AestheticPicker from "@/components/AestheticPicker";
import LookCard from "@/components/LookCard";
import WishlistPanel from "@/components/studio/WishlistPanel";
import type { GeneratedLook, GenerateResponse } from "@/lib/types";

const COUNT_OPTIONS = [1, 2, 4];

const TABS = [
  { id: "create", label: "Create", icon: "✨" },
  { id: "wishlist", label: "Wishlist", icon: "🤍" },
  { id: "profile", label: "Profile", icon: "👤" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Studio({
  userEmail,
  userName,
  supabaseAuth = false,
  realGeneration = false,
}: {
  userEmail: string;
  userName?: string;
  supabaseAuth?: boolean;
  realGeneration?: boolean;
}) {
  const router = useRouter();

  const [tab, setTab] = useState<TabId>("create");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [looks, setLooks] = useState<GeneratedLook[]>([]);

  const toggleAesthetic = (id: string) =>
    setAesthetics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canGenerate =
    !loading && (aesthetics.length > 0 || prompt.trim().length > 0);

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("prompt", prompt);
      form.set("aesthetics", JSON.stringify(aesthetics));
      form.set("count", String(count));
      for (const p of photos) form.append("photos", p.file);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data: GenerateResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed.");
      setLooks((prev) => [...(data.looks ?? []), ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (supabaseAuth) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    } else {
      await fetch("/api/auth/logout", { method: "POST" });
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] animate-float rounded-full bg-[#5f27cd]/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-[#0abde3]/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-white/10 bg-ink/60 backdrop-blur-xl sm:w-56">
          <div className="flex items-center gap-2 px-3 py-4 sm:px-4">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm shadow ring-1 ring-white/10">
              ✨
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Looksy
            </span>
          </div>

          <nav className="flex-1 space-y-1 px-2 sm:px-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 text-white ring-1 ring-white/10"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                ].join(" ")}
                title={t.label}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 p-2 sm:p-3">
            <div className="hidden truncate px-2 pb-1.5 text-xs text-white/45 sm:block">
              Hi, {userName || userEmail}
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
              title="Log out"
            >
              <span className="text-lg leading-none">⎋</span>
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
            {tab === "create" && (
              <CreateTab
                realGeneration={realGeneration}
                aesthetics={aesthetics}
                toggleAesthetic={toggleAesthetic}
                prompt={prompt}
                setPrompt={setPrompt}
                count={count}
                setCount={setCount}
                generate={generate}
                canGenerate={canGenerate}
                loading={loading}
                error={error}
                looks={looks}
                supabaseAuth={supabaseAuth}
              />
            )}

            {tab === "wishlist" && (
              <section>
                <h1 className="mb-6 text-2xl font-bold tracking-tight">
                  🤍 Wishlist
                </h1>
                <WishlistPanel />
              </section>
            )}

            {tab === "profile" && (
              <ProfileTab
                userEmail={userEmail}
                userName={userName}
                photos={photos}
                setPhotos={setPhotos}
                realGeneration={realGeneration}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function DemoNote() {
  return (
    <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-2.5 py-1.5 text-[11px] leading-snug text-amber-200/80">
      🎭 Demo styles a model, not your face — your face needs a billed Gemini key.
    </p>
  );
}

function CreateTab({
  realGeneration,
  aesthetics,
  toggleAesthetic,
  prompt,
  setPrompt,
  count,
  setCount,
  generate,
  canGenerate,
  loading,
  error,
  looks,
  supabaseAuth,
}: {
  realGeneration: boolean;
  aesthetics: string[];
  toggleAesthetic: (id: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  count: number;
  setCount: (n: number) => void;
  generate: () => void;
  canGenerate: boolean;
  loading: boolean;
  error: string | null;
  looks: GeneratedLook[];
  supabaseAuth: boolean;
}) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">✨ Create a look</h1>

      {!realGeneration && <DemoNote />}

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5 backdrop-blur-xl">
        <AestheticPicker selected={aesthetics} onToggle={toggleAesthetic} />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="Style it your way (optional) — e.g. black jacket, blue jeans, city street"
          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/55">How many?</span>
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={[
                  "h-8 w-8 rounded-lg border text-sm font-medium transition",
                  count === n
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/70 hover:text-white",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.7)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "Creating…" : "✨ Create my looks"}
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      {(loading || looks.length > 0) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {loading &&
            Array.from({ length: count }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="skeleton h-[30rem] animate-shimmer rounded-3xl"
              />
            ))}
          {looks.map((look) => (
            <LookCard key={look.id} look={look} saveable={supabaseAuth} />
          ))}
        </div>
      )}

      {!loading && looks.length === 0 && (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/40 sm:min-h-[22rem]">
          <div>
            <div className="mb-3 text-4xl">🪄</div>
            Pick a style and hit Create — your looks (with buy links) show up here.
          </div>
        </div>
      )}
    </section>
  );
}

function ProfileTab({
  userEmail,
  userName,
  photos,
  setPhotos,
  realGeneration,
}: {
  userEmail: string;
  userName?: string;
  photos: UploadedPhoto[];
  setPhotos: (p: UploadedPhoto[]) => void;
  realGeneration: boolean;
}) {
  return (
    <section className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">👤 Profile</h1>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-lg font-bold">
            {(userName || userEmail || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {userName || "Your account"}
            </div>
            <div className="truncate text-sm text-white/50">{userEmail}</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5">
          <PhotoUpload
            photos={photos}
            onChange={setPhotos}
            hint={
              realGeneration
                ? "Add a clear selfie so your looks actually look like you."
                : "In demo mode your photo isn’t used yet — add a billed Gemini key to put your real face in the looks."
            }
          />
          {!realGeneration && (
            <div className="mt-3">
              <DemoNote />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

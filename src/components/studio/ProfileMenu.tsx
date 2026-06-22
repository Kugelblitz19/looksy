"use client";

import { useEffect, useRef, useState } from "react";

function MenuItem({
  icon,
  label,
  onClick,
  soon,
  danger,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  soon?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={soon}
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition",
        soon
          ? "cursor-default text-white/35"
          : danger
            ? "text-white/75 hover:bg-red-500/10 hover:text-red-300"
            : "text-white/85 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
      {soon && (
        <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/40">
          soon
        </span>
      )}
    </button>
  );
}

export default function ProfileMenu({
  userName,
  userEmail,
  realGeneration,
  onOpenPhoto,
  onScrollToSaved,
  onLogout,
}: {
  userName?: string;
  userEmail: string;
  realGeneration: boolean;
  onOpenPhoto: () => void;
  onScrollToSaved: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (userName || userEmail || "?").charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const act = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm font-bold text-white ring-1 ring-white/15 transition hover:brightness-110"
        aria-label="Profile menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-base font-bold">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {userName || "Your account"}
              </div>
              <div className="truncate text-xs text-white/50">{userEmail}</div>
            </div>
          </div>

          <div className="border-b border-white/10 p-3">
            {realGeneration ? (
              <div className="rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200">
                ✨ Real-face mode is on
              </div>
            ) : (
              <div className="rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-xs leading-snug text-amber-200/90">
                🎭 Demo mode — styles a model.
                <span className="block text-amber-200/55">
                  Add a billed Gemini key for your real face.
                </span>
              </div>
            )}
          </div>

          <nav className="p-1.5">
            <MenuItem icon="📸" label="Your photo" onClick={act(onOpenPhoto)} />
            <MenuItem
              icon="🤍"
              label="Saved looks"
              onClick={act(onScrollToSaved)}
            />
            <MenuItem icon="🎨" label="Style profile" soon />
            <MenuItem icon="🎁" label="Invite & earn" soon />
            <MenuItem icon="⚙️" label="Settings" soon />
          </nav>

          <div className="border-t border-white/10 p-1.5">
            <MenuItem icon="⎋" label="Log out" onClick={act(onLogout)} danger />
          </div>
        </div>
      )}
    </div>
  );
}

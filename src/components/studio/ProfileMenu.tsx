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
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition duration-300",
        soon
          ? "cursor-default text-white/30"
          : danger
            ? "text-white/60 hover:text-red-300"
            : "text-white/75 hover:text-champagne",
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
  avatarUrl,
  onOpenPhoto,
  onScrollToSaved,
  onLogout,
}: {
  userName?: string;
  userEmail: string;
  realGeneration: boolean;
  avatarUrl?: string | null;
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
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-sm font-bold text-white ring-1 ring-white/10 transition duration-300 hover:ring-champagne-deep/40"
        aria-label="Profile menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="You" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-ink/95 shadow-2xl shadow-black/60 ring-1 ring-white/[0.04] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-base font-bold">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="You" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {userName || "Your account"}
              </div>
              <div className="truncate text-xs text-white/45">{userEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3.5 py-2.5 text-[11px] uppercase tracking-[0.15em] text-white/40">
            <span
              className={`h-1.5 w-1.5 rounded-full ${realGeneration ? "bg-champagne" : "bg-amber-300/70"}`}
            />
            {realGeneration ? "Real-face mode on" : "Demo mode · model only"}
          </div>

          <nav className="divide-y divide-white/[0.05] p-1.5">
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

          <div className="border-t border-white/[0.06] p-1.5">
            <MenuItem icon="⎋" label="Log out" onClick={act(onLogout)} danger />
          </div>
        </div>
      )}
    </div>
  );
}

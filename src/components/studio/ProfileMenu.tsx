"use client";

import { useEffect, useRef, useState } from "react";

function MenuItem({
  label,
  onClick,
  soon,
  danger,
}: {
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
        "flex w-full items-center gap-3 px-3 py-2.5 text-sm transition duration-300",
        soon
          ? "cursor-default text-ink-30"
          : danger
            ? "text-ink-60 hover:text-vermilion"
            : "text-ink-60 hover:text-ink",
      ].join(" ")}
    >
      <span>{label}</span>
      {soon && (
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-ink-30">
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
  const [night, setNight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (userName || userEmail || "?").charAt(0).toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("looksy:theme");
    const isNight = saved === "night";
    setNight(isNight);
    document.documentElement.dataset.theme = isNight ? "night" : "";
  }, []);

  const toggleNight = () => {
    setNight((prev) => {
      const next = !prev;
      document.documentElement.dataset.theme = next ? "night" : "";
      localStorage.setItem("looksy:theme", next ? "night" : "");
      return next;
    });
  };

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
        className="grid h-9 w-9 place-items-center overflow-hidden border border-ink/20 bg-paper font-display text-sm text-ink transition duration-300 hover:border-ink"
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
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden border border-ink/15 bg-paper">
          <div className="flex items-center gap-3 border-b border-ink/10 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border border-ink/20 bg-paper font-display text-base text-ink">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="You" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink">
                {userName || "Your account"}
              </div>
              <div className="truncate text-xs text-ink-30">{userEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-ink/10 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-ink-30">
            <span
              className={`h-1.5 w-1.5 rounded-full ${realGeneration ? "bg-vermilion" : "bg-ink-30"}`}
            />
            {realGeneration ? "Real-face mode on" : "Demo mode · model only"}
          </div>

          <nav className="divide-y divide-ink/10 px-1.5 py-1">
            <MenuItem label="Your photo" onClick={act(onOpenPhoto)} />
            <MenuItem label="Saved looks" onClick={act(onScrollToSaved)} />
            <MenuItem label={night ? "Day Edition" : "Night Edition"} onClick={toggleNight} />
            <MenuItem label="Style profile" soon />
            <MenuItem label="Invite & earn" soon />
            <MenuItem label="Settings" soon />
          </nav>

          <div className="border-t border-ink/10 px-1.5 py-1">
            <MenuItem label="Log out" onClick={act(onLogout)} danger />
          </div>
        </div>
      )}
    </div>
  );
}

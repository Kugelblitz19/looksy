"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** A real "Install app" affordance — captures Chrome's beforeinstallprompt so
 *  users can add Looksy to their home screen without digging in the menu.
 *  Hidden when already installed or previously dismissed. */
export default function InstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("looksy:install-dismissed")) {
      setHidden(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!evt || hidden) return null;

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice.catch(() => undefined);
    setEvt(null);
  }

  function dismiss() {
    localStorage.setItem("looksy:install-dismissed", "1");
    setHidden(true);
  }

  return (
    <div className="animate-fade-up fixed bottom-4 right-4 z-[80] flex items-center gap-3 border border-ink/15 bg-paper px-4 py-3 text-ink shadow-[0_20px_60px_-25px_rgba(0,0,0,0.5)]">
      <span className="flex items-center gap-2 text-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-vermilion" aria-hidden />
        Install Looksy
      </span>
      <button
        type="button"
        onClick={install}
        className="bg-vermilion px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-paper transition hover:bg-vermilion-ink"
      >
        Add app
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-ink-30 transition hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";

/** Registers the service worker so Looksy is installable on Android (and the
 *  base for a Play Store TWA). No-ops where service workers aren't supported. */
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

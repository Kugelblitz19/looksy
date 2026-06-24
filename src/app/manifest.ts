import type { MetadataRoute } from "next";

/** Installable PWA manifest — lets Looksy run full-screen from the home screen
 *  and is the base a Play Store TWA wraps. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Looksy — The Issue",
    short_name: "Looksy",
    description:
      "Upload a selfie, pick a vibe, get a cover so good it's basically a personality — instantly shoppable.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E0B08",
    theme_color: "#0E0B08",
    categories: ["shopping", "lifestyle", "photo"],
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

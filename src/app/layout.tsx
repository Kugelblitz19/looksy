import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, Newsreader, Azeret_Mono } from "next/font/google";
import Pressroom from "@/components/Pressroom";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/InstallPrompt";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Fraunces — the high-contrast bracketed serif masthead. Instant Condé-Nast.
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Inter Tight — quiet, neutral UI chrome so the serif carries the personality.
const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Newsreader — editorial running copy: captions, credits, the style note.
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

// Azeret Mono — the ticket-stub texture, reserved for issue/plate numbers + prices.
const mono = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020",
  ),
  title: "Looksy — The Issue",
  description:
    "Upload a selfie, pick a vibe, get a cover so good it's basically a personality — instantly shoppable. An AI fashion weekly, shot in India.",
  openGraph: {
    title: "Looksy — The Issue",
    description:
      "Your selfie. This week's cover. One tap to post, one tap to cop. An AI fashion weekly.",
    siteName: "Looksy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Looksy — The Issue",
    description: "Your selfie. This week's cover. One tap to post, one tap to cop.",
  },
  appleWebApp: {
    capable: true,
    title: "Looksy",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBFAF7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <PWARegister />
        <Pressroom />
        {children}
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}

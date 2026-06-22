import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// High-contrast editorial serif for display headings (the Studio's magazine feel).
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020",
  ),
  title: "Looksy — See yourself in any look",
  description:
    "Upload a selfie, pick a vibe, describe a look — and see AI-generated photos of you wearing it. Instantly shoppable.",
  openGraph: {
    title: "Looksy — See yourself in any look",
    description:
      "Your selfie, restyled by AI — and instantly shoppable. Try on streetwear, old money, party, festive and more.",
    siteName: "Looksy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Looksy — See yourself in any look",
    description: "Your selfie, restyled by AI — and instantly shoppable.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

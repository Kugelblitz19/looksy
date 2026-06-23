import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

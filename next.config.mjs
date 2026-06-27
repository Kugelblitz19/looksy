/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Content-Security-Policy. The app only talks to itself + Supabase from the
// browser (next/font self-hosts fonts; demo images come back as data: URLs;
// Pollinations/Gemini are fetched server-side). Dev/HMR additionally needs
// 'unsafe-eval' and a websocket, so those are added only outside production.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com${isProd ? "" : " ws: http://localhost:*"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig = {
  // Allow larger payloads for selfie uploads sent to the generate route.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  // Security headers on every response (clickjacking, MIME-sniffing, referrer
  // leakage, a tuned CSP, and HSTS in production).
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Serve the Android TWA verification file from an env-driven route, so the
  // Play Store app can be verified without a code change (just set env vars).
  async rewrites() {
    return [
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
    ];
  },
  // Don't let the dev watcher recompile when local data files write.
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: ["**/node_modules/**", "**/data/**"],
    };
    return config;
  },
};

export default nextConfig;

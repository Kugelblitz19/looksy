/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger payloads for selfie uploads sent to the generate route.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  // Serve the Android TWA verification file from an env-driven route, so the
  // Play Store app can be verified without a code change (just set env vars).
  async rewrites() {
    return [
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
    ];
  },
  // Don't let the dev watcher recompile when the file-based user store writes.
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: ["**/node_modules/**", "**/data/**"],
    };
    return config;
  },
};

export default nextConfig;

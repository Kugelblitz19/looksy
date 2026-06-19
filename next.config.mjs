/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger payloads for selfie uploads sent to the generate route.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
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

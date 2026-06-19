/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger payloads for selfie uploads sent to the generate route.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecom/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Soft-nav must not reuse stale RSC for dynamic admin pages (dashboard counts)
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;

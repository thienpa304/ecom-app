import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecom/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;

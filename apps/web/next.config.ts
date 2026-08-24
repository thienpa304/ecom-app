import type { NextConfig } from "next";

const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(
    "/",
  )[0] || "mldnnchxmthiqecqmdml.supabase.co";

// Media now lives in Cloudflare R2. Supabase stays allowlisted until every
// stored URL has been repointed (see scripts/rewrite-media-urls.mjs).
const mediaHost =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/^https?:\/\//, "").split(
    "/",
  )[0] || "img.dienmaylocphatdat.vn";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecom/shared"],
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.png", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: mediaHost },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;

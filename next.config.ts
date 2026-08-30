import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // 15 days — cuts down on repeat re-transformations of the same poster.
    minimumCacheTTL: 60 * 60 * 24 * 15,
    // webp only: skip the pricier avif encode, keep transformations to one format.
    formats: ["image/webp"],
  },
};

export default nextConfig;

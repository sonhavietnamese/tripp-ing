import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Next.js image optimization to avoid problematic redirects
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

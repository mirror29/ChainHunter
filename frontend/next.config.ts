import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Next.js for Vercel deployment
  output: "standalone",

  // Disable image optimization since Cloudflare Pages doesn't support it natively
  images: {
    unoptimized: true,
  },

  // Disable CSS optimization for Cloudflare compatibility
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;

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

  // Add custom headers for Cloudflare
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
    ];
  },

  // 添加API路由重写
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;

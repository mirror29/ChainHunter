import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  // rewrites: async () => {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: process.env.NEXT_PUBLIC_API_URL + "/:path*",
  //     },
  //   ];
  // },

  // 禁用优化CSS，避免critters相关问题
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;

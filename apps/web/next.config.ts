import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ai-workforce-api.vercel.app/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;

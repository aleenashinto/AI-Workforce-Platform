import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/platform/dashboard",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ai-workforce-api-pi.vercel.app/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;

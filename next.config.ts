import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error Next.js 15 dev origins issue
    allowedDevOrigins: ["*", "localhost:3000"],
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "viziune-urbana-ploiesti.vercel.app",
          },
        ],
        destination: "https://www.viziuneurbanaploiesti.ro/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

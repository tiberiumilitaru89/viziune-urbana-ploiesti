import type { NextConfig } from "next";
import path from "path";

function resolveSupabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.hostname : null;
  } catch {
    return null;
  }
}

const supabaseHostname = resolveSupabaseHostname();

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  ...(supabaseHostname
    ? [
        {
          protocol: "https" as const,
          hostname: supabaseHostname,
          pathname: "/storage/v1/object/public/proiecte/**",
        },
        {
          protocol: "https" as const,
          hostname: supabaseHostname,
          pathname: "/storage/v1/object/public/Proiecte/**",
        },
      ]
    : []),
  {
    protocol: "https",
    hostname: "viziuneurbanaploiesti.ro",
  },
  {
    protocol: "https",
    hostname: "www.viziuneurbanaploiesti.ro",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "0",
          },
        ],
      },
    ];
  },
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

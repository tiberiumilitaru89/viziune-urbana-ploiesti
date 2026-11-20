import { NextRequest, NextResponse } from "next/server";

const PUBLIC_HEALTH_PATHS = new Set(["/api/healthz", "/api/readyz"]);
const SAFE_CORRELATION_ID_REGEX = /^[A-Za-z0-9._-]{1,64}$/;

function resolveCorrelationId(req: NextRequest): string {
  const incoming = req.headers.get("x-correlation-id")?.trim();
  if (incoming && SAFE_CORRELATION_ID_REGEX.test(incoming)) {
    return incoming;
  }
  return crypto.randomUUID();
}

function resolveSupabaseConnectOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.origin : null;
  } catch {
    return null;
  }
}

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-XSS-Protection", "0");
}

export function proxy(request: NextRequest) {
  const correlationId = resolveCorrelationId(request);
  const pathname = request.nextUrl.pathname;

  // Rutele /api/healthz și /api/readyz sunt întotdeauna publice
  if (PUBLIC_HEALTH_PATHS.has(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-correlation-id", correlationId);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applySecurityHeaders(response);
    response.headers.set("X-Correlation-ID", correlationId);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const isDev = process.env.NODE_ENV === "development";
  const hostHeader = (request.headers.get("host") || "").toLowerCase();
  if (
    !isDev &&
    !pathname.startsWith("/api/") &&
    (hostHeader === "viziuneurbanaploiesti.ro" ||
      hostHeader === "viziune-urbana-ploiesti.vercel.app")
  ) {
    const canonicalUrl = new URL(
      `${pathname}${request.nextUrl.search}`,
      "https://www.viziuneurbanaploiesti.ro"
    );
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const supabaseOrigin = resolveSupabaseConnectOrigin();

  // În development permitem 'unsafe-eval' pentru Next.js Fast Refresh & HMR
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'nonce-${nonce}'`
    : `'self' 'nonce-${nonce}'`;

  const connectSrc = supabaseOrigin ? `connect-src 'self' ${supabaseOrigin}` : "connect-src 'self'";

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: https: blob:",
    connectSrc,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ];
  const cspHeader = `${cspDirectives.join("; ")};`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-correlation-id", correlationId);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("X-Correlation-ID", correlationId);
  response.headers.set("Content-Security-Policy", cspHeader);
  applySecurityHeaders(response);

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/formular-230")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Vary", "Cookie, Authorization");
  }

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.svg|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

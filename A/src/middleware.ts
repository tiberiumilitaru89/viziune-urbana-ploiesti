import { NextRequest, NextResponse } from "next/server";

const PUBLIC_HEALTH_PATHS = new Set(["/api/healthz", "/api/readyz"]);

export function middleware(request: NextRequest) {
  const correlationId =
    request.headers.get("x-correlation-id")?.trim() || crypto.randomUUID();

  // Rutele /api/healthz și /api/readyz sunt întotdeauna publice
  if (PUBLIC_HEALTH_PATHS.has(request.nextUrl.pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-correlation-id", correlationId);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("X-Correlation-ID", correlationId);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const isDev = process.env.NODE_ENV === "development";
  const hostHeader = (request.headers.get("host") || "").toLowerCase();
  if (
    !isDev &&
    !request.nextUrl.pathname.startsWith("/api/") &&
    (hostHeader === "viziuneurbanaploiesti.ro" ||
      hostHeader === "viziune-urbana-ploiesti.vercel.app")
  ) {
    const canonicalUrl = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      "https://www.viziuneurbanaploiesti.ro"
    );
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // În development permitem 'unsafe-eval' pentru Next.js Fast Refresh & HMR
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'nonce-${nonce}'`
    : `'self' 'nonce-${nonce}'`;

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    font-src 'self' data:;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

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
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Interceptăm rutele de pagini și excludem fișierele statice de bundle / media
     */
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

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { sanitizeLogValue } from "@/lib/security-utils";

export { sanitizeLogValue };

export function getCorrelationId(req?: Request): string {
  const incoming = req?.headers.get("x-correlation-id")?.trim();
  if (incoming && incoming.length > 0 && incoming.length <= 128) {
    return incoming;
  }
  return crypto.randomUUID();
}

export function logStructured(
  level: "info" | "warn" | "error",
  event: string,
  meta: Record<string, unknown> = {}
): void {
  const traceId =
    (typeof meta.correlationId === "string" && meta.correlationId) ||
    (typeof meta.trace_id === "string" && meta.trace_id) ||
    crypto.randomUUID();

  const sanitizedMeta = sanitizeLogValue(meta) as Record<string, unknown>;
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "viziune-urbana-ploiesti",
    trace_id: traceId,
    event,
    ...sanitizedMeta,
  });

  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

export type ProblemDetailsOptions = {
  status: number;
  title: string;
  detail: string;
  instance?: string;
  type?: string;
  correlationId?: string;
  extra?: Record<string, unknown>;
};

/**
 * Generează un răspuns HTTP de eroare conform RFC 7807 (application/problem+json),
 * păstrând simultan câmpurile `success: false`, `error` și `message` pentru
 * compatibilitate 100% cu frontend-ul existent.
 */
export function createProblemResponse(opts: ProblemDetailsOptions): NextResponse {
  const correlationId = opts.correlationId || crypto.randomUUID();
  const body = {
    type: opts.type || `https://viziuneurbanaploiesti.ro/probs/http-${opts.status}`,
    title: opts.title,
    status: opts.status,
    detail: opts.detail,
    instance: opts.instance || "/api",
    correlationId,
    success: false,
    error: opts.detail,
    message: opts.detail,
    ...(opts.extra || {}),
  };

  return new NextResponse(JSON.stringify(body), {
    status: opts.status,
    headers: {
      "Content-Type": "application/problem+json; charset=utf-8",
      "X-Correlation-ID": correlationId,
      "Cache-Control": "no-store",
    },
  });
}

export function withCorrelationHeader<T>(res: NextResponse<T>, correlationId: string): NextResponse<T> {
  res.headers.set("X-Correlation-ID", correlationId);
  return res;
}

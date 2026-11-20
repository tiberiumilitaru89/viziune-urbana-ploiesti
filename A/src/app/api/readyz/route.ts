import { NextResponse } from "next/server";
import { getCorrelationId, logStructured } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";

const READYZ_TIMEOUT_MS = 3_000;

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), READYZ_TIMEOUT_MS);

  try {
    const queryPromise = supabaseAdmin
      .from("metrics")
      .select("id")
      .limit(1)
      .abortSignal(controller.signal);

    const { error } = await queryPromise;
    if (error) {
      logStructured("warn", "readyz_db_check_failed", { correlationId });
      return NextResponse.json(
        {
          status: "degraded",
          service: "viziune-urbana-ploiesti",
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
            "X-Correlation-ID": correlationId,
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: "ready",
        service: "viziune-urbana-ploiesti",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Correlation-ID": correlationId,
        },
      }
    );
  } catch {
    logStructured("warn", "readyz_db_check_exception", { correlationId });
    return NextResponse.json(
      {
        status: "degraded",
        service: "viziune-urbana-ploiesti",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Correlation-ID": correlationId,
        },
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

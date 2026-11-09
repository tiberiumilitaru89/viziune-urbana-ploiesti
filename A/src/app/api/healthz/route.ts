import { NextResponse } from "next/server";
import { getCorrelationId } from "@/lib/logger";

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  return NextResponse.json(
    {
      status: "ok",
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
}

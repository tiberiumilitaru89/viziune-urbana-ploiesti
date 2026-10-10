import { NextResponse } from "next/server";
import { getCachedPublicData } from "@/lib/publicServerCache";

// Revalidare la nivel Edge CDN la fiecare 60 de secunde
export const revalidate = 60;

export async function GET() {
  try {
    const { data, cached, degraded } = await getCachedPublicData();

    return NextResponse.json(
      {
        success: true,
        data,
        cached,
        ...(degraded ? { degraded: true } : {}),
      },
      {
        headers: {
          "Cache-Control": degraded
            ? "public, s-maxage=30, stale-while-revalidate=60"
            : "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Eroare la încărcarea datelor publice" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { 
  fetchPublicAssociations, 
  fetchPartners, 
  fetchProjects, 
  fetchMetrics, 
  fetchOngConfig 
} from "@/lib/db";

// Revalidare la fiecare 30 de secunde pe Vercel (Edge Cache)
export const revalidate = 30;

export async function GET() {
  try {
    const [associations, partners, projects, metrics, ongConfig] = await Promise.all([
      fetchPublicAssociations(),
      fetchPartners(false),
      fetchProjects(false, true), // Doar proiectele finalizate și ne-arhivate sunt expuse public pe site
      fetchMetrics(),
      fetchOngConfig(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          associations,
          partners,
          projects,
          metrics,
          ongConfig,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la încărcarea datelor publice" },
      { status: 500 }
    );
  }
}

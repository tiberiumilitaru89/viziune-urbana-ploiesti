import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/auth";
import { 
  fetchAssociations, 
  saveAssociation, 
  archiveAssociation,
  fetchPartners,
  savePartner,
  archivePartner,
  fetchProjects,
  saveProject,
  archiveProject,
  fetchMetrics,
  saveMetrics,
  fetchOngConfig,
  saveOngConfig,
  fetchPartnerApplications,
  updatePartnerApplicationStatus,
  fetchDonations,
  updateDonationStatus,
} from "@/lib/db";

export async function GET(req: Request) {
  // BARIERĂ INVIOLABILĂ DE SECURITATE: Verificare sesiune admin
  if (!isRequestAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Acces neautorizat. Sesiune administrativă invalidă sau expirată." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const [associations, partners, projects, metrics, ongConfig, partnerApplications, donations] = await Promise.all([
      fetchAssociations(includeArchived),
      fetchPartners(includeArchived),
      fetchProjects(includeArchived),
      fetchMetrics(),
      fetchOngConfig(),
      fetchPartnerApplications(),
      fetchDonations(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        associations,
        partners,
        projects,
        metrics,
        ongConfig,
        partnerApplications,
        donations,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la încărcarea datelor din baza de date" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // BARIERĂ INVIOLABILĂ DE SECURITATE: Verificare sesiune admin
  if (!isRequestAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Acces neautorizat. Sesiune administrativă invalidă sau expirată." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
    }

    let success = false;

    switch (action) {
      case "save_association":
        success = await saveAssociation(payload);
        break;
      case "archive_association":
        success = await archiveAssociation(payload.id);
        break;
      case "save_partner":
        success = await savePartner(payload);
        break;
      case "archive_partner":
        success = await archivePartner(payload.id);
        break;
      case "save_project":
        success = await saveProject(payload);
        break;
      case "archive_project":
        success = await archiveProject(payload.id);
        break;
      case "save_metrics":
        success = await saveMetrics(payload);
        break;
      case "save_ong_config":
        success = await saveOngConfig(payload);
        break;
      case "update_partner_application_status":
        success = await updatePartnerApplicationStatus(payload.id, payload.status);
        break;
      case "update_donation_status":
        success = await updateDonationStatus(payload.id, payload.status);
        break;
      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la procesarea cererii administrative" },
      { status: 500 }
    );
  }
}

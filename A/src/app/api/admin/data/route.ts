import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/auth";
import { AuditRequest } from "@/lib/types";
import { 
  fetchAssociations, 
  saveAssociation, 
  archiveAssociation,
  hardDeleteAssociation,
  fetchPartners,
  savePartner,
  archivePartner,
  hardDeletePartner,
  fetchProjects,
  saveProject,
  archiveProject,
  hardDeleteProject,
  fetchMetrics,
  saveMetrics,
  fetchOngConfig,
  saveOngConfig,
  fetchPartnerApplications,
  updatePartnerApplicationStatus,
  hardDeletePartnerApplication,
  fetchDonations,
  updateDonationStatus,
  hardDeleteDonation,
  deleteStorageFile,
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

import { z } from "zod";

const saveAssociationSchema = z.object({
  id: z.string().trim().min(1).max(100),
  dosarNumber: z.string().trim().max(50).optional(),
  name: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(5).max(30),
  building: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(300),
  neighborhood: z.string().trim().max(100).optional(),
  problem: z.string().trim().min(1).max(2000),
  status: z.enum(["nou", "in_evaluare", "acceptat", "respins", "finalizat"]),
  formsCollected: z.number().int().min(0).max(100000),
  formsTarget: z.number().int().min(1).max(100000),
  fundsCollected: z.number().int().min(0).max(100000000),
  fundsTarget: z.number().int().min(0).max(100000000),
  createdAt: z.string().optional(),
});

const idPayloadSchema = z.object({
  id: z.string().trim().min(1).max(100),
});

const savePartnerSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(200),
  category: z.enum(["executie", "practica", "comunitate", "academic"]),
  description: z.string().trim().min(1).max(3000),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  badgeText: z.string().trim().max(100).optional().or(z.literal("")),
});

const projectPhotoSchema = z.object({
  id: z.string().trim().min(1).max(100),
  url: z.string().trim().min(1).max(1000),
  caption: z.string().trim().max(500).optional(),
  stage: z.enum(["inainte", "in_lucru", "dupa"]),
  createdAt: z.string().optional(),
});

const saveProjectSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(250),
  description: z.string().trim().min(1).max(3000),
  status: z.enum(["in_curs", "finalizat"]),
  beforeImage: z.string().trim().min(1).max(500),
  afterImage: z.string().trim().min(1).max(500),
  completionDate: z.string().trim().min(1).max(100),
  neighborhood: z.string().trim().max(100).optional(),
  gallery: z.array(projectPhotoSchema).optional().default([]),
});

const saveMetricsSchema = z.object({
  totalFormsCollected: z.number().int().min(0).max(1000000),
  totalFormsTarget: z.number().int().min(0).max(1000000),
  totalFundsCollectedRon: z.number().int().min(0).max(1000000000),
  totalFundsTargetRon: z.number().int().min(0).max(1000000000),
  activeAssociationsCount: z.number().int().min(0).max(10000),
});

const saveOngConfigSchema = z.object({
  name: z.string().trim().min(1).max(200),
  cif: z.string().trim().min(2).max(50),
  iban: z.string().trim().min(10).max(50),
  bank: z.string().trim().min(2).max(100),
  percentage: z.string().trim().min(1).max(20),
  distributeYears: z.number().int().min(1).max(10),
});

const updatePartnerAppSchema = z.object({
  id: z.string().trim().min(1).max(100),
  status: z.enum(["nou", "contactat", "arhivat"]),
});

const updateDonationStatusSchema = z.object({
  id: z.string().trim().min(1).max(100),
  status: z.enum(["inregistrat", "confirmat", "finalizat", "arhivat"]),
});

const hardDeletePhotoSchema = z.object({
  projectId: z.string().trim().min(1).max(100),
  photoId: z.string().trim().min(1).max(100),
  photoUrl: z.string().trim().min(1).max(1000),
});

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
      case "save_association": {
        const validated = saveAssociationSchema.parse(payload);
        const assocToSave: AuditRequest = {
          ...validated,
          createdAt: validated.createdAt || new Date().toISOString(),
        };
        success = await saveAssociation(assocToSave);
        break;
      }
      case "archive_association": {
        const validated = idPayloadSchema.parse(payload);
        success = await archiveAssociation(validated.id);
        break;
      }
      case "save_partner": {
        const validated = savePartnerSchema.parse(payload);
        success = await savePartner(validated);
        break;
      }
      case "archive_partner": {
        const validated = idPayloadSchema.parse(payload);
        success = await archivePartner(validated.id);
        break;
      }
      case "save_project": {
        const validated = saveProjectSchema.parse(payload);
        success = await saveProject(validated);
        break;
      }
      case "archive_project": {
        const validated = idPayloadSchema.parse(payload);
        success = await archiveProject(validated.id);
        break;
      }
      case "save_metrics": {
        const validated = saveMetricsSchema.parse(payload);
        success = await saveMetrics(validated);
        break;
      }
      case "save_ong_config": {
        const validated = saveOngConfigSchema.parse(payload);
        success = await saveOngConfig(validated);
        break;
      }
      case "update_partner_application_status": {
        const validated = updatePartnerAppSchema.parse(payload);
        success = await updatePartnerApplicationStatus(validated.id, validated.status);
        break;
      }
      case "update_donation_status": {
        const validated = updateDonationStatusSchema.parse(payload);
        success = await updateDonationStatus(validated.id, validated.status as "inregistrat" | "confirmat" | "finalizat");
        break;
      }
      case "hard_delete_association": {
        const validated = idPayloadSchema.parse(payload);
        success = await hardDeleteAssociation(validated.id);
        break;
      }
      case "hard_delete_partner": {
        const validated = idPayloadSchema.parse(payload);
        success = await hardDeletePartner(validated.id);
        break;
      }
      case "hard_delete_project": {
        const validated = idPayloadSchema.parse(payload);
        success = await hardDeleteProject(validated.id);
        break;
      }
      case "hard_delete_partner_application": {
        const validated = idPayloadSchema.parse(payload);
        success = await hardDeletePartnerApplication(validated.id);
        break;
      }
      case "hard_delete_donation": {
        const validated = idPayloadSchema.parse(payload);
        success = await hardDeleteDonation(validated.id);
        break;
      }
      case "hard_delete_photo": {
        const validated = hardDeletePhotoSchema.parse(payload);
        if (validated.photoUrl) {
          await deleteStorageFile(validated.photoUrl);
        }
        success = true;
        break;
      }
      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: `Validare eșuată: ${error.errors.map((e) => e.message).join(", ")}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Eroare la procesarea cererii administrative" },
      { status: 500 }
    );
  }
}

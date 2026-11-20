import { NextResponse } from "next/server";
import { z } from "zod";
import { isRequestAuthenticatedAsync } from "@/lib/auth";
import { AuditRequest } from "@/lib/types";
import { invalidatePublicDataServerCache } from "@/lib/publicServerCache";
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readJsonWithLimit,
} from "@/lib/request-guard";
import {
  validateSafeMediaOrLinkUrl,
  verifySameOriginRequest,
} from "@/lib/security-utils";
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
  deleteProjectPhotoFromStorage,
} from "@/lib/db";
import {
  applyPrivateNoStoreHeaders,
  createProblemResponse,
  getCorrelationId,
  logStructured,
  withCorrelationHeader,
} from "@/lib/logger";

const MAX_ADMIN_DATA_BODY_BYTES = 262_144;

const adminActionEnvelopeSchema = z
  .object({
    action: z.string().trim().min(1).max(80),
    payload: z.unknown(),
  })
  .strict();

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  if (!(await isRequestAuthenticatedAsync(req))) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 401,
        title: "Unauthorized",
        detail: "Acces neautorizat. Sesiune administrativă invalidă sau expirată.",
        instance: "/api/admin/data",
        correlationId,
      })
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const [associations, partners, projects, metrics, ongConfig, partnerApplications, donations] =
      await Promise.all([
        fetchAssociations(includeArchived),
        fetchPartners(includeArchived),
        fetchProjects(includeArchived),
        fetchMetrics(),
        fetchOngConfig(),
        fetchPartnerApplications(),
        fetchDonations(),
      ]);

    return applyPrivateNoStoreHeaders(
      withCorrelationHeader(
        NextResponse.json({
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
        }),
        correlationId
      )
    );
  } catch (err) {
    logStructured("error", "admin_data_get_failed", {
      correlationId,
      error: err instanceof Error ? err.message : "unknown_error",
    });
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la încărcarea datelor din baza de date",
        instance: "/api/admin/data",
        correlationId,
      })
    );
  }
}

const saveAssociationSchema = z
  .object({
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
    createdAt: z.string().max(100).optional(),
  })
  .strict();

const idPayloadSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
  })
  .strict();

const savePartnerSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(150),
    role: z.string().trim().min(1).max(200),
    category: z.enum(["executie", "practica", "comunitate", "academic"]),
    description: z.string().trim().min(1).max(3000),
    logoUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || validateSafeMediaOrLinkUrl(v), "URL logo invalid")
      .optional()
      .or(z.literal("")),
    website: z
      .string()
      .trim()
      .max(500)
      .refine(
        (v) => !v || validateSafeMediaOrLinkUrl(v, { allowRelative: false }),
        "URL website invalid"
      )
      .optional()
      .or(z.literal("")),
    badgeText: z.string().trim().max(100).optional().or(z.literal("")),
  })
  .strict();

const projectPhotoSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    url: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .refine((v) => validateSafeMediaOrLinkUrl(v), "URL fotografie invalid"),
    caption: z.string().trim().max(500).optional(),
    stage: z.enum(["inainte", "in_lucru", "dupa"]),
    createdAt: z.string().max(100).optional(),
  })
  .strict();

const saveProjectSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(250),
    description: z.string().trim().min(1).max(3000),
    status: z.enum(["in_curs", "finalizat"]),
    beforeImage: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((v) => validateSafeMediaOrLinkUrl(v), "URL imagine 'Înainte' invalid"),
    afterImage: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((v) => validateSafeMediaOrLinkUrl(v), "URL imagine 'După' invalid"),
    completionDate: z.string().trim().min(1).max(100),
    neighborhood: z.string().trim().max(100).optional(),
    gallery: z.array(projectPhotoSchema).max(200).optional().default([]),
    isArchived: z.boolean().optional(),
  })
  .strict();

const saveMetricsSchema = z
  .object({
    totalFormsCollected: z.number().int().min(0).max(1000000),
    totalFormsTarget: z.number().int().min(0).max(1000000),
    totalFundsCollectedRon: z.number().int().min(0).max(1000000000),
    totalFundsTargetRon: z.number().int().min(0).max(1000000000),
    activeAssociationsCount: z.number().int().min(0).max(10000),
  })
  .strict();

const saveOngConfigSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    cif: z.string().trim().min(2).max(50),
    iban: z.string().trim().min(10).max(50),
    bank: z.string().trim().min(2).max(100),
    percentage: z.string().trim().min(1).max(20),
    distributeYears: z.number().int().min(1).max(10),
  })
  .strict();

const updatePartnerAppSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    status: z.enum(["nou", "contactat", "arhivat"]),
  })
  .strict();

const updateDonationStatusSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    status: z.enum(["inregistrat", "confirmat", "finalizat", "arhivat"]),
  })
  .strict();

const hardDeletePhotoSchema = z
  .object({
    projectId: z.string().trim().min(1).max(100),
    photoId: z.string().trim().min(1).max(100),
    photoUrl: z.string().trim().min(1).max(1000),
  })
  .strict();

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const originCheck = verifySameOriginRequest(req);
  if (!originCheck.allowed) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 403,
        title: "Forbidden",
        detail: "Cerere respinsă: origine invalidă (protecție CSRF).",
        instance: "/api/admin/data",
        correlationId,
      })
    );
  }

  if (!(await isRequestAuthenticatedAsync(req))) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 401,
        title: "Unauthorized",
        detail: "Acces neautorizat. Sesiune administrativă invalidă sau expirată.",
        instance: "/api/admin/data",
        correlationId,
      })
    );
  }

  try {
    const rawBody = await readJsonWithLimit(req, MAX_ADMIN_DATA_BODY_BYTES);
    const { action, payload } = adminActionEnvelopeSchema.parse(rawBody);

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
        success = await updateDonationStatus(validated.id, validated.status);
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
        success = await deleteProjectPhotoFromStorage(
          validated.projectId,
          validated.photoId,
          validated.photoUrl
        );
        break;
      }
      default:
        return applyPrivateNoStoreHeaders(
          createProblemResponse({
            status: 400,
            title: "Bad Request",
            detail: "Acțiune necunoscută",
            instance: "/api/admin/data",
            correlationId,
          })
        );
    }

    if (success) {
      invalidatePublicDataServerCache();
    }

    return applyPrivateNoStoreHeaders(
      withCorrelationHeader(NextResponse.json({ success }), correlationId)
    );
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 413,
          title: "Payload Too Large",
          detail: "Dimensiunea cererii depășește limita permisă.",
          instance: "/api/admin/data",
          correlationId,
        })
      );
    }
    if (error instanceof InvalidJsonBodyError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Bad Request",
          detail: "Corp JSON invalid.",
          instance: "/api/admin/data",
          correlationId,
        })
      );
    }
    if (error instanceof z.ZodError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Validation Error",
          detail: `Validare eșuată: ${error.issues.map((e) => e.message).join(", ")}`,
          instance: "/api/admin/data",
          correlationId,
        })
      );
    }
    logStructured("error", "admin_data_post_failed", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la procesarea cererii administrative",
        instance: "/api/admin/data",
        correlationId,
      })
    );
  }
}

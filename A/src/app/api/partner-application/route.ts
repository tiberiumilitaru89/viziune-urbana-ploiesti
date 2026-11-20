import { NextResponse, after } from "next/server";
import { z } from "zod";
import { savePartnerApplication } from "@/lib/db";
import { checkRateLimitAsync, getClientIp } from "@/lib/rateLimit";
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readJsonWithLimit,
} from "@/lib/request-guard";
import { verifySameOriginRequest } from "@/lib/security-utils";
import {
  createProblemResponse,
  getCorrelationId,
  logStructured,
  withCorrelationHeader,
} from "@/lib/logger";

const MAX_PARTNER_APP_BODY_BYTES = 16_384;

const partnerApplicationSchema = z
  .object({
    companyName: z.string().trim().min(2, "Introduceți numele firmei (minim 2 caractere)").max(200),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(
        /^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/,
        "Introduceți un număr de telefon valid (ex: 0722123456 sau 0244456789)"
      ),
    description: z
      .string()
      .trim()
      .min(5, "Introduceți o scurtă descriere a activității (minim 5 caractere)")
      .max(2000),
    hp_website: z.string().max(200).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const originCheck = verifySameOriginRequest(req);
    if (!originCheck.allowed) {
      return createProblemResponse({
        status: 403,
        title: "Forbidden",
        detail: "Cerere respinsă: origine invalidă.",
        instance: "/api/partner-application",
        correlationId,
      });
    }

    const ip = getClientIp(req);

    // Rate-Limiting distribuit pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = await checkRateLimitAsync(`partner-app:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return createProblemResponse({
        status: 429,
        title: "Too Many Requests",
        detail: `Prea multe cereri recente. Vă rugăm să așteptați ${waitMin} minute.`,
        instance: "/api/partner-application",
        correlationId,
      });
    }

    const body = await readJsonWithLimit(req, MAX_PARTNER_APP_BODY_BYTES);

    // Neutralizare Bot (Honeypot)
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as { hp_website?: unknown }).hp_website === "string" &&
      (body as { hp_website: string }).hp_website.trim().length > 0
    ) {
      return withCorrelationHeader(
        NextResponse.json({ success: true }, { status: 201 }),
        correlationId
      );
    }

    const validated = partnerApplicationSchema.parse(body);

    const saved = await savePartnerApplication({
      companyName: validated.companyName,
      phone: validated.phone,
      description: validated.description,
    });

    if (!saved) {
      logStructured("error", "partner_application_db_insert_failed", { correlationId });
      return createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la înregistrarea solicitării de parteneriat.",
        instance: "/api/partner-application",
        correlationId,
      });
    }

    after(async () => {
      try {
        const { sendAdminNotification } = await import("@/lib/email");
        await sendAdminNotification({
          type: "partner_application",
          subject: `Candidatură Partener Tehnic: ${validated.companyName}`,
          title: "Candidatură Nouă: Devino Partener Tehnic",
          fields: [
            { label: "Nume Firmă", value: validated.companyName },
            { label: "Telefon", value: validated.phone },
            { label: "Descriere Activitate", value: validated.description },
          ],
        }).catch(() =>
          logStructured("error", "partner_application_admin_email_failed", { correlationId })
        );
      } catch (err) {
        logStructured("error", "partner_application_after_task_failed", {
          correlationId,
          error: err instanceof Error ? err.message : "unknown_error",
        });
      }
    });

    return withCorrelationHeader(
      NextResponse.json({ success: true }, { status: 201 }),
      correlationId
    );
  } catch (error: unknown) {
    if (error instanceof PayloadTooLargeError) {
      return createProblemResponse({
        status: 413,
        title: "Payload Too Large",
        detail: "Dimensiunea cererii depășește limita permisă.",
        instance: "/api/partner-application",
        correlationId,
      });
    }
    if (error instanceof InvalidJsonBodyError) {
      return createProblemResponse({
        status: 400,
        title: "Bad Request",
        detail: "Corp JSON invalid.",
        instance: "/api/partner-application",
        correlationId,
      });
    }
    if (error instanceof z.ZodError) {
      return createProblemResponse({
        status: 400,
        title: "Validation Error",
        detail: error.issues[0]?.message || "Date invalide transmise.",
        instance: "/api/partner-application",
        correlationId,
      });
    }
    logStructured("error", "partner_application_unhandled_error", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return createProblemResponse({
      status: 500,
      title: "Internal Server Error",
      detail: "Eroare internă de server.",
      instance: "/api/partner-application",
      correlationId,
    });
  }
}

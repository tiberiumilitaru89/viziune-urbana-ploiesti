import crypto from "node:crypto";
import { NextResponse, after } from "next/server";
import { z } from "zod";
import { saveAssociation } from "@/lib/db";
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

const MAX_AUDIT_BODY_BYTES = 16_384;

const requestSchema = z
  .object({
    name: z.string().trim().min(3, "Numele este obligatoriu").max(150),
    phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu").max(30),
    email: z.string().trim().email("Adresă email invalidă").max(150).optional().or(z.literal("")),
    building: z
      .string()
      .trim()
      .min(3, "Numele asociației sau al blocului este obligatoriu")
      .max(200),
    address: z.string().trim().min(5, "Adresa completă este obligatorie").max(300),
    problem: z.string().trim().min(10, "Descrierea defecțiunii este obligatorie").max(2000),
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
        instance: "/api/audit-request",
        correlationId,
      });
    }

    const ip = getClientIp(req);

    // Rate-Limiting distribuit pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = await checkRateLimitAsync(`audit-req:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return createProblemResponse({
        status: 429,
        title: "Too Many Requests",
        detail: `Prea multe cereri recente. Vă rugăm să așteptați ${waitMin} minute.`,
        instance: "/api/audit-request",
        correlationId,
      });
    }

    const body = await readJsonWithLimit(req, MAX_AUDIT_BODY_BYTES);

    // Neutralizare Bot (Honeypot)
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as { hp_website?: unknown }).hp_website === "string" &&
      (body as { hp_website: string }).hp_website.trim().length > 0
    ) {
      return withCorrelationHeader(
        NextResponse.json(
          { success: true, id: `req-discarded-${crypto.randomUUID()}` },
          { status: 201 }
        ),
        correlationId
      );
    }

    const validated = requestSchema.parse(body);
    const id = `req-${crypto.randomUUID()}`;
    const year = new Date().getFullYear();
    const dosarNumber = `DOSAR-PH-${year}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const saved = await saveAssociation({
      id,
      dosarNumber,
      name: validated.name,
      phone: validated.phone,
      building: validated.building,
      address: validated.address,
      problem: validated.problem,
      status: "nou",
      formsCollected: 0,
      formsTarget: 40,
      fundsCollected: 0,
      fundsTarget: 12000,
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      logStructured("error", "audit_request_db_insert_failed", { correlationId });
      return createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la salvare în baza de date",
        instance: "/api/audit-request",
        correlationId,
      });
    }

    // Rândurile noi (`status: "nou"`) rămân nemoderate până la aprobarea administratorului;
    // cache-ul public nu se invalidează la înregistrarea cererii.

    after(async () => {
      try {
        const { sendAdminNotification, sendCitizenConfirmation } = await import("@/lib/email");
        await sendAdminNotification({
          type: "audit_request",
          subject: `[${dosarNumber}] Cerere Nouă de Înscriere Asociație: ${validated.building}`,
          title: `Cerere Nouă de Evaluare Tehnică — ${dosarNumber}`,
          fields: [
            { label: "Număr Dosar Registru", value: dosarNumber },
            { label: "Nume Contact", value: validated.name },
            { label: "Telefon", value: validated.phone },
            { label: "Email", value: validated.email || "Nespecificat" },
            { label: "Bloc / Asociație", value: validated.building },
            { label: "Adresă", value: validated.address },
            { label: "Descriere Problemă", value: validated.problem },
          ],
        }).catch(() =>
          logStructured("error", "audit_request_admin_email_failed", { correlationId })
        );

        if (validated.email) {
          const normalizedEmail = validated.email.trim().toLowerCase();
          const emailLimit = await checkRateLimitAsync(
            `email-confirm:${normalizedEmail}`,
            3,
            60 * 60 * 1000
          );
          if (emailLimit.allowed) {
            await sendCitizenConfirmation({
              toEmail: validated.email,
              recipientName: validated.name,
              registrationNumber: dosarNumber,
              type: "audit_request",
              details: [
                { label: "Număr Dosar Alocat", value: dosarNumber },
                { label: "Reprezentant Asociație", value: validated.name },
                { label: "Imobil / Bloc", value: validated.building },
                { label: "Adresă Înregistrată", value: validated.address },
                {
                  label: "Link Urmărire Live",
                  value: `https://www.viziuneurbanaploiesti.ro/status?q=${dosarNumber}`,
                },
                { label: "Data Înregistrării", value: new Date().toLocaleDateString("ro-RO") },
              ],
            }).catch(() =>
              logStructured("warn", "audit_request_citizen_email_failed", { correlationId })
            );
          } else {
            logStructured("warn", "audit_request_citizen_email_rate_limited", { correlationId });
          }
        }
      } catch (err) {
        logStructured("error", "audit_request_after_task_failed", {
          correlationId,
          error: err instanceof Error ? err.message : "unknown_error",
        });
      }
    });

    return withCorrelationHeader(
      NextResponse.json({ success: true, id, dosarNumber }, { status: 201 }),
      correlationId
    );
  } catch (error: unknown) {
    if (error instanceof PayloadTooLargeError) {
      return createProblemResponse({
        status: 413,
        title: "Payload Too Large",
        detail: "Dimensiunea cererii depășește limita permisă.",
        instance: "/api/audit-request",
        correlationId,
      });
    }
    if (error instanceof InvalidJsonBodyError) {
      return createProblemResponse({
        status: 400,
        title: "Bad Request",
        detail: "Corp JSON invalid.",
        instance: "/api/audit-request",
        correlationId,
      });
    }
    if (error instanceof z.ZodError) {
      return createProblemResponse({
        status: 400,
        title: "Validation Error",
        detail: error.issues[0]?.message || "Date invalide transmise.",
        instance: "/api/audit-request",
        correlationId,
      });
    }
    logStructured("error", "audit_request_unhandled_error", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return createProblemResponse({
      status: 500,
      title: "Internal Server Error",
      detail: "Eroare internă de server.",
      instance: "/api/audit-request",
      correlationId,
    });
  }
}

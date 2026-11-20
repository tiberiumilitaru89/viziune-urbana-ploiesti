import crypto from "node:crypto";
import { NextResponse, after } from "next/server";
import { z } from "zod";
import { DonationEntry } from "@/lib/types";
import { saveDonationDb } from "@/lib/db";
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

const MAX_DONATION_BODY_BYTES = 16_384;

const donationSchema = z
  .object({
    type: z.enum(["bani", "materiale"]),
    targetAssociationName: z.string().trim().max(200).optional(),
    amountRon: z
      .number()
      .int("Suma trebuie să fie un număr întreg (RON)")
      .positive("Suma oferită trebuie să fie strict pozitivă")
      .max(10_000_000, "Suma depășește limita permisă")
      .optional(),
    materialType: z.string().trim().max(200).optional(),
    quantity: z
      .number()
      .int("Cantitatea trebuie să fie un număr întreg")
      .positive("Cantitatea trebuie să fie strict pozitivă")
      .max(1_000_000, "Cantitatea depășește limita permisă")
      .optional(),
    unit: z.string().trim().max(50).optional(),
    companyOrName: z.string().trim().min(3, "Numele sau compania este obligatorie").max(200),
    phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu").max(20),
    email: z.string().trim().email("Email invalid").max(150).optional().or(z.literal("")),
    hp_website: z.string().max(200).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === "bani") {
      if (typeof data.amountRon !== "number" || Number.isNaN(data.amountRon) || data.amountRon <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountRon"],
          message: "Pentru sponsorizări financiare, suma în RON este obligatorie și trebuie să fie mai mare ca 0.",
        });
      }
    } else if (data.type === "materiale") {
      if (!data.materialType || data.materialType.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["materialType"],
          message: "Tipul materialelor donate este obligatoriu (ex: țeavă PPR, coturi, robineți, izolație).",
        });
      }
      if (typeof data.quantity !== "number" || Number.isNaN(data.quantity) || data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Cantitatea de materiale trebuie să fie un număr pozitiv mai mare ca 0.",
        });
      }
      if (!data.unit || data.unit.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: "Unitatea de măsură (ex: metri, bucăți, cutii) este obligatorie.",
        });
      }
    }
  });

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const originCheck = verifySameOriginRequest(req);
    if (!originCheck.allowed) {
      return createProblemResponse({
        status: 403,
        title: "Forbidden",
        detail: "Cerere respinsă: origine invalidă.",
        instance: "/api/donation",
        correlationId,
      });
    }

    const ip = getClientIp(req);

    // Rate-Limiting distribuit pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = await checkRateLimitAsync(`donation:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return createProblemResponse({
        status: 429,
        title: "Too Many Requests",
        detail: `Prea multe cereri recente. Vă rugăm să așteptați ${waitMin} minute.`,
        instance: "/api/donation",
        correlationId,
      });
    }

    const body = await readJsonWithLimit(req, MAX_DONATION_BODY_BYTES);

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
          { success: true, id: `don-discarded-${crypto.randomUUID()}` },
          { status: 201 }
        ),
        correlationId
      );
    }

    const validated = donationSchema.parse(body);

    const donation: DonationEntry = {
      id: `don-${crypto.randomUUID()}`,
      type: validated.type,
      targetAssociationName: validated.targetAssociationName,
      amountRon: validated.amountRon,
      materialType: validated.materialType,
      quantity: validated.quantity,
      unit: validated.unit,
      companyOrName: validated.companyOrName,
      phone: validated.phone,
      email: validated.email,
      status: "inregistrat",
      createdAt: new Date().toISOString(),
    };

    const savedInDb = await saveDonationDb(donation);
    if (!savedInDb) {
      logStructured("error", "donation_db_insert_failed", { correlationId });
      return createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la înregistrarea sponsorizării în baza de date.",
        instance: "/api/donation",
        correlationId,
      });
    }

    after(async () => {
      try {
        const { sendAdminNotification } = await import("@/lib/email");
        await sendAdminNotification({
          type: "donation",
          subject: `Sponsorizare Nouă (${validated.type.toUpperCase()}): ${validated.companyOrName}`,
          title: "Sponsorizare / Donație Înregistrată",
          fields: [
            { label: "Tip Sponsorizare", value: validated.type === "bani" ? "Financiară (Bani)" : "Materiale de Construcții" },
            { label: "Companie / Nume Donator", value: validated.companyOrName },
            { label: "Telefon", value: validated.phone },
            { label: "Email", value: validated.email || "Nespecificat" },
            { label: "Asociație Vizată", value: validated.targetAssociationName || "Fond General" },
            ...(validated.type === "bani"
              ? [{ label: "Sumă Oferită", value: `${validated.amountRon} RON` }]
              : [
                  { label: "Tip Material", value: validated.materialType },
                  { label: "Cantitate", value: `${validated.quantity} ${validated.unit}` },
                ]),
          ],
        }).catch(() =>
          logStructured("error", "donation_admin_email_failed", { correlationId })
        );
      } catch (err) {
        logStructured("error", "donation_after_task_failed", {
          correlationId,
          error: err instanceof Error ? err.message : "unknown_error",
        });
      }
    });

    return withCorrelationHeader(
      NextResponse.json({ success: true, id: donation.id }, { status: 201 }),
      correlationId
    );
  } catch (error: unknown) {
    if (error instanceof PayloadTooLargeError) {
      return createProblemResponse({
        status: 413,
        title: "Payload Too Large",
        detail: "Dimensiunea cererii depășește limita permisă.",
        instance: "/api/donation",
        correlationId,
      });
    }
    if (error instanceof InvalidJsonBodyError) {
      return createProblemResponse({
        status: 400,
        title: "Bad Request",
        detail: "Corp JSON invalid.",
        instance: "/api/donation",
        correlationId,
      });
    }
    if (error instanceof z.ZodError) {
      return createProblemResponse({
        status: 400,
        title: "Validation Error",
        detail: error.issues[0]?.message || "Date invalide transmise.",
        instance: "/api/donation",
        correlationId,
      });
    }
    logStructured("error", "donation_unhandled_error", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return createProblemResponse({
      status: 500,
      title: "Internal Server Error",
      detail: "Eroare internă de server.",
      instance: "/api/donation",
      correlationId,
    });
  }
}

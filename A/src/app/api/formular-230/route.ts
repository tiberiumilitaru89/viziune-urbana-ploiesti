import crypto from "node:crypto";
import { NextResponse, after } from "next/server";
import { z } from "zod";
import { isRequestAuthenticatedAsync } from "@/lib/auth";
import { validateRomanianCnp } from "@/lib/cnp";
import { checkRateLimitAsync, getClientIp } from "@/lib/rateLimit";
import {
  isValidPngSignatureDataUrl,
  verifySameOriginRequest,
} from "@/lib/security-utils";
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readJsonWithLimit,
} from "@/lib/request-guard";
import {
  insertFormular230,
  fetchFormulare230,
  fetchOngConfig,
  saveOngConfig,
  updateFormular230StatusDb,
  archiveFormular230,
  hardDeleteFormular230,
} from "@/lib/db";
import { invalidatePublicDataServerCache } from "@/lib/publicServerCache";
import {
  applyPrivateNoStoreHeaders,
  createProblemResponse,
  getCorrelationId,
  logStructured,
  withCorrelationHeader,
} from "@/lib/logger";

const MAX_F230_POST_BYTES = 512_000;
const MAX_F230_PUT_BYTES = 16_384;

const Formular230Schema = z
  .object({
    lastName: z.string().trim().min(2, "Numele de familie este obligatoriu").max(100),
    firstName: z.string().trim().min(2, "Prenumele este obligatoriu").max(100),
    initialaTata: z.string().trim().max(2).optional(),
    cnp: z
      .string()
      .trim()
      .regex(/^[1-8]\d{12}$/, "CNP-ul trebuie să conțină exact 13 cifre valide"),
    email: z.string().trim().email("Adresă de email invalidă").max(150),
    phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu").max(30),
    address: z.string().trim().min(5, "Adresa completă este obligatorie").max(300),
    city: z.string().trim().min(1).max(100).default("Ploiești"),
    county: z.string().trim().min(1).max(100).default("Prahova"),
    signatureDataUrl: z
      .string()
      .refine(
        isValidPngSignatureDataUrl,
        "Semnătura olografă PNG este invalidă sau depășește dimensiunea permisă."
      ),
    distributeFor2Years: z.boolean().default(true),
    consentBorderou: z.boolean().default(true),
    consentGdpr: z.literal(true, { error: "Acordul GDPR este obligatoriu." }),
    hp_website: z.string().max(200).optional(),
  })
  .strict();

const ConfigUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    cif: z.string().trim().min(1).max(50).optional(),
    iban: z.string().trim().min(5).max(50).optional(),
    bank: z.string().trim().min(1).max(100).optional(),
    percentage: z.string().trim().min(1).max(20).optional(),
    distributeYears: z.number().int().min(1).max(10).optional(),
  })
  .strict();

const Formular230PutSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("update_status"),
      id: z.string().trim().min(1).max(120),
      status: z.enum(["inregistrat", "validat", "depus_anaf"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("archive"),
      id: z.string().trim().min(1).max(120),
    })
    .strict(),
  z
    .object({
      action: z.literal("hard_delete"),
      id: z.string().trim().min(1).max(120),
    })
    .strict(),
  z
    .object({
      action: z.literal("update_config"),
      config: ConfigUpdateSchema,
    })
    .strict(),
]);

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  if (!(await isRequestAuthenticatedAsync(req))) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 401,
        title: "Unauthorized",
        detail: "Acces neautorizat la registrul Formulare 230.",
        instance: "/api/formular-230",
        correlationId,
      })
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const [config, forms] = await Promise.all([
      fetchOngConfig(),
      fetchFormulare230(includeArchived),
    ]);

    return applyPrivateNoStoreHeaders(
      withCorrelationHeader(
        NextResponse.json({
          success: true,
          config,
          totalCount: forms.length,
          forms,
        }),
        correlationId
      )
    );
  } catch (err) {
    logStructured("error", "formular_230_get_failed", {
      correlationId,
      error: err instanceof Error ? err.message : "unknown_error",
    });
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la încărcarea datelor formularului 230",
        instance: "/api/formular-230",
        correlationId,
      })
    );
  }
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const originCheck = verifySameOriginRequest(req);
  if (!originCheck.allowed) {
    return createProblemResponse({
      status: 403,
      title: "Forbidden",
      detail: "Cerere respinsă: origine invalidă (protecție CSRF).",
      instance: "/api/formular-230",
      correlationId,
    });
  }

  try {
    const ip = getClientIp(req);

    // 1. Protecție Rate-Limiting distribuită pe IP (maxim 5 formulare trimise la 10 minute per IP)
    const rateLimit = await checkRateLimitAsync(`submit-f230:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return createProblemResponse({
        status: 429,
        title: "Too Many Requests",
        detail: `Ați trimis deja mai multe formulare. Vă rugăm să așteptați ${waitMin} minute înainte de a încerca din nou.`,
        instance: "/api/formular-230",
        correlationId,
      });
    }

    const body = await readJsonWithLimit(req, MAX_F230_POST_BYTES);

    // 2. Neutralizare Bot prin Honeypot
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as { hp_website?: unknown }).hp_website === "string" &&
      (body as { hp_website: string }).hp_website.trim().length > 0
    ) {
      return withCorrelationHeader(
        NextResponse.json({
          success: true,
          message: "Formularul a fost recepționat.",
          id: `f230-discarded-${crypto.randomUUID()}`,
        }),
        correlationId
      );
    }

    const validatedData = Formular230Schema.parse(body);

    // 3. Validare Matematică Riguroasă CNP
    const cnpCheck = validateRomanianCnp(validatedData.cnp);
    if (!cnpCheck.isValid) {
      return createProblemResponse({
        status: 400,
        title: "Bad Request",
        detail: cnpCheck.error || "CNP invalid conform standardelor oficiale.",
        instance: "/api/formular-230",
        correlationId,
      });
    }

    // 4. Salvare în baza de date Supabase (cu criptare AES-256-GCM at-rest pe CNP și semnătură)
    const result = await insertFormular230({
      lastName: validatedData.lastName,
      firstName: validatedData.firstName,
      initialaTata: validatedData.initialaTata,
      cnp: validatedData.cnp,
      email: validatedData.email,
      phone: validatedData.phone,
      address: validatedData.address,
      city: validatedData.city,
      county: validatedData.county,
      signatureDataUrl: validatedData.signatureDataUrl,
      distributeFor2Years: validatedData.distributeFor2Years,
      consentBorderou: validatedData.consentBorderou,
    });

    if (!result.success) {
      logStructured("error", "formular_230_db_insert_failed", { correlationId });
      return createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la salvare în baza de date",
        instance: "/api/formular-230",
        correlationId,
      });
    }

    // 5. Notificare Email în context post-response Next.js `after()`
    const regNumber = `VUP-F230-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    after(async () => {
      try {
        const { sendAdminNotification, sendCitizenConfirmation } = await import("@/lib/email");
        await sendAdminNotification({
          type: "formular_230",
          subject: `Formular 230 Nou (3,5%): ${validatedData.firstName} ${validatedData.lastName}`,
          title: "Formular 230 Înregistrat Online (Redirecționare 3,5%)",
          fields: [
            { label: "Nume Contribuabil", value: `${validatedData.firstName} ${validatedData.lastName}` },
            { label: "Telefon", value: validatedData.phone },
            { label: "Email", value: validatedData.email },
            { label: "Localitate", value: `${validatedData.city}, ${validatedData.county}` },
            { label: "Opțiune 2 Ani", value: validatedData.distributeFor2Years ? "DA (2 ani)" : "NU (1 an)" },
            { label: "Borderou ANAF", value: validatedData.consentBorderou ? "Acord depunere borderou asociație" : "Depunere individuală" },
          ],
        }).catch(() =>
          logStructured("error", "formular_230_admin_email_failed", { correlationId })
        );

        if (validatedData.email) {
          const normalizedEmail = validatedData.email.trim().toLowerCase();
          const emailLimit = await checkRateLimitAsync(
            `email-confirm:${normalizedEmail}`,
            3,
            60 * 60 * 1000
          );
          if (emailLimit.allowed) {
            await sendCitizenConfirmation({
              toEmail: validatedData.email,
              recipientName: `${validatedData.firstName} ${validatedData.lastName}`,
              registrationNumber: regNumber,
              type: "formular_230",
              details: [
                { label: "Contribuabil", value: `${validatedData.firstName} ${validatedData.lastName}` },
                { label: "Localitate", value: `${validatedData.city}, ${validatedData.county}` },
                { label: "Opțiune Redirecționare", value: validatedData.distributeFor2Years ? "2 Ani Fiscali" : "1 An Fiscal" },
                { label: "Mod Depunere", value: validatedData.consentBorderou ? "Borderou Colectiv Asociație la ANAF Prahova" : "Depunere Individuală" },
                { label: "Data Înregistrării", value: new Date().toLocaleDateString("ro-RO") },
              ],
            }).catch(() =>
              logStructured("warn", "formular_230_citizen_email_failed", { correlationId })
            );
          } else {
            logStructured("warn", "formular_230_citizen_email_rate_limited", { correlationId });
          }
        }
      } catch (err) {
        logStructured("error", "formular_230_after_task_failed", {
          correlationId,
          error: err instanceof Error ? err.message : "unknown_error",
        });
      }
    });

    return withCorrelationHeader(
      NextResponse.json({
        success: true,
        message: "Formularul 230 a fost înregistrat cu succes în registrul asociației.",
        id: result.id,
      }),
      correlationId
    );
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return createProblemResponse({
        status: 413,
        title: "Payload Too Large",
        detail: "Dimensiunea cererii depășește limita permisă.",
        instance: "/api/formular-230",
        correlationId,
      });
    }
    if (error instanceof InvalidJsonBodyError) {
      return createProblemResponse({
        status: 400,
        title: "Bad Request",
        detail: "Corp JSON invalid.",
        instance: "/api/formular-230",
        correlationId,
      });
    }
    if (error instanceof z.ZodError) {
      return createProblemResponse({
        status: 400,
        title: "Validation Error",
        detail: error.issues[0]?.message || "Date invalide transmise.",
        instance: "/api/formular-230",
        correlationId,
      });
    }
    logStructured("error", "formular_230_post_unhandled_error", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return createProblemResponse({
      status: 500,
      title: "Internal Server Error",
      detail: "Eroare internă de server la salvarea formularului.",
      instance: "/api/formular-230",
      correlationId,
    });
  }
}

export async function PUT(req: Request) {
  const correlationId = getCorrelationId(req);

  const originCheck = verifySameOriginRequest(req);
  if (!originCheck.allowed) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 403,
        title: "Forbidden",
        detail: "Cerere respinsă: origine invalidă (protecție CSRF).",
        instance: "/api/formular-230",
        correlationId,
      })
    );
  }

  if (!(await isRequestAuthenticatedAsync(req))) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 401,
        title: "Unauthorized",
        detail: "Acces neautorizat la operațiunile de administrare.",
        instance: "/api/formular-230",
        correlationId,
      })
    );
  }

  try {
    const body = await readJsonWithLimit(req, MAX_F230_PUT_BYTES);
    const parsed = Formular230PutSchema.parse(body);

    if (parsed.action === "update_status") {
      const updated = await updateFormular230StatusDb(parsed.id, parsed.status);
      return applyPrivateNoStoreHeaders(
        withCorrelationHeader(NextResponse.json({ success: updated }), correlationId)
      );
    }

    if (parsed.action === "archive") {
      const archived = await archiveFormular230(parsed.id);
      return applyPrivateNoStoreHeaders(
        withCorrelationHeader(NextResponse.json({ success: archived }), correlationId)
      );
    }

    if (parsed.action === "hard_delete") {
      const deleted = await hardDeleteFormular230(parsed.id);
      return applyPrivateNoStoreHeaders(
        withCorrelationHeader(NextResponse.json({ success: deleted }), correlationId)
      );
    }

    // parsed.action === "update_config"
    const current = await fetchOngConfig();
    const updated = await saveOngConfig({
      name: parsed.config.name || current.name,
      cif: parsed.config.cif || current.cif,
      iban: parsed.config.iban || current.iban,
      bank: parsed.config.bank || current.bank,
      percentage: parsed.config.percentage || current.percentage,
      distributeYears: parsed.config.distributeYears ?? current.distributeYears,
    });
    if (updated) {
      invalidatePublicDataServerCache();
    }
    return applyPrivateNoStoreHeaders(
      withCorrelationHeader(NextResponse.json({ success: updated }), correlationId)
    );
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 413,
          title: "Payload Too Large",
          detail: "Dimensiunea cererii depășește limita permisă.",
          instance: "/api/formular-230",
          correlationId,
        })
      );
    }
    if (err instanceof InvalidJsonBodyError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Bad Request",
          detail: "Corp JSON invalid.",
          instance: "/api/formular-230",
          correlationId,
        })
      );
    }
    if (err instanceof z.ZodError) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Validation Error",
          detail: err.issues[0]?.message || "Parametri invalizi.",
          instance: "/api/formular-230",
          correlationId,
        })
      );
    }
    logStructured("error", "formular_230_put_error", {
      correlationId,
      error: err instanceof Error ? err.message : "unknown_error",
    });
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "Eroare la procesarea cererii administrative",
        instance: "/api/formular-230",
        correlationId,
      })
    );
  }
}

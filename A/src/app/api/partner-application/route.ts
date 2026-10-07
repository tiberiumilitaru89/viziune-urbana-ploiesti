import { NextResponse } from "next/server";
import { z } from "zod";
import { savePartnerApplication } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const partnerApplicationSchema = z.object({
  companyName: z.string().trim().min(2, "Introduceți numele firmei (minim 2 caractere)"),
  phone: z.string().trim().regex(/^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/, "Introduceți un număr de telefon valid (ex: 0722123456 sau 0244456789)"),
  description: z.string().trim().min(5, "Introduceți o scurtă descriere a activității (minim 5 caractere)"),
  hp_website: z.string().optional(), // Honeypot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate-Limiting pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = checkRateLimit(`partner-app:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return NextResponse.json(
        { success: false, message: `Prea multe cereri recente. Vă rugăm să așteptați ${waitMin} minute.` },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Neutralizare Bot (Honeypot)
    if (body.hp_website && typeof body.hp_website === "string" && body.hp_website.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const validated = partnerApplicationSchema.parse(body);

    const saved = await savePartnerApplication({
      companyName: validated.companyName,
      phone: validated.phone,
      description: validated.description,
    });

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Eroare la înregistrarea solicitării de parteneriat." },
        { status: 500 }
      );
    }

    // Notificare pe email către administrator
    const { sendAdminNotification } = await import("@/lib/email");
    sendAdminNotification({
      type: "partner_application",
      subject: `Candidatură Partener Tehnic: ${validated.companyName}`,
      title: "Candidatură Nouă: Devino Partener Tehnic",
      fields: [
        { label: "Nume Firmă", value: validated.companyName },
        { label: "Telefon", value: validated.phone },
        { label: "Descriere Activitate", value: validated.description },
      ],
    }).catch((err) => console.error("Eroare trimitere notificare email:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || "Date invalide transmise." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Eroare internă de server." },
      { status: 500 }
    );
  }
}

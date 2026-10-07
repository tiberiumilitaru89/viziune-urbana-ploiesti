import { NextResponse } from "next/server";
import { z } from "zod";
import { saveAssociation } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const requestSchema = z.object({
  name: z.string().trim().min(3, "Numele este obligatoriu"),
  phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu"),
  email: z.string().email("Adresă email invalidă").optional().or(z.literal("")),
  building: z.string().trim().min(3, "Numele asociației sau al blocului este obligatoriu"),
  address: z.string().trim().min(5, "Adresa completă este obligatorie"),
  problem: z.string().trim().min(10, "Descrierea defecțiunii este obligatorie"),
  hp_website: z.string().optional(), // Honeypot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate-Limiting pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = checkRateLimit(`audit-req:${ip}`, 5, 10 * 60 * 1000);
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
      return NextResponse.json({ success: true, id: `req-discarded-${Date.now()}` }, { status: 201 });
    }

    const validated = requestSchema.parse(body);
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const saved = await saveAssociation({
      id,
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
      return NextResponse.json({ success: false, message: "Eroare la salvare în baza de date" }, { status: 500 });
    }

    // Notificare pe email către administrator & Confirmare Cetățean
    const { sendAdminNotification, sendCitizenConfirmation } = await import("@/lib/email");
    sendAdminNotification({
      type: "audit_request",
      subject: `Cerere Nouă de Înscriere Asociație: ${validated.building}`,
      title: "Cerere Nouă de Evaluare Tehnică / Înscriere Asociație",
      fields: [
        { label: "Nume Contact", value: validated.name },
        { label: "Telefon", value: validated.phone },
        { label: "Email", value: validated.email || "Nespecificat" },
        { label: "Bloc / Asociație", value: validated.building },
        { label: "Adresă", value: validated.address },
        { label: "Descriere Problemă", value: validated.problem },
      ],
    }).catch((err) => console.error("Eroare trimitere notificare email admin:", err));

    if (validated.email) {
      const regNumber = `VUP-EVAL-${Date.now().toString().slice(-6)}`;
      sendCitizenConfirmation({
        toEmail: validated.email,
        recipientName: validated.name,
        registrationNumber: regNumber,
        type: "audit_request",
        details: [
          { label: "Reprezentant Asociație", value: validated.name },
          { label: "Imobil / Bloc", value: validated.building },
          { label: "Adresă Înregistrată", value: validated.address },
          { label: "Număr Telefon Contact", value: validated.phone },
          { label: "Data Înregistrării", value: new Date().toLocaleDateString("ro-RO") },
        ],
      }).catch((err) => console.warn("Eroare trimitere confirmare cetățean:", err));
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.errors[0]?.message || "Date invalide transmise." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Eroare internă de server." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { addDonation } from "@/lib/data";
import { saveDonationDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const donationSchema = z.object({
  type: z.enum(["bani", "materiale"]),
  targetAssociationName: z.string().optional(),
  amountRon: z.number().optional(),
  materialType: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  companyOrName: z.string().trim().min(3, "Numele sau compania este obligatorie"),
  phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu"),
  email: z.string().trim().email("Email invalid").optional().or(z.literal("")),
  hp_website: z.string().optional(), // Honeypot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate-Limiting pe IP (maxim 5 cereri / 10 minute)
    const rateLimit = checkRateLimit(`donation:${ip}`, 5, 10 * 60 * 1000);
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
      return NextResponse.json({ success: true, id: `don-discarded-${Date.now()}` }, { status: 201 });
    }

    const validated = donationSchema.parse(body);

    const saved = addDonation({
      type: validated.type,
      targetAssociationName: validated.targetAssociationName,
      amountRon: validated.amountRon,
      materialType: validated.materialType,
      quantity: validated.quantity,
      unit: validated.unit,
      companyOrName: validated.companyOrName,
      phone: validated.phone,
      email: validated.email,
    });

    // Persistare asincronă în baza de date Supabase
    saveDonationDb(saved).catch((err) => console.warn("Eroare salvare donatie in Supabase:", err));

    // Notificare pe email către administrator
    const { sendAdminNotification } = await import("@/lib/email");
    sendAdminNotification({
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
    }).catch((err) => console.error("Eroare trimitere notificare email:", err));

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.errors[0]?.message || "Date invalide transmise." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Eroare internă de server." }, { status: 500 });
  }
}

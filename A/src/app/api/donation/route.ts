import { NextResponse } from "next/server";
import { z } from "zod";
import { addDonation } from "@/lib/data";
import { saveDonationDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

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
    hp_website: z.string().optional(), // Honeypot
  })
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

    // Persistare garantată în baza de date Supabase
    const savedInDb = await saveDonationDb(saved);
    if (!savedInDb) {
      return NextResponse.json(
        { success: false, message: "Eroare la înregistrarea sponsorizării în baza de date." },
        { status: 500 }
      );
    }

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

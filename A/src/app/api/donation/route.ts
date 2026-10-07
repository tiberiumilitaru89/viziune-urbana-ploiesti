import { NextResponse } from "next/server";
import { z } from "zod";
import { addDonation } from "@/lib/data";

const donationSchema = z.object({
  type: z.enum(["bani", "materiale"]),
  targetAssociationName: z.string().optional(),
  amountRon: z.number().optional(),
  materialType: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  companyOrName: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // Notificare pe email către administrator
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
    }).catch((err) => console.error("Eroare trimitere notificare email:", err));

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Eroare internă de server." }, { status: 500 });
  }
}

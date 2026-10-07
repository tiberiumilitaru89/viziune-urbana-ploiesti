import { NextResponse } from "next/server";
import { z } from "zod";
import { savePartnerApplication } from "@/lib/db";

const partnerApplicationSchema = z.object({
  companyName: z.string().min(2, "Introduceți numele firmei (minim 2 caractere)"),
  phone: z.string().regex(/^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/, "Introduceți un număr de telefon valid (ex: 0722123456 sau 0244456789)"),
  description: z.string().min(5, "Introduceți o scurtă descriere a activității (minim 5 caractere)"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    await sendAdminNotification({
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
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Eroare internă de server." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { insertFormular230, fetchFormulare230, fetchOngConfig, saveOngConfig, updateFormular230StatusDb, archiveFormular230 } from "@/lib/db";

const Formular230Schema = z.object({
  lastName: z.string().min(2, "Numele de familie este obligatoriu"),
  firstName: z.string().min(2, "Prenumele este obligatoriu"),
  initialaTata: z.string().max(2).optional(),
  cnp: z.string().regex(/^[1-8]\d{12}$/, "CNP-ul trebuie să conțină exact 13 cifre valide"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().min(10, "Numărul de telefon este obligatoriu"),
  address: z.string().min(5, "Adresa completă este obligatorie"),
  city: z.string().default("Ploiești"),
  county: z.string().default("Prahova"),
  signatureDataUrl: z.string().min(30, "Semnătura olografă este obligatorie"),
  distributeFor2Years: z.boolean().default(true),
  consentBorderou: z.boolean().default(true),
});

const ConfigUpdateSchema = z.object({
  name: z.string().optional(),
  cif: z.string().optional(),
  iban: z.string().optional(),
  bank: z.string().optional(),
  percentage: z.string().optional(),
  distributeYears: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const [config, forms] = await Promise.all([
      fetchOngConfig(),
      fetchFormulare230(includeArchived),
    ]);

    return NextResponse.json({
      success: true,
      config,
      totalCount: forms.length,
      forms,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la încărcarea datelor formularului 230" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = Formular230Schema.parse(body);

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
      return NextResponse.json({ success: false, error: "Eroare la salvare în baza de date" }, { status: 500 });
    }

    // Notificare pe email către administrator
    const { sendAdminNotification } = await import("@/lib/email");
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
    }).catch((err) => console.error("Eroare trimitere notificare email:", err));

    return NextResponse.json({
      success: true,
      message: "Formularul 230 a fost înregistrat cu succes în registrul asociației.",
      id: result.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || "Date invalide" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Eroare internă de server la salvarea formularului" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "update_status") {
      const { id, status } = body;
      if (!id || !["inregistrat", "validat", "depus_anaf"].includes(status)) {
        return NextResponse.json({ success: false, error: "Parametri invalizi" }, { status: 400 });
      }
      const updated = await updateFormular230StatusDb(id, status);
      return NextResponse.json({ success: updated });
    }

    if (body.action === "archive") {
      const { id } = body;
      if (!id) return NextResponse.json({ success: false, error: "Lipseste ID-ul" }, { status: 400 });
      const archived = await archiveFormular230(id);
      return NextResponse.json({ success: archived });
    }

    if (body.action === "update_config") {
      const validatedConfig = ConfigUpdateSchema.parse(body.config);
      const current = await fetchOngConfig();
      const updated = await saveOngConfig({
        name: validatedConfig.name || current.name,
        cif: validatedConfig.cif || current.cif,
        iban: validatedConfig.iban || current.iban,
        bank: validatedConfig.bank || current.bank,
        percentage: validatedConfig.percentage || current.percentage,
        distributeYears: validatedConfig.distributeYears ?? current.distributeYears,
      });
      return NextResponse.json({ success: updated });
    }

    return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la procesarea cererii administrative" },
      { status: 500 }
    );
  }
}

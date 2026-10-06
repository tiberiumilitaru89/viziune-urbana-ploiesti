import { NextResponse } from "next/server";
import { z } from "zod";
import { addFormular230, getAllFormulare230, getOngConfig, updateOngConfig, updateFormular230Status } from "@/lib/data";

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

export async function GET() {
  try {
    const config = getOngConfig();
    const forms = getAllFormulare230();
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

    const newForm = addFormular230({
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

    return NextResponse.json({
      success: true,
      id: newForm.id,
      message: "Formularul 230 a fost înregistrat cu succes!",
      form: newForm,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "A apărut o eroare la salvarea formularului" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Check if updating an entry's status
    if (body.formId && body.status) {
      const ok = updateFormular230Status(body.formId, body.status);
      return NextResponse.json({ success: ok });
    }

    // Check if updating ONG config
    if (body.config) {
      const validatedConfig = ConfigUpdateSchema.parse(body.config);
      const updated = updateOngConfig(validatedConfig);
      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ success: false, error: "Payload necunoscut" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Eroare la actualizare" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { isRequestAuthenticated } from "@/lib/auth";
import { validateRomanianCnp } from "@/lib/cnp";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { 
  insertFormular230, 
  fetchFormulare230, 
  fetchOngConfig, 
  saveOngConfig, 
  updateFormular230StatusDb, 
  archiveFormular230,
  hardDeleteFormular230 
} from "@/lib/db";

const Formular230Schema = z.object({
  lastName: z.string().trim().min(2, "Numele de familie este obligatoriu"),
  firstName: z.string().trim().min(2, "Prenumele este obligatoriu"),
  initialaTata: z.string().trim().max(2).optional(),
  cnp: z.string().trim().regex(/^[1-8]\d{12}$/, "CNP-ul trebuie să conțină exact 13 cifre valide"),
  email: z.string().trim().email("Adresă de email invalidă"),
  phone: z.string().trim().min(10, "Numărul de telefon este obligatoriu"),
  address: z.string().trim().min(5, "Adresa completă este obligatorie"),
  city: z.string().trim().default("Ploiești"),
  county: z.string().trim().default("Prahova"),
  signatureDataUrl: z.string().min(30, "Semnătura olografă este obligatorie"),
  distributeFor2Years: z.boolean().default(true),
  consentBorderou: z.boolean().default(true),
  // Câmp Honeypot invizibil pentru neutralizarea roboților automați
  hp_website: z.string().optional(),
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
  // BARIERĂ INVIOLABILĂ DE SECURITATE: Doar administratorul autentificat poate citi formularele 230
  if (!isRequestAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Acces neautorizat la registrul Formulare 230." },
      { status: 401 }
    );
  }

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
    const ip = getClientIp(req);

    // 1. Protecție Rate-Limiting pe IP (maxim 5 formulare trimise la 10 minute per IP)
    const rateLimit = checkRateLimit(`submit-f230:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil(rateLimit.resetInMs / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Ați trimis deja mai multe formulare. Vă rugăm să așteptați ${waitMin} minute înainte de a încerca din nou.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Neutralizare Bot prin Honeypot (dacă un bot a completat câmpul ascuns)
    if (body.hp_website && typeof body.hp_website === "string" && body.hp_website.trim().length > 0) {
      // Discard silențios
      return NextResponse.json({
        success: true,
        message: "Formularul a fost recepționat.",
        id: `f230-discarded-${Date.now()}`,
      });
    }

    const validatedData = Formular230Schema.parse(body);

    // 3. Validare Matematică Riguroasă CNP (Algoritm Oficial Național ANAF)
    const cnpCheck = validateRomanianCnp(validatedData.cnp);
    if (!cnpCheck.isValid) {
      return NextResponse.json(
        { success: false, error: cnpCheck.error || "CNP invalid conform standardelor oficiale." },
        { status: 400 }
      );
    }

    // 4. Salvare în baza de date Supabase
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

    // 5. Notificare Email Asincronă către Administrator & Confirmare Cetățean
    const { sendAdminNotification, sendCitizenConfirmation } = await import("@/lib/email");
    sendAdminNotification({
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

    if (validatedData.email) {
      const regNumber = `VUP-F230-${Date.now().toString().slice(-6)}`;
      sendCitizenConfirmation({
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
      }).catch((err) => console.warn("Eroare trimitere confirmare cetățean:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Formularul 230 a fost înregistrat cu succes în registrul asociației.",
      id: result.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || "Date invalide transmise." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Eroare internă de server la salvarea formularului." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  // BARIERĂ INVIOLABILĂ DE SECURITATE: Doar administratorul autentificat poate modifica stări sau setări
  if (!isRequestAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Acces neautorizat la operațiunile de administrare." },
      { status: 401 }
    );
  }

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
      if (!id) return NextResponse.json({ success: false, error: "Lipsește ID-ul" }, { status: 400 });
      const archived = await archiveFormular230(id);
      return NextResponse.json({ success: archived });
    }

    if (body.action === "hard_delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ success: false, error: "Lipsește ID-ul" }, { status: 400 });
      const deleted = await hardDeleteFormular230(id);
      return NextResponse.json({ success: deleted });
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

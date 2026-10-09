import { supabase, supabaseAdmin } from "./supabase";
import { 
  AuditRequest, 
  PartnerItem, 
  ProjectItem, 
  GlobalMetrics, 
  OngConfig, 
  Formular230Entry, 
  PublicAssociationSummary,
  DonationEntry 
} from "./types";
import { 
  INITIAL_ASSOCIATIONS, 
  INITIAL_PARTNERS, 
  INITIAL_PROJECTS, 
  INITIAL_METRICS 
} from "./data";
import { detectNeighborhood } from "./neighborhoods";

// ==========================================
// 1. ASOCIAȚII / AUDIT
// ==========================================

export async function fetchAssociations(includeArchived = false): Promise<AuditRequest[]> {
  try {
    let query = supabaseAdmin
      .from("associations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [...INITIAL_ASSOCIATIONS];
    }

    return data.map((r, index) => ({
      id: r.id,
      dosarNumber: r.dosar_number || `DOSAR-PH-${101 + index}`,
      name: r.name,
      phone: r.phone,
      building: r.building,
      address: r.address,
      neighborhood: r.neighborhood || detectNeighborhood(r.address, r.building),
      problem: r.problem,
      status: r.status,
      formsCollected: r.forms_collected,
      formsTarget: r.forms_target,
      fundsCollected: r.funds_collected,
      fundsTarget: r.funds_target,
      createdAt: r.created_at,
    }));
  } catch {
    return [...INITIAL_ASSOCIATIONS];
  }
}

export async function fetchPublicAssociations(): Promise<PublicAssociationSummary[]> {
  const all = await fetchAssociations(false);
  return all.map((r) => ({
    id: r.id,
    dosarNumber: r.dosarNumber,
    building: r.building,
    address: r.address,
    neighborhood: r.neighborhood || detectNeighborhood(r.address, r.building),
    problem: r.problem,
    status: r.status,
    formsCollected: r.formsCollected,
    formsTarget: r.formsTarget,
    fundsCollected: r.fundsCollected,
    fundsTarget: r.fundsTarget,
    createdAt: r.createdAt,
  }));
}

export async function saveAssociation(assoc: AuditRequest): Promise<boolean> {
  try {
    const payload = {
      id: assoc.id,
      name: assoc.name,
      phone: assoc.phone,
      building: assoc.building,
      address: assoc.address,
      problem: assoc.problem,
      status: assoc.status,
      forms_collected: assoc.formsCollected,
      forms_target: assoc.formsTarget,
      funds_collected: assoc.fundsCollected,
      funds_target: assoc.fundsTarget,
      is_archived: false,
    };

    // Încercăm salvarea cu dosar_number dacă coloana există în Supabase
    const { error } = await supabaseAdmin.from("associations").upsert({
      ...payload,
      dosar_number: assoc.dosarNumber || null,
    });

    if (error && (error.message.includes("dosar_number") || error.code === "PGRST204")) {
      // Fallback fără coloana dosar_number dacă utilizatorul nu a adăugat încă coloana în SQL
      const { error: fallbackError } = await supabaseAdmin.from("associations").upsert(payload);
      return !fallbackError;
    }

    return !error;
  } catch {
    return false;
  }
}

export async function archiveAssociation(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("associations")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function hardDeleteAssociation(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("associations")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Eroare la ștergerea definitivă a asociației din Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a asociației:", err);
    return false;
  }
}

// ==========================================
// 2. PARTENERI
// ==========================================

export async function fetchPartners(includeArchived = false): Promise<PartnerItem[]> {
  try {
    let query = supabaseAdmin.from("partners").select("*");
    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [...INITIAL_PARTNERS];
    }

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      category: p.category,
      description: p.description,
      logoUrl: p.logo_url || "",
      website: p.website || "",
      badgeText: p.badge_text || "",
    }));
  } catch {
    return [...INITIAL_PARTNERS];
  }
}

export async function savePartner(partner: PartnerItem): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("partners").upsert({
      id: partner.id,
      name: partner.name,
      role: partner.role,
      category: partner.category,
      description: partner.description,
      logo_url: partner.logoUrl || "",
      website: partner.website || "",
      badge_text: partner.badgeText || "",
      is_archived: false,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function archivePartner(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("partners")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function hardDeletePartner(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("partners")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Eroare la ștergerea definitivă a partenerului din Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a partenerului:", err);
    return false;
  }
}

// ==========================================
// 2.1. SOLICITĂRI DEVINO PARTENER (CANDIDATURI)
// ==========================================

export async function fetchPartnerApplications(): Promise<import("./types").PartnerApplication[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      companyName: item.company_name,
      phone: item.phone,
      description: item.description,
      status: item.status,
      createdAt: item.created_at,
    }));
  } catch {
    return [];
  }
}

export async function savePartnerApplication(app: {
  companyName: string;
  phone: string;
  description: string;
}): Promise<boolean> {
  try {
    const id = `partapp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { error } = await supabaseAdmin.from("partner_applications").insert({
      id,
      company_name: app.companyName,
      phone: app.phone,
      description: app.description,
      status: "nou",
    });

    if (error) {
      console.warn("Eroare la salvarea partner_applications în Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la salvarea partner_applications:", err);
    return false;
  }
}

export async function updatePartnerApplicationStatus(
  id: string,
  status: "nou" | "contactat" | "arhivat"
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("partner_applications")
      .update({ status })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function hardDeletePartnerApplication(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("partner_applications")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Eroare la ștergerea definitivă a cererii de parteneriat:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a cererii de parteneriat:", err);
    return false;
  }
}

// ==========================================
// 3. PROIECTE (INAINTE / DUPA)
// ==========================================

export async function fetchProjects(includeArchived = false, onlyFinalized = false): Promise<ProjectItem[]> {
  try {
    let query = supabaseAdmin.from("projects").select("*");
    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }
    if (onlyFinalized) {
      query = query.eq("status", "finalizat");
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const initial = onlyFinalized
        ? INITIAL_PROJECTS.filter((p) => p.status === "finalizat")
        : INITIAL_PROJECTS;
      return [...initial];
    }

    return data.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      beforeImage: p.before_image,
      afterImage: p.after_image,
      completionDate: p.completion_date,
      neighborhood: p.neighborhood || undefined,
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      isArchived: p.is_archived || false,
    }));
  } catch {
    const initial = onlyFinalized
      ? INITIAL_PROJECTS.filter((p) => p.status === "finalizat")
      : INITIAL_PROJECTS;
    return [...initial];
  }
}

export async function saveProject(project: ProjectItem): Promise<boolean> {
  try {
    const payload = {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      before_image: project.beforeImage,
      after_image: project.afterImage,
      completion_date: project.completionDate,
      neighborhood: project.neighborhood || null,
      gallery: project.gallery || [],
      is_archived: false,
    };

    // Încercăm salvarea cu coloana gallery (jsonb)
    const { error } = await supabaseAdmin.from("projects").upsert(payload);
    if (error && (error.message.includes("gallery") || error.code === "PGRST204")) {
      // Fallback fără coloana gallery dacă nu a fost adăugată încă în Supabase SQL
      const { gallery: _, ...fallbackPayload } = payload;
      const { error: fallbackError } = await supabaseAdmin.from("projects").upsert(fallbackPayload);
      return !fallbackError;
    }
    return !error;
  } catch {
    return false;
  }
}

export async function archiveProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("projects")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteStorageFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl) return true;
    if (!fileUrl.includes("/storage/v1/object/public/")) return true;
    const parts = fileUrl.split("/storage/v1/object/public/");
    if (parts.length < 2) return true;
    const bucketAndPath = parts[1];
    const slashIdx = bucketAndPath.indexOf("/");
    if (slashIdx === -1) return true;
    const bucket = bucketAndPath.substring(0, slashIdx);
    const filePath = decodeURIComponent(bucketAndPath.substring(slashIdx + 1));
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
    if (error) {
      console.warn("Atenționare la ștergerea fișierului din Supabase Storage:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Excepție la ștergerea fișierului din storage:", err);
    return false;
  }
}

export async function hardDeleteProject(id: string): Promise<boolean> {
  try {
    // 1. Preluăm datele proiectului pentru a șterge fișierele foto din Supabase Storage
    const { data: proj } = await supabaseAdmin
      .from("projects")
      .select("before_image, after_image, gallery")
      .eq("id", id)
      .single();

    if (proj) {
      if (proj.before_image) await deleteStorageFile(proj.before_image);
      if (proj.after_image) await deleteStorageFile(proj.after_image);
      if (Array.isArray(proj.gallery)) {
        for (const p of proj.gallery) {
          if (p?.url) await deleteStorageFile(p.url);
        }
      }
    }

    // 2. Ștergem fizic înregistrarea din PostgreSQL
    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Eroare la ștergerea definitivă a proiectului:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a proiectului:", err);
    return false;
  }
}

// ==========================================
// 4. METRICI GLOBALE
// ==========================================

export async function fetchMetrics(): Promise<GlobalMetrics> {
  try {
    const { data, error } = await supabaseAdmin.from("metrics").select("*").eq("id", 1).single();
    if (error || !data) {
      return { ...INITIAL_METRICS };
    }
    return {
      totalFormsCollected: data.total_forms_collected,
      totalFormsTarget: data.total_forms_target,
      totalFundsCollectedRon: data.total_funds_collected_ron,
      totalFundsTargetRon: data.total_funds_target_ron,
      activeAssociationsCount: data.active_associations_count,
    };
  } catch {
    return { ...INITIAL_METRICS };
  }
}

export async function saveMetrics(metrics: GlobalMetrics): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("metrics").upsert({
      id: 1,
      total_forms_collected: metrics.totalFormsCollected,
      total_forms_target: metrics.totalFormsTarget,
      total_funds_collected_ron: metrics.totalFundsCollectedRon,
      total_funds_target_ron: metrics.totalFundsTargetRon,
      active_associations_count: metrics.activeAssociationsCount,
    });
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 5. CONFIG ONG
// ==========================================

export async function fetchOngConfig(): Promise<OngConfig> {
  try {
    const { data, error } = await supabaseAdmin.from("ong_config").select("*").eq("id", 1).single();
    if (error || !data) {
      return {
        name: "Asociația Viziune Urbană Ploiești",
        cif: "48923410",
        iban: "RO94BACX0000004234473000",
        bank: "UniCredit Bank România",
        percentage: "3,5%",
        distributeYears: 2,
      };
    }
    return {
      name: data.name,
      cif: data.cif,
      iban: data.iban,
      bank: data.bank,
      percentage: data.percentage,
      distributeYears: data.distribute_years,
    };
  } catch {
    return {
      name: "Asociația Viziune Urbană Ploiești",
      cif: "48923410",
      iban: "RO94BACX0000004234473000",
      bank: "UniCredit Bank România",
      percentage: "3,5%",
      distributeYears: 2,
    };
  }
}

export async function saveOngConfig(config: OngConfig): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("ong_config").upsert({
      id: 1,
      name: config.name,
      cif: config.cif,
      iban: config.iban,
      bank: config.bank,
      percentage: config.percentage,
      distribute_years: config.distributeYears,
    });
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 6. FORMULARE 230
// ==========================================

export async function fetchFormulare230(includeArchived = false): Promise<Formular230Entry[]> {
  try {
    let query = supabaseAdmin
      .from("formulare_230")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((f) => ({
      id: f.id,
      createdAt: f.created_at,
      lastName: f.last_name,
      firstName: f.first_name,
      initialaTata: f.initiala_tata,
      cnp: f.cnp,
      email: f.email,
      phone: f.phone,
      address: f.address,
      city: f.city,
      county: f.county,
      signatureDataUrl: f.signature_data_url,
      distributeFor2Years: f.distribute_for_2_years,
      consentBorderou: f.consent_borderou,
      status: f.status,
    }));
  } catch {
    return [];
  }
}

export async function insertFormular230(entry: Omit<Formular230Entry, "id" | "createdAt" | "status">): Promise<{ success: boolean; id?: string }> {
  try {
    const id = `f230-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { error } = await supabaseAdmin.from("formulare_230").insert({
      id,
      last_name: entry.lastName,
      first_name: entry.firstName,
      initiala_tata: entry.initialaTata || null,
      cnp: entry.cnp,
      email: entry.email,
      phone: entry.phone,
      address: entry.address,
      city: entry.city,
      county: entry.county,
      signature_data_url: entry.signatureDataUrl,
      distribute_for_2_years: entry.distributeFor2Years,
      consent_borderou: entry.consentBorderou,
      status: "inregistrat",
      is_archived: false,
    });

    if (error) {
      console.error("Eroare insert formular 230:", error);
      return { success: false };
    }
    return { success: true, id };
  } catch (err) {
    console.error("Eroare formular 230:", err);
    return { success: false };
  }
}

export async function updateFormular230StatusDb(id: string, status: Formular230Entry["status"]): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("formulare_230")
      .update({ status })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function archiveFormular230(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("formulare_230")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function hardDeleteFormular230(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("formulare_230")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Eroare la ștergerea definitivă a formularului 230:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a formularului 230:", err);
    return false;
  }
}

// ==========================================
// 7. DONAȚII & SPONSORIZĂRI
// ==========================================

export async function fetchDonations(): Promise<DonationEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      type: d.type === "materiale" ? "materiale" : "bani",
      targetAssociationName: d.target_association_name || undefined,
      amountRon: d.amount_ron !== null && d.amount_ron !== undefined ? Number(d.amount_ron) : undefined,
      materialType: d.material_type || undefined,
      quantity: d.material_quantity !== null && d.material_quantity !== undefined ? Number(d.material_quantity) : undefined,
      unit: d.material_unit || undefined,
      companyOrName: d.donor_name_or_company,
      phone: d.donor_phone,
      email: d.donor_email || undefined,
      status: d.status === "confirmat" ? "confirmat" : d.status === "finalizat" ? "finalizat" : "inregistrat",
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function updateDonationStatus(
  id: string,
  status: "inregistrat" | "confirmat" | "finalizat"
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("donations")
      .update({ status })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function saveDonationDb(donation: DonationEntry): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("donations").insert({
      id: donation.id,
      type: donation.type,
      target_association_name: donation.targetAssociationName || null,
      amount_ron: donation.amountRon || null,
      material_type: donation.materialType || null,
      material_quantity: donation.quantity || null,
      material_unit: donation.unit || null,
      donor_name_or_company: donation.companyOrName,
      donor_phone: donation.phone,
      donor_email: donation.email || null,
      status: donation.status || "inregistrat",
      created_at: donation.createdAt,
    });

    if (error) {
      console.warn("Eroare la salvarea donației în Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la salvarea donației în Supabase:", err);
    return false;
  }
}

export async function hardDeleteDonation(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("donations")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Eroare la ștergerea definitivă a donației din Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepție la ștergerea definitivă a donației:", err);
    return false;
  }
}


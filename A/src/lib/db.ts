import { supabase, supabaseAdmin } from "./supabase";
import { 
  AuditRequest, 
  PartnerItem, 
  ProjectItem, 
  GlobalMetrics, 
  OngConfig, 
  Formular230Entry, 
  PublicAssociationSummary 
} from "./types";
import { 
  INITIAL_ASSOCIATIONS, 
  INITIAL_PARTNERS, 
  INITIAL_PROJECTS, 
  INITIAL_METRICS 
} from "./data";

// ==========================================
// 1. ASOCIAȚII / AUDIT
// ==========================================

export async function fetchAssociations(includeArchived = false): Promise<AuditRequest[]> {
  try {
    let query = supabase
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

    return data.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      building: r.building,
      address: r.address,
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
    building: r.building,
    address: r.address,
    status: r.status,
    formsCollected: r.formsCollected,
    formsTarget: r.formsTarget,
    fundsCollected: r.fundsCollected,
    fundsTarget: r.fundsTarget,
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

    const { error } = await supabase.from("associations").upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

export async function archiveAssociation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("associations")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 2. PARTENERI
// ==========================================

export async function fetchPartners(includeArchived = false): Promise<PartnerItem[]> {
  try {
    let query = supabase.from("partners").select("*");
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
    const { error } = await supabase.from("partners").upsert({
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
    const { error } = await supabase
      .from("partners")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 3. PROIECTE (INAINTE / DUPA)
// ==========================================

export async function fetchProjects(includeArchived = false): Promise<ProjectItem[]> {
  try {
    let query = supabase.from("projects").select("*");
    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [...INITIAL_PROJECTS];
    }

    return data.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      beforeImage: p.before_image,
      afterImage: p.after_image,
      completionDate: p.completion_date,
    }));
  } catch {
    return [...INITIAL_PROJECTS];
  }
}

export async function saveProject(project: ProjectItem): Promise<boolean> {
  try {
    const { error } = await supabase.from("projects").upsert({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      before_image: project.beforeImage,
      after_image: project.afterImage,
      completion_date: project.completionDate,
      is_archived: false,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function archiveProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .update({ is_archived: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 4. METRICI GLOBALE
// ==========================================

export async function fetchMetrics(): Promise<GlobalMetrics> {
  try {
    const { data, error } = await supabase.from("metrics").select("*").eq("id", 1).single();
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
    const { error } = await supabase.from("metrics").upsert({
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
    const { data, error } = await supabase.from("ong_config").select("*").eq("id", 1).single();
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
    const { error } = await supabase.from("ong_config").upsert({
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
    const { error } = await supabase.from("formulare_230").insert({
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

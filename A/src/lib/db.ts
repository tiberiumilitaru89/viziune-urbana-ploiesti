import "server-only";
import crypto from "node:crypto";
import { supabaseAdmin } from "./supabase";
import type {
  AuditRequest,
  PartnerItem,
  ProjectItem,
  GlobalMetrics,
  OngConfig,
  Formular230Entry,
  PublicAssociationSummary,
  DonationEntry,
} from "./types";
import {
  INITIAL_ASSOCIATIONS,
  INITIAL_PARTNERS,
  INITIAL_PROJECTS,
  INITIAL_METRICS,
} from "./data";
import { detectNeighborhood } from "./neighborhoods";
import { encryptPII, decryptPII } from "./pii-crypto";
import { logStructured } from "./logger";
import { normalizeDonationStatus, parseAllowedStorageTarget } from "./security-utils";

// ==========================================
// 1. ASOCIAȚII / AUDIT
// ==========================================

export const PUBLIC_VISIBLE_ASSOCIATION_STATUSES = new Set<AuditRequest["status"]>([
  "in_evaluare",
  "acceptat",
  "finalizat",
]);

export function filterPublicAssociations(
  all: readonly AuditRequest[]
): PublicAssociationSummary[] {
  return all
    .filter((r) => PUBLIC_VISIBLE_ASSOCIATION_STATUSES.has(r.status))
    .map((r) => ({
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
  return filterPublicAssociations(all);
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

    const { error } = await supabaseAdmin.from("associations").upsert({
      ...payload,
      dosar_number: assoc.dosarNumber || null,
    });

    if (error && (error.message.includes("dosar_number") || error.code === "PGRST204")) {
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
      logStructured("error", "hard_delete_association_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_association_exception", { error: err });
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
      logStructured("error", "hard_delete_partner_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_partner_exception", { error: err });
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
    const id = `partapp-${crypto.randomUUID()}`;
    const { error } = await supabaseAdmin.from("partner_applications").insert({
      id,
      company_name: app.companyName,
      phone: app.phone,
      description: app.description,
      status: "nou",
    });

    if (error) {
      logStructured("warn", "save_partner_application_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "save_partner_application_exception", { error: err });
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
      logStructured("error", "hard_delete_partner_application_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_partner_application_exception", { error: err });
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

    const { error } = await supabaseAdmin.from("projects").upsert(payload);
    if (error && (error.message.includes("gallery") || error.code === "PGRST204")) {
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
    if (!fileUrl || fileUrl.startsWith("/")) return true;

    const target = parseAllowedStorageTarget(
      fileUrl,
      process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    );
    if (!target) {
      logStructured("warn", "storage_delete_rejected_invalid_target");
      return false;
    }

    const { error } = await supabaseAdmin.storage.from(target.bucket).remove([target.filePath]);
    if (error) {
      logStructured("warn", "supabase_storage_delete_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("warn", "supabase_storage_delete_exception", { error: err });
    return false;
  }
}

export async function deleteProjectPhotoFromStorage(
  projectId: string,
  photoId: string,
  photoUrl: string
): Promise<boolean> {
  try {
    const { data: proj, error } = await supabaseAdmin
      .from("projects")
      .select("before_image, after_image, gallery")
      .eq("id", projectId)
      .single();

    if (error || !proj) {
      logStructured("warn", "storage_delete_project_not_found", { projectId });
      return false;
    }

    const galleryList = Array.isArray(proj.gallery)
      ? (proj.gallery as Array<{ id?: string; url?: string }>)
      : [];

    const belongsToProject =
      proj.before_image === photoUrl ||
      proj.after_image === photoUrl ||
      galleryList.some((p) => p?.url === photoUrl && (!photoId || p?.id === photoId));

    if (!belongsToProject) {
      logStructured("warn", "storage_delete_rejected_photo_ownership", { projectId, photoId });
      return false;
    }

    return deleteStorageFile(photoUrl);
  } catch (err) {
    logStructured("warn", "delete_project_photo_exception", { projectId, error: err });
    return false;
  }
}

export async function hardDeleteProject(id: string): Promise<boolean> {
  try {
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

    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      logStructured("error", "hard_delete_project_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_project_exception", { error: err });
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

export type RawFormular230Row = {
  readonly id: string;
  readonly created_at: string;
  readonly last_name: string;
  readonly first_name: string;
  readonly initiala_tata?: string | null;
  readonly cnp: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly city: string;
  readonly county: string;
  readonly signature_data_url: string;
  readonly distribute_for_2_years: boolean;
  readonly consent_borderou: boolean;
  readonly status: Formular230Entry["status"];
};

function safeDecryptField(
  value: string,
  rowId: string,
  field: "cnp" | "signatureDataUrl"
): string {
  try {
    return decryptPII(value);
  } catch {
    logStructured("error", "formular_230_row_decryption_failed", { rowId, field });
    return field === "cnp" ? "[EROARE DECRIPTARE]" : "";
  }
}

export function mapAndDecryptFormular230Rows(
  rows: readonly RawFormular230Row[]
): Formular230Entry[] {
  return rows.map((f) => ({
    id: f.id,
    createdAt: f.created_at,
    lastName: f.last_name,
    firstName: f.first_name,
    initialaTata: f.initiala_tata ?? undefined,
    cnp: safeDecryptField(f.cnp, f.id, "cnp"),
    email: f.email,
    phone: f.phone,
    address: f.address,
    city: f.city,
    county: f.county,
    signatureDataUrl: safeDecryptField(f.signature_data_url, f.id, "signatureDataUrl"),
    distributeFor2Years: f.distribute_for_2_years,
    consentBorderou: f.consent_borderou,
    status: f.status,
  }));
}

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

    return mapAndDecryptFormular230Rows(data as RawFormular230Row[]);
  } catch (err) {
    logStructured("error", "fetch_formulare_230_exception", { error: err });
    return [];
  }
}

export const getFormulare230 = fetchFormulare230;

export async function insertFormular230(
  entry: Omit<Formular230Entry, "id" | "createdAt" | "status">
): Promise<{ success: boolean; id?: string }> {
  try {
    const id = `f230-${crypto.randomUUID()}`;
    const encryptedCnp = encryptPII(entry.cnp);
    const encryptedSignature = encryptPII(entry.signatureDataUrl);

    const { error } = await supabaseAdmin.from("formulare_230").insert({
      id,
      last_name: entry.lastName,
      first_name: entry.firstName,
      initiala_tata: entry.initialaTata || null,
      cnp: encryptedCnp,
      email: entry.email,
      phone: entry.phone,
      address: entry.address,
      city: entry.city,
      county: entry.county,
      signature_data_url: encryptedSignature,
      distribute_for_2_years: entry.distributeFor2Years,
      consent_borderou: entry.consentBorderou,
      status: "inregistrat",
      is_archived: false,
    });

    if (error) {
      logStructured("error", "insert_formular_230_failed", { error: error.message });
      return { success: false };
    }
    return { success: true, id };
  } catch (err) {
    logStructured("error", "insert_formular_230_exception", { error: err });
    return { success: false };
  }
}

export async function updateFormular230StatusDb(
  id: string,
  status: Formular230Entry["status"]
): Promise<boolean> {
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
      logStructured("error", "hard_delete_formular_230_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_formular_230_exception", { error: err });
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
      status: normalizeDonationStatus(d.status),
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function updateDonationStatus(
  id: string,
  status: DonationEntry["status"]
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
      logStructured("warn", "save_donation_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "save_donation_exception", { error: err });
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
      logStructured("error", "hard_delete_donation_failed", { error: error.message });
      return false;
    }
    return true;
  } catch (err) {
    logStructured("error", "hard_delete_donation_exception", { error: err });
    return false;
  }
}

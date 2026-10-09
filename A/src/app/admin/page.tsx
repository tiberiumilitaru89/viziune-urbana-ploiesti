"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Lock,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Building2,
  Users,
  Image as ImageIcon,
  BarChart3,
  RefreshCw,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Eye,
  Download,
  X,
  Loader2,
  HeartHandshake,
  Coins,
  Mail,
  Upload,
} from "lucide-react";
import {
  AuditRequest,
  AuditStatus,
  PartnerItem,
  ProjectItem,
  GlobalMetrics,
  Formular230Entry,
  Formular230Status,
  OngConfig,
  PartnerApplication,
  DonationEntry,
} from "@/lib/types";
import {
  INITIAL_ASSOCIATIONS,
  INITIAL_PARTNERS,
  INITIAL_PROJECTS,
  INITIAL_METRICS,
} from "@/lib/data";
import { Formular230OfficialDoc } from "@/components/form230/Formular230OfficialDoc";
import { NoticeBoardModal } from "@/components/admin/NoticeBoardModal";

type AdminTab = "associations" | "partners" | "projects" | "metrics" | "form230" | "donations";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("associations");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States
  const [associations, setAssociations] = useState<AuditRequest[]>([...INITIAL_ASSOCIATIONS]);
  const [partners, setPartners] = useState<PartnerItem[]>([...INITIAL_PARTNERS]);
  const [partnerApplications, setPartnerApplications] = useState<PartnerApplication[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([...INITIAL_PROJECTS]);
  const [metrics, setMetrics] = useState<GlobalMetrics>({ ...INITIAL_METRICS });

  // Formular 230 & Parametri Fiscali ONG States
  const [ongConfig, setOngConfig] = useState<OngConfig>({
    name: "Asociația Viziune Urbană Ploiești",
    cif: "48923410",
    iban: "RO94BACX0000004234473000",
    bank: "UniCredit Bank România",
    percentage: "3,5%",
    distributeYears: 2,
  });
  const [f230List, setF230List] = useState<Formular230Entry[]>([]);
  const [f230Search, setF230Search] = useState("");
  const [f230StatusFilter, setF230StatusFilter] = useState<string>("all");
  const [selectedFormForPreview, setSelectedFormForPreview] = useState<Formular230Entry | null>(null);
  const [isSavingOngConfig, setIsSavingOngConfig] = useState(false);
  const [isLoadingF230, setIsLoadingF230] = useState(false);

  // Donații & Sponsorizări States
  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [donationFilter, setDonationFilter] = useState<string>("all");
  const [donationSearch, setDonationSearch] = useState<string>("");

  // Filters & Searches
  const [assocFilter, setAssocFilter] = useState<string>("all");
  const [assocSearch, setAssocSearch] = useState<string>("");

  // Modals / Expandable Forms
  const [showAddAssoc, setShowAddAssoc] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedAssocForNoticeBoard, setSelectedAssocForNoticeBoard] = useState<AuditRequest | null>(null);
  const [isNoticeBoardOpen, setIsNoticeBoardOpen] = useState(false);

  // New Association Form State
  const [newAssoc, setNewAssoc] = useState({
    name: "",
    phone: "",
    building: "",
    address: "",
    problem: "",
    formsCollected: 0,
    formsTarget: 40,
    fundsCollected: 0,
    fundsTarget: 12000,
    status: "nou" as AuditStatus,
  });

  // New Partner Form State
  const [newPartner, setNewPartner] = useState<Omit<PartnerItem, "id">>({
    name: "",
    role: "Partener Tehnic de Execuție",
    category: "executie",
    description: "",
    badgeText: "Partener Oficial",
    logoUrl: "",
    website: "",
  });

  // New Project Form State
  const [newProject, setNewProject] = useState<Omit<ProjectItem, "id">>({
    title: "",
    description: "",
    status: "finalizat",
    beforeImage: "/ref-assets/before-DmrOVzle.png",
    afterImage: "/ref-assets/after-C5YhGlz_.png",
    completionDate: "Octombrie 2026",
  });

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload Imagini Proiecte în Supabase Storage
  const [uploadingImage, setUploadingImage] = useState<"before" | "after" | null>(null);

  const handleUploadProjectImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(field);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (field === "before") {
          setNewProject((prev) => ({ ...prev, beforeImage: data.url }));
        } else {
          setNewProject((prev) => ({ ...prev, afterImage: data.url }));
        }
        showToast("Fotografia a fost încărcată cu succes în Supabase Storage!");
      } else {
        alert(data.error || "Eroare la încărcarea imaginii.");
      }
    } catch {
      alert("A apărut o eroare de rețea la încărcare.");
    } finally {
      setUploadingImage(null);
    }
  };

  // Verificare sesiune admin pe server la mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const json = await res.json();
        if (json.success && json.authenticated) {
          setIsAuthenticated(true);
          loadAdminData();
          loadF230Data();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const loadAdminData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        setIsAuthenticated(false);
        showToast("Sesiune expirată. Vă rugăm să vă reautentificați.");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.associations?.length > 0) setAssociations(json.data.associations);
        if (json.data.partners?.length > 0) setPartners(json.data.partners);
        if (json.data.partnerApplications?.length > 0) setPartnerApplications(json.data.partnerApplications);
        if (json.data.projects?.length > 0) setProjects(json.data.projects);
        if (json.data.metrics) setMetrics(json.data.metrics);
        if (json.data.ongConfig) setOngConfig(json.data.ongConfig);
        if (json.data.donations) setDonations(json.data.donations);
      }
    } catch {
      // Fallback to local or initial
    }
  };

  // Formular 230 API Actions
  const loadF230Data = async () => {
    setIsLoadingF230(true);
    try {
      const res = await fetch("/api/formular-230");
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (data.config) setOngConfig(data.config);
        if (data.forms) setF230List(data.forms);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingF230(false);
    }
  };

  const handleSaveOngConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOngConfig(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_ong_config", payload: ongConfig }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Configurația ONG a fost salvată în Supabase!");
      } else {
        alert("A apărut o eroare la salvarea setărilor în baza de date.");
      }
    } catch {
      alert("Eroare de rețea la salvarea configurației.");
    } finally {
      setIsSavingOngConfig(false);
    }
  };

  const handleUpdateF230Status = async (id: string, newStatus: Formular230Status) => {
    try {
      const res = await fetch("/api/formular-230", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setF230List((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
        showToast(`Statusul formularului a fost actualizat la "${newStatus}" în Supabase!`);
      }
    } catch {
      alert("Eroare la actualizarea statusului.");
    }
  };

  const handleArchiveF230 = async (id: string) => {
    if (!confirm("Sigur doriți să arhivați acest formular 230? El nu va mai fi vizibil în lista curentă, dar rămâne protejat în baza de date.")) {
      return;
    }
    try {
      const res = await fetch("/api/formular-230", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", id }),
      });
      const data = await res.json();
      if (data.success) {
        setF230List((prev) => prev.filter((f) => f.id !== id));
        showToast("Formularul 230 a fost arhivat în siguranță!");
      }
    } catch {
      alert("Eroare la arhivarea formularului.");
    }
  };

  const maskCnp = (cnp: string) => {
    if (!cnp || cnp.length < 13) return cnp || "—";
    return `${cnp.substring(0, 3)}******${cnp.substring(9)}`;
  };

  // ==========================================
  // SHARED CSV EXPORT ENGINE (Excel UTF-8 BOM)
  // ==========================================
  const escapeCsv = (val: string | number | undefined | null) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(";")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export Borderou Centralizator Formular 230 ANAF
  const handleExportAnafBorderou = () => {
    if (f230List.length === 0) {
      alert("Nu există formulare 230 înregistrate pentru a genera borderoul.");
      return;
    }

    const headers = [
      "Nr. Crt.",
      "Nume",
      "Initiala Tata",
      "Prenume",
      "CNP",
      "Adresa Domiciliu",
      "Localitate",
      "Judet",
      "Telefon",
      "Email",
      "Optiune 2 Ani",
      "Status",
      "Data Inregistrarii",
    ];

    const rows = f230List.map((item, index) => [
      index + 1,
      escapeCsv(item.lastName),
      escapeCsv(item.initialaTata || ""),
      escapeCsv(item.firstName),
      escapeCsv(item.cnp),
      escapeCsv(item.address),
      escapeCsv(item.city),
      escapeCsv(item.county),
      escapeCsv(item.phone),
      escapeCsv(item.email || ""),
      item.distributeFor2Years ? "DA" : "NU",
      escapeCsv(item.status),
      new Date(item.createdAt).toLocaleDateString("ro-RO"),
    ]);

    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`Borderou_ANAF_Formulare230_VUP_${today}.csv`, headers, rows);
    showToast("Borderoul oficial ANAF (CSV/Excel) a fost descărcat cu succes!");
  };

  // 2. Export Registru Asociații de Proprietari & Cereri de Audit
  const handleExportAssociations = () => {
    if (associations.length === 0) {
      alert("Nu există asociații înregistrate în sistem pentru export.");
      return;
    }

    const headers = [
      "Nr. Crt.",
      "Nr. Dosar",
      "ID Cerere",
      "Nume Solicitant",
      "Telefon Contact",
      "Asociatie / Bloc",
      "Adresa Completa",
      "Cartier",
      "Problema Semnalata",
      "Status Inregistrare",
      "Formulare 230 Stranse",
      "Tinta Formulare 230",
      "Procent Formulare",
      "Fond Manopera Strans (RON)",
      "Tinta Fond Manopera (RON)",
      "Procent Fond",
      "Data Inregistrarii",
    ];

    const rows = associations.map((assoc, idx) => {
      const formPct = assoc.formsTarget > 0 ? Math.round((assoc.formsCollected / assoc.formsTarget) * 100) : 0;
      const fundPct = assoc.fundsTarget > 0 ? Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100) : 0;
      return [
        idx + 1,
        escapeCsv(assoc.dosarNumber || `DOSAR-PH-${assoc.id}`),
        escapeCsv(assoc.id),
        escapeCsv(assoc.name),
        escapeCsv(assoc.phone),
        escapeCsv(assoc.building),
        escapeCsv(assoc.address),
        escapeCsv(assoc.neighborhood || ""),
        escapeCsv(assoc.problem),
        escapeCsv(assoc.status),
        assoc.formsCollected,
        assoc.formsTarget,
        `${formPct}%`,
        assoc.fundsCollected,
        assoc.fundsTarget,
        `${fundPct}%`,
        assoc.createdAt ? new Date(assoc.createdAt).toLocaleDateString("ro-RO") : "",
      ];
    });

    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`Registru_Asociatii_Proprietari_VUP_${today}.csv`, headers, rows);
    showToast("Registrul Asociațiilor de Proprietari (CSV/Excel) a fost descărcat!");
  };

  // 3. Export Candidaturi Solicitări Parteneri Tehnic („Devino Partener”)
  const handleExportPartnerApplications = () => {
    if (partnerApplications.length === 0) {
      alert("Nu există candidaturi de parteneriat înregistrate pentru export.");
      return;
    }

    const headers = [
      "Nr. Crt.",
      "ID Solicitare",
      "Companie / Nume Instalator",
      "Telefon Contact",
      "Servicii & Descriere Oferta",
      "Status Solicitare",
      "Data Inregistrarii",
    ];

    const rows = partnerApplications.map((app, idx) => [
      idx + 1,
      escapeCsv(app.id),
      escapeCsv(app.companyName),
      escapeCsv(app.phone),
      escapeCsv(app.description),
      escapeCsv(app.status),
      app.createdAt ? new Date(app.createdAt).toLocaleDateString("ro-RO") : "",
    ]);

    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`Candidaturi_Parteneri_Tehnici_VUP_${today}.csv`, headers, rows);
    showToast("Registrul solicitărilor de parteneriat a fost descărcat!");
  };

  // 4. Export Registru Donații & Sponsorizări
  const handleExportDonations = () => {
    if (donations.length === 0) {
      alert("Nu există donații sau sponsorizări înregistrate pentru export.");
      return;
    }

    const headers = [
      "Nr. Crt.",
      "ID Donatie",
      "Tip Donatie",
      "Donator / Companie",
      "Telefon Contact",
      "Email Contact",
      "Suma Donata (RON)",
      "Tip Materiale",
      "Cantitate",
      "Unitate Masura",
      "Asociatie Beneficiara",
      "Status Donatie",
      "Data Inregistrarii",
    ];

    const rows = donations.map((d, idx) => [
      idx + 1,
      escapeCsv(d.id),
      d.type === "materiale" ? "Materiale" : "Bani (Fond Manoperă)",
      escapeCsv(d.companyOrName),
      escapeCsv(d.phone),
      escapeCsv(d.email || ""),
      d.amountRon ? `${d.amountRon} RON` : "—",
      escapeCsv(d.materialType || "—"),
      d.quantity !== undefined ? d.quantity : "—",
      escapeCsv(d.unit || "—"),
      escapeCsv(d.targetAssociationName || "Fond General Ploiești"),
      escapeCsv(d.status),
      d.createdAt ? new Date(d.createdAt).toLocaleDateString("ro-RO") : "",
    ]);

    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`Registru_Donatii_Sponsorizari_VUP_${today}.csv`, headers, rows);
    showToast("Registrul donațiilor și sponsorizărilor a fost descărcat!");
  };

  // 5. Update Status Donație în Supabase
  const handleUpdateDonationStatus = async (
    id: string,
    status: "inregistrat" | "confirmat" | "finalizat"
  ) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_donation_status",
          payload: { id, status },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDonations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d))
        );
        showToast(`Statusul donației a fost actualizat la "${status}" în Supabase!`);
      } else {
        alert("Eroare la actualizarea statusului donației.");
      }
    } catch {
      alert("Eroare de conexiune la server.");
    }
  };

  // Save Association (Single or All) to Supabase
  const saveAssociationToDb = async (assoc: AuditRequest) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_association", payload: assoc }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Asociația "${assoc.building}" a fost salvată în Supabase!`);
      } else {
        alert("Eroare la salvare în baza de date.");
      }
    } catch {
      alert("Eroare de conexiune la salvare.");
    }
  };

  const handleArchiveAssociation = async (assoc: AuditRequest) => {
    if (confirm(`Sigur doriți să arhivați asociația "${assoc.building}"? Rămâne salvată în siguranță în baza de date (istoric).`)) {
      try {
        const res = await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "archive_association", payload: { id: assoc.id } }),
        });
        const data = await res.json();
        if (data.success) {
          setAssociations((prev) => prev.filter((item) => item.id !== assoc.id));
          showToast(`Asociația "${assoc.building}" a fost arhivată în siguranță!`);
        } else {
          alert("Eroare la arhivare.");
        }
      } catch {
        alert("Eroare de conexiune.");
      }
    }
  };

  // Save Partner to Supabase
  const savePartnerToDb = async (partner: PartnerItem) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_partner", payload: partner }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Partenerul "${partner.name}" a fost salvat în Supabase!`);
      }
    } catch {
      alert("Eroare la salvare partener.");
    }
  };

  const handleArchivePartner = async (partner: PartnerItem) => {
    if (confirm(`Sigur doriți să arhivați partenerul "${partner.name}"?`)) {
      try {
        const res = await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "archive_partner", payload: { id: partner.id } }),
        });
        const data = await res.json();
        if (data.success) {
          setPartners((prev) => prev.filter((p) => p.id !== partner.id));
          showToast(`Partenerul "${partner.name}" a fost arhivat.`);
        }
      } catch {
        alert("Eroare la arhivare.");
      }
    }
  };

  const handleUpdatePartnerAppStatus = async (id: string, status: "nou" | "contactat" | "arhivat") => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_partner_application_status",
          payload: { id, status },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPartnerApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
        showToast("Statusul solicitării de parteneriat a fost actualizat.");
      }
    } catch {
      alert("Eroare la actualizarea statusului.");
    }
  };

  // Save Project to Supabase
  const saveProjectToDb = async (project: ProjectItem) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_project", payload: project }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Proiectul "${project.title}" a fost salvat în Supabase!`);
      }
    } catch {
      alert("Eroare la salvare proiect.");
    }
  };

  const handleArchiveProject = async (project: ProjectItem) => {
    if (confirm(`Sigur doriți să arhivați proiectul "${project.title}"?`)) {
      try {
        const res = await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "archive_project", payload: { id: project.id } }),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) => prev.filter((p) => p.id !== project.id));
          showToast(`Proiectul "${project.title}" a fost arhivat.`);
        }
      } catch {
        alert("Eroare la arhivare.");
      }
    }
  };

  // Save Metrics to Supabase
  const saveMetricsState = async (updated: GlobalMetrics) => {
    setMetrics(updated);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_metrics", payload: updated }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Metricile globale au fost sincronizate în Supabase!");
      }
    } catch {
      alert("Eroare la salvare metrici.");
    }
  };

  // Login Handler Securizat pe Server (HMAC-SHA256 Token Session)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError("Introduceți parola autorizată.");
      return;
    }
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password: password.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword("");
        setAuthError("");
        showToast("Autentificare reușită!");
        loadAdminData();
        loadF230Data();
      } else {
        setAuthError(data.error || "Parolă autorizată incorectă. Încercați din nou.");
      }
    } catch {
      setAuthError("Eroare de conexiune la server. Vă rugăm să reîncercați.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Reset / Refresh from Supabase
  const handleResetDefaults = () => {
    loadAdminData();
    loadF230Data();
    showToast("Datele au fost reîncărcate proaspăt din baza de date!");
  };

  // Logout Handler Securizat
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // ignore
    } finally {
      setIsAuthenticated(false);
      setPassword("");
      showToast("Ați fost deconectat în siguranță.");
    }
  };

  // Add Association
  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssoc.building || !newAssoc.address) {
      alert("Numele blocului și adresa sunt obligatorii.");
      return;
    }

    const nextNum = 101 + associations.length;
    const created: AuditRequest = {
      id: `req-${Date.now()}`,
      dosarNumber: `DOSAR-PH-${nextNum}`,
      name: newAssoc.name || "Reprezentant Asociație",
      phone: newAssoc.phone || "0720000000",
      building: newAssoc.building,
      address: newAssoc.address,
      problem: newAssoc.problem || "Defecțiuni conducte alimentare și canalizare subsol.",
      status: newAssoc.status,
      formsCollected: Number(newAssoc.formsCollected) || 0,
      formsTarget: Number(newAssoc.formsTarget) || 40,
      fundsCollected: Number(newAssoc.fundsCollected) || 0,
      fundsTarget: Number(newAssoc.fundsTarget) || 12000,
      createdAt: new Date().toISOString(),
    };

    setAssociations([created, ...associations]);
    await saveAssociationToDb(created);
    setShowAddAssoc(false);
    setNewAssoc({
      name: "",
      phone: "",
      building: "",
      address: "",
      problem: "",
      formsCollected: 0,
      formsTarget: 40,
      fundsCollected: 0,
      fundsTarget: 12000,
      status: "nou",
    });
  };

  // Add Partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.role) {
      alert("Numele și rolul partenerului sunt obligatorii.");
      return;
    }

    const created: PartnerItem = {
      ...newPartner,
      id: `part-${Date.now()}`,
    };

    setPartners([...partners, created]);
    await savePartnerToDb(created);
    setShowAddPartner(false);
    setNewPartner({
      name: "",
      role: "Partener Tehnic de Execuție",
      category: "executie",
      description: "",
      badgeText: "Partener Oficial",
      logoUrl: "",
      website: "",
    });
  };

  // Add Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      alert("Titlul și descrierea proiectului sunt obligatorii.");
      return;
    }

    const created: ProjectItem = {
      ...newProject,
      id: `proj-${Date.now()}`,
    };

    setProjects([...projects, created]);
    await saveProjectToDb(created);
    setShowAddProject(false);
    setNewProject({
      title: "",
      description: "",
      status: "finalizat",
      beforeImage: "/ref-assets/before-DmrOVzle.png",
      afterImage: "/ref-assets/after-C5YhGlz_.png",
      completionDate: "Octombrie 2026",
    });
  };

  // Filtered Associations
  const filteredAssociations = associations.filter((a) => {
    const matchesFilter = assocFilter === "all" || a.status === assocFilter;
    const q = assocSearch.toLowerCase();
    const matchesSearch =
      !assocSearch ||
      a.building.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.phone.includes(q);
    return matchesFilter && matchesSearch;
  });

  // ==============================================================
  // RENDER: SECURED LOGIN SCREEN (Civic Glassmorphism with Background)
  // ==============================================================
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-amber-900/20 shadow-xl">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="text-xs font-serif font-bold text-slate-700">Se verifică sesiunea securizată...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative text-slate-900">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-600/30 flex items-center justify-center mx-auto mb-4 bg-[#FAF7F2] shadow-md">
              <Image
                src="/official-logo.jpg"
                alt="Sigla Oficială Asociația Viziune Urbană Ploiești"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-serif font-black text-[#071330]">Panou de Administrare</h1>
            <p className="text-xs text-amber-900 font-serif mt-1 font-semibold">
              Asociația Viziune Urbană Ploiești & Instal Serv Becheanu
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Formular securizat fără sugestii automate de browser */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
            {/* Câmpuri decoy invizibile pentru a preveni definitiv managerul de parole din Chrome/Edge */}
            <input
              type="text"
              name="prevent_autofill_username"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="password"
              name="prevent_autofill_password"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label className="block text-xs font-serif font-bold text-slate-700 mb-2">
                Parolă Acces Registru
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="admin_secret_token_no_suggest"
                  id="admin_secret_token_no_suggest"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduceți parola autorizată"
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-amber-900/25 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-colors shadow-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 disabled:opacity-50 shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Se verifică autorizarea...</span>
                </>
              ) : (
                "Autentificare în Panou"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-800 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Înapoi pe site-ul public
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // RENDER: AUTHENTICATED ADMIN DASHBOARD (Civic Glassmorphism)
  // ==============================================================
  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-4 sm:p-8 selection:bg-amber-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-serif font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header Card */}
        <div className="bg-white/85 backdrop-blur-md border border-amber-900/20 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-600/30 shrink-0 bg-[#FAF7F2] shadow-sm">
              <Image
                src="/official-logo.jpg"
                alt="Sigla Oficială"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#071330]">
                Panou de Administrare — Viziune Urbană Ploiești
              </h1>
              <p className="text-xs text-amber-900 font-serif font-semibold">
                Gestiune Asociații, Parteneri (Instal Serv Becheanu), Galerie Lucrări și Metrici
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              title="Resetează la datele inițiale"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif text-slate-600 hover:text-rose-700 bg-white border border-amber-900/20 hover:border-rose-300 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetare</span>
            </button>

            <button
              onClick={handleLogout}
              title="Deconectare din panoul de administrare"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif text-slate-600 hover:text-rose-700 bg-white border border-amber-900/20 hover:border-rose-300 transition-colors shadow-sm font-semibold"
            >
              <span>Deconectare</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Vezi Site-ul Public
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white/85 backdrop-blur-md border border-amber-900/20 rounded-2xl w-fit shadow-md">
          <button
            onClick={() => setActiveTab("associations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "associations"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Asociații de Proprietari ({associations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "partners"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parteneri ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "projects"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galerie & Poze Înainte/După ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "metrics"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrici & Fond Reparații</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("form230");
              loadF230Data();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "form230"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formulare 230 & Setări ONG ({f230List.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("donations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "donations"
                ? "bg-[#c48834] text-white shadow-md"
                : "text-slate-700 hover:text-slate-950 hover:bg-amber-100/50"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Donații & Sponsorizări ({donations.length})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: ASOCIAȚII DE PROPRIETARI & ACTUALIZARE FORMULARE/FOND   */}
        {/* ============================================================== */}
        {activeTab === "associations" && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={assocSearch}
                    onChange={(e) => setAssocSearch(e.target.value)}
                    placeholder="Caută bloc, stradă, telefon..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/95 border border-amber-900/25 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white/85 border border-amber-900/20 rounded-xl text-xs font-serif shadow-sm">
                  {(["all", "nou", "in_evaluare", "acceptat", "finalizat"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAssocFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        assocFilter === st
                          ? "bg-[#c48834] text-white font-bold shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {st === "all" ? "Toate" : st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportAssociations}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-800 bg-white border border-amber-900/25 hover:bg-amber-50 hover:border-amber-600 transition-all shadow-sm"
                  title="Descarcă tabelul complet al asociațiilor și cererilor de audit în format Excel / CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Exportă Asociații (Excel / CSV)</span>
                </button>

                {/* Add Association Button */}
                <button
                  onClick={() => setShowAddAssoc(!showAddAssoc)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddAssoc ? "Anulează" : "Adaugă Asociație Nouă"}</span>
                </button>
              </div>
            </div>

            {/* Expandable Form: Adaugă Asociație */}
            {showAddAssoc && (
              <form
                onSubmit={handleCreateAssociation}
                className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
              >
                <h3 className="font-serif text-lg font-bold text-[#071330] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-700" />
                  Înregistrează o Asociație Nouă în Sistem
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-serif">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Nume Asociație / Bloc *</label>
                    <input
                      type="text"
                      required
                      value={newAssoc.building}
                      onChange={(e) => setNewAssoc({ ...newAssoc, building: e.target.value })}
                      placeholder="Ex: Asociația Bloc 18B — Cartier Nord"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Adresă Detaliată *</label>
                    <input
                      type="text"
                      required
                      value={newAssoc.address}
                      onChange={(e) => setNewAssoc({ ...newAssoc, address: e.target.value })}
                      placeholder="Ex: Str. Cameliei nr. 12, Ploiești"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Persoană Contact / Solicitant</label>
                    <input
                      type="text"
                      value={newAssoc.name}
                      onChange={(e) => setNewAssoc({ ...newAssoc, name: e.target.value })}
                      placeholder="Ex: Ion Popescu (Președinte)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Telefon Contact</label>
                    <input
                      type="text"
                      value={newAssoc.phone}
                      onChange={(e) => setNewAssoc({ ...newAssoc, phone: e.target.value })}
                      placeholder="Ex: 0722123456"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Număr Formulare ANAF 230 (Actual / Țintă)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={newAssoc.formsCollected}
                        onChange={(e) => setNewAssoc({ ...newAssoc, formsCollected: Number(e.target.value) })}
                        placeholder="Colectate"
                        className="w-1/2 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                      />
                      <input
                        type="number"
                        min="1"
                        value={newAssoc.formsTarget}
                        onChange={(e) => setNewAssoc({ ...newAssoc, formsTarget: Number(e.target.value) })}
                        placeholder="Țintă"
                        className="w-1/2 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Fond Reparații Manoperă (RON Actual / Țintă)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={newAssoc.fundsCollected}
                        onChange={(e) => setNewAssoc({ ...newAssoc, fundsCollected: Number(e.target.value) })}
                        placeholder="Colectat"
                        className="w-1/2 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                      />
                      <input
                        type="number"
                        min="1"
                        value={newAssoc.fundsTarget}
                        onChange={(e) => setNewAssoc({ ...newAssoc, fundsTarget: Number(e.target.value) })}
                        placeholder="Țintă"
                        className="w-1/2 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-slate-700 mb-1 font-bold">Defecțiuni Sesizate la Subsol</label>
                    <textarea
                      rows={2}
                      value={newAssoc.problem}
                      onChange={(e) => setNewAssoc({ ...newAssoc, problem: e.target.value })}
                      placeholder="Ex: Țevi de încălzire sparte, pierderi permanente de apă rece, igrasie și rugină."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAssoc(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
                  >
                    Salvează Asociația
                  </button>
                </div>
              </form>
            )}

            {/* List of Associations */}
            <div className="space-y-4">
              {filteredAssociations.map((assoc) => (
                <div
                  key={assoc.id}
                  className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-amber-600/40 transition-colors shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-amber-900/10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-[#071330]">{assoc.building}</h4>
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-500/15 border border-amber-600/30 px-2.5 py-0.5 rounded-lg shadow-xs">
                          {assoc.dosarNumber || `DOSAR-PH-${assoc.id}`}
                        </span>
                        <Link
                          href="/status"
                          target="_blank"
                          className="text-[11px] text-amber-800 hover:text-amber-950 underline font-serif font-bold ml-1"
                        >
                          (Verifică în Portalul Public ↗)
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" /> {assoc.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-700" /> {assoc.name} ({assoc.phone})
                        </span>
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-700 font-serif font-bold">Stadiu FSM:</label>
                      <select
                        value={assoc.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as AuditStatus;
                          const updatedAssoc = { ...assoc, status: newStatus };
                          setAssociations((prev) =>
                            prev.map((item) => (item.id === assoc.id ? updatedAssoc : item))
                          );
                          await saveAssociationToDb(updatedAssoc);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-900/25 text-xs text-amber-900 font-serif font-bold focus:outline-none shadow-sm"
                      >
                        <option value="nou">Nou Înscris</option>
                        <option value="in_evaluare">În Curs de Evaluare</option>
                        <option value="acceptat">Acceptat în Program</option>
                        <option value="respins">Respins</option>
                        <option value="finalizat">Lucrare Finalizată</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic bg-[#FAF7F2] p-3 rounded-xl border border-amber-900/15">
                    &quot;{assoc.problem}&quot;
                  </p>

                  {/* Inline Metrics Editors: Număr Formulare & Fond Reparații */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Formulare ANAF 230 */}
                    <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-amber-900/15 space-y-2">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-900">
                        <span>Actualizare Nr. Formulare 230:</span>
                        <span>{Math.round((assoc.formsCollected / assoc.formsTarget) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-600 text-[10px] font-bold">Colectate:</span>
                          <input
                            type="number"
                            min="0"
                            value={assoc.formsCollected}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = associations.map((item) =>
                                item.id === assoc.id ? { ...item, formsCollected: val } : item
                              );
                              setAssociations(updated);
                            }}
                            className="w-20 px-2 py-1 rounded bg-white border border-amber-900/25 text-slate-900 text-center font-bold shadow-sm"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-600 text-[10px] font-bold">Țintă:</span>
                          <input
                            type="number"
                            min="1"
                            value={assoc.formsTarget}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = associations.map((item) =>
                                item.id === assoc.id ? { ...item, formsTarget: val } : item
                              );
                              setAssociations(updated);
                            }}
                            className="w-20 px-2 py-1 rounded bg-white border border-amber-900/25 text-slate-900 text-center font-bold shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fond Reparații Manoperă */}
                    <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-amber-900/15 space-y-2">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-900">
                        <span>Actualizare Fond Reparații (Manoperă):</span>
                        <span>{Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-600 text-[10px] font-bold">Colectat (RON):</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={assoc.fundsCollected}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = associations.map((item) =>
                                item.id === assoc.id ? { ...item, fundsCollected: val } : item
                              );
                              setAssociations(updated);
                            }}
                            className="w-24 px-2 py-1 rounded bg-white border border-amber-900/25 text-slate-900 text-center font-bold shadow-sm"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-600 text-[10px] font-bold">Țintă (RON):</span>
                          <input
                            type="number"
                            min="1"
                            step="100"
                            value={assoc.fundsTarget}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = associations.map((item) =>
                                item.id === assoc.id ? { ...item, fundsTarget: val } : item
                              );
                              setAssociations(updated);
                            }}
                            className="w-24 px-2 py-1 rounded bg-white border border-amber-900/25 text-slate-900 text-center font-bold shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar for Item */}
                  <div className="flex flex-wrap justify-between items-center gap-2.5 pt-3 border-t border-amber-900/10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssocForNoticeBoard(assoc);
                        setIsNoticeBoardOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-800" />
                      <span>Generează Fișă Avizier (PDF / Print)</span>
                    </button>

                    <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveAssociationToDb(assoc)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-white bg-emerald-700 hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvează în Baza de Date
                    </button>
                    <button
                      onClick={() => handleArchiveAssociation(assoc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Șterge / Arhivează
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PARTENERI (INSTAL SERV BECHEANU & ALȚI PARTENERI)       */}
        {/* ============================================================== */}
        {activeTab === "partners" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#071330]">Parteneri Acreditați & Tehnici</h3>
                <p className="text-xs text-slate-600">
                  Adăugați și gestionați partenerii oficiali afișați pe site (inclusiv Instal Serv Becheanu)
                </p>
              </div>

              <button
                onClick={() => setShowAddPartner(!showAddPartner)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddPartner ? "Anulează" : "Adaugă Partener"}</span>
              </button>
            </div>

            {/* Expandable Add Partner Form */}
            {showAddPartner && (
              <form
                onSubmit={handleCreatePartner}
                className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
              >
                <h4 className="font-serif text-base font-bold text-[#071330]">Adăugare Partener Nou</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-serif">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Denumire Partener *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      placeholder="Ex: Instal Serv Becheanu"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Rol Oficial *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.role}
                      onChange={(e) => setNewPartner({ ...newPartner, role: e.target.value })}
                      placeholder="Ex: Partener Tehnic de Execuție"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Categorie Partener</label>
                    <select
                      value={newPartner.category}
                      onChange={(e) =>
                        setNewPartner({
                          ...newPartner,
                          category: e.target.value as PartnerItem["category"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    >
                      <option value="executie">Execuție Tehnică (Instal Serv Becheanu)</option>
                      <option value="practica">Practică & Calificare Profesională (InfoACCRP / Toma Socolescu)</option>
                      <option value="comunitate">Comunitate & Inițiativă Civic</option>
                      <option value="academic">Academic & Științific (UPG)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-slate-700 mb-1 font-bold">Descriere Competențe & Implicare</label>
                    <textarea
                      rows={2}
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                      placeholder="Ex: Execuție profesionistă cu echipe autorizate și garanție de 5 ani."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPartner(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 shadow-md"
                  >
                    Salvează Partener
                  </button>
                </div>
              </form>
            )}

            {/* List of Partners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 space-y-3 shadow-md text-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold px-2.5 py-0.5 rounded bg-[#FAF7F2] border border-amber-900/20">
                        {partner.category.toUpperCase()}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#071330] mt-2">{partner.name}</h4>
                      <p className="text-xs text-amber-800 font-serif font-semibold">{partner.role}</p>
                    </div>

                    <button
                      onClick={() => handleArchivePartner(partner)}
                      title="Arhivează partenerul"
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{partner.description}</p>
                </div>
              ))}
            </div>

            {/* Secțiune Solicitări Noi de la Potențiali Parteneri (Devino Partener) */}
            <div className="pt-8 border-t border-amber-900/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#071330]">
                    Solicitări Primite: „Devino Partener Tehnic” ({partnerApplications.length})
                  </h4>
                  <p className="text-xs text-slate-600">
                    Firme și instalatori care au completat formularul din site pentru a fi contactați de administrator
                  </p>
                </div>

                {partnerApplications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportPartnerApplications}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold text-slate-800 bg-white border border-amber-900/25 hover:bg-amber-50 hover:border-amber-600 transition-all shadow-sm shrink-0"
                    title="Descarcă registrul candidaturilor de parteneriat în format Excel / CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>Exportă Solicitări (Excel / CSV)</span>
                  </button>
                )}
              </div>

              {partnerApplications.length === 0 ? (
                <div className="p-8 text-center bg-white/70 rounded-2xl border border-amber-900/15 text-xs text-slate-500 font-serif">
                  Nu există încă solicitări de parteneriat înregistrate.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partnerApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white/90 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 space-y-3 shadow-md text-slate-900"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded border ${
                              app.status === "nou"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : app.status === "contactat"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {app.status === "nou" ? "NOU • DE CONTACTAT" : app.status.toUpperCase()}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#071330] mt-2">
                            {app.companyName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold mt-1">
                            <Phone className="w-3.5 h-3.5" />
                            <a href={`tel:${app.phone}`} className="hover:underline">
                              {app.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-amber-900/10 text-xs text-slate-700 leading-relaxed font-sans">
                        {app.description}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-amber-900/10 text-[11px] font-serif">
                        <span className="text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {app.status !== "contactat" && (
                            <button
                              type="button"
                              onClick={() => handleUpdatePartnerAppStatus(app.id, "contactat")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              Marchează Contactat
                            </button>
                          )}
                          {app.status !== "arhivat" && (
                            <button
                              type="button"
                              onClick={() => handleUpdatePartnerAppStatus(app.id, "arhivat")}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                            >
                              Arhivează
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: POZE & GALERIE PROIECTE (ÎNAINTE / DUPĂ)                */}
        {/* ============================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#071330]">Galerie Lucrări & Comparații Foto</h3>
                <p className="text-xs text-slate-600">
                  Adăugați proiecte finalizate, actualizați titlul și pozele Înainte de intervenție / După recepție
                </p>
              </div>

              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProject ? "Anulează" : "Adaugă Lucrare / Poze"}</span>
              </button>
            </div>

            {/* Expandable Add Project Form */}
            {showAddProject && (
              <form
                onSubmit={handleCreateProject}
                className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
              >
                <h4 className="font-serif text-base font-bold text-[#071330]">Adăugare Lucrare & Set Fotografic</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 mb-1 font-bold">Titlu Proiect *</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Ex: Reabilitare completă subsol Bloc 8B — Cartier Nord"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 mb-1 font-bold">Descriere Tehnică *</label>
                    <textarea
                      rows={2}
                      required
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Ex: Înlocuire integrală 180 metri liniari trasee PPR fibră compozită, izolație Armaflex 19mm."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Poză: Înainte de intervenție *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newProject.beforeImage}
                        onChange={(e) => setNewProject({ ...newProject, beforeImage: e.target.value })}
                        placeholder="/ref-assets/before-DmrOVzle.png sau link"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm text-xs font-mono"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 shrink-0 border border-amber-300 transition-colors shadow-xs">
                        {uploadingImage === "before" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            <span>Se încarcă...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-amber-800" />
                            <span>Încarcă Poză</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={uploadingImage !== null}
                          onChange={(e) => handleUploadProjectImage(e, "before")}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Poză: După recepție *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newProject.afterImage}
                        onChange={(e) => setNewProject({ ...newProject, afterImage: e.target.value })}
                        placeholder="/ref-assets/after-C5YhGlz_.png sau link"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm text-xs font-mono"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 shrink-0 border border-amber-300 transition-colors shadow-xs">
                        {uploadingImage === "after" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            <span>Se încarcă...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-amber-800" />
                            <span>Încarcă Poză</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={uploadingImage !== null}
                          onChange={(e) => handleUploadProjectImage(e, "after")}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Data Finalizării / Recepției</label>
                    <input
                      type="text"
                      value={newProject.completionDate}
                      onChange={(e) => setNewProject({ ...newProject, completionDate: e.target.value })}
                      placeholder="Ex: Octombrie 2026"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-900/25 text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 shadow-md"
                  >
                    Salvează Lucrarea
                  </button>
                </div>
              </form>
            )}

            {/* List of Projects */}
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 space-y-4 shadow-md text-slate-900"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#071330]">{proj.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                    </div>

                    <button
                      onClick={() => handleArchiveProject(proj)}
                      title="Arhivează proiectul"
                      className="text-slate-400 hover:text-rose-600 self-start sm:self-center p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-amber-900/15">
                      <div className="font-serif font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Înainte:
                      </div>
                      <p className="font-mono text-[10px] text-slate-600 truncate">{proj.beforeImage}</p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-amber-900/15">
                      <div className="font-serif font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> După:
                      </div>
                      <p className="font-mono text-[10px] text-slate-600 truncate">{proj.afterImage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: METRICI GLOBALE & FOND REPARAȚII                        */}
        {/* ============================================================== */}
        {activeTab === "metrics" && (
          <div className="bg-white/85 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#071330]">Metrici Agregate & Fond Reparații Municipale</h3>
              <p className="text-xs text-slate-600">
                Ajustați contoarele de impact afișate public în secțiunile site-ului
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-serif">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Total Formulare 230 Colectate</label>
                <input
                  type="number"
                  min="0"
                  value={metrics.totalFormsCollected}
                  onChange={(e) => setMetrics({ ...metrics, totalFormsCollected: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Țintă Total Formulare Municipiu</label>
                <input
                  type="number"
                  min="1"
                  value={metrics.totalFormsTarget}
                  onChange={(e) => setMetrics({ ...metrics, totalFormsTarget: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Fonduri Adunate Manoperă (RON)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={metrics.totalFundsCollectedRon}
                  onChange={(e) => setMetrics({ ...metrics, totalFundsCollectedRon: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Țintă Totală Fonduri (RON)</label>
                <input
                  type="number"
                  min="1"
                  step="500"
                  value={metrics.totalFundsTargetRon}
                  onChange={(e) => setMetrics({ ...metrics, totalFundsTargetRon: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Număr Asociații Active</label>
                <input
                  type="number"
                  min="0"
                  value={metrics.activeAssociationsCount}
                  onChange={(e) => setMetrics({ ...metrics, activeAssociationsCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => saveMetricsState(metrics)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" /> Salvează Metricile Globale
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FORMULARE 230 & CONFIGURARE FISCALĂ ONG                */}
        {/* ============================================================== */}
        {activeTab === "form230" && (
          <div className="space-y-8">
            {/* Secțiunea 1: Parametri Fiscali ONG */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-900/15">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#071330] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-700" />
                    Configurare Parametri Fiscali ONG (Formular 230)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Acești parametri sunt injectați automat în ambele variante publice ale site-ului (pagina dedicată <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono">/formular-230</code> și fereastra modală de donații).
                  </p>
                </div>

                <button
                  onClick={loadF230Data}
                  disabled={isLoadingF230}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif text-slate-700 hover:text-amber-800 bg-white border border-amber-900/20 shadow-sm shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingF230 ? "animate-spin" : ""}`} />
                  <span>Reîmprospătează</span>
                </button>
              </div>

              <form onSubmit={handleSaveOngConfig} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-serif">
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Denumire Oficială Asociație / ONG *
                    </label>
                    <input
                      type="text"
                      required
                      value={ongConfig.name}
                      onChange={(e) => setOngConfig({ ...ongConfig, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-semibold shadow-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Cod de Identificare Fiscală (CIF) *
                    </label>
                    <input
                      type="text"
                      required
                      value={ongConfig.cif}
                      onChange={(e) => setOngConfig({ ...ongConfig, cif: e.target.value })}
                      placeholder="Ex: 48923410"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-mono font-bold shadow-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Cont Bancar Oficial (IBAN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={ongConfig.iban}
                      onChange={(e) => setOngConfig({ ...ongConfig, iban: e.target.value })}
                      placeholder="Ex: RO94BACX0000004234473000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-mono font-bold shadow-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Banca Comercială *
                    </label>
                    <input
                      type="text"
                      required
                      value={ongConfig.bank}
                      onChange={(e) => setOngConfig({ ...ongConfig, bank: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-semibold shadow-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Cota Redirecționată din Impozit
                    </label>
                    <input
                      type="text"
                      required
                      value={ongConfig.percentage}
                      onChange={(e) => setOngConfig({ ...ongConfig, percentage: e.target.value })}
                      placeholder="3,5%"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-bold shadow-sm focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">
                      Perioadă Opțiune (Ani)
                    </label>
                    <select
                      value={ongConfig.distributeYears}
                      onChange={(e) => setOngConfig({ ...ongConfig, distributeYears: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 font-semibold shadow-sm focus:border-amber-600 focus:outline-none"
                    >
                      <option value={2}>2 ani (Opțiune legală extinsă)</option>
                      <option value={1}>1 an (Doar anul fiscal curent)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingOngConfig}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingOngConfig ? "Se salvează..." : "Salvează Setările Fiscale ONG"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Secțiunea 2: Registru Formulare 230 Colectate */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900">
              {/* Metrici sumare */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-600/20">
                  <span className="text-[11px] font-serif text-slate-600 uppercase tracking-wider block">
                    Total Formulare Colectate
                  </span>
                  <span className="text-2xl font-serif font-black text-[#071330] mt-1 block">
                    {f230List.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-600/20">
                  <span className="text-[11px] font-serif text-slate-600 uppercase tracking-wider block">
                    Formulare Validate Intern
                  </span>
                  <span className="text-2xl font-serif font-black text-blue-900 mt-1 block">
                    {f230List.filter((f) => f.status === "validat").length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-600/20">
                  <span className="text-[11px] font-serif text-slate-600 uppercase tracking-wider block">
                    Depuse Oficial la ANAF Prahova
                  </span>
                  <span className="text-2xl font-serif font-black text-emerald-900 mt-1 block">
                    {f230List.filter((f) => f.status === "depus_anaf").length}
                  </span>
                </div>
              </div>

              {/* Filtrare & Căutare */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-2">
                <div className="relative min-w-[240px] flex-1 sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={f230Search}
                    onChange={(e) => setF230Search(e.target.value)}
                    placeholder="Caută după nume, telefon, CNP sau adresă..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-amber-900/25 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 p-1 bg-white border border-amber-900/20 rounded-xl text-xs font-serif shadow-sm">
                    {(["all", "inregistrat", "validat", "depus_anaf"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setF230StatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                          f230StatusFilter === st
                            ? "bg-[#c48834] text-white font-bold shadow-sm"
                            : "text-slate-600 hover:text-slate-950"
                        }`}
                      >
                        {st === "all" ? "Toate" : st === "depus_anaf" ? "Depus ANAF" : st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportAnafBorderou}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all active:scale-[0.98]"
                    title="Descarcă borderoul în format CSV compatibil Excel pentru depunere la ANAF"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportă Borderou ANAF (Excel / CSV)</span>
                  </button>
                </div>
              </div>

              {/* Tabel Submisii Formular 230 */}
              <div className="overflow-x-auto rounded-2xl border border-amber-900/20 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F5EDE1] text-amber-950 font-serif font-bold border-b border-amber-900/20">
                      <th className="py-3 px-4">Dată</th>
                      <th className="py-3 px-4">Nume & Prenume</th>
                      <th className="py-3 px-4">CNP (Mascat PII)</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Adresă / Oraș</th>
                      <th className="py-3 px-4 text-center">Opțiune 2 Ani</th>
                      <th className="py-3 px-4">Status & Gestiune</th>
                      <th className="py-3 px-4 text-center">Formular ANAF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 bg-white">
                    {f230List
                      .filter((item) => {
                        if (f230StatusFilter !== "all" && item.status !== f230StatusFilter) return false;
                        if (!f230Search) return true;
                        const q = f230Search.toLowerCase();
                        return (
                          item.lastName.toLowerCase().includes(q) ||
                          item.firstName.toLowerCase().includes(q) ||
                          item.phone.toLowerCase().includes(q) ||
                          item.cnp.includes(q) ||
                          item.address.toLowerCase().includes(q)
                        );
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-serif font-bold text-[#071330] whitespace-nowrap">
                            {item.lastName} {item.firstName} {item.initialaTata ? `(${item.initialaTata})` : ""}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap font-medium">
                            {maskCnp(item.cnp)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <div>{item.phone}</div>
                            <div className="text-[11px] text-slate-400">{item.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={item.address}>
                            {item.address}, {item.city}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.distributeFor2Years ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                2 Ani
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                1 An
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateF230Status(item.id, e.target.value as Formular230Status)
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                item.status === "depus_anaf"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : item.status === "validat"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="inregistrat">Înregistrat</option>
                              <option value="validat">Validat Intern</option>
                              <option value="depus_anaf">Depus ANAF</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedFormForPreview(item)}
                                title="Previzualizează documentul oficial ANAF semnat"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 font-serif font-bold text-xs border border-amber-600/30 transition-colors shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-800" />
                                <span>Vezi PDF</span>
                              </button>
                              <button
                                onClick={() => handleArchiveF230(item.id)}
                                title="Arhivează formularul (rămâne securizat în baza de date)"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {f230List.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-serif italic">
                          Nu există încă formulare 230 înregistrate în sistem.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: DONAȚII & SPONSORIZĂRI (BANI & MATERIALE)               */}
        {/* ============================================================== */}
        {activeTab === "donations" && (
          <div className="space-y-6">
            {/* Header & Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/90 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-serif font-bold">
                  <span>Fond Colectat din Donații</span>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-[#071330]">
                  {donations
                    .filter((d) => d.type === "bani" && d.amountRon)
                    .reduce((sum, d) => sum + (d.amountRon || 0), 0)
                    .toLocaleString("ro-RO")}{" "}
                  <span className="text-sm font-normal text-slate-600">RON</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {donations.filter((d) => d.type === "bani").length} donații financiare directe
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-serif font-bold">
                  <span>Sponsorizări în Materiale</span>
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-[#071330]">
                  {donations.filter((d) => d.type === "materiale").length}
                </div>
                <p className="text-[11px] text-slate-500">Țevi, fitinguri PPR, izolații, vopsea etc.</p>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-serif font-bold">
                  <span>Total Înregistrări Active</span>
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-[#071330]">{donations.length}</div>
                <p className="text-[11px] text-slate-500">Înregistrate în baza de date securizată</p>
              </div>
            </div>

            {/* Actions Bar: Search, Filters & Export Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    placeholder="Caută donator, firmă, telefon..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/95 border border-amber-900/25 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white/85 border border-amber-900/20 rounded-xl text-xs font-serif shadow-sm">
                  {[
                    { key: "all", label: "Toate" },
                    { key: "bani", label: "Bani" },
                    { key: "materiale", label: "Materiale" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setDonationFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        donationFilter === filter.key
                          ? "bg-[#c48834] text-white font-bold shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportDonations}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-800 bg-white border border-amber-900/25 hover:bg-amber-50 hover:border-amber-600 transition-all shadow-sm"
                  title="Descarcă tabelul complet al donațiilor și sponsorizărilor în format Excel / CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Exportă Registru Donații (Excel / CSV)</span>
                </button>
              </div>
            </div>

            {/* Donations Table */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-900/20 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-amber-900/15 text-slate-700 font-serif font-bold">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Donator / Companie</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Tip & Valoare</th>
                      <th className="py-3.5 px-4">Destinație (Asociație / Bloc)</th>
                      <th className="py-3.5 px-4">Data</th>
                      <th className="py-3.5 px-4">Status & Gestiune</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 text-slate-800">
                    {donations
                      .filter((d) => {
                        const matchesSearch =
                          donationSearch === "" ||
                          d.companyOrName.toLowerCase().includes(donationSearch.toLowerCase()) ||
                          d.phone.includes(donationSearch) ||
                          (d.email && d.email.toLowerCase().includes(donationSearch.toLowerCase())) ||
                          (d.targetAssociationName &&
                            d.targetAssociationName.toLowerCase().includes(donationSearch.toLowerCase()));

                        const matchesFilter =
                          donationFilter === "all" ||
                          (donationFilter === "bani" && d.type === "bani") ||
                          (donationFilter === "materiale" && d.type === "materiale");

                        return matchesSearch && matchesFilter;
                      })
                      .map((d, idx) => (
                        <tr key={d.id} className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-serif font-bold text-[#071330]">{d.companyOrName}</div>
                            {d.description && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                                {d.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-sans space-y-0.5">
                            <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${d.phone}`} className="hover:underline">
                                {d.phone}
                              </a>
                            </div>
                            {d.email && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <a href={`mailto:${d.email}`} className="hover:underline">
                                  {d.email}
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-serif">
                            {d.type === "bani" ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{d.amountRon ? `${d.amountRon.toLocaleString("ro-RO")} RON` : "Bani"}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                                <span>
                                  {d.quantity} {d.unit || "buc"} {d.materialType || "materiale"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-serif font-medium text-slate-700">
                            {d.targetAssociationName ? (
                              <span className="text-[#071330] font-bold">{d.targetAssociationName}</span>
                            ) : (
                              <span className="text-slate-500 italic">Fond General Ploiești</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString("ro-RO") : "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={d.status}
                              onChange={(e) =>
                                handleUpdateDonationStatus(
                                  d.id,
                                  e.target.value as "inregistrat" | "confirmat" | "finalizat"
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${
                                d.status === "finalizat"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : d.status === "confirmat"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="inregistrat">Înregistrat</option>
                              <option value="confirmat">Confirmat / Preluat</option>
                              <option value="finalizat">Finalizat & Decontat</option>
                            </select>
                          </td>
                        </tr>
                      ))}

                    {donations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-serif italic">
                          <HeartHandshake className="w-8 h-8 text-amber-700/40 mx-auto mb-2" />
                          Nu există încă donații sau sponsorizări înregistrate în sistem.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* Modal Previzualizare & Tipărire Formular 230 ANAF Oficial */}
        {selectedFormForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
            <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-amber-900/30 my-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between pb-4 mb-4 bg-white border-b border-amber-900/15">
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#071330] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-700" />
                    Formular 230 Oficial — {selectedFormForPreview.lastName} {selectedFormForPreview.firstName}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Document generat automat conform modelului aprobat prin Ordinul ANAF.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedFormForPreview(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto pb-4">
                <Formular230OfficialDoc
                  formData={{
                    lastName: selectedFormForPreview.lastName,
                    firstName: selectedFormForPreview.firstName,
                    initialaTata: selectedFormForPreview.initialaTata,
                    cnp: selectedFormForPreview.cnp,
                    address: selectedFormForPreview.address,
                    city: selectedFormForPreview.city,
                    county: selectedFormForPreview.county,
                    phone: selectedFormForPreview.phone,
                    email: selectedFormForPreview.email,
                    signatureDataUrl: selectedFormForPreview.signatureDataUrl,
                    distributeFor2Years: selectedFormForPreview.distributeFor2Years,
                  }}
                  ongConfig={ongConfig}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Previzualizare & Tipărire Fișă de Avizier (Format A4) */}
        <NoticeBoardModal
          isOpen={isNoticeBoardOpen}
          association={selectedAssocForNoticeBoard}
          onClose={() => {
            setIsNoticeBoardOpen(false);
            setSelectedAssocForNoticeBoard(null);
          }}
        />
      </div>
    </div>
  );
}

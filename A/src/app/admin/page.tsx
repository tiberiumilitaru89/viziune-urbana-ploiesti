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
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AuditRequest, AuditStatus, PartnerItem, ProjectItem, GlobalMetrics } from "@/lib/types";
import {
  INITIAL_ASSOCIATIONS,
  INITIAL_PARTNERS,
  INITIAL_PROJECTS,
  INITIAL_METRICS,
} from "@/lib/data";

type AdminTab = "associations" | "partners" | "projects" | "metrics";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("associations");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States
  const [associations, setAssociations] = useState<AuditRequest[]>([...INITIAL_ASSOCIATIONS]);
  const [partners, setPartners] = useState<PartnerItem[]>([...INITIAL_PARTNERS]);
  const [projects, setProjects] = useState<ProjectItem[]>([...INITIAL_PROJECTS]);
  const [metrics, setMetrics] = useState<GlobalMetrics>({ ...INITIAL_METRICS });

  // Filters & Searches
  const [assocFilter, setAssocFilter] = useState<string>("all");
  const [assocSearch, setAssocSearch] = useState<string>("");

  // Modals / Expandable Forms
  const [showAddAssoc, setShowAddAssoc] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

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

  // Load from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAssoc = localStorage.getItem("vup_associations");
        if (savedAssoc) {
          const parsed = JSON.parse(savedAssoc);
          if (Array.isArray(parsed) && parsed.length > 0) setAssociations(parsed);
        }

        const savedPartners = localStorage.getItem("vup_partners");
        if (savedPartners) {
          const parsed = JSON.parse(savedPartners);
          if (Array.isArray(parsed) && parsed.length > 0) setPartners(parsed);
        }

        const savedProjects = localStorage.getItem("vup_projects");
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) setProjects(parsed);
        }

        const savedMetrics = localStorage.getItem("vup_metrics");
        if (savedMetrics) {
          const parsed = JSON.parse(savedMetrics);
          if (parsed && typeof parsed.totalFormsCollected === "number") setMetrics(parsed);
        }
      } catch {
        // Fallback to initial
      }
    }
  }, []);

  // Save Associations
  const saveAssociationsState = (updated: AuditRequest[]) => {
    setAssociations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("vup_associations", JSON.stringify(updated));
    }
    showToast("Asociațiile și indicatorii au fost actualizați cu succes!");
  };

  // Save Partners
  const savePartnersState = (updated: PartnerItem[]) => {
    setPartners(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("vup_partners", JSON.stringify(updated));
    }
    showToast("Registrul partenerilor a fost salvat cu succes!");
  };

  // Save Projects
  const saveProjectsState = (updated: ProjectItem[]) => {
    setProjects(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("vup_projects", JSON.stringify(updated));
    }
    showToast("Galeria de proiecte și fotografiile au fost actualizate!");
  };

  // Save Metrics
  const saveMetricsState = (updated: GlobalMetrics) => {
    setMetrics(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("vup_metrics", JSON.stringify(updated));
    }
    showToast("Metricile globale și fondul de reparații au fost salvate!");
  };

  // Reset to Factory Defaults
  const handleResetDefaults = () => {
    if (confirm("Sigur doriți să resetați toate datele la valorile inițiale din sistem?")) {
      setAssociations([...INITIAL_ASSOCIATIONS]);
      setPartners([...INITIAL_PARTNERS]);
      setProjects([...INITIAL_PROJECTS]);
      setMetrics({ ...INITIAL_METRICS });

      if (typeof window !== "undefined") {
        localStorage.removeItem("vup_associations");
        localStorage.removeItem("vup_partners");
        localStorage.removeItem("vup_projects");
        localStorage.removeItem("vup_metrics");
      }
      showToast("Toate datele au fost resetate la valorile implicite.");
    }
  };

  // Login Handler (Password: vup2026 strictly)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "vup2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Parolă autorizată incorectă. Încercați din nou.");
    }
  };

  // Add Association
  const handleCreateAssociation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssoc.building || !newAssoc.address) {
      alert("Numele blocului și adresa sunt obligatorii.");
      return;
    }

    const created: AuditRequest = {
      id: `req-${Date.now()}`,
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

    const updated = [created, ...associations];
    saveAssociationsState(updated);
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
  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.role) {
      alert("Numele și rolul partenerului sunt obligatorii.");
      return;
    }

    const created: PartnerItem = {
      ...newPartner,
      id: `part-${Date.now()}`,
    };

    savePartnersState([...partners, created]);
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
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      alert("Titlul și descrierea proiectului sunt obligatorii.");
      return;
    }

    const created: ProjectItem = {
      ...newProject,
      id: `proj-${Date.now()}`,
    };

    saveProjectsState([created, ...projects]);
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
  const filteredAssociations = associations.filter((r) => {
    const matchesFilter = assocFilter === "all" || r.status === assocFilter;
    const matchesSearch =
      r.building.toLowerCase().includes(assocSearch.toLowerCase()) ||
      r.address.toLowerCase().includes(assocSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(assocSearch.toLowerCase()) ||
      r.phone.includes(assocSearch);
    return matchesFilter && matchesSearch;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
        <div className="w-full max-w-md bg-[#0a142f] border-2 border-amber-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-4 bg-[#070d1e] shadow-lg shadow-amber-950/50">
              <Image
                src="/official-logo.jpg"
                alt="Sigla Oficială Asociația Viziune Urbană Ploiești"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-serif font-black text-white">Panou de Administrare</h1>
            <p className="text-xs text-amber-300 font-serif mt-1">
              Asociația Viziune Urbană Ploiești & Instal Serv Becheanu
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
              <label className="block text-xs font-serif font-bold text-slate-300 mb-2">
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
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#050914] border border-amber-900/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-950/60 transition-all active:scale-[0.99]"
            >
              Autentificare în Panou
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Înapoi pe site-ul public
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 p-4 sm:p-8 selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-serif font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/50 shrink-0 bg-[#0a142f] shadow-md">
              <Image
                src="/official-logo.jpg"
                alt="Sigla Oficială"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-white">
                Panou de Administrare — Viziune Urbană Ploiești
              </h1>
              <p className="text-xs text-amber-300 font-serif">
                Gestiune Asociații, Parteneri (Instal Serv Becheanu), Galerie Lucrări și Metrici
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              title="Resetează la datele inițiale"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif text-slate-400 hover:text-rose-300 bg-[#0a142f] border border-amber-900/30 hover:border-rose-900/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetare</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Vezi Site-ul Public
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#0a142f] border border-amber-900/40 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("associations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "associations"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Asociații de Proprietari ({associations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "partners"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parteneri ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "projects"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galerie & Poze Înainte/După ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
              activeTab === "metrics"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrici & Fond Reparații</span>
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
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0a142f] border border-amber-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#0a142f] border border-amber-900/30 rounded-xl text-xs font-serif">
                  {(["all", "nou", "in_evaluare", "acceptat", "finalizat"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAssocFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        assocFilter === st
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st === "all" ? "Toate" : st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Association Button */}
              <button
                onClick={() => setShowAddAssoc(!showAddAssoc)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddAssoc ? "Anulează" : "Adaugă Asociație Nouă"}</span>
              </button>
            </div>

            {/* Expandable Form: Adaugă Asociație */}
            {showAddAssoc && (
              <form
                onSubmit={handleCreateAssociation}
                className="bg-[#0a142f] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
              >
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Înregistrează o Asociație Nouă în Sistem
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-serif">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Nume Asociație / Bloc *</label>
                    <input
                      type="text"
                      required
                      value={newAssoc.building}
                      onChange={(e) => setNewAssoc({ ...newAssoc, building: e.target.value })}
                      placeholder="Ex: Asociația Bloc 18B — Cartier Nord"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Adresă Detaliată *</label>
                    <input
                      type="text"
                      required
                      value={newAssoc.address}
                      onChange={(e) => setNewAssoc({ ...newAssoc, address: e.target.value })}
                      placeholder="Ex: Str. Cameliei nr. 12, Ploiești"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Persoană Contact / Solicitant</label>
                    <input
                      type="text"
                      value={newAssoc.name}
                      onChange={(e) => setNewAssoc({ ...newAssoc, name: e.target.value })}
                      placeholder="Ex: Ion Popescu (Președinte)"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Telefon Contact</label>
                    <input
                      type="text"
                      value={newAssoc.phone}
                      onChange={(e) => setNewAssoc({ ...newAssoc, phone: e.target.value })}
                      placeholder="Ex: 0722123456"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Număr Formulare ANAF 230 (Actual / Țintă)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={newAssoc.formsCollected}
                        onChange={(e) => setNewAssoc({ ...newAssoc, formsCollected: Number(e.target.value) })}
                        placeholder="Colectate"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        value={newAssoc.formsTarget}
                        onChange={(e) => setNewAssoc({ ...newAssoc, formsTarget: Number(e.target.value) })}
                        placeholder="Țintă"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Fond Reparații Manoperă (RON Actual / Țintă)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={newAssoc.fundsCollected}
                        onChange={(e) => setNewAssoc({ ...newAssoc, fundsCollected: Number(e.target.value) })}
                        placeholder="Colectat"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        value={newAssoc.fundsTarget}
                        onChange={(e) => setNewAssoc({ ...newAssoc, fundsTarget: Number(e.target.value) })}
                        placeholder="Țintă"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-slate-300 mb-1 font-bold">Defecțiuni Sesizate la Subsol</label>
                    <textarea
                      rows={2}
                      value={newAssoc.problem}
                      onChange={(e) => setNewAssoc({ ...newAssoc, problem: e.target.value })}
                      placeholder="Ex: Țevi de încălzire sparte, pierderi permanente de apă rece, igrasie și rugină."
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAssoc(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-400 hover:text-white"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg"
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
                  className="bg-[#0a142f] border border-amber-900/40 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-amber-900/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-white">{assoc.building}</h4>
                        <span className="font-mono text-[10px] text-slate-500">ID: {assoc.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> {assoc.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" /> {assoc.name} ({assoc.phone})
                        </span>
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-400 font-serif">Stadiu FSM:</label>
                      <select
                        value={assoc.status}
                        onChange={(e) => {
                          const updated = associations.map((item) =>
                            item.id === assoc.id ? { ...item, status: e.target.value as AuditStatus } : item
                          );
                          saveAssociationsState(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#050914] border border-amber-900/40 text-xs text-amber-300 font-serif font-bold focus:outline-none"
                      >
                        <option value="nou">Nou Înscris</option>
                        <option value="in_evaluare">În Curs de Evaluare</option>
                        <option value="acceptat">Acceptat în Program</option>
                        <option value="respins">Respins</option>
                        <option value="finalizat">Lucrare Finalizată</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-[#050914]/60 p-3 rounded-xl border border-amber-900/20">
                    &quot;{assoc.problem}&quot;
                  </p>

                  {/* Inline Metrics Editors: Număr Formulare & Fond Reparații */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Formulare ANAF 230 */}
                    <div className="bg-[#050914] p-3.5 rounded-xl border border-amber-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-300">
                        <span>Actualizare Nr. Formulare 230:</span>
                        <span>{Math.round((assoc.formsCollected / assoc.formsTarget) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Colectate:</span>
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
                            className="w-20 px-2 py-1 rounded bg-[#0a142f] border border-amber-900/50 text-white text-center font-bold"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Țintă:</span>
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
                            className="w-20 px-2 py-1 rounded bg-[#0a142f] border border-amber-900/50 text-white text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fond Reparații Manoperă */}
                    <div className="bg-[#050914] p-3.5 rounded-xl border border-amber-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-300">
                        <span>Actualizare Fond Reparații (Manoperă):</span>
                        <span>{Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Colectat (RON):</span>
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
                            className="w-24 px-2 py-1 rounded bg-[#0a142f] border border-amber-900/50 text-white text-center font-bold"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Țintă (RON):</span>
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
                            className="w-24 px-2 py-1 rounded bg-[#0a142f] border border-amber-900/50 text-white text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar for Item */}
                  <div className="flex justify-end items-center gap-2.5 pt-2">
                    <button
                      onClick={() => saveAssociationsState(associations)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvează Modificările
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Sigur doriți să ștergeți asociația "${assoc.building}"?`)) {
                          const updated = associations.filter((item) => item.id !== assoc.id);
                          saveAssociationsState(updated);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Șterge
                    </button>
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
                <h3 className="text-lg font-serif font-bold text-white">Parteneri Acreditați & Tehnici</h3>
                <p className="text-xs text-slate-400">
                  Adăugați și gestionați partenerii oficiali afișați pe site (inclusiv Instal Serv Becheanu)
                </p>
              </div>

              <button
                onClick={() => setShowAddPartner(!showAddPartner)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddPartner ? "Anulează" : "Adaugă Partener"}</span>
              </button>
            </div>

            {/* Expandable Add Partner Form */}
            {showAddPartner && (
              <form
                onSubmit={handleCreatePartner}
                className="bg-[#0a142f] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
              >
                <h4 className="font-serif text-base font-bold text-white">Adăugare Partener Nou</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-serif">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Denumire Partener *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      placeholder="Ex: Instal Serv Becheanu"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Rol Oficial *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.role}
                      onChange={(e) => setNewPartner({ ...newPartner, role: e.target.value })}
                      placeholder="Ex: Partener Tehnic de Execuție"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Categorie Partener</label>
                    <select
                      value={newPartner.category}
                      onChange={(e) =>
                        setNewPartner({
                          ...newPartner,
                          category: e.target.value as PartnerItem["category"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    >
                      <option value="executie">Execuție Tehnică (Instal Serv Becheanu)</option>
                      <option value="practica">Practică & Calificare Profesională (ACCRP / Toma Socolescu)</option>
                      <option value="comunitate">Comunitate & Inițiativă Civic</option>
                      <option value="academic">Academic & Științific (UPG)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-slate-300 mb-1 font-bold">Descriere Competențe & Implicare</label>
                    <textarea
                      rows={2}
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                      placeholder="Ex: Execuție profesionistă cu echipe autorizate și garanție de 5 ani."
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPartner(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-400 hover:text-white"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow"
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
                  className="bg-[#0a142f] border border-amber-900/40 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded bg-[#050914] border border-amber-900/40">
                        {partner.category.toUpperCase()}
                      </span>
                      <h4 className="font-serif text-base font-bold text-white mt-2">{partner.name}</h4>
                      <p className="text-xs text-amber-300 font-serif">{partner.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Ștergeți partenerul "${partner.name}"?`)) {
                          savePartnersState(partners.filter((p) => p.id !== partner.id));
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{partner.description}</p>
                </div>
              ))}
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
                <h3 className="text-lg font-serif font-bold text-white">Galerie Lucrări & Comparații Foto</h3>
                <p className="text-xs text-slate-400">
                  Adăugați proiecte finalizate, actualizați titlul și pozele Înainte de intervenție / După recepție
                </p>
              </div>

              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProject ? "Anulează" : "Adaugă Lucrare / Poze"}</span>
              </button>
            </div>

            {/* Expandable Add Project Form */}
            {showAddProject && (
              <form
                onSubmit={handleCreateProject}
                className="bg-[#0a142f] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
              >
                <h4 className="font-serif text-base font-bold text-white">Adăugare Lucrare & Set Fotografic</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1 font-bold">Titlu Proiect *</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Ex: Reabilitare completă subsol Bloc 8B — Cartier Nord"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1 font-bold">Descriere Tehnică *</label>
                    <textarea
                      rows={2}
                      required
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Ex: Înlocuire integrală 180 metri liniari trasee PPR fibră compozită, izolație Armaflex 19mm."
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">URL / Cale Poză: Înainte de intervenție</label>
                    <input
                      type="text"
                      required
                      value={newProject.beforeImage}
                      onChange={(e) => setNewProject({ ...newProject, beforeImage: e.target.value })}
                      placeholder="/ref-assets/before-DmrOVzle.png sau link extern"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">URL / Cale Poză: După recepție</label>
                    <input
                      type="text"
                      required
                      value={newProject.afterImage}
                      onChange={(e) => setNewProject({ ...newProject, afterImage: e.target.value })}
                      placeholder="/ref-assets/after-C5YhGlz_.png sau link extern"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Data Finalizării / Recepției</label>
                    <input
                      type="text"
                      value={newProject.completionDate}
                      onChange={(e) => setNewProject({ ...newProject, completionDate: e.target.value })}
                      placeholder="Ex: Octombrie 2026"
                      className="w-full px-3 py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-4 py-2 rounded-xl text-xs font-serif text-slate-400 hover:text-white"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow"
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
                  className="bg-[#0a142f] border border-amber-900/40 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-base font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Ștergeți lucrarea "${proj.title}"?`)) {
                          saveProjectsState(projects.filter((p) => p.id !== proj.id));
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 self-start sm:self-center p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#050914] rounded-xl border border-amber-900/20">
                      <div className="font-serif font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Înainte:
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">{proj.beforeImage}</p>
                    </div>

                    <div className="p-3 bg-[#050914] rounded-xl border border-amber-900/20">
                      <div className="font-serif font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> După:
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">{proj.afterImage}</p>
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
          <div className="bg-[#0a142f] border border-amber-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Metrici Agregate & Fond Reparații Municipale</h3>
              <p className="text-xs text-slate-400">
                Ajustați contoarele de impact afișate public în secțiunile site-ului
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-serif">
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Total Formulare 230 Colectate</label>
                <input
                  type="number"
                  min="0"
                  value={metrics.totalFormsCollected}
                  onChange={(e) => setMetrics({ ...metrics, totalFormsCollected: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Țintă Total Formulare Municipiu</label>
                <input
                  type="number"
                  min="1"
                  value={metrics.totalFormsTarget}
                  onChange={(e) => setMetrics({ ...metrics, totalFormsTarget: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Fonduri Adunate Manoperă (RON)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={metrics.totalFundsCollectedRon}
                  onChange={(e) => setMetrics({ ...metrics, totalFundsCollectedRon: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Țintă Totală Fonduri (RON)</label>
                <input
                  type="number"
                  min="1"
                  step="500"
                  value={metrics.totalFundsTargetRon}
                  onChange={(e) => setMetrics({ ...metrics, totalFundsTargetRon: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Număr Asociații Active</label>
                <input
                  type="number"
                  min="0"
                  value={metrics.activeAssociationsCount}
                  onChange={(e) => setMetrics({ ...metrics, activeAssociationsCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => saveMetricsState(metrics)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg"
              >
                <Save className="w-4 h-4" /> Salvează Metricile Globale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

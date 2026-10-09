"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Wrench, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  MessageCircle,
  FileCheck
} from "lucide-react";
import { PublicAssociationSummary, AuditStatus } from "@/lib/types";
import { INITIAL_ASSOCIATIONS } from "@/lib/data";

const FSM_STEPS = [
  { key: "nou", label: "1. Cerere Înregistrată", desc: "Dosar deschis și preluat în registrul civic", icon: FileText },
  { key: "in_evaluare", label: "2. Evaluare Tehnică în Teren", desc: "Inspecție vizuală conducte & măsurători Instal Serv Becheanu", icon: Search },
  { key: "acceptat", label: "3. Soluție & Sponsorizare Aprobată", desc: "0 LEI materiale locatari (PPR PN20 + Armaflex 19mm)", icon: CheckCircle2 },
  { key: "in_executie", label: "4. Lucrări în Execuție", desc: "Demontare fontă ruginită și montaj trasee noi", icon: Wrench },
  { key: "finalizat", label: "5. Recepție & Garanție 5 Ani", desc: "Lucrare predată cu proces verbal și garanție oficială", icon: ShieldCheck },
];

function getStepIndex(status: AuditStatus): number {
  switch (status) {
    case "nou":
      return 0;
    case "in_evaluare":
      return 1;
    case "acceptat":
      return 2;
    case "finalizat":
      return 4;
    case "respins":
      return -1;
    default:
      return 0;
  }
}

export default function StatusTrackerPage() {
  const [associations, setAssociations] = useState<PublicAssociationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Toate");
  const [selectedAssoc, setSelectedAssoc] = useState<PublicAssociationSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const queryParam = urlParams?.get("q") || urlParams?.get("dosar") || urlParams?.get("search");
      if (queryParam) {
        setSearchTerm(queryParam);
      }

      try {
        const res = await fetch("/api/public/data");
        const json = await res.json();
        let loadedList: PublicAssociationSummary[] = [];

        if (json.success && json.data?.associations) {
          loadedList = json.data.associations;
        } else {
          // Fallback din date locale
          loadedList = INITIAL_ASSOCIATIONS.map((r, idx) => ({
            id: r.id,
            dosarNumber: r.dosarNumber || `DOSAR-PH-${101 + idx}`,
            building: r.building,
            address: r.address,
            neighborhood: r.neighborhood,
            problem: r.problem,
            status: r.status,
            formsCollected: r.formsCollected,
            formsTarget: r.formsTarget,
            fundsCollected: r.fundsCollected,
            fundsTarget: r.fundsTarget,
            createdAt: r.createdAt,
          }));
        }

        setAssociations(loadedList);
        if (loadedList.length > 0) {
          if (queryParam) {
            const matched = loadedList.find(
              (a) =>
                (a.dosarNumber && a.dosarNumber.toLowerCase() === queryParam.toLowerCase()) ||
                a.building.toLowerCase().includes(queryParam.toLowerCase())
            );
            setSelectedAssoc(matched || loadedList[0]);
          } else {
            setSelectedAssoc(loadedList[0]);
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    associations.forEach((a) => {
      if (a.neighborhood) set.add(a.neighborhood);
    });
    return ["Toate", ...Array.from(set)];
  }, [associations]);

  const filtered = useMemo(() => {
    return associations.filter((a) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        (a.dosarNumber && a.dosarNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        a.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchNeighborhood =
        selectedNeighborhood === "Toate" || a.neighborhood === selectedNeighborhood;

      return matchSearch && matchNeighborhood;
    });
  }, [associations, searchTerm, selectedNeighborhood]);

  const currentStep = selectedAssoc ? getStepIndex(selectedAssoc.status) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#071330] selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-900/15 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-amber-800 group-hover:-translate-x-1 transition-transform" />
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-600/30 bg-white">
              <Image
                src="/official-logo.jpg"
                alt="Logo VUP"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-black text-sm text-[#071330] leading-none">
                VIZIUNE URBANĂ PLOIEȘTI
              </div>
              <div className="text-[10px] font-bold text-amber-800 tracking-wider">
                PORTAL PUBLIC DE URMARIRE DOSAR
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/formular-230"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-950 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 transition-all shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-amber-800" />
              Completează Formularul 230
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-900/10 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            TRANSPARENȚĂ CIVICĂ TOTALĂ — DATE ÎN TIMP REAL
          </div>

          <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#071330] tracking-tight">
            Urmărește Stadiul Dosarului Blocului Tău
          </h1>

          <p className="font-serif text-sm sm:text-base text-slate-700 max-w-2xl mx-auto">
            Verifică live etapele tehnice ale fiecărui bloc înscris în programul municipal de reabilitare a subsolurilor din Ploiești: de la inspecția tehnică până la predarea cu <strong>garanție de 5 ani</strong>.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-amber-800/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Introdu Număr Dosar (ex: DOSAR-PH-101) sau Numele Blocului..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-amber-900/20 text-[#071330] placeholder-slate-400 font-serif text-sm sm:text-base shadow-lg focus:outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Șterge
                </button>
              )}
            </div>

            {/* Neighborhood filter chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs font-serif font-bold text-slate-600 mr-1">Cartier:</span>
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNeighborhood(n)}
                  className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition-all ${
                    selectedNeighborhood === n
                      ? "bg-[#071330] text-amber-400 shadow-md scale-105"
                      : "bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-900/15"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Details + Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        {loading ? (
          <div className="py-20 text-center font-serif text-slate-600">
            Se încarcă registrul dosarelor tehnice din Ploiești...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center max-w-xl mx-auto border border-amber-900/15 shadow-sm space-y-4">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#071330]">
              Nu a fost găsit niciun dosar pentru căutarea ta.
            </h3>
            <p className="font-serif text-xs text-slate-600">
              Verifică dacă ai introdus corect numărul dosarului (ex: <code>DOSAR-PH-101</code>) sau numele străzii.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedNeighborhood("Toate");
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-xs"
            >
              Resetează Căutarea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Dossier Card & Live Visual Stepper (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {selectedAssoc && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-amber-900/20 p-6 sm:p-8 shadow-xl space-y-6">
                  {/* Dossier Header Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-900/10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-600/30 text-[#071330] font-mono font-bold text-xs tracking-wider">
                      <FileText className="w-4 h-4 text-amber-800" />
                      {selectedAssoc.dosarNumber || `DOSAR-PH-${selectedAssoc.id}`}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif text-slate-500">Stadiu dosar:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-serif font-bold ${
                          selectedAssoc.status === "finalizat"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : selectedAssoc.status === "acceptat"
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : selectedAssoc.status === "in_evaluare"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {selectedAssoc.status === "finalizat" && "✓ Lucrare Finalizată (Garanție 5 Ani)"}
                        {selectedAssoc.status === "acceptat" && "★ Proiect Aprobat & Finanțat"}
                        {selectedAssoc.status === "in_evaluare" && "⏱ În Curs de Evaluare Tehnică"}
                        {selectedAssoc.status === "nou" && "📝 Cerere Nou Înregistrată"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h2 className="font-serif font-black text-xl sm:text-2xl text-[#071330] tracking-tight">
                      {selectedAssoc.building}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-serif text-slate-600 mt-2">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{selectedAssoc.address}</span>
                      {selectedAssoc.neighborhood && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                          Cartier {selectedAssoc.neighborhood}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Problem Description */}
                  {selectedAssoc.problem && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-900/10 text-xs font-serif text-slate-800 leading-relaxed space-y-1">
                      <div className="font-bold text-amber-950 uppercase tracking-wider text-[10px]">
                        Constatare Situație Tehnică Subsol:
                      </div>
                      <p>{selectedAssoc.problem}</p>
                    </div>
                  )}

                  {/* FSM Stepper: 5 Progressive Steps */}
                  <div className="pt-2">
                    <div className="text-xs font-serif font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
                      <span>Etapele de Reabilitare (FSM Pipeline)</span>
                      <span className="text-amber-800 font-sans font-bold text-xs">
                        {currentStep >= 0 ? `Pasul ${currentStep + 1} din 5` : "În procesare"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {FSM_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStep > idx || selectedAssoc.status === "finalizat";
                        const isCurrent = currentStep === idx && selectedAssoc.status !== "finalizat";
                        const isPending = currentStep < idx;

                        return (
                          <div
                            key={step.key}
                            className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                              isDone
                                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                                : isCurrent
                                ? "bg-amber-500/15 border-amber-600/40 text-amber-950 ring-2 ring-amber-500/20 shadow-sm"
                                : "bg-white/60 border-slate-200 text-slate-400 opacity-70"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : isCurrent
                                  ? "bg-amber-600 text-white animate-pulse"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4
                                  className={`text-xs sm:text-sm font-serif font-bold ${
                                    isDone
                                      ? "text-emerald-900"
                                      : isCurrent
                                      ? "text-amber-950 font-black"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shrink-0">
                                    În Desfășurare
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] font-serif mt-0.5 ${
                                  isDone
                                    ? "text-emerald-800/80"
                                    : isCurrent
                                    ? "text-amber-900/90 font-medium"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobilization Bar: Formulare 230 & Semnături Bloc */}
                  <div className="p-5 rounded-2xl bg-[#071330] text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between text-xs font-serif">
                      <span className="font-bold text-amber-400 uppercase tracking-wider">
                        Mobilizare Locatari (Semnături Formular 230):
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {selectedAssoc.formsCollected} / {selectedAssoc.formsTarget} semnături
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((selectedAssoc.formsCollected / Math.max(1, selectedAssoc.formsTarget)) * 100)
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <p className="text-[11px] font-serif text-slate-300">
                        {selectedAssoc.formsCollected >= selectedAssoc.formsTarget ? (
                          <span className="text-emerald-400 font-bold">
                            ✓ Cvorum de semnături atins! Lucrările sunt programate cu prioritate.
                          </span>
                        ) : (
                          <span>
                            Mai sunt necesare{" "}
                            <strong className="text-amber-400">
                              {Math.max(0, selectedAssoc.formsTarget - selectedAssoc.formsCollected)} formulare
                            </strong>{" "}
                            pentru a trece la etapa de execuție.
                          </span>
                        )}
                      </p>

                      <Link
                        href="/formular-230"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs transition-colors shadow-sm"
                      >
                        <FileCheck className="w-4 h-4 text-slate-950" />
                        Semnează pentru acest bloc
                      </Link>
                    </div>
                  </div>

                  {/* Technical Coordinator Contact Channel */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-serif border-t border-amber-900/10">
                    <span className="text-slate-600">
                      Coordonator tehnic: <strong>George Becheanu (Instal Serv)</strong>
                    </span>
                    <a
                      href={`https://wa.me/40720015592?text=${encodeURIComponent(
                        `Bună ziua! Mă interesează stadiul dosarului ${selectedAssoc.dosarNumber || ""} pentru ${selectedAssoc.building} (${selectedAssoc.address}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Întreabă pe WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Directory of All Registered Dossiers (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black text-base text-[#071330] tracking-tight">
                  Dosare Înregistrate ({filtered.length})
                </h3>
                <span className="text-xs font-serif text-slate-500">
                  Selectează un bloc pentru detalii
                </span>
              </div>

              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                {filtered.map((assoc) => {
                  const isSelected = selectedAssoc?.id === assoc.id;
                  const step = getStepIndex(assoc.status);

                  return (
                    <button
                      key={assoc.id}
                      onClick={() => {
                        setSelectedAssoc(assoc);
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-white border-2 border-amber-800 shadow-md ring-2 ring-amber-500/20 scale-[1.02]"
                          : "bg-white/80 hover:bg-white border-amber-900/15 hover:border-amber-900/30 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-mono text-[11px] font-bold text-amber-900 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-600/20">
                          {assoc.dosarNumber || `DOSAR-PH-${assoc.id}`}
                        </div>

                        <span
                          className={`text-[10px] font-serif font-bold px-2 py-0.5 rounded-full ${
                            assoc.status === "finalizat"
                              ? "bg-emerald-100 text-emerald-800"
                              : assoc.status === "acceptat"
                              ? "bg-blue-100 text-blue-800"
                              : assoc.status === "in_evaluare"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {assoc.status === "finalizat" && "Finalizat"}
                          {assoc.status === "acceptat" && "Aprobat"}
                          {assoc.status === "in_evaluare" && "În evaluare"}
                          {assoc.status === "nou" && "Înregistrat"}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#071330] mt-2 leading-snug">
                        {assoc.building}
                      </h4>

                      <p className="font-serif text-xs text-slate-600 mt-1 line-clamp-1">
                        {assoc.address}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-serif text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        <span>Cartier {assoc.neighborhood || "Ploiești"}</span>
                        <span className="font-bold text-amber-900">
                          {assoc.formsCollected} / {assoc.formsTarget} semnături
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info Strip */}
      <footer className="bg-white border-t border-amber-900/15 py-6 px-4 text-center text-xs font-serif text-slate-600 space-y-1">
        <p>
          © 2026 Asociația Viziune Urbană Ploiești (CIF 48923410) & Instal Serv Becheanu SRL.
        </p>
        <p className="text-slate-500 text-[11px]">
          Portal civic de monitorizare a reabilitării blocurilor. Datele afișate sunt strict tehnice și respectă normele GDPR (fără expunere de date personale).
        </p>
      </footer>
    </div>
  );
}

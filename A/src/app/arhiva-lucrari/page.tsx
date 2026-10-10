"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";
import { ProjectItem, PhotoStage } from "@/lib/types";
import { INITIAL_PROJECTS } from "@/lib/data";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Columns,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Calendar,
  Layers,
  Wrench,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";

function ArhivaLucrariContent() {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("proiect");

  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    INITIAL_PROJECTS.filter((p) => p.status === "finalizat" && !p.isArchived)
  );
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const finalizate = INITIAL_PROJECTS.filter((p) => p.status === "finalizat" && !p.isArchived);
    return urlProjectId || finalizate[0]?.id || "";
  });
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">("side-by-side");
  const [sliderPos, setSliderPos] = useState(50);
  const [stageFilter, setStageFilter] = useState<"all" | PhotoStage>("all");

  // Modale Audit & Donație
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sincronizare la schimbarea parametrului ?proiect=...
  useEffect(() => {
    if (urlProjectId) {
      setActiveProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Încărcare proiecte publice (strict finalizate)
  useEffect(() => {
    fetch("/api/public/data")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.projects?.length > 0) {
          const finalizateOnly = res.data.projects.filter(
            (p: ProjectItem) => p.status === "finalizat" && !p.isArchived
          );
          if (finalizateOnly.length > 0) {
            setProjects(finalizateOnly);
            if (!urlProjectId && !activeProjectId) {
              setActiveProjectId(finalizateOnly[0].id);
            }
          }
        }
      })
      .catch(() => {
        // Fallback la INITIAL_PROJECTS
      });
  }, [urlProjectId, activeProjectId]);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const projectGallery = activeProject?.gallery || [];

  const beforePhotos = projectGallery.filter((p) => p.stage === "inainte");
  const inProgressPhotos = projectGallery.filter((p) => p.stage === "in_lucru");
  const afterPhotos = projectGallery.filter((p) => p.stage === "dupa");

  const displayedPhotos = projectGallery.filter((photo) => {
    if (stageFilter === "all") return true;
    return photo.stage === stageFilter;
  });

  const handlePointerAction = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  // Navigare Lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex === null || displayedPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % displayedPhotos.length);
  }, [lightboxIndex, displayedPhotos.length]);

  const handlePrevPhoto = useCallback(() => {
    if (lightboxIndex === null || displayedPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + displayedPhotos.length) % displayedPhotos.length);
  }, [lightboxIndex, displayedPhotos.length]);

  // Tastatură pentru Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNextPhoto, handlePrevPhoto]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        onOpenAuditModal={() => setAuditModalOpen(true)}
        onOpenDonationModal={() => setDonationModalOpen(true)}
      />

      <main className="flex-1 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Heraldic Subtitle */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-serif text-slate-600 mb-4">
            <Link href="/" className="hover:text-amber-800 transition-colors">
              Acasă
            </Link>
            <span>/</span>
            <span className="font-bold text-[#071330]">Arhivă Lucrări & Galerie Foto</span>
          </div>

          {/* Header Secțiune */}
          <div className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 shadow-xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Documentare Fotografică Integrală • Transparență Civic</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight leading-[1.1] mb-4">
                Arhiva Lucrărilor de Reabilitare
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                Fiecare intervenție din subsolurile din Ploiești este documentată pas cu pas pe etape: 
                <strong> Înainte de intervenție</strong>, <strong>Lucrări pe șantier</strong> și <strong>Recepția finală</strong> cu garanție de 5 ani oferită de partenerul tehnic oficial <em>Instal Serv Becheanu</em>.
              </p>
            </div>

            {/* Piloni Civici */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-amber-900/10 text-xs font-serif">
              <div className="flex items-center gap-2 text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Materiale 100% Sponsorizate</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>0 Lei Cost Materiale Locatari</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Probe de Presiune la 10 Bari</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garanție Scrisă 5 Ani</span>
              </div>
            </div>
          </div>

          {/* Selector Proiecte / Lucrări (Dropdown inteligent + Pills orizontale) */}
          <div className="mb-8 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-amber-900/15 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
              <label htmlFor="arhiva-project-select" className="text-xs font-serif font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Alegeți Lucrarea din Arhivă ({projects.length} finalizate):</span>
              </label>

              {/* Dropdown Selector pentru selecție instantă */}
              <div className="relative w-full md:max-w-md">
                <select
                  id="arhiva-project-select"
                  value={activeProjectId}
                  onChange={(e) => {
                    setActiveProjectId(e.target.value);
                    setStageFilter("all");
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border-2 border-amber-900/20 text-[#071330] font-serif font-bold text-xs sm:text-sm shadow-xs focus:border-amber-600 focus:outline-none appearance-none cursor-pointer transition-colors"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title} • {proj.neighborhood ? `Cartier ${proj.neighborhood}` : "Ploiești"} ({proj.gallery?.length || 0} poze)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-800">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Butoane Rapide (Tabs cu scroll orizontal) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pt-1 no-scrollbar">
              {projects.map((proj) => {
                const isActive = activeProject.id === proj.id;
                const totalPhotos = proj.gallery?.length || 0;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setStageFilter("all");
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold whitespace-nowrap transition-all shadow-xs shrink-0 ${
                      isActive
                        ? "bg-[#c48834] text-white shadow-md shadow-amber-900/20 scale-[1.01]"
                        : "bg-white text-slate-800 hover:text-slate-950 border border-amber-900/20 hover:border-amber-600/40"
                    }`}
                  >
                    <span>{proj.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? "bg-amber-950/40 text-amber-200" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {totalPhotos} poze
                    </span>
                    <ArrowRight
                      className={`w-3 h-3 ${isActive ? "text-white" : "text-amber-800"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Detalii Proiect & Glisor Comparație Principală */}
          <div className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-serif text-amber-800 font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Recepție oficială: {activeProject.completionDate}</span>
                  {activeProject.neighborhood && (
                    <>
                      <span>•</span>
                      <span>Cartier {activeProject.neighborhood}</span>
                    </>
                  )}
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-black text-[#071330]">
                  {activeProject.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans max-w-4xl mt-1.5">
                  {activeProject.description}
                </p>
              </div>

              {/* Toggle Mod Comparație */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-amber-900/20 text-xs font-serif shrink-0 self-start lg:self-center">
                <button
                  onClick={() => setViewMode("side-by-side")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === "side-by-side"
                      ? "bg-[#c48834] text-white font-bold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Față în Față
                </button>
                <button
                  onClick={() => setViewMode("slider")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === "slider"
                      ? "bg-[#c48834] text-white font-bold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Glisor Interactiv
                </button>
              </div>
            </div>

            {/* Vizualizare Comparație */}
            {viewMode === "side-by-side" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Înainte */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                  <Image
                    src={activeProject.beforeImage}
                    alt={`Înainte de intervenție - ${activeProject.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#be123c] text-white px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Înainte de intervenție
                  </div>
                </div>

                {/* După */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                  <Image
                    src={activeProject.afterImage}
                    alt={`După recepție - ${activeProject.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#15803d] text-white px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    După recepție
                  </div>
                </div>
              </div>
            ) : (
              <div
                onPointerDown={(e) => handlePointerAction(e.clientX, e.currentTarget)}
                onPointerMove={(e) => {
                  if (e.buttons === 1) handlePointerAction(e.clientX, e.currentTarget);
                }}
                className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden select-none border border-slate-200 shadow-md touch-pan-y cursor-ew-resize"
              >
                {/* După (Fundal) */}
                <div className="absolute inset-0 pointer-events-none">
                  <Image
                    src={activeProject.afterImage}
                    alt="După lucrare subsol Ploiești"
                    fill
                    priority
                    className="object-cover object-center pointer-events-none"
                  />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#15803d] text-white px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    După recepție
                  </div>
                </div>

                {/* Înainte (Clipped) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <Image
                    src={activeProject.beforeImage}
                    alt="Înainte de lucrare subsol Ploiești"
                    fill
                    priority
                    className="object-cover object-center pointer-events-none"
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#be123c] text-white px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Înainte de intervenție
                  </div>
                </div>

                {/* Divizor Glisant */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#c48834] shadow-[0_0_15px_rgba(196,136,52,0.8)] cursor-ew-resize z-20 flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#c48834] text-white font-serif font-black text-xs flex items-center justify-center shadow-xl">
                    ⇄
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  aria-label="Glisează pentru comparație foto"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-pan-y"
                />
              </div>
            )}
          </div>

          {/* SECȚIUNE GALERIE EXTINSĂ PE ETAPE (CERINȚA 1 & 3) */}
          <div className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-3xl p-6 sm:p-10 shadow-xl mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/10">
              <div>
                <div className="text-[11px] font-serif font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>Jurnal Fotografic Detaliat</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#071330]">
                  Galeria Lucrării pe Etape de Execuție
                </h3>
              </div>

              {/* Filtru Etape - Selector Clar Înainte / După / În Lucru */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-serif">
                <button
                  onClick={() => setStageFilter("all")}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                    stageFilter === "all"
                      ? "bg-[#071330] text-white shadow-md ring-2 ring-[#c48834]/40"
                      : "bg-[#FAF7F2] text-slate-700 hover:bg-amber-100/60 border border-slate-200"
                  }`}
                >
                  Toate Cadrele ({projectGallery.length})
                </button>
                <button
                  onClick={() => setStageFilter("inainte")}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    stageFilter === "inainte"
                      ? "bg-rose-700 text-white shadow-md ring-2 ring-rose-400"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Doar Înainte ({beforePhotos.length})</span>
                </button>
                <button
                  onClick={() => setStageFilter("in_lucru")}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    stageFilter === "in_lucru"
                      ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                      : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>În execuție ({inProgressPhotos.length})</span>
                </button>
                <button
                  onClick={() => setStageFilter("dupa")}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    stageFilter === "dupa"
                      ? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400"
                      : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Doar După recepție ({afterPhotos.length})</span>
                </button>
              </div>
            </div>

            {/* Grilă Fotografii */}
            {displayedPhotos.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-serif font-bold text-slate-600">
                  Nu există fotografii încărcate pentru această etapă în cadrul proiectului curent.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-6">
                {displayedPhotos.map((photo, idx) => {
                  const stageBadge = {
                    inainte: {
                      text: "Înainte de intervenție",
                      cls: "bg-rose-100 text-rose-800 border-rose-300",
                    },
                    in_lucru: {
                      text: "Lucrări în execuție",
                      cls: "bg-amber-100 text-amber-900 border-amber-300",
                    },
                    dupa: {
                      text: "Recepție finală",
                      cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    },
                  }[photo.stage];

                  return (
                    <div
                      key={photo.id}
                      onClick={() => handleOpenLightbox(idx)}
                      className="group cursor-pointer bg-[#FAF7F2] rounded-2xl border border-amber-900/15 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <Image
                          src={photo.url}
                          alt={photo.caption || "Fotografie din lucrare"}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Stage Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`text-[10px] font-serif font-bold px-2.5 py-1 rounded-lg border shadow-sm ${stageBadge.cls}`}
                          >
                            {stageBadge.text}
                          </span>
                        </div>

                        {/* Hover Overlay cu Iconiță Zoom */}
                        <div className="absolute inset-0 bg-[#071330]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="p-2.5 rounded-full bg-white/90 text-[#071330] shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Legendă Tehnică */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs sm:text-sm font-serif font-semibold text-slate-800 leading-snug">
                          {photo.caption || "Documentare fotografică pe șantierul Viziune Urbană Ploiești."}
                        </p>
                        <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between text-[11px] text-amber-800 font-serif font-bold">
                          <span>Instal Serv Becheanu</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Vezi mărit <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Banner Civic Call-to-Action */}
          <div className="bg-gradient-to-br from-[#071330] to-[#0f2454] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider mb-4 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Înscrie Asociația Ta
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight mb-3">
                Subsolul blocului tău are nevoie de o transformare similară?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-6">
                Beneficiați de audit tehnic gratuit în teren efectuat de Instal Serv Becheanu și materiale noi asigurate prin sponsorizări civice.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAuditModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-[#c48834] hover:bg-amber-500 text-white font-serif font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-950/20"
                >
                  Solicită Audit Tehnic Gratuit
                </button>
                <button
                  onClick={() => setDonationModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif font-semibold text-xs sm:text-sm border border-white/20 transition-all"
                >
                  Sprijină Lucrările / Donează
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* LIGHTBOX MODAL FULLSCREEN */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-[#071330]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={handleCloseLightbox}
        >
          {/* Top Bar Lightbox */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm text-amber-400">
                {activeProject.title}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lightboxIndex + 1} / {displayedPhotos.length}
              </span>
            </div>

            <button
              onClick={handleCloseLightbox}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Închide fereastra"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centru: Imagine cu Butoane de Navigare */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Buton Prev */}
            <button
              onClick={handlePrevPhoto}
              aria-label="Fotografia precedentă"
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-amber-600 text-white transition-all backdrop-blur-xs"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Fotografie Mare */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={displayedPhotos[lightboxIndex].url}
                alt={displayedPhotos[lightboxIndex].caption || "Fotografie mărită"}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Buton Next */}
            <button
              onClick={handleNextPhoto}
              aria-label="Fotografia următoare"
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-amber-600 text-white transition-all backdrop-blur-xs"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Descriere & Etapă */}
          <div
            className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center text-white space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-[10px] font-serif font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                  {
                    inainte: "bg-rose-500 text-white",
                    in_lucru: "bg-amber-500 text-slate-950 font-black",
                    dupa: "bg-emerald-500 text-white",
                  }[displayedPhotos[lightboxIndex].stage]
                }`}
              >
                {
                  {
                    inainte: "Etapa 1: Înainte de intervenție",
                    in_lucru: "Etapa 2: Lucrări în execuție pe șantier",
                    dupa: "Etapa 3: Recepție finală",
                  }[displayedPhotos[lightboxIndex].stage]
                }
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif text-slate-200">
              {displayedPhotos[lightboxIndex].caption || "Documentare tehnică de șantier în parteneriat cu Instal Serv Becheanu."}
            </p>
          </div>
        </div>
      )}

      {/* Modale */}
      <AuditModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
    </div>
  );
}

export default function ArhivaLucrariPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-slate-700">
          <div className="text-center p-8">
            <div className="w-10 h-10 border-4 border-[#c48834] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold text-sm">Se încarcă arhiva tehnică a lucrărilor...</p>
          </div>
        </div>
      }
    >
      <ArhivaLucrariContent />
    </Suspense>
  );
}

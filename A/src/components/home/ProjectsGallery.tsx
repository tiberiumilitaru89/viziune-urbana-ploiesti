"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_PROJECTS } from "@/lib/data";
import { ProjectItem } from "@/lib/types";
import { CheckCircle2, AlertTriangle, ArrowRight, Sliders, Columns, Sparkles, Building2, ChevronDown } from "lucide-react";

export function ProjectsGallery() {
  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    INITIAL_PROJECTS.filter((p) => p.status === "finalizat" && !p.isArchived)
  );
  const [activeProject, setActiveProject] = useState<ProjectItem>(() => {
    const finalizate = INITIAL_PROJECTS.filter((p) => p.status === "finalizat" && !p.isArchived);
    return finalizate[0] || INITIAL_PROJECTS[0];
  });
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">("side-by-side");

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
            setActiveProject((prev) => {
              const stillExists = finalizateOnly.find((p: ProjectItem) => p.id === prev.id);
              return stillExists || finalizateOnly[0];
            });
          }
        }
      })
      .catch(() => {
        // Fallback to initial
      });
  }, []);

  const handlePointerAction = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  return (
    <section
      id="proiecte"
      className="relative py-16 sm:py-24 lg:py-28 bg-transparent text-slate-900 border-t border-amber-900/15 overflow-hidden"
    >

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header layout matching exactly the reference image */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <div className="text-[11px] sm:text-xs font-serif font-bold uppercase tracking-[0.25em] text-slate-600 mb-2.5">
              Orașe mai bune, prin oameni implicați
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-6xl font-serif font-black text-[#071330] tracking-tight leading-[1.1] mb-4">
              Proiecte finalizate
            </h2>
            <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-sans max-w-xl">
              Documentăm fotografic fiecare intervenție. Vedeți cum un spațiu insalubru devine o cameră tehnică de nivel european.
            </p>
          </div>

          {/* Right vertical civic pillars + CTA catre Arhiva */}
          <div className="flex flex-col items-start lg:items-end gap-3 pt-2">
            <div className="hidden lg:flex flex-col items-end gap-1.5 text-[10px] font-mono font-bold tracking-[0.25em] text-slate-600 uppercase pr-2">
              <span>Comunitate</span>
              <span>Transparență</span>
              <span>Infrastructură</span>
              <span>Viitor</span>
            </div>

            <Link
              href="/arhiva-lucrari"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-amber-50 text-[#071330] hover:text-amber-900 font-serif font-bold text-xs border border-amber-900/20 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Arhivă Lucrări & Galerie pe Etape</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Project Selector: Dropdown inteligent + Comutator Mod Vizualizare */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="w-full md:max-w-md">
            <label htmlFor="project-select-home" className="block text-[11px] font-serif font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Alegeți Lucrarea din Listă ({projects.length} finalizate):</span>
            </label>
            <div className="relative">
              <select
                id="project-select-home"
                value={activeProject.id}
                onChange={(e) => {
                  const selected = projects.find((p) => p.id === e.target.value);
                  if (selected) setActiveProject(selected);
                }}
                className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/95 border-2 border-amber-900/20 text-[#071330] font-serif font-bold text-xs sm:text-sm shadow-sm focus:border-amber-600 focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} {proj.neighborhood ? `— Cartier ${proj.neighborhood}` : ""} ({proj.completionDate})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-800">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/90 rounded-xl border border-amber-900/20 text-xs font-serif shrink-0 self-end md:self-auto shadow-xs">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "side-by-side" ? "bg-[#c48834] text-white font-bold shadow-xs" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Față în Față
            </button>
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "slider" ? "bg-[#c48834] text-white font-bold shadow-xs" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Glisor Interactiv
            </button>
          </div>
        </div>

        {/* Butoane Rapide (Tabs orizontale fluide) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {projects.map((proj) => {
            const isActive = activeProject.id === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold whitespace-nowrap transition-all shadow-xs shrink-0 ${
                  isActive
                    ? "bg-[#c48834] text-white shadow-md shadow-amber-900/20 scale-[1.01]"
                    : "bg-white/80 text-slate-800 hover:text-slate-950 border border-amber-900/20 hover:border-amber-600/40"
                }`}
              >
                <span>{proj.title}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-amber-800"}`} />
              </button>
            );
          })}
        </div>

        {/* Comparison Showcase Container */}
        <div className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-amber-950/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-7">
            <div>
              <div className="flex items-center gap-2 text-xs font-serif text-amber-800 font-bold mb-1">
                <span>Recepție: {activeProject.completionDate}</span>
                {activeProject.neighborhood && <span>• Cartier {activeProject.neighborhood}</span>}
              </div>
              <h3 className="font-serif text-lg sm:text-2xl font-black text-[#071330] mb-1.5">
                {activeProject.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                {activeProject.description}
              </p>
            </div>

            {/* Buton proeminent direct la cele două poze */}
            <Link
              href={`/arhiva-lucrari?proiect=${activeProject.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#c48834] hover:bg-amber-600 text-white font-serif font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0 self-start sm:self-center"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Vezi Galeria Foto ({activeProject.gallery?.length || 0} imagini)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {viewMode === "side-by-side" ? (
            /* Side-by-side two columns exactly matching the reference photo */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Before Column */}
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                <Image
                  src={activeProject.beforeImage}
                  alt={`Înainte de intervenție - ${activeProject.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#be123c] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Înainte de intervenție
                </div>
              </div>

              {/* After Column */}
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                <Image
                  src={activeProject.afterImage}
                  alt={`După recepție - ${activeProject.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#15803d] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  După recepție
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Slider view */
            <div
              onPointerDown={(e) => handlePointerAction(e.clientX, e.currentTarget)}
              onPointerMove={(e) => {
                if (e.buttons === 1) handlePointerAction(e.clientX, e.currentTarget);
              }}
              className="relative aspect-[16/9] w-full rounded-xl sm:rounded-2xl overflow-hidden select-none border border-slate-200 shadow-md touch-pan-y cursor-ew-resize"
            >
              {/* After Image */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={activeProject.afterImage}
                  alt="După lucrare subsol Ploiești"
                  fill
                  priority
                  className="object-cover object-center pointer-events-none"
                />
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#15803d] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  După recepție
                </div>
              </div>

              {/* Before Image (Clipped) */}
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
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#be123c] text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Înainte de intervenție
                </div>
              </div>

              {/* Divider */}
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
                aria-label="Glisează pentru comparație"
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-pan-y"
              />
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-amber-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-600 font-serif">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800">Partener tehnic oficial:</span>
              <span>Instal Serv Becheanu</span>
              <span>•</span>
              <span className="text-[#a16922] font-bold">Data recepției: {activeProject.completionDate}</span>
            </div>

            <Link
              href={`/arhiva-lucrari?proiect=${activeProject.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#7c4d12] hover:text-[#071330] font-bold border border-amber-600/30 transition-all shadow-xs"
            >
              <span>Explorează Galeria Completă a Lucrării pe Etape ({activeProject.gallery?.length || 0} poze)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

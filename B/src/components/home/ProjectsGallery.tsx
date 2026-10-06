"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { INITIAL_PROJECTS } from "@/lib/data";
import { ProjectItem } from "@/lib/types";
import { CheckCircle2, AlertTriangle, ArrowRight, Sliders, Columns } from "lucide-react";

export function ProjectsGallery() {
  const [projects, setProjects] = useState<ProjectItem[]>([...INITIAL_PROJECTS]);
  const [activeProject, setActiveProject] = useState<ProjectItem>(INITIAL_PROJECTS[0]);
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">("side-by-side");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("vup_projects");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setActiveProject(parsed[0]);
          }
        }
      } catch {
        // fallback to initial
      }
    }
  }, []);

  const handlePointerAction = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  return (
    <section
      id="proiecte"
      className="relative py-16 sm:py-24 lg:py-28 bg-[#fbf9f4] text-slate-900 border-t border-amber-900/20 overflow-hidden"
      style={{
        backgroundImage: "url('/ploiesti-hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Subtle overlay to enhance contrast while keeping landmark & handwriting clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f4]/95 via-[#fbf9f4]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbf9f4]/60 pointer-events-none" />

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

          {/* Right vertical civic pillars (as in original reference) */}
          <div className="hidden lg:flex flex-col items-end gap-1.5 text-[10px] font-mono font-bold tracking-[0.25em] text-slate-600 uppercase pr-2 pt-2">
            <span>Comunitate</span>
            <span>Transparență</span>
            <span>Infrastructură</span>
            <span>Viitor</span>
          </div>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
          {projects.map((proj) => {
            const isActive = activeProject.id === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all shadow-sm ${
                  isActive
                    ? "bg-[#c48834] text-white shadow-md shadow-amber-900/20 scale-[1.01]"
                    : "bg-[#fdfaf5] text-slate-800 hover:text-slate-950 border border-amber-900/20 hover:border-amber-600/40"
                }`}
              >
                <span>{proj.title}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-amber-800"}`} />
              </button>
            );
          })}

          {/* View Mode Toggle */}
          <div className="ml-auto hidden sm:flex items-center gap-1 p-1 bg-white/80 rounded-xl border border-amber-900/20 text-xs font-serif">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "side-by-side" ? "bg-[#c48834] text-white font-bold" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Față în Față
            </button>
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "slider" ? "bg-[#c48834] text-white font-bold" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Glisor Interactiv
            </button>
          </div>
        </div>

        {/* Comparison Showcase Container */}
        <div className="bg-white/95 backdrop-blur-md border border-amber-900/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-amber-950/5">
          <div className="mb-5 sm:mb-7">
            <h3 className="font-serif text-lg sm:text-2xl font-black text-[#071330] mb-1.5">
              {activeProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
              {activeProject.description}
            </p>
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

          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500 font-serif">
            <span>Lucrări executate în parteneriat cu Instal Serv Becheanu</span>
            <span className="text-[#a16922] font-bold">Data recepției: {activeProject.completionDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { INITIAL_PROJECTS } from "@/lib/data";
import { CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export function ProjectsGallery() {
  const [activeProject, setActiveProject] = useState(INITIAL_PROJECTS[0]);
  const [sliderPos, setSliderPos] = useState(50);

  const handlePointerAction = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  return (
    <section id="proiecte" className="py-14 sm:py-20 lg:py-24 bg-[#080d19]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            Arhiva Lucrărilor
          </div>
          <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight">
            Proiecte finalizate
          </h2>
          <p className="mt-3 sm:mt-4 text-slate-400 text-xs sm:text-base leading-relaxed">
            De la subsoluri insalubre, inundate și cu pierderi cronice de căldură, la spații tehnice uscate, vopsite profesional și echipate cu rețele moderne garantate 5 ani.
          </p>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {INITIAL_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setActiveProject(proj)}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeProject.id === proj.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
              }`}
            >
              {proj.title}
            </button>
          ))}
        </div>

        {/* Interactive Before/After Card */}
        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">
              {activeProject.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          {/* Interactive Split Slider Container */}
          <div
            onPointerDown={(e) => handlePointerAction(e.clientX, e.currentTarget)}
            onPointerMove={(e) => {
              if (e.buttons === 1) handlePointerAction(e.clientX, e.currentTarget);
            }}
            className="relative aspect-[16/9] w-full rounded-xl sm:rounded-2xl overflow-hidden select-none border border-slate-800 shadow-inner touch-pan-y cursor-ew-resize"
          >
            {/* After Image (Full width background) */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src={activeProject.afterImage}
                alt="După reabilitare subsol Ploiești"
                fill
                priority
                className="object-cover object-center pointer-events-none"
              />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                După Lucrare
              </div>
            </div>

            {/* Before Image (Clipped overlay with 100% pixel-perfect alignment on any mobile/desktop viewport) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            >
              <Image
                src={activeProject.beforeImage}
                alt="Înainte de reabilitare subsol Ploiești"
                fill
                priority
                className="object-cover object-center pointer-events-none"
              />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-rose-600/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Înainte de Lucrare
              </div>
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)] cursor-ew-resize z-20 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-900 font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xl">
                ⇄
              </div>
            </div>

            {/* Hidden Input Range Controller for accessible keyboard/touch navigation */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Glisează pentru comparație proiect"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-pan-y"
            />
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] sm:text-[11px] text-slate-400">
            <span>◄ Trage cursorul stânga/dreapta pentru a compara starea subsolului</span>
            <span className="font-semibold text-emerald-400">Finalizat: {activeProject.completionDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

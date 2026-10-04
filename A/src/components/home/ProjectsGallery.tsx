"use client";

import React, { useState } from "react";
import Image from "next/image";
import { INITIAL_PROJECTS } from "@/lib/data";
import { CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export function ProjectsGallery() {
  const [activeProject, setActiveProject] = useState(INITIAL_PROJECTS[0]);
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section id="proiecte" className="py-24 bg-[#080d19] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            Arhiva Lucrărilor
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Proiecte finalizate (înainte și după)
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            De la subsoluri insalubre, inundate și cu pierderi cronice de căldură, la spații tehnice uscate, vopsite profesional și echipate cu rețele moderne garantate 5 ani.
          </p>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {INITIAL_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setActiveProject(proj)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {activeProject.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          {/* Interactive Split Slider */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden select-none border border-slate-800 shadow-inner">
            {/* After Image (Background) */}
            <div className="absolute inset-0">
              <Image
                src={activeProject.afterImage}
                alt="După reabilitare subsol Ploiești"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                După Lucrare
              </div>
            </div>

            {/* Before Image (Clipped Overlay) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="relative w-full h-full min-w-[700px] sm:min-w-[850px] lg:min-w-[900px]">
                <Image
                  src={activeProject.beforeImage}
                  alt="Înainte de reabilitare subsol Ploiești"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-4 left-4 bg-rose-600/90 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-3.5 h-3.5" />
                Înainte de Lucrare
              </div>
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)] cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 font-black text-xs flex items-center justify-center shadow-xl">
                ⇄
              </div>
            </div>

            {/* Hidden Input Range Controller over entire image for smooth drag & touch */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Glisează pentru comparație Înainte și După"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>

          <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400">
            <span>◄ Trage cursorul stânga/dreapta pentru a compara starea subsolului</span>
            <span className="font-semibold text-emerald-400">Finalizat: {activeProject.completionDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

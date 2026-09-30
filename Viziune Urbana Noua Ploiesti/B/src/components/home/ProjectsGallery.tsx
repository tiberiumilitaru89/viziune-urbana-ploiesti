"use client";

import React, { useState } from "react";
import Image from "next/image";
import { INITIAL_PROJECTS } from "@/lib/data";
import { CheckCircle2, AlertTriangle, Landmark } from "lucide-react";

export function ProjectsGallery() {
  const [activeProject, setActiveProject] = useState(INITIAL_PROJECTS[0]);
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section id="proiecte" className="py-28 bg-[#070d1e] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Landmark className="w-3.5 h-3.5" />
            Arhiva Lucrărilor
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Dovada Faptică: Înainte și După
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Documentăm fotografic fiecare intervenție. Vedeți cum un spațiu insalubru devine o cameră tehnică de nivel european.
          </p>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {INITIAL_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setActiveProject(proj)}
              className={`px-5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all ${
                activeProject.id === proj.id
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/60"
                  : "bg-[#0a142f] text-slate-300 hover:text-white border border-amber-900/30"
              }`}
            >
              {proj.title}
            </button>
          ))}
        </div>

        {/* Comparison Showcase */}
        <div className="max-w-4xl mx-auto bg-[#0a142f] border border-amber-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl">
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              {activeProject.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden select-none border-2 border-amber-900/40 shadow-2xl">
            {/* After Image */}
            <div className="absolute inset-0">
              <Image
                src={activeProject.afterImage}
                alt="După lucrare subsol Ploiești"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                După Recepție
              </div>
            </div>

            {/* Before Image */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="relative w-full h-full min-w-[700px] sm:min-w-[850px] lg:min-w-[900px]">
                <Image
                  src={activeProject.beforeImage}
                  alt="Înainte de lucrare subsol Ploiești"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-4 left-4 bg-rose-700/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-4 h-4" />
                Înainte de Intervenție
              </div>
            </div>

            {/* Divider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-serif font-black text-xs flex items-center justify-center shadow-xl">
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>

          <div className="mt-4 flex justify-between items-center text-xs text-slate-400 font-serif">
            <span>◄ Trageți glisorul pentru a vizualiza starea inițială</span>
            <span className="text-amber-300 font-bold">Data finalizării: {activeProject.completionDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

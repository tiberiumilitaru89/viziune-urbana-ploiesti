import React from "react";
import { Wrench, GraduationCap, Building2, ShieldCheck, Award } from "lucide-react";

export function PartnersStrip() {
  return (
    <div className="bg-[#050914] border-y border-amber-900/30 py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="flex items-center gap-2.5 font-serif text-xs font-bold uppercase tracking-[0.2em] text-amber-300 lg:pr-8 lg:border-r border-amber-900/40 shrink-0">
            <Award className="w-4 h-4 text-amber-400" />
            Consorțiul Partenerilor Oficiali
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full items-center">
            {/* Partener Tehnic: Instal Serv Becheanu */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Partener Tehnic
                </div>
                <div className="text-xs font-serif font-bold text-white">
                  Instal Serv Becheanu
                </div>
              </div>
            </div>

            {/* Partener de Practică: Toma Socolescu */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Partener Practică
                </div>
                <div className="text-xs font-serif font-bold text-white">
                  Lic. Toma Socolescu
                </div>
              </div>
            </div>

            {/* Partener de Practică: ACCR */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Partener Practică
                </div>
                <div className="text-xs font-serif font-bold text-white">
                  ACCR Ploiești
                </div>
              </div>
            </div>

            {/* Susținător: UPG Ploiești */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Susținător Proiect
                </div>
                <div className="text-xs font-serif font-bold text-white">
                  UPG Ploiești
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

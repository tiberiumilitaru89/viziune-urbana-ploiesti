import React from "react";
import { Wrench, GraduationCap, Building2, ShieldCheck } from "lucide-react";

export function PartnersStrip() {
  return (
    <div className="bg-[#080d19] border-y border-slate-800/80 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 lg:pr-8 lg:border-r border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Partenerii Noștri Oficiali
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full items-center">
            {/* Parteneri Tehnici: Parteneri de Execuție */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Parteneri Tehnici
                </div>
                <div className="text-xs font-bold text-white">
                  Parteneri de Execuție
                </div>
              </div>
            </div>

            {/* Partener de Practică: Toma Socolescu */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Partener Practică
                </div>
                <div className="text-xs font-bold text-white">
                  Lic. Toma Socolescu
                </div>
              </div>
            </div>

            {/* Partener de Practică: ACCR */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Partener Practică
                </div>
                <div className="text-xs font-bold text-white">
                  ACCR Ploiești
                </div>
              </div>
            </div>

            {/* Susținător: UPG Ploiești */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Susținător Proiect
                </div>
                <div className="text-xs font-bold text-white">
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

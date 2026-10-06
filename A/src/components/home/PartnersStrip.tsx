import React from "react";
import Image from "next/image";
import { GraduationCap, Building2, Award } from "lucide-react";

export function PartnersStrip() {
  return (
    <div className="bg-[#FAF7F2]/80 backdrop-blur-md border-y border-amber-900/15 py-4 sm:py-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center gap-2.5 font-serif text-xs font-bold uppercase tracking-[0.2em] text-amber-900 lg:pr-8 lg:border-r border-amber-900/20 shrink-0">
            <Award className="w-4 h-4 text-amber-700" />
            Consorțiul Partenerilor Oficiali
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6 w-full items-center">
            {/* Partener Tehnic de Executie */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-9 rounded-xl bg-white border border-amber-600/30 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-sm">
                <Image
                  src="/becheanu-logo.png"
                  alt="Logo Instal Serv Becheanu"
                  width={48}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Parteneri Tehnici
                </div>
                <div className="text-xs font-serif font-bold text-[#071330]">
                  Instal Serv Becheanu
                </div>
              </div>
            </div>

            {/* Partener de Practică: Toma Socolescu */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-600/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-blue-800" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Partener Practică
                </div>
                <div className="text-xs font-serif font-bold text-[#071330]">
                  Lic. Toma Socolescu
                </div>
              </div>
            </div>

            {/* Partener Calificare: ACCRP */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-600/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-purple-800" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                  Partener Calificare
                </div>
                <div className="text-xs font-serif font-bold text-[#071330]">
                  ACCRP
                </div>
              </div>
            </div>

            {/* Susținător: UPG Ploiești */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-600/30 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                  Susținător Proiect
                </div>
                <div className="text-xs font-serif font-bold text-[#071330]">
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

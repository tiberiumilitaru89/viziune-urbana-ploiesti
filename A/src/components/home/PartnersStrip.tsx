"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GraduationCap, Award, Users, Wrench, Landmark, ShieldCheck } from "lucide-react";
import { INITIAL_PARTNERS } from "@/lib/data";
import { PartnerItem } from "@/lib/types";
import { fetchPublicDataClient } from "@/lib/publicData";

export function PartnersStrip() {
  const [partners, setPartners] = useState<PartnerItem[]>([...INITIAL_PARTNERS]);

  useEffect(() => {
    fetchPublicDataClient()
      .then((data) => {
        if (data.partners.length > 0) {
          setPartners([...data.partners]);
        }
      })
      .catch(() => {
        // Fallback la date inițiale
      });
  }, []);

  return (
    <section 
      aria-label="Consorțiul Partenerilor Oficiali"
      className="bg-[#FAF7F2] border-y border-amber-900/15 py-5 sm:py-7 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row items-center xl:items-stretch gap-4 sm:gap-6">
          
          {/* Header Consorțiu - Vizibilitate ridicată, contrast și tipografie clară */}
          <div className="flex items-center gap-3 font-serif text-xs sm:text-sm font-extrabold uppercase tracking-[0.16em] text-[#071330] xl:pr-6 xl:border-r border-amber-900/20 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-600/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-800" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-amber-800 uppercase">Garanție & Expertiză</span>
              <span className="whitespace-nowrap">Consorțiul Partenerilor</span>
            </div>
          </div>

          {/* Grilă Parteneri - Carduri aerisite, fără text trunchiat, contrast 100% */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full items-stretch">
            {partners.slice(0, 4).map((p) => {
              const isBecheanu = p.id === "part-1" || p.name.includes("Becheanu");
              
              // Mapare icon & culori per categorie pentru contrast optim
              let badgeBg = "bg-amber-100/90 text-amber-900 border-amber-300";
              let iconBg = "bg-amber-50 text-amber-800 border-amber-200";
              let IconComp = Users;

              if (isBecheanu) {
                badgeBg = "bg-emerald-100/90 text-emerald-900 border-emerald-300";
                iconBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
                IconComp = ShieldCheck;
              } else if (p.category === "practica" && (p.name.includes("Socolescu") || p.id === "part-2")) {
                badgeBg = "bg-blue-100/90 text-blue-900 border-blue-300";
                iconBg = "bg-blue-50 text-blue-800 border-blue-200";
                IconComp = GraduationCap;
              } else if (p.name.includes("InfoACCRP") || p.id === "part-3") {
                badgeBg = "bg-purple-100/90 text-purple-900 border-purple-300";
                iconBg = "bg-purple-50 text-purple-800 border-purple-200";
                IconComp = Wrench;
              } else if (p.category === "academic" || p.name.includes("UPG") || p.id === "part-4") {
                badgeBg = "bg-teal-100/90 text-teal-900 border-teal-300";
                iconBg = "bg-teal-50 text-teal-800 border-teal-200";
                IconComp = Landmark;
              }

              return (
                <div 
                  key={p.id} 
                  className="bg-white/95 rounded-xl border border-amber-900/15 p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm hover:shadow-md hover:border-amber-700/35 transition-all"
                >
                  {/* Logo sau Icon distinct */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 p-1.5 overflow-hidden shadow-xs ${iconBg}`}>
                    {isBecheanu ? (
                      <Image
                        src="/becheanu-logo.png"
                        alt="Logo Instal Serv Becheanu"
                        width={44}
                        height={44}
                        className="object-contain w-full h-full"
                      />
                    ) : p.logoUrl ? (
                      <Image
                        src={p.logoUrl}
                        alt={`Logo ${p.name}`}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <IconComp className="w-5 h-5" />
                    )}
                  </div>

                  {/* Detalii Text - Lizibil, fără trunchiere artificială, tipografie fermă */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`inline-block text-[10px] font-sans font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeBg}`}>
                        {p.badgeText || (isBecheanu ? "Execuție & Garanție 5 Ani" : "Partener Oficial")}
                      </span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-serif font-bold text-[#071330] leading-snug line-clamp-2" title={p.name}>
                      {p.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}


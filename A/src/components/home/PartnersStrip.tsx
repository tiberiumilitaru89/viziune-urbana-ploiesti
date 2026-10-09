"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GraduationCap, Building2, Award, Users } from "lucide-react";
import { INITIAL_PARTNERS } from "@/lib/data";
import { PartnerItem } from "@/lib/types";

export function PartnersStrip() {
  const [partners, setPartners] = useState<PartnerItem[]>([...INITIAL_PARTNERS]);

  useEffect(() => {
    fetch("/api/public/data")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.partners?.length > 0) {
          setPartners(res.data.partners);
        }
      })
      .catch(() => {
        // Fallback la date inițiale
      });
  }, []);

  return (
    <div className="bg-[#FAF7F2]/80 backdrop-blur-md border-y border-amber-900/15 py-4 sm:py-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center gap-2.5 font-serif text-xs font-bold uppercase tracking-[0.2em] text-amber-900 lg:pr-8 lg:border-r border-amber-900/20 shrink-0">
            <Award className="w-4 h-4 text-amber-700" />
            Consorțiul Partenerilor Oficiali
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6 w-full items-center">
            {partners.slice(0, 4).map((p) => {
              const isBecheanu = p.id === "part-1" || p.name.includes("Becheanu");
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-amber-600/30 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-sm">
                    {isBecheanu ? (
                      <Image
                        src="/becheanu-logo.png"
                        alt="Logo Instal Serv Becheanu"
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                      />
                    ) : p.logoUrl ? (
                      <Image
                        src={p.logoUrl}
                        alt={`Logo ${p.name}`}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                      />
                    ) : p.category === "practica" ? (
                      <GraduationCap className="w-4 h-4 text-purple-800" />
                    ) : p.category === "academic" ? (
                      <Building2 className="w-4 h-4 text-emerald-800" />
                    ) : (
                      <Users className="w-4 h-4 text-amber-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 truncate">
                      {p.badgeText || "Partener"}
                    </div>
                    <div className="text-xs font-serif font-bold text-[#071330] truncate" title={p.name}>
                      {p.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

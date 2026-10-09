"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getPublicAssociations } from "@/lib/data";
import { PublicAssociationSummary } from "@/lib/types";
import { PLOIESTI_NEIGHBORHOODS, detectNeighborhood } from "@/lib/neighborhoods";
import { Building2, FileSpreadsheet, Coins, CheckCircle, Clock, ArrowRight, Landmark, MapPin, Navigation } from "lucide-react";

type AssociationTrackerProps = {
  readonly onOpenAuditModal: () => void;
};

export function AssociationTracker({ onOpenAuditModal }: AssociationTrackerProps) {
  const [associations, setAssociations] = useState<PublicAssociationSummary[]>(() => getPublicAssociations());
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("toate");

  useEffect(() => {
    // Fetch live data from Supabase via public API
    fetch("/api/public/data")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.associations?.length > 0) {
          setAssociations(res.data.associations);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  // Compute counts per neighborhood
  const neighborhoodCounts = useMemo(() => {
    const counts: Record<string, number> = { toate: associations.length };
    PLOIESTI_NEIGHBORHOODS.forEach((n) => {
      counts[n] = 0;
    });

    associations.forEach((a) => {
      const n = a.neighborhood || detectNeighborhood(a.address, a.building);
      if (counts[n] !== undefined) {
        counts[n] += 1;
      } else {
        counts["Alte Zone"] = (counts["Alte Zone"] || 0) + 1;
      }
    });

    return counts;
  }, [associations]);

  // Filtered list
  const filteredAssociations = useMemo(() => {
    if (selectedNeighborhood === "toate") return associations;
    return associations.filter((a) => {
      const n = a.neighborhood || detectNeighborhood(a.address, a.building);
      return n === selectedNeighborhood;
    });
  }, [associations, selectedNeighborhood]);

  return (
    <section id="asociatii" className="py-14 sm:py-20 lg:py-28 bg-transparent border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Landmark className="w-3.5 h-3.5" />
            Transparență Comunitară pe Cartiere
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight">
            Registrul Asociațiilor din Ploiești
          </h2>
          <p className="mt-4 text-slate-700 text-base leading-relaxed">
            Fiecare asociație înscrisă are o evoluție publică transparentă: strângerea formularelor ANAF 230 și constituirea fondului propriu de manoperă pe cartierele orașului.
          </p>
        </div>

        {/* Bara de Filtrare pe Cartiere din Ploiești */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Navigation className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-slate-700">
              Selectează Cartierul
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedNeighborhood("toate")}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-sm ${
                selectedNeighborhood === "toate"
                  ? "bg-[#c48834] text-white shadow-md scale-105"
                  : "bg-white/80 text-slate-700 border border-amber-900/20 hover:bg-amber-100/60"
              }`}
            >
              Toate Cartierele ({neighborhoodCounts.toate ?? 0})
            </button>

            {PLOIESTI_NEIGHBORHOODS.map((neighborhood) => {
              const count = neighborhoodCounts[neighborhood] || 0;
              const isSelected = selectedNeighborhood === neighborhood;

              return (
                <button
                  key={neighborhood}
                  onClick={() => setSelectedNeighborhood(neighborhood)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-serif transition-all shadow-sm flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#c48834] text-white font-bold shadow-md scale-105"
                      : "bg-white/80 text-slate-700 border border-amber-900/20 hover:bg-amber-100/60 font-semibold"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-white" : "text-amber-700"}`} />
                  <span>{neighborhood}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grila de Asociații */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {filteredAssociations.map((assoc) => {
            const formPct = Math.min(100, Math.round((assoc.formsCollected / assoc.formsTarget) * 100));
            const fundPct = Math.min(100, Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100));
            const isApproved = assoc.status === "acceptat" || assoc.status === "finalizat";
            const neighborhood = assoc.neighborhood || detectNeighborhood(assoc.address, assoc.building);

            return (
              <div
                key={assoc.id}
                className="bg-white/85 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 sm:p-6 shadow-md hover:border-amber-600/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-600/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-amber-800" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/40 inline-block">
                          {assoc.dosarNumber || `DOSAR-PH-${assoc.id}`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-500/15 border border-amber-600/25 px-2 py-0.5 rounded-md ml-1.5">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          {neighborhood}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}
                    >
                      {isApproved ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {isApproved ? "Aprobat" : "În Evaluare"}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#071330] mb-1 leading-snug">
                    {assoc.building}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    {assoc.address}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-amber-900/10">
                  {/* Progress bar Formulare */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
                        Formulare ANAF 230
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {assoc.formsCollected} / {assoc.formsTarget} ({formPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${formPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress bar Fond */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-emerald-700" />
                        Fond Manoperă Bloc
                      </span>
                      <span className="font-mono font-bold text-emerald-800">
                        {assoc.fundsCollected.toLocaleString()} / {assoc.fundsTarget.toLocaleString()} Lei
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${fundPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs font-serif">
                    <span className="text-slate-500 text-[11px]">Transparență civică</span>
                    <Link
                      href="/status"
                      className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-950 hover:underline text-[11px]"
                    >
                      <span>Urmărește stadiul dosarului</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssociations.length === 0 && (
          <div className="text-center py-10 bg-white/60 rounded-2xl border border-amber-900/15 max-w-md mx-auto mb-8">
            <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h4 className="text-sm font-serif font-bold text-slate-800">Nicio asociație înregistrată încă în {selectedNeighborhood}</h4>
            <p className="text-xs text-slate-600 mt-1">Fii prima asociație din cartier care solicită evaluarea tehnică gratuită!</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onOpenAuditModal}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 shadow-md transition-all active:scale-95"
          >
            <span>Înscrie Asociația Ta din Ploiești în Registru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

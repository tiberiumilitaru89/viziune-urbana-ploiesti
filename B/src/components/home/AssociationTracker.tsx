"use client";

import React, { useState } from "react";
import { getPublicAssociations } from "@/lib/data";
import { Building2, FileSpreadsheet, Coins, CheckCircle, Clock, ShieldCheck, ArrowRight, Landmark } from "lucide-react";

type AssociationTrackerProps = {
  readonly onOpenAuditModal: () => void;
};

export function AssociationTracker({ onOpenAuditModal }: AssociationTrackerProps) {
  const associations = getPublicAssociations();

  return (
    <section id="asociatii" className="py-14 sm:py-20 lg:py-28 bg-[#070d1e]/80 backdrop-blur-sm border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Landmark className="w-3.5 h-3.5" />
            Transparență Comunitară
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Registrul Asociațiilor în Curs
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Fiecare asociație înscrisă are o evoluție publică transparentă: strângerea formularelor ANAF 230 și constituirea fondului propriu de manoperă.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {associations.map((assoc) => {
            const formPct = Math.min(100, Math.round((assoc.formsCollected / assoc.formsTarget) * 100));
            const fundPct = Math.min(100, Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100));

            return (
              <div
                key={assoc.id}
                className="bg-[#0a142f] border border-amber-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-serif font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#050914] text-amber-300 border border-amber-900/40 flex items-center gap-1.5">
                      {assoc.status === "acceptat" ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Acceptat în Program
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" /> În Curs de Evaluare
                        </>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">ID: {assoc.id}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white mb-1 leading-snug">
                    {assoc.building}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    {assoc.address}
                  </p>

                  {/* Progress 1: Formulare 230 */}
                  <div className="mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-serif">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        Formulare 230 Colectate:
                      </span>
                      <span className="font-black text-emerald-400">
                        {assoc.formsCollected} / {assoc.formsTarget} ({formPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050914] overflow-hidden border border-amber-900/20">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${formPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress 2: Fond Manoperă */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-serif">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        Fond Manoperă Acoperit:
                      </span>
                      <span className="font-black text-amber-300">
                        {assoc.fundsCollected.toLocaleString("ro-RO")} / {assoc.fundsTarget.toLocaleString("ro-RO")} Lei
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050914] overflow-hidden border border-amber-900/20">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${fundPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-900/30 text-[11px] text-slate-400 font-serif flex items-center justify-between">
                  <span>Materiale: <strong className="text-amber-300">100% Sponsorizate</strong></span>
                  <span className="text-slate-500 font-sans">Legea 196/2018</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="text-center">
          <button
            onClick={onOpenAuditModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs font-serif font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/60 transition-all text-center"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            Înscrie Asociația Ta în Registrul Oficial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

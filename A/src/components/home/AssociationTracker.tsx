"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_ASSOCIATIONS } from "@/lib/data";
import { Building2, CheckCircle2, Clock, Users, ArrowRight, ShieldCheck } from "lucide-react";

type AssociationTrackerProps = {
  readonly onOpenAuditModal: () => void;
};

export function AssociationTracker({ onOpenAuditModal }: AssociationTrackerProps) {
  return (
    <section id="asociatii" className="py-14 sm:py-20 lg:py-24 bg-[#060911]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Users className="w-3.5 h-3.5" />
              Transparență în timp real
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Asociații Înscrise & Progres.
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              Fiecare bloc înscris are un panou transparent în care se urmărește colectarea formularelor de redirecționare 3.5% (ANAF 230) și constituirea fondului asociației pentru manoperă.
            </p>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="self-stretch sm:self-start md:self-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            Înscrie Blocul Tău <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Association Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {INITIAL_ASSOCIATIONS.map((assoc) => {
            const formPercent = Math.min(100, Math.round((assoc.formsCollected / assoc.formsTarget) * 100));
            const fundsPercent = Math.min(100, Math.round((assoc.fundsCollected / assoc.fundsTarget) * 100));

            return (
              <div
                key={assoc.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Ploiești
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        assoc.status === "acceptat"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {assoc.status === "acceptat" ? "Aprobat" : "În Evaluare"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 leading-snug">
                    {assoc.building}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{assoc.address}</p>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 mb-6 leading-relaxed">
                    <span className="text-slate-400 font-semibold">Diagnostic: </span>
                    {assoc.problem}
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  {/* Forms progress */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">
                        Formulare ANAF 230
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {assoc.formsCollected} / {assoc.formsTarget} ({formPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${formPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Funds progress */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">
                        Fond Manoperă Bloc
                      </span>
                      <span className="font-mono font-bold text-blue-400">
                        {assoc.fundsCollected.toLocaleString("ro-RO")} / {assoc.fundsTarget.toLocaleString("ro-RO")} Lei
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${fundsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

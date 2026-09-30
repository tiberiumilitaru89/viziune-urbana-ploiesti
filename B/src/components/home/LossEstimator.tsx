"use client";

import React, { useState } from "react";
import { Calculator, AlertTriangle, ArrowRight, TrendingDown, PiggyBank, ShieldCheck } from "lucide-react";

type LossEstimatorProps = {
  readonly onOpenAuditModal: () => void;
};

export function LossEstimator({ onOpenAuditModal }: LossEstimatorProps) {
  const [apartments, setApartments] = useState<number>(40);
  const [floors, setFloors] = useState<number>(4);
  const [pipeCondition, setPipeCondition] = useState<"degradat" | "severa" | "critic">("severa");

  // Multiplier based on pipe condition
  const multiplier = pipeCondition === "critic" ? 85 : pipeCondition === "severa" ? 65 : 45;

  const monthlyLossPerApt = multiplier;
  const yearlyLossPerApt = monthlyLossPerApt * 6; // 6 heating months
  const totalBuildingAnnualLoss = yearlyLossPerApt * apartments;
  const estimatedMaterialsSponsored = Math.round(apartments * 320);

  return (
    <section id="calculator" className="py-28 bg-[#050914] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Audit Financiar Comunitar
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Calculatorul Pierderilor din Subsol
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            O țeavă caldă neizolată și ruginită în subsol funcționează ca un calorifer pornit inutil non-stop. Aflați cât plătește blocul dumneavoastră din neglijență.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-[#0a142f] border border-amber-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-7">
            <h3 className="font-serif text-lg font-bold text-white border-b border-amber-900/30 pb-3">
              Parametrii Tehnici ai Blocului
            </h3>

            {/* Apartamente */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 font-serif">
                  Număr Apartamente în Scara / Blocul Tău:
                </label>
                <span className="font-serif font-black text-lg text-amber-300">
                  {apartments}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="2"
                value={apartments}
                onChange={(e) => setApartments(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10 apt.</span>
                <span>60 apt.</span>
                <span>120 apt.</span>
              </div>
            </div>

            {/* Regim Înălțime */}
            <div>
              <label className="block text-xs font-bold text-slate-300 font-serif mb-2">
                Regim de Înălțime (Etaje):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[4, 8, 10].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setFloors(fl)}
                    className={`py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                      floors === fl
                        ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-950/60"
                        : "bg-[#050914] text-slate-300 border border-amber-900/30 hover:border-amber-500/30"
                    }`}
                  >
                    {fl === 4 ? "P + 4 Etaje" : fl === 8 ? "P + 8 Etaje" : "P + 10 Etaje"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stare Țevi */}
            <div>
              <label className="block text-xs font-bold text-slate-300 font-serif mb-2">
                Starea Actuală a Instalației din Subsol:
              </label>
              <div className="space-y-2">
                {[
                  { id: "degradat", label: "Degradată (țevi vechi, izolație distrusă parțial)" },
                  { id: "severa", label: "Severă (bălți ocazionale, rugină avansată, miros)" },
                  { id: "critic", label: "Critică (inundație cronică, canalizare refulată)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPipeCondition(item.id as "degradat" | "severa" | "critic")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-serif transition-all border ${
                      pipeCondition === item.id
                        ? "bg-amber-950/40 border-amber-400 text-amber-200 font-bold"
                        : "bg-[#050914] border-amber-900/20 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0a142f] to-[#070d1e] border-2 border-amber-500/40 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
            <h3 className="font-serif text-lg font-bold text-amber-300 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Impactul Financiar Estimat
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#050914] border border-rose-900/40">
                <div className="text-[11px] font-serif text-slate-400 mb-1">
                  Pierdere / Apartament / Lună rece
                </div>
                <div className="text-2xl font-serif font-black text-rose-400">
                  ~{monthlyLossPerApt} Lei
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Energie termică disipată inutil
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#050914] border border-rose-900/40">
                <div className="text-[11px] font-serif text-slate-400 mb-1">
                  Pierdere Anuală la Nivel de Bloc
                </div>
                <div className="text-2xl font-serif font-black text-rose-400">
                  ~{totalBuildingAnnualLoss.toLocaleString("ro-RO")} Lei
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Bani aruncați pe fereastră anual
                </div>
              </div>
            </div>

            {/* Sponsorship value savings */}
            <div className="p-5 rounded-2xl bg-[#050914] border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
                <PiggyBank className="w-4 h-4 text-amber-400" />
                Valoarea Materialelor Puse la Dispoziție Gratuit:
              </div>
              <div className="text-3xl font-serif font-black text-amber-300">
                ~{estimatedMaterialsSponsored.toLocaleString("ro-RO")} Lei
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Asociația Viziune Urbană acoperă 100% costul acestor materiale din fondurile strânse de la companii donatoare și formularele 230 ANAF.
              </p>
            </div>

            <button
              onClick={onOpenAuditModal}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/60 transition-all font-serif"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              Solicită Audit Tehnic Gratuit pentru Blocul Tău <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

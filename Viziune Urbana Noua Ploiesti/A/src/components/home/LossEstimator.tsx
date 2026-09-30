"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingDown, ShieldAlert, Sparkles, Flame } from "lucide-react";

type LossEstimatorProps = {
  readonly onOpenAuditModal: () => void;
};

export function LossEstimator({ onOpenAuditModal }: LossEstimatorProps) {
  const [apartments, setApartments] = useState<number>(40);
  const [pipeAge, setPipeAge] = useState<number>(35);
  const [hasRecurringLeaks, setHasRecurringLeaks] = useState<boolean>(true);

  // Calculation parameters based on real Ploiești district heating data:
  // Non-insulated steel pipes lose ~25-35% heat in damp basements.
  const baseLossPerAptPerMonth = Math.round(35 + (pipeAge / 10) * 12 + (hasRecurringLeaks ? 25 : 0));
  const annualLossPerApt = baseLossPerAptPerMonth * 7; // 7 heating months in Prahova
  const totalBlockLossPerYear = annualLossPerApt * apartments;
  const estimatedMaterialsSaved = Math.round(apartments * 380); // Average material value sponsored

  return (
    <section id="calculator" className="py-24 bg-[#060911] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Simulator Financiar Asociație
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cât vă costă țevile vechi din subsol?
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Conductele neizolate și pierderile de agent termic din subsoluri se regăsesc lună de lună în factura fiecărui locatar. Simulați impactul pentru blocul dumneavoastră:
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Controls */}
            <div className="space-y-6">
              {/* Apartments Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Număr apartamente în bloc
                  </label>
                  <span className="text-sm font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {apartments} apartamente
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="2"
                  value={apartments}
                  onChange={(e) => setApartments(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>10 (bloc mic)</span>
                  <span>40 (bloc standard 4 etaje)</span>
                  <span>120 (turn)</span>
                </div>
              </div>

              {/* Pipe Age Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Vechimea instalației (ani)
                  </label>
                  <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {pipeAge} ani
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={pipeAge}
                  onChange={(e) => setPipeAge(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>10 ani</span>
                  <span>35 ani (media Ploiești)</span>
                  <span>60 ani</span>
                </div>
              </div>

              {/* Toggle Leaks */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasRecurringLeaks}
                    onChange={(e) => setHasRecurringLeaks(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Avem inundații recurente sau umezeală / miros în subsol
                  </span>
                </label>
              </div>
            </div>

            {/* Right Results Card */}
            <div className="bg-[#0b1326] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  Pierderi estimate anual la încălzire
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {totalBlockLossPerYear.toLocaleString("ro-RO")} Lei{" "}
                  <span className="text-xs font-normal text-slate-400">/ an pe bloc</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Aprox. <strong className="text-slate-200">{annualLossPerApt} Lei</strong> aruncați de fiecare apartament în fiecare iarnă.
                </div>
              </div>

              <div className="border-b border-slate-800 pb-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  Valoare materiale sponsorizate de noi
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ~ {estimatedMaterialsSaved.toLocaleString("ro-RO")} Lei
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Costul tuturor țevilor, robineților și izolației Armaflex suportat de asociația noastră.
                </div>
              </div>

              <button
                onClick={onOpenAuditModal}
                className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all"
              >
                Solicită Evaluarea Gratuită a Blocului <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

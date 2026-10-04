import React from "react";
import Image from "next/image";
import { SPEC_ITEMS } from "@/lib/data";
import { Wrench, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

type TechnicalSpecsProps = {
  readonly onOpenAuditModal: () => void;
};

export function TechnicalSpecs({ onOpenAuditModal }: TechnicalSpecsProps) {
  return (
    <section id="caiet-sarcini" className="py-24 bg-[#080d19] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Wrench className="w-3.5 h-3.5" />
            Caiet de Sarcini & Standarde
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Etapele execuției proiectului vor fi:
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Standarde riguroase de execuție tehnică și igienizare pentru fiecare subsol reabilitat.
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
          {SPEC_ITEMS.map((item) => (
            <div
              key={item.orderNum}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    0{item.orderNum}
                  </span>
                  {item.image && (
                    <div className="w-9 h-9 relative rounded-lg overflow-hidden border border-slate-800">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Normativ tehnic obligatoriu</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action strip */}
        <div className="text-center bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Instalații noi, izolate profesional. Zero pierderi, zero griji.
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            Scăpați de inundații, mucegai și facturi umflate. Contactați-ne pentru evaluarea tehnică gratuită a subsolului blocului dumneavoastră.
          </p>
          <button
            onClick={onOpenAuditModal}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all"
          >
            Contactează-ne pentru Evaluare <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

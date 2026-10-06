import React from "react";
import Image from "next/image";
import { SPEC_ITEMS } from "@/lib/data";
import { Wrench, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

type TechnicalSpecsProps = {
  readonly onOpenAuditModal: () => void;
};

export function TechnicalSpecs({ onOpenAuditModal }: TechnicalSpecsProps) {
  return (
    <section id="caiet-sarcini" className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Wrench className="w-3.5 h-3.5" />
            Caiet de Sarcini & Standarde
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight">
            Etapele execuției proiectului vor fi:
          </h2>
          <p className="mt-4 text-slate-700 text-base leading-relaxed">
            Standarde riguroase de execuție tehnică și igienizare pentru fiecare subsol reabilitat.
          </p>
        </div>

        {/* 5 Steps Grid in crisp white cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-10 sm:mb-16">
          {SPEC_ITEMS.map((item) => (
            <div
              key={item.orderNum}
              className="bg-white border border-amber-900/15 hover:border-amber-600/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-600/30 text-amber-900 font-mono font-bold text-xs flex items-center justify-center">
                    0{item.orderNum}
                  </span>
                  {item.image && (
                    <div className="w-9 h-9 relative rounded-lg overflow-hidden border border-amber-900/15">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-serif font-bold text-[#071330] mb-2 leading-snug group-hover:text-amber-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Standard Conformitate</span>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-amber-900/20 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-600/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#071330]">
                Standard Executiv Garantat
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Garanție de 5 ani oferită de către partenerii de execuție pentru toate traseele hidraulice.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 shadow-md transition-all active:scale-95 shrink-0"
          >
            <span>Înscrie Asociația</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

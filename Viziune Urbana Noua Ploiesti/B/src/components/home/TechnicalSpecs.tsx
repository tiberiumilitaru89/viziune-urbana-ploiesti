import React from "react";
import Image from "next/image";
import { SPEC_ITEMS } from "@/lib/data";
import { CheckSquare, ArrowRight, ShieldCheck, Scale } from "lucide-react";

type TechnicalSpecsProps = {
  readonly onOpenAuditModal: () => void;
};

export function TechnicalSpecs({ onOpenAuditModal }: TechnicalSpecsProps) {
  return (
    <section id="caiet-sarcini" className="py-28 bg-[#050914] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Scale className="w-3.5 h-3.5" />
            Normativ Tehnic
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Caiet de Sarcini & Standarde de Execuție
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Fiecare subsol reabilitat respectă strict aceste 8 etape tehnologice, asigurând o durabilitate de minimum 30 de ani.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {SPEC_ITEMS.map((item) => (
            <div
              key={item.orderNum}
              className="bg-[#0a142f] border border-amber-900/30 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl"
            >
              <div>
                {item.image && (
                  <div className="relative h-36 w-full bg-[#050914] border-b border-amber-900/30">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-serif font-black text-xs flex items-center justify-center shrink-0">
                      {item.orderNum}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-5 pt-2 text-[10px] text-amber-300/80 font-serif border-t border-amber-900/20 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Normativ tehnic verificat</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onOpenAuditModal}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-950/60"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            Solicită Implementarea Caietului de Sarcini pentru Blocul Tău <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

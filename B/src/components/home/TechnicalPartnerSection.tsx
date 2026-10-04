import React from "react";
import Image from "next/image";
import { Wrench, ShieldCheck, Clock, Award, CheckCircle, Landmark } from "lucide-react";

export function TechnicalPartnerSection() {
  return (
    <section id="partener" className="py-28 bg-[#070d1e] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0a142f] to-[#050914] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Technical Partner Photo */}
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-amber-900/40 shadow-2xl">
              <Image
                src="/tehnician-tevi-cupru.jpg"
                alt="Tehnician calificat partener pe șantier"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 bg-[#0a142f]/90 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/30 text-xs">
                <div className="font-serif font-bold text-white">Parteneri de Execuție</div>
                <div className="text-[11px] text-amber-300">Peste 15 ani pe șantierele din Prahova</div>
              </div>
            </div>

            {/* Partner Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em]">
                <Award className="w-3.5 h-3.5" />
                Parteneri Tehnici Acreditați
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight leading-tight">
                Parteneri de Execuție Autorizați
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed font-serif">
                Pentru că materialele de calitate au nevoie de o mână de lucru la fel de sigură, lucrările sunt încredințate exclusiv partenerilor de execuție autorizați, cu reputație impecabilă.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0a142f] border border-amber-900/30">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-white">15+ Ani de Experiență</h4>
                    <p className="text-[11px] text-slate-400">
                      Sute de subsoluri, coloane și instalații complexe executate în Ploiești și județul Prahova.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0a142f] border border-amber-900/30">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-white">Garanție de 5 ani oferită de către partenerii de execuție</h4>
                    <p className="text-[11px] text-slate-400">
                      Contract ferm de garanție de 5 ani oferit de către partenerii de execuție și asistență directă cu asociația de proprietari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0a142f] border border-amber-900/30">
                  <Wrench className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-white">Verificări Trimestriale</h4>
                    <p className="text-[11px] text-slate-400">
                      Inspecții periodice ale robineților și traseelor pentru prevenirea oricăror anomalii de presiune.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

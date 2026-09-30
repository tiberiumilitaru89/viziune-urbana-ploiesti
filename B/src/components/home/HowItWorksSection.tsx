import React from "react";
import { FileText, ClipboardCheck, Gift, Wrench, AlertCircle, ArrowRight, Scale } from "lucide-react";

type HowItWorksSectionProps = {
  readonly onOpenAuditModal: () => void;
};

export function HowItWorksSection({ onOpenAuditModal }: HowItWorksSectionProps) {
  const steps = [
    {
      num: "I",
      icon: FileText,
      title: "Completează formularul",
      desc: "Asociația depune cererea și detaliază problema subsolului. (Durează doar 2 minute).",
      tag: "Depunere Oficială Rapidă",
    },
    {
      num: "II",
      icon: ClipboardCheck,
      title: "Evaluare Tehnică",
      desc: "Specialiștii evaluează în teren și calculează necesarul de materiale. Deplasarea în teren, evaluarea stării subsolului și întocmirea devizului de materiale sunt complet gratuite.",
      tag: "Constatare Gratuită în Teren",
    },
    {
      num: "III",
      icon: Gift,
      title: "Sponsorizare Materiale",
      desc: "Viziune Urbană achiziționează direct de la distribuitori țevile, robineții, izolația și toate materialele necesare, și le donează asociației. Nu vă dăm bani, ci vă aducem fizic materialele. Asigurăm integral toate materialele necesare, cu zero cost pentru bloc.",
      tag: "Donație Materiale 100%",
    },
    {
      num: "IV",
      icon: Wrench,
      title: "Execuție Autorizată",
      desc: "Partenerul autorizat execută lucrarea, asociația plătind doar manopera.",
      tag: "Garanție 5 Ani de Execuție",
    },
  ];

  return (
    <section id="cum-functioneaza" className="py-28 bg-[#050914] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Scale className="w-3.5 h-3.5" />
            Protocolul Civic Oficial
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Cum funcționează programul
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Procedură clară, transparentă și verificată în fața asociațiilor de proprietari și a legii.
          </p>
        </div>

        {/* 4 Protocol Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-7 rounded-2xl bg-[#0a142f] border border-amber-900/30 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-serif text-3xl font-black text-amber-400/50">
                      {st.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {st.desc}
                  </p>
                </div>

                <div className="text-[11px] font-serif font-bold text-amber-300 px-3 py-1 rounded-md bg-[#050914] border border-amber-900/40 inline-block self-start">
                  {st.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Transparency Box */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#0a142f] border-2 border-amber-500/40 p-8 flex flex-col sm:flex-row items-start gap-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="font-serif text-lg font-bold text-white">
              Transparență Financiară Absolută — Asociația mai plătește ceva?
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Asociația plătește <strong>DOAR manopera</strong> (munca instalatorilor) către partenerul tehnic. Materialele, care reprezintă o mare parte din cost, sunt <strong>gratuite</strong>.
            </p>
          </div>
          <button
            onClick={onOpenAuditModal}
            className="sm:self-center shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg"
          >
            Înscrie Asociația <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

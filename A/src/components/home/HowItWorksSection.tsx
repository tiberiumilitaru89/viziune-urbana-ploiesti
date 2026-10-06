import React from "react";
import { FileText, ClipboardCheck, Gift, Wrench, AlertCircle, ArrowRight } from "lucide-react";

type HowItWorksSectionProps = {
  readonly onOpenAuditModal: () => void;
};

export function HowItWorksSection({ onOpenAuditModal }: HowItWorksSectionProps) {
  const steps = [
    {
      num: "01",
      icon: FileText,
      title: "Completează formularul",
      desc: "Asociația de proprietari trimite solicitarea și detaliază pe scurt problemele subsolului.",
      tag: "Durează doar 2 minute",
      accent: "text-amber-800 border-amber-600/30 bg-amber-500/15",
    },
    {
      num: "02",
      icon: ClipboardCheck,
      title: "Evaluare Tehnică Gratuită",
      desc: "Specialiștii noștri se deplasează în teren, constată defecțiunile și întocmesc devizul complet de materiale.",
      tag: "100% Gratuit & Fără Obligații",
      accent: "text-emerald-800 border-emerald-600/30 bg-emerald-500/15",
    },
    {
      num: "03",
      icon: Gift,
      title: "Sponsorizare în Materiale",
      desc: "Viziune Urbană cumpără direct de la distribuitori toate materialele (PPR, robineți, izolație Armaflex) și le donează blocului.",
      tag: "Materiale Sponsorizate 100%",
      accent: "text-blue-800 border-blue-600/30 bg-blue-500/15",
    },
    {
      num: "04",
      icon: Wrench,
      title: "Execuție & Garanție 5 Ani",
      desc: "Partenerul autorizat, Instal Serv Becheanu, montează noua rețea, asociația suportând doar costul de manoperă.",
      tag: "Garanție 5 ani oferită de către partenerii de execuție",
      accent: "text-amber-900 border-amber-700/30 bg-amber-600/15",
    },
  ];

  return (
    <section id="cum-functioneaza" className="py-14 sm:py-20 lg:py-24 bg-transparent border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-bold uppercase tracking-widest mb-4">
            Proces Transparent
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight">
            Cum funcționează programul.
          </h2>
          <p className="mt-4 text-slate-700 text-base leading-relaxed">
            Patru pași simpli și riguroși prin care transformăm subsolurile degradate în spații tehnice uscate, moderne și eficiente energetic.
          </p>
        </div>

        {/* Steps Grid in crisp white cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="relative p-5 sm:p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-900/15 hover:border-amber-600/40 transition-all hover:-translate-y-1 shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-serif font-black text-amber-800/40 group-hover:text-amber-700 transition-colors">
                      {s.num}
                    </span>
                    <div className={`p-2.5 rounded-xl border ${s.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#071330] mb-2 leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-amber-900 inline-block px-3 py-1 rounded-md bg-[#F5EDE1] border border-amber-700/20">
                  {s.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Clarification Callout */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-amber-50/90 border border-amber-300 p-5 sm:p-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-600/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-800" />
          </div>

          <div className="space-y-2 flex-1">
            <h4 className="text-base font-serif font-bold text-[#071330]">
              Notă Importantă — Asociația mai plătește ceva?
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Asociația plătește <strong className="text-[#071330] font-bold">DOAR manopera</strong> (munca propriu-zisă a instalatorilor calificați) către <strong className="text-[#071330] font-bold">Instal Serv Becheanu</strong>. Toate materialele (care reprezintă cea mai mare pondere financiară dintr-un deviz) sunt <strong className="text-[#071330] font-bold">100% asigurate și donate</strong> prin Viziune Urbană.
            </p>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="w-full sm:w-auto justify-center sm:self-center shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 transition-all shadow-md active:scale-95 text-center"
          >
            <span>Înscrie Asociația</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

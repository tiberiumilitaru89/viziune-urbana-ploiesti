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
      accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      num: "02",
      icon: ClipboardCheck,
      title: "Evaluare Tehnică Gratuită",
      desc: "Specialiștii noștri se deplasează în teren, constată defecțiunile și întocmesc devizul complet de materiale.",
      tag: "100% Gratuit & Fără Obligații",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      num: "03",
      icon: Gift,
      title: "Sponsorizare în Materiale",
      desc: "Viziune Urbană cumpără direct de la distribuitori toate materialele (PPR, robineți, izolație Armaflex) și le donează blocului.",
      tag: "Materiale Sponsorizate 100%",
      accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      num: "04",
      icon: Wrench,
      title: "Execuție & Garanție 5 Ani",
      desc: "Partenerul tehnic autorizat montează noua rețea, asociația suportând doar costul de manoperă.",
      tag: "Garanție 5 ani + Verificări",
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
  ];

  return (
    <section id="cum-functioneaza" className="py-14 sm:py-20 lg:py-24 bg-[#090e1a]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            Proces Transparent
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cum funcționează programul.
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Patru pași simpli și riguroși prin care transformăm subsolurile degradate în spații tehnice uscate, moderne și eficiente energetic.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-700 group-hover:text-slate-500 transition-colors">
                    {step.num}
                  </span>
                  <div className={`p-2.5 rounded-xl border ${step.accent}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {step.desc}
                </p>

                <div className="text-[11px] font-bold text-slate-300 inline-block px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60">
                  {step.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Transparency Callout */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 sm:p-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="text-base font-bold text-white">
              Notă Importantă — Asociația mai plătește ceva?
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Asociația plătește <strong>DOAR manopera</strong> (munca propriu-zisă a instalatorilor calificați) către partenerul tehnic de execuție. Toate materialele (care reprezintă cea mai mare pondere financiară dintr-un deviz) sunt <strong>100% asigurate și donate</strong> prin Viziune Urbană.
            </p>
          </div>
          <button
            onClick={onOpenAuditModal}
            className="w-full sm:w-auto justify-center sm:self-center shrink-0 flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20 text-center"
          >
            Înscrie Asociația <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

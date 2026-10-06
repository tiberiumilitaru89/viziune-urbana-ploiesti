import React from "react";
import { GraduationCap, BookOpen, Users2, Landmark } from "lucide-react";

export function InstitutionalPartners() {
  const partners = [
    {
      name: "Liceul Tehnologic „Toma Socolescu”",
      role: "Partener de Practică Profesională",
      desc: "Elevii din clasele profesionale de instalații participă la stagii practice pe șantierele de reabilitare din subsoluri, sub îndrumarea maiștrilor și tehnicienilor partenerilor de execuție.",
      icon: GraduationCap,
      badge: "Formare Generații Noi",
      accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      name: "ACCRP Ploiești",
      role: "Partener de Calificare & Formare Profesională",
      desc: "Centrul de calificare și recalificare profesională din Ploiești asigură instruirea practică, atestarea oficială și perfecționarea continuă a instalatorilor și meșterilor pe șantierele de modernizare.",
      icon: Users2,
      badge: "Calificare Tehnică",
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      name: "Universitatea Petrol-Gaze (UPG)",
      role: "Susținător Științific & Instituțional",
      desc: "Catedrele de inginerie mecanică și energetică din cadrul UPG Ploiești sprijină inițiativa prin recomandări metodologice și monitorizarea eficienței termice a rețelelor secundare.",
      icon: Landmark,
      badge: "Audit Energetic",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
  ];

  return (
    <section className="py-20 bg-[#080d19]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Educație & Comunitate
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Parteneriate Instituționale & Educaționale
          </h2>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Reabilitarea Ploieștiului este un efort comun ce reunește școli tehnice, universitatea fanion a orașului și societatea civilă.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${p.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/60 uppercase tracking-wider">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 leading-snug">
                    {p.name}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-400 mb-3">
                    {p.role}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

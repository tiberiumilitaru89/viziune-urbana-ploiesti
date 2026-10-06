import React from "react";
import { GraduationCap, BookOpen, Users2, Landmark } from "lucide-react";

export function InstitutionalPartners() {
  const partners = [
    {
      name: "Liceul Tehnologic „Toma Socolescu”",
      role: "Partener de Practică Profesională",
      desc: "Elevii din clasele profesionale de instalații participă la stagii practice pe șantierele de reabilitare din subsoluri, sub îndrumarea maiștrilor și tehnicienilor Instal Serv Becheanu.",
      icon: GraduationCap,
      badge: "Formare Generații Noi",
      accent: "text-amber-800 border-amber-600/30 bg-amber-500/15",
    },
    {
      name: "ACCRP Ploiești",
      role: "Partener de Calificare & Formare Profesională",
      desc: "Centrul de calificare și recalificare profesională din Ploiești asigură instruirea practică, atestarea oficială și perfecționarea continuă a instalatorilor și meșterilor pe șantierele de modernizare.",
      icon: Users2,
      badge: "Calificare Tehnică",
      accent: "text-purple-800 border-purple-600/30 bg-purple-500/15",
    },
    {
      name: "Universitatea Petrol-Gaze (UPG)",
      role: "Susținător Științific & Instituțional",
      desc: "Catedrele de inginerie mecanică și energetică din cadrul UPG Ploiești sprijină inițiativa prin recomandări metodologice și monitorizarea eficienței termice a rețelelor secundare.",
      icon: Landmark,
      badge: "Audit Energetic",
      accent: "text-emerald-800 border-emerald-600/30 bg-emerald-500/15",
    },
  ];

  return (
    <section className="py-20 bg-[#FAF7F2] border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Educație & Comunitate
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#071330] tracking-tight">
            Parteneriate Instituționale & Educaționale
          </h2>
          <p className="mt-3 text-slate-700 text-sm leading-relaxed">
            Reabilitarea Ploieștiului este un efort comun ce reunește școli tehnice, universitatea fanion a orașului și societatea civilă.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="p-6 rounded-2xl bg-white border border-amber-900/15 flex flex-col justify-between hover:border-amber-600/40 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${p.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-[#F5EDE1] border border-amber-700/20 px-2.5 py-1 rounded-md">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#071330] mb-1">
                    {p.name}
                  </h3>
                  <div className="text-xs font-bold text-amber-800 mb-3">
                    {p.role}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
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

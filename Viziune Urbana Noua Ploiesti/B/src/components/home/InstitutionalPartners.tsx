import React from "react";
import { GraduationCap, Landmark, Users2, BookOpen } from "lucide-react";

export function InstitutionalPartners() {
  const partners = [
    {
      name: "Liceul Tehnologic „Toma Socolescu”",
      role: "Partener de Practică Profesională",
      desc: "Elevii din clasele profesionale de instalații participă la stagii practice pe șantierele de reabilitare din subsoluri, sub îndrumarea maiștrilor și tehnicienilor Instal Serv Becheanu.",
      icon: GraduationCap,
      badge: "Formare Generații Noi",
    },
    {
      name: "ACCR Ploiești",
      role: "Partener de Practică & Implicare Comunitară",
      desc: "Asociația Comunitară Calea Renașterii sprijină dialogul cu locatarii și organizarea asociațiilor de proprietari pentru luarea deciziilor în adunările generale.",
      icon: Users2,
      badge: "Coeziune Civic",
    },
    {
      name: "Universitatea Petrol-Gaze (UPG)",
      role: "Susținător Științific & Instituțional",
      desc: "Catedrele de inginerie mecanică și energetică din cadrul UPG Ploiești sprijină inițiativa prin recomandări metodologice și monitorizarea eficienței termice a rețelelor secundare.",
      icon: Landmark,
      badge: "Audit Energetic",
    },
  ];

  return (
    <section className="py-24 bg-[#050914] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Consorțiul Civic & Educațional
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Parteneriate Instituționale & Educaționale
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Un pact între generații: învățământul tehnic ploieștean își formează viitorii instalatori chiar pe șantierele orașului.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="p-7 rounded-2xl bg-[#0a142f] border border-amber-900/30 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-serif font-bold text-amber-300 px-2.5 py-1 rounded-full bg-[#050914] border border-amber-900/40 uppercase tracking-wider">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white mb-1 leading-snug">
                    {p.name}
                  </h3>
                  <div className="text-xs font-serif font-semibold text-amber-400 mb-4">
                    {p.role}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
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

import React from "react";
import Image from "next/image";
import { AlertTriangle, TrendingUp, Users, CheckCircle } from "lucide-react";

export function MissionSection() {
  return (
    <section id="misiune" className="py-14 sm:py-20 lg:py-24 bg-[#060911]/75 backdrop-blur-[2px] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              De ce existăm
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Problema invizibilă <br />
              <span className="text-slate-400">de sub pașii noștri.</span>
            </h2>

            <div className="space-y-4 text-slate-300 text-base leading-relaxed">
              <p>
                Sute de blocuri din Ploiești ascund la subsol o adevărată bombă cu ceas: țevi de oțel și fontă vechi de peste 40 de ani, ruginite, inundații recurente, pierderi masive de agent termic și un mediu insalubru care afectează sănătatea tuturor locatarilor.
              </p>
              <p>
                Asociația <strong>Viziune Urbană</strong> a pornit din frustrarea comună a multor ploieșteni: subsoluri inundate, mirosuri insuportabile pe casa scării și facturi umflate nejustificat de pierderile din rețea.
              </p>
            </div>

            {/* Quote Manifest */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/90 border-l-4 border-emerald-500 border-slate-800 shadow-xl">
              <p className="text-base sm:text-lg font-medium text-slate-100 italic leading-snug">
                „Nu suntem o firmă comercială. Suntem vecini care au decis că nu mai pot asista pasivi la degradarea blocurilor și că problemele nu se rezolvă de la sine.”
              </p>
              <div className="mt-3 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                — Manifestul Civic Viziune Urbană Ploiești
              </div>
            </div>
          </div>

          {/* Media & Stats column */}
          <div className="relative">
            {/* Visual preview */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-[4/3]">
              <Image
                src="/subsol-reabilitat.jpg"
                alt="Subsol reabilitat profesional în Ploiești"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-transparent to-transparent opacity-80" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border border-slate-700/60 text-[11px] sm:text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Intervenție finalizată în Ploiești
              </div>
            </div>

            {/* Floating stats cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mt-4">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <div className="text-xl sm:text-3xl font-extrabold text-emerald-400">
                  18+
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Asociații Ajutate
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <div className="text-xl sm:text-3xl font-extrabold text-blue-400">
                  250k+
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Lei Sponsorizați
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <div className="text-xl sm:text-3xl font-extrabold text-purple-400">
                  100%
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Garanție Lucrări
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Image from "next/image";
import { BookOpen, CheckCircle, Landmark, ShieldCheck } from "lucide-react";

export function MissionSection() {
  return (
    <section id="misiune" className="py-28 bg-[#070d1e]/80 backdrop-blur-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Editorial manifesto column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Manifestul Civic
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight leading-tight mb-6">
              Problema invizibilă <br />
              <span className="text-amber-300/80 italic font-normal">de sub pașii noștri.</span>
            </h2>

            <div className="space-y-4 text-slate-300 text-base leading-relaxed">
              <p>
                Sute de blocuri din Ploiești ascund la subsol o adevărată bombă cu ceas: țevi ruginite, inundații recurente, pierderi masive de căldură și un mediu insalubru.
              </p>
              <p>
                Viziune Urbană a pornit din frustrarea comună a multor ploieșteni: subsoluri inundate, mirosuri insuportabile și facturi umflate de pierderi.
              </p>
            </div>

            {/* Official Foundation Decree Quote */}
            <div className="mt-8 p-7 rounded-2xl bg-[#0a142f] border border-amber-500/40 relative shadow-2xl">
              <div className="text-4xl font-serif text-amber-400/40 absolute top-3 left-4 leading-none select-none">
                “
              </div>
              <p className="text-lg font-serif italic text-slate-100 leading-relaxed pl-6 relative z-10">
                Nu suntem o firmă. Suntem vecini care au decis că nu mai pot aștepta să se repare de la sine.
              </p>
              <div className="mt-4 pt-3 border-t border-amber-900/30 flex items-center justify-between text-xs text-amber-300 font-bold tracking-wider uppercase">
                <span>Asociația Viziune Urbană Ploiești</span>
                <span className="text-slate-400 font-normal">Statut Civic</span>
              </div>
            </div>
          </div>

          {/* Visual archival column */}
          <div>
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-[#0a142f] aspect-[4/3]">
              <Image
                src="/subsol-reabilitat.jpg"
                alt="Subsol reabilitat integral prin Viziune Urbană Ploiești"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e] via-transparent to-transparent opacity-80" />
              <div className="absolute top-4 left-4 bg-[#0a142f]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/40 text-xs font-serif font-bold text-amber-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                Lucrare recepționată conform normativelor
              </div>
            </div>

            {/* Editorial Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <div className="p-5 rounded-2xl bg-[#0a142f] border border-amber-900/30 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-300">
                  18+
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Asociații Ajutate
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0a142f] border border-amber-900/30 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-300">
                  250k+
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Lei Sponsorizați
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0a142f] border border-amber-900/30 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-300">
                  5 Ani
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Garanție Fermă
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

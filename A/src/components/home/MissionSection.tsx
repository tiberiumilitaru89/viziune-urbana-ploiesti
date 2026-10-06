import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export function MissionSection() {
  return (
    <section id="misiune" className="py-14 sm:py-20 lg:py-24 bg-transparent border-t border-amber-900/15 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-bold uppercase tracking-widest mb-4">
              De ce existăm
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight leading-tight mb-6">
              Problema invizibilă <br />
              <span className="text-amber-800 italic font-normal">de sub pașii noștri.</span>
            </h2>

            <div className="space-y-4 text-slate-700 text-base leading-relaxed">
              <p>
                Sute de blocuri din Ploiești ascund la subsol o adevărată bombă cu ceas: țevi de oțel și fontă vechi de peste 40 de ani, ruginite, inundații recurente, pierderi masive de agent termic și un mediu insalubru care afectează sănătatea tuturor locatarilor.
              </p>
              <p>
                Asociația <strong className="text-[#071330] font-bold">Viziune Urbană</strong> a pornit din frustrarea comună a multor ploieșteni: subsoluri inundate, mirosuri insuportabile pe casa scării și facturi umflate nejustificat de pierderile din rețea.
              </p>
            </div>

            {/* Quote Manifest on translucent card */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md border-l-4 border-amber-600 border border-amber-900/15 shadow-md">
              <p className="text-base sm:text-lg font-serif font-medium text-[#071330] italic leading-snug">
                „Nu suntem o firmă comercială. Suntem vecini care au decis că nu mai pot asista pasivi la degradarea blocurilor și că problemele nu se rezolvă de la sine.”
              </p>
              <div className="mt-3 text-xs font-bold text-amber-800 uppercase tracking-wider">
                — Manifestul Civic Viziune Urbană Ploiești
              </div>
            </div>
          </div>

          {/* Media & Stats column */}
          <div className="relative">
            {/* Visual preview */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-900/15 shadow-xl bg-white aspect-[4/3]">
              <Image
                src="/subsol-reabilitat.jpg"
                alt="Subsol reabilitat profesional în Ploiești"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border border-amber-900/15 text-[11px] sm:text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Intervenție finalizată în Ploiești
              </div>
            </div>

            {/* Floating stats cards in translucent glass */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mt-4">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md border border-amber-900/15 text-center shadow-md">
                <div className="text-xl sm:text-3xl font-serif font-black text-[#071330]">18+</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Asociații Ajutate</div>
              </div>
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md border border-amber-900/15 text-center shadow-md">
                <div className="text-xl sm:text-3xl font-serif font-black text-amber-700">250k+</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Lei Sponsorizați</div>
              </div>
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md border border-amber-900/15 text-center shadow-md">
                <div className="text-xl sm:text-3xl font-serif font-black text-emerald-700">100%</div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Garanție Lucrări</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

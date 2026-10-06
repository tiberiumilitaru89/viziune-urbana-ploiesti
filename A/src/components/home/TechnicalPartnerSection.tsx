import React from "react";
import Image from "next/image";
import { ShieldCheck, Award, CalendarCheck, CheckCircle } from "lucide-react";

export function TechnicalPartnerSection() {
  return (
    <section id="partener" className="py-20 lg:py-24 bg-[#FAF7F2] border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Column */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-amber-900/15 shadow-xl bg-white aspect-[4/3]">
              <Image
                src="/tehnician-tevi-cupru.jpg"
                alt="Tehnician profesionist partener montând instalație"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071330]/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-amber-900/15 shadow-md">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">
                  Certificare & Rigoare
                </div>
                <div className="text-sm font-serif font-bold text-[#071330]">
                  Sudură și îmbinare termică cu utilaje de înaltă precizie
                </div>
              </div>
            </div>
          </div>

          {/* Text & Guarantee Details */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Partener Tehnic Oficial
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight leading-tight mb-6">
              INSTAL SERV BECHEANU
            </h2>

            <p className="text-slate-700 text-base leading-relaxed mb-8">
              Cu o experiență de peste 15 ani în domeniul instalațiilor de bloc din Ploiești și județul Prahova, echipa <strong className="text-[#071330] font-bold">Instal Serv Becheanu</strong> aduce expertiză industrială, scule profesionale și proceduri certificate pe fiecare șantier.
            </p>

            {/* Highlights in crisp white cards */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <Award className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    15+ Ani de Experiență Dedicată Blocurilor
                  </h4>
                  <p className="text-xs text-slate-600">
                    Sute de coloane înlocuite și subsoluri modernizate conform celor mai exigente standarde europene.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <CalendarCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    Garanție 5 Ani
                  </h4>
                  <p className="text-xs text-slate-600">
                    Garanție de 5 ani oferită de către partenerii de execuție prin contract și proces-verbal de recepție.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    Echipă Completă de Instalatori Autorizați
                  </h4>
                  <p className="text-xs text-slate-600">
                    Personal calificat, echipat cu termofuziune digitală, generatoare autonome și scule de carotare uscată.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

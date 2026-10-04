import React from "react";
import Image from "next/image";
import { ShieldCheck, Award, CalendarCheck, Phone, CheckCircle, Wrench } from "lucide-react";

export function TechnicalPartnerSection() {
  return (
    <section id="partener" className="py-24 bg-[#060911]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Column */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-[4/3]">
              <Image
                src="/tehnician-tevi-cupru.jpg"
                alt="Tehnician profesionist partener montând instalație"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Certificare & Rigoare
                </div>
                <div className="text-sm font-semibold text-white">
                  Sudură și îmbinare termică cu utilaje de înaltă precizie
                </div>
              </div>
            </div>
          </div>

          {/* Text & Guarantee Details */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Parteneri Tehnici de Execuție
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              PARTENERI DE EXECUȚIE AUTORIZAȚI
            </h2>

            <p className="text-slate-300 text-base leading-relaxed mb-8">
              Cu o experiență de peste 15 ani în domeniul instalațiilor de bloc din Ploiești și județul Prahova, echipele partenere de execuție aduc expertiză industrială, scule profesionale și proceduri certificate.
            </p>

            {/* Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    15+ Ani de Experiență Dedicată Blocurilor
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sute de coloane înlocuite și subsoluri modernizate conform celor mai exigente standarde europene.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <CalendarCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Garanție 5 ani oferită de către partenerii de execuție
                  </h4>
                  <p className="text-xs text-slate-400">
                    Fiecare lucrare beneficiază de garanție de 5 ani oferită de către partenerii de execuție și inspecții periodice fără costuri adăugate pentru asociație.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <Wrench className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Echipă Autorizată și Tehnicieni Calificați
                  </h4>
                  <p className="text-xs text-slate-400">
                    Fără improvizații sau meșteri ocazionali. Personal specializat în instalații de presiune și canalizare.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Phone className="w-4 h-4 text-blue-400" />
                Dispecerat Tehnic: 0244 456 789
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { Landmark, MapPin, Phone, ShieldCheck, ArrowUpRight, Scale } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050914]/90 backdrop-blur-md text-slate-400 border-t border-amber-900/30 pt-12 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-serif font-black text-white text-base tracking-wide">
                VIZIUNE URBANĂ PLOIEȘTI
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Asociație civică independentă, dedicată salubrizării și reabilitării capitale a infrastructurii subterane din municipiul Ploiești. Un parteneriat durabil între proprietari, meșteri calificați și mediul academic.
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ploiești, jud. Prahova, România</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Secretariat: 0244 456 789</span>
              </div>
            </div>
          </div>

          {/* Navigație oficială */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
              Structură & Rapoarte
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#misiune" className="hover:text-amber-300 transition-colors">
                  Manifestul Civic Ploieștean
                </a>
              </li>
              <li>
                <a href="#cum-functioneaza" className="hover:text-amber-300 transition-colors">
                  Protocolul de Sponsorizare (4 Pași)
                </a>
              </li>
              <li>
                <a href="#proiecte" className="hover:text-amber-300 transition-colors">
                  Proiecte finalizate
                </a>
              </li>
              <li>
                <a href="#asociatii" className="hover:text-amber-300 transition-colors">
                  Registrul Public al Asociațiilor
                </a>
              </li>
              <li>
                <a href="#caiet-sarcini" className="hover:text-amber-300 transition-colors">
                  Etapele Execuției Proiectului
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">
                  Clarificări Procedurale (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Parteneriate Academice & Tehnice */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
              Parteneri Acreditați
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0a142f] border border-amber-900/30">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  PARTENERI DE EXECUȚIE
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[11px] text-slate-400">Garanție 5 ani oferită de către partenerii de execuție</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0a142f] border border-amber-900/30">
                <div className="text-xs font-bold text-white">Liceul Tehnic Toma Socolescu</div>
                <div className="text-[11px] text-amber-400">Convenție de practică duală</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0a142f] border border-amber-900/30">
                <div className="text-xs font-bold text-white">UPG Ploiești & ACCR</div>
                <div className="text-[11px] text-blue-300">Comitet științific și civic</div>
              </div>
            </div>
          </div>

          {/* Legalitate & Date Financiare */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
              Cadru Legal & Donații
            </h4>
            <div className="p-3.5 rounded-xl bg-[#0a142f] border border-amber-900/30 text-xs space-y-2">
              <div className="text-slate-200 font-semibold">Asociația Viziune Urbană Ploiești</div>
              <div className="text-[11px] text-slate-400">Banca Comercială Română (BCR)</div>
              <div className="font-mono text-[11px] text-amber-300 select-all bg-[#050914] p-2 rounded border border-amber-900/40 break-all">
                RO49 AAAA 1B31 0075 9384 0000
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <Scale className="w-3 h-3 text-amber-400" />
                <span>ONG înregistrat | Legea 196/2018</span>
              </div>
            </div>
            <div className="mt-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors"
              >
                Acces Registru Administratori <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="pt-8 border-t border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} Asociația Viziune Urbană Ploiești. Înregistrată în Registrul Asociațiilor și Fundațiilor.
          </div>
          <div className="text-right">
            Fundația unui bloc sănătos începe de jos.
          </div>
        </div>
      </div>
    </footer>
  );
}

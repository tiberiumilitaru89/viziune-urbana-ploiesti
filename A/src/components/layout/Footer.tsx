import React from "react";
import Link from "next/link";
import { Building2, Phone, MapPin, Mail, ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050811]/90 backdrop-blur-md text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                VIZIUNE URBANĂ PLOIEȘTI
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Inițiativă civică dedicată reabilitării integrale a rețelelor din subsolurile blocurilor din Ploiești. Sponsorizăm materialele, reconstruim încrederea între vecini.
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ploiești, jud. Prahova, România</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>0244 456 789 / 0722 123 456</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigație rapidă */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Platformă Civic
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#misiune" className="hover:text-emerald-400 transition-colors">
                  Misiune & De ce existăm
                </a>
              </li>
              <li>
                <a href="#cum-functioneaza" className="hover:text-emerald-400 transition-colors">
                  Cum funcționează (4 etape)
                </a>
              </li>
              <li>
                <a href="#proiecte" className="hover:text-emerald-400 transition-colors">
                  Proiecte finalizate
                </a>
              </li>
              <li>
                <a href="#asociatii" className="hover:text-emerald-400 transition-colors">
                  Tabelul Progresului Asociațiilor
                </a>
              </li>
              <li>
                <a href="#caiet-sarcini" className="hover:text-emerald-400 transition-colors">
                  Etapele Execuției Proiectului
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Întrebări Frecvente (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Parteneriate oficiale */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Parteneri Oficiali
            </h4>
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  PARTENERI DE EXECUȚIE
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400">Garanție 5 ani oferită de către partenerii de execuție</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white">Liceul Tehnic Toma Socolescu</div>
                <div className="text-[11px] text-amber-400">Partener de practică profesională</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white">UPG Ploiești & ACCR</div>
                <div className="text-[11px] text-blue-400">Susținători instituționali de proiect</div>
              </div>
            </div>
          </div>

          {/* Col 4: Transparență și Legalitate */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Transparență & Date Bancare
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <div className="text-slate-300 font-semibold">Asociația Viziune Urbană Ploiești</div>
              <div className="text-[11px] text-slate-400">Banca Comercială Română (BCR)</div>
              <div className="font-mono text-[11px] text-emerald-400 select-all bg-slate-950 p-1.5 rounded border border-slate-800">
                RO49 AAAA 1B31 0075 9384 0000
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Toate donațiile financiare și de materiale sunt supuse evidenței contabile stricte și rapoartelor publice anuale.
              </p>
            </div>
            <div className="mt-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                Panou Administrare Asociație <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {currentYear} Asociația Viziune Urbană Ploiești. Toate drepturile rezervate.
          </div>
          <div className="flex gap-6">
            <span>ONG Înregistrat în Registrul Asociațiilor și Fundațiilor</span>
            <span>Conform Legii 196/2018</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

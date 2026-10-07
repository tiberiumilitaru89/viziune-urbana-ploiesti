import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, ShieldCheck, ArrowUpRight, Scale, FileText } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF7F2]/95 backdrop-blur-md text-slate-700 border-t border-amber-900/20 pt-12 sm:pt-16 pb-8 sm:pb-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-600/30 shadow-md shrink-0 bg-[#FAF7F2]">
                <Image
                  src="/official-logo.jpg"
                  alt="Siglă Asociația Viziune Urbană Ploiești"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-serif font-black text-[#071330] text-base tracking-wide">
                VIZIUNE URBANĂ PLOIEȘTI
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Asociație civică independentă, dedicată salubrizării și reabilitării capitale a infrastructurii subterane din municipiul Ploiești. Un parteneriat durabil între proprietari, meșteri calificați și mediul academic.
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Ploiești, jud. Prahova, România</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Secretariat: 0244 456 789</span>
              </div>
            </div>
          </div>

          {/* Navigație oficială */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-900 uppercase tracking-widest mb-4">
              Structură & Rapoarte
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/formular-230" className="text-amber-900 font-bold hover:text-amber-950 transition-colors flex items-center gap-1.5">
                  <span>Redirecționează 3,5% (Formular 230)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-900 px-1.5 py-0.5 rounded font-sans font-semibold">Online</span>
                </Link>
              </li>
              <li>
                <Link href="/#misiune" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Manifestul Civic Ploieștean
                </Link>
              </li>
              <li>
                <Link href="/#cum-functioneaza" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Protocolul de Sponsorizare (4 Pași)
                </Link>
              </li>
              <li>
                <Link href="/#proiecte" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Proiecte finalizate
                </Link>
              </li>
              <li>
                <Link href="/#asociatii" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Registrul Public al Asociațiilor
                </Link>
              </li>
              <li>
                <Link href="/#caiet-sarcini" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Etapele Execuției Proiectului
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-slate-700 hover:text-amber-800 transition-colors">
                  Clarificări Procedurale (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Parteneriate Academice & Tehnice */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-900 uppercase tracking-widest mb-4">
              Parteneri Acreditați
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <div className="text-xs font-serif font-bold text-[#071330] flex items-center justify-between">
                  INSTAL SERV BECHEANU
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="text-[11px] text-slate-600">Garanție 5 ani oferită de către partenerii de execuție</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <div className="text-xs font-serif font-bold text-[#071330]">Liceul Tehnic Toma Socolescu</div>
                <div className="text-[11px] text-amber-800">Convenție de practică duală</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <div className="text-xs font-serif font-bold text-[#071330]">UPG & ACCRP</div>
                <div className="text-[11px] text-blue-800">Comitet științific & calificare</div>
              </div>
            </div>
          </div>

          {/* Legalitate & Date Financiare */}
          <div>
            <h4 className="font-serif text-xs font-bold text-amber-900 uppercase tracking-widest mb-4">
              Cadru Legal & Donații
            </h4>
            <div className="p-3.5 rounded-xl bg-white border border-amber-900/15 text-xs space-y-2 shadow-sm">
              <div className="text-[#071330] font-bold">Asociația Viziune Urbană Ploiești</div>
              <div className="text-[11px] text-slate-600">UniCredit Bank</div>
              <div className="font-mono text-[11px] text-amber-950 select-all bg-[#F5EDE1] p-2 rounded border border-amber-700/20 break-all font-semibold">
                RO94 BACX 0000 0042 3447 3000
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 pt-1">
                <Scale className="w-3 h-3 text-amber-700" />
                <span>ONG înregistrat | Legea 196/2018</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/formular-230"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Completează Formularul 230</span>
                </Link>
              </div>
            </div>
            <div className="mt-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 hover:text-amber-950 font-bold transition-colors"
              >
                Acces Registru Administratori <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom banner & T.M. Solutions Signature */}
        <div className="pt-8 border-t border-amber-900/15 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="space-y-1.5 text-center md:text-left">
            <div>
              &copy; {currentYear} Asociația Viziune Urbană Ploiești. Înregistrată în Registrul Asociațiilor și Fundațiilor.
            </div>
            <div className="font-serif italic text-amber-900">
              Fundația unui bloc sănătos începe de jos.
            </div>
          </div>

          {/* Signature: Designed & Developed by T.M. Solutions */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-900/15 shadow-sm hover:border-amber-700/40 transition-all">
            <span className="text-[11px] font-semibold text-[#071330] tracking-tight mb-2">
              Designed & Developed by T.M. Solutions
            </span>
            <a
              href="https://www.tiberiumilitaru.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center md:items-end gap-1.5"
              title="Portofoliu Tiberiu Militaru - T.M. Solutions"
            >
              <div className="p-1.5 bg-white rounded-xl shadow-sm border border-amber-900/15 group-hover:shadow-md group-hover:scale-105 transition-all">
                <Image
                  src="/qr-tiberiu.webp"
                  alt="QR Code Portofoliu Tiberiu Militaru"
                  width={72}
                  height={72}
                  className="rounded-lg object-contain"
                />
              </div>
              <span className="font-mono text-[11px] font-medium text-amber-900 group-hover:text-amber-700 underline underline-offset-2 transition-colors">
                www.tiberiumilitaru.ro
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

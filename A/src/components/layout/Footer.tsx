import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ShieldCheck, ArrowUpRight, Scale, FileText, Cookie, ExternalLink, Landmark, Globe } from "lucide-react";

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
              Asociație civică independentă, dedicată salubrizării și reabilitării capitale a infrastructurii subterane din municipiul Ploiești. Un parteneriat durabil între proprietari, parteneri tehnici autorizați și mediul academic.
            </p>
            <div className="pt-2 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Ploiești, jud. Prahova, România</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                <a href="tel:0720015592" className="hover:text-amber-900 transition-colors font-medium">
                  Telefon: 0720 015 592
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-800 shrink-0" />
                <a href="mailto:viziuneurbanaploiesti@yahoo.com" className="hover:text-amber-900 transition-colors font-medium">
                  viziuneurbanaploiesti@yahoo.com
                </a>
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
                <div className="text-xs font-serif font-bold text-[#071330]">UPG</div>
                <div className="text-[11px] text-emerald-800">Comitet științific</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-amber-900/15 shadow-sm">
                <div className="text-xs font-serif font-bold text-[#071330]">InfoACCRP</div>
                <div className="text-[11px] text-purple-800">Comitet de calificare</div>
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

            {/* Link-uri de Conformitate Legală & GDPR */}
            <div className="pt-3 border-t border-amber-900/15 space-y-1.5 text-[11px]">
              <div>
                <Link
                  href="/confidentialitate"
                  className="text-slate-700 hover:text-amber-950 font-medium transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Protecția Datelor (GDPR)</span>
                </Link>
              </div>
              <div>
                <Link
                  href="/termeni"
                  className="text-slate-700 hover:text-amber-950 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Termeni & Sponsorizare</span>
                </Link>
              </div>
              <div>
                <Link
                  href="/cookies"
                  className="text-slate-700 hover:text-amber-950 font-medium transition-colors flex items-center gap-1.5"
                >
                  <Cookie className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Module Cookie (Zero Tracking)</span>
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

        {/* Secțiune Dedicată: Autorități Oficiale, Soluționarea Litigiilor (SAL/SOL) & Utilități Locale */}
        <div className="pt-8 border-t border-amber-900/15 space-y-6">
          {/* Carduri SAL & SOL (Conform Ordin ANPC 449/2022) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl bg-white/90 border border-amber-900/15 hover:border-amber-700/50 shadow-sm hover:shadow transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-700/20 flex items-center justify-center text-amber-900 group-hover:scale-105 transition-transform shrink-0">
                  <Scale className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#071330] flex items-center gap-1.5">
                    <span>ANPC – SAL (Soluționarea Alternativă a Litigiilor)</span>
                    <ExternalLink className="w-3 h-3 text-amber-700 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Procedură extrajudiciară de mediere a litigiilor de consum conform legislației ANPC
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-700/20 shrink-0 hidden sm:inline-block">
                anpc.ro/sal
              </span>
            </a>

            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl bg-white/90 border border-amber-900/15 hover:border-amber-700/50 shadow-sm hover:shadow transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 border border-blue-700/20 flex items-center justify-center text-blue-900 group-hover:scale-105 transition-transform shrink-0">
                  <Globe className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#071330] flex items-center gap-1.5">
                    <span>Comisia Europeană – SOL (Soluționarea Online)</span>
                    <ExternalLink className="w-3 h-3 text-amber-700 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Platforma oficială europeană de soluționare online a litigiilor de consum (ODR)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-900 border border-blue-700/20 shrink-0 hidden sm:inline-block">
                ec.europa.eu/odr
              </span>
            </a>
          </div>

          {/* Registre Oficiale & Autorități Naționale și Locale */}
          <div className="p-4 rounded-2xl bg-white/70 border border-amber-900/15 space-y-3">
            <div className="text-[11px] font-serif font-bold uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-800" />
              <span>Verificare Registre Publice & Autorități de Monitorizare</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
              <a
                href="https://www.anaf.ro/anaf/internet/ANAF/servicii_online/registre/entitati_cult"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  ANAF Registru
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Verifică 3,5% (CIF 48923410)</span>
              </a>

              <a
                href="https://anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  ANPC
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Protecția Consumatorilor</span>
              </a>

              <a
                href="https://www.dataprotection.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  ANSPDCP
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Supraveghere Date PII</span>
              </a>

              <a
                href="https://www.ploiesti.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  Primăria Ploiești
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Asociații de Proprietari</span>
              </a>

              <a
                href="https://termoploiesti.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  Termo Ploiești
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Rețea Termoficare</span>
              </a>

              <a
                href="https://www.apanovaploiesti.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/15 hover:border-amber-700 text-slate-800 hover:text-amber-950 transition-all flex flex-col justify-between"
              >
                <span className="font-bold text-[#071330] flex items-center justify-between">
                  Apa Nova Ploiești
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500">Apă & Canalizare</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom banner & T.M. Solutions Signature */}
        <div className="pt-8 border-t border-amber-900/15 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="space-y-2 text-center md:text-left">
            <div>
              &copy; {currentYear} Asociația Viziune Urbană Ploiești. Înregistrată în Registrul Asociațiilor și Fundațiilor.
            </div>
            <div className="font-serif italic text-amber-900">
              Fundația unui bloc sănătos începe de jos.
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-[11px] pt-1">
              <Link href="/confidentialitate" className="text-slate-600 hover:text-amber-950 underline underline-offset-2 transition-colors">
                Politică de Confidențialitate
              </Link>
              <span className="text-amber-900/30">•</span>
              <Link href="/termeni" className="text-slate-600 hover:text-amber-950 underline underline-offset-2 transition-colors">
                Termeni & Condiții
              </Link>
              <span className="text-amber-900/30">•</span>
              <Link href="/cookies" className="text-slate-600 hover:text-amber-950 underline underline-offset-2 transition-colors">
                Politica privind Cookie-urile
              </Link>
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

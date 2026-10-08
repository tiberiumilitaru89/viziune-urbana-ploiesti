"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";
import {
  Cookie,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sliders,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function CookiesPage() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <>
      <Navbar
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
      />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Navigație Înapoi */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Înapoi la pagina principală</span>
          </Link>
        </div>

        {/* Antet Pagină */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Cookie className="w-3.5 h-3.5 text-amber-800" />
            Directiva ePrivacy • Zero Tracking
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight mb-4">
            Politica privind Modulele Cookie{" "}
            <span className="italic font-normal text-[#B5853F]">
              & Navigarea Fără Urmărire
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Platforma Viziune Urbană Ploiești respectă intimitatea vizitatorilor. Nu utilizăm cookie-uri publicitare, pixeli de urmărire sau instrumente terțe de profilare a utilizatorilor.
          </p>
        </div>

        {/* Card Principal Conținut */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-900/20 shadow-xl space-y-8 text-slate-800 text-sm leading-relaxed">
          {/* Angajamentul Zero Tracking */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>1. Angajamentul Nostru: Zero Urmărire Comercială</h2>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Site-ul nostru NU conține cookie-uri terțe de marketing sau analiză comportamentală</span>
              </div>
              <p>
                Spre deosebire de platformele comerciale, Asociația Viziune Urbană Ploiești nu vinde publicitate și nu monetizează datele vizitatorilor. Nu integrăm pe site:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Google Analytics sau alte scripturi similare de colectare a comportamentului;</li>
                <li>Meta (Facebook) Pixel, TikTok Pixel sau tag-uri LinkedIn;</li>
                <li>Module de retargeting publicitar sau profilare sociodemografică.</li>
              </ul>
            </div>
          </section>

          {/* Ce este un modul cookie */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Cookie className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>2. Ce este un Modul Cookie?</h2>
            </div>
            <p>
              Un cookie este un fișier text de mici dimensiuni stocat temporar pe calculatorul, tableta sau telefonul dumneavoastră mobil atunci când vizitați o pagină web. Cookie-urile permit recunoașterea dispozitivului la vizitele următoare pentru a reține setările sau pentru a menține autentificarea securizată.
            </p>
          </section>

          {/* Ce cookie-uri folosim */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Lock className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>3. Module Cookie Folosite pe viziuneurbanaploiesti.ro</h2>
            </div>
            <p>
              Platforma noastră utilizează exclusiv <strong>cookie-uri strict necesare (tehnice)</strong>, indispensabile securității și bunei funcționări a zonelor protejate:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-amber-900/15 rounded-2xl overflow-hidden">
                <thead className="bg-[#FAF7F2] font-serif font-bold text-[#071330] uppercase border-b border-amber-900/15">
                  <tr>
                    <th className="p-3">Nume Cookie</th>
                    <th className="p-3">Tip & Scop</th>
                    <th className="p-3">Durată</th>
                    <th className="p-3">Nivel Securitate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 text-slate-700 font-sans">
                  <tr>
                    <td className="p-3 font-mono font-bold text-amber-900">vup_admin_session</td>
                    <td className="p-3">
                      <strong>Strict Necesar:</strong> Token de sesiune criptat HMAC-SHA256 utilizat exclusiv pentru autentificarea administratorilor asociației în panoul securizat <code className="bg-slate-100 px-1 rounded font-mono">/admin</code>.
                    </td>
                    <td className="p-3">8 ore</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        HttpOnly • Secure • SameSite
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-600 italic">
              * Vizitatorii obișnuiți care accesează paginile publice (acasă, manifest, formulare, arhivă lucrări) nu primesc cookie-uri de urmărire sau identificare.
            </p>
          </section>

          {/* De ce nu afișăm banner intruziv */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>4. De ce Nu Afișăm un Banner Pop-up de Consimțământ?</h2>
            </div>
            <p>
              Conform dispozițiilor <em>Articolului 5 alin. (3) din Directiva Europeană 2002/58/CE (ePrivacy)</em>, transpusă în legislația națională prin <em>Legea nr. 506/2004</em>, precum și ghidurilor emise de Comitetul European pentru Protecția Datelor (EDPB):
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-900/15 text-xs sm:text-sm text-slate-700 space-y-2">
              <p className="font-semibold text-[#071330]">
                Cookie-urile strict necesare furnizării unui serviciu solicitat în mod expres de utilizator sunt exceptate de la obligația obținerii acordului prealabil.
              </p>
              <p>
                Întrucât site-ul nostru nu activează cookie-uri de analiză sau marketing, nu este necesar să vă întrerupem navigarea cu ferestre pop-up obositoare pentru solicitarea acordului.
              </p>
            </div>
          </section>

          {/* Cum puteți controla cookie-urile */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Sliders className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>5. Gestionarea și Ștergerea Cookie-urilor din Browser</h2>
            </div>
            <p>
              Puteți configura în orice moment browserul dumneavoastră web să refuze stocarea cookie-urilor sau să vă alerteze atunci când sunt trimise cookie-uri. Vă rugăm să consultați ghidul oficial al browserului utilizat:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-serif font-bold text-center">
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/20 hover:border-amber-700 text-amber-900 shadow-sm transition-all"
              >
                Google Chrome
              </a>
              <a
                href="https://support.mozilla.org/ro/kb/sterge-cookie-urile-pentru-a-elimina-informatiile"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/20 hover:border-amber-700 text-amber-900 shadow-sm transition-all"
              >
                Mozilla Firefox
              </a>
              <a
                href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/20 hover:border-amber-700 text-amber-900 shadow-sm transition-all"
              >
                Apple Safari
              </a>
              <a
                href="https://support.microsoft.com/ro-ro/windows/ștergerea-și-gestionarea-modulelor-cookie-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white border border-amber-900/20 hover:border-amber-700 text-amber-900 shadow-sm transition-all"
              >
                Microsoft Edge
              </a>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-amber-900/15 space-y-2">
            <h3 className="font-serif font-bold text-[#071330] text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Întrebări și Asistență
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Dacă aveți întrebări suplimentare referitoare la politica noastră tehnică privind modulele cookie, ne puteți contacta oricând la{" "}
              <a href="mailto:viziuneurbanaploiesti@yahoo.com" className="text-amber-900 font-bold underline hover:text-amber-950">
                viziuneurbanaploiesti@yahoo.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />

      {/* Modale Funcționale */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
}

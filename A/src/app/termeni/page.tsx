"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";
import {
  Scale,
  FileCheck2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Hammer,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function TermeniPage() {
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
            <Scale className="w-3.5 h-3.5 text-amber-800" />
            Cadru Legal Civic • Legea 196/2018
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight mb-4">
            Termeni și Condiții de Utilizare{" "}
            <span className="italic font-normal text-[#B5853F]">
              & Protocol de Sponsorizare
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Prezentul document stabilește cadrul de colaborare civică, criteriile de acordare a sponsorizărilor în materiale și modalitatea de utilizare a platformei Asociației Viziune Urbană Ploiești.
          </p>
        </div>

        {/* Card Principal Conținut */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-900/20 shadow-xl space-y-8 text-slate-800 text-sm leading-relaxed">
          {/* Articolul 1: Dispoziții Generale */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>1. Misiunea Civică și Statutul Asociației</h2>
            </div>
            <p>
              Site-ul oficial <strong>viziuneurbanaploiesti.ro</strong> este administrat de <strong>Asociația Viziune Urbană Ploiești</strong>, organizație neguvernamentală, apolitică și non-profit constituită în conformitate cu <em>Ordonanța Guvernului nr. 26/2000</em>.
            </p>
            <p>
              Obiectivul nostru fundamental este sprijinirea asociațiilor de proprietari din Municipiul Ploiești în vederea salubrizării, igienizării și reabilitării capitale a infrastructurii tehnice subterane (instalații de termoficare, apă caldă/rece și canalizare), grav degradate în ultimele decenii.
            </p>
          </section>

          {/* Articolul 2: Gratuitatea Evaluărilor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2>2. Principiul Gratuității Evaluărilor Tehnice</h2>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
              <p className="font-semibold text-emerald-900">
                Constatarea tehnică și întocmirea devizului estimativ de materiale sunt 100% GRATUITE pentru orice asociație de proprietari din Ploiești.
              </p>
              <p>
                Completarea formularului de înscriere nu generează nicio obligație financiară, contractuală sau exclusivitate pentru asociația de proprietari sau locatarii blocului respectiv.
              </p>
            </div>
          </section>

          {/* Articolul 3: Mecanismul Sponsorizării Materialelor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <FileCheck2 className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>3. Mecanismul de Sponsorizare a Materialelor</h2>
            </div>
            <p>
              Programul civic funcționează pe principiul subvenționării comunitare:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Materiale 100% Sponsorizate:</strong> Conductele magistrale din polipropilenă cu inserție compozită (PPR), robineții sferici cu trecere completă, fitingurile certificate și izolația termică elastomerică (tip Armaflex 19mm) sunt asigurate prin fondurile atrase de Asociația Viziune Urbană Ploiești (donații, sponsorizări agenți economici și campania Formular 230 ANAF).
              </li>
              <li>
                <strong>Proprietatea Materialelor:</strong> Odată instalate și recepționate, materialele devin parte integrantă a proprietății comune indivize a asociației de proprietari, fără vreo pretenție patrimonială ulterioară din partea Asociației civice.
              </li>
            </ul>
          </section>

          {/* Articolul 4: Execuția Lucrărilor & Garanția Partenerilor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Hammer className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>4. Execuția Tehnică, Manopera și Garanția de 5 Ani</h2>
            </div>
            <p>
              Pentru respectarea normativelor tehnice în vigoare și garantarea calității inginerești a lucrărilor:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-900/15 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-[#071330]">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Garanție de 5 ani oferită de partenerii tehnici autorizați</span>
              </div>
              <p>
                Lucrările de montaj, sudură a conductelor, dezafectare a vechilor țevi ruginite și probe de presiune sunt executate exclusiv de către parteneri tehnici autorizați (partener de execuție de bază: <strong>S.C. Instal Serv Becheanu S.R.L.</strong>).
              </p>
              <p>
                Contractul de execuție/prestări servicii pentru manoperă se încheie <strong>direct și transparent</strong> între Asociația de Proprietari beneficiară și Executantul Acreditat. Garanția de 5 ani este stipulată expres în procesul-verbal de recepție la terminarea lucrărilor semnat de executant și comitetul executiv al asociației.
              </p>
            </div>
          </section>

          {/* Articolul 5: Hotărârea Adunării Generale */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Scale className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>5. Conformitatea cu Legea nr. 196/2018</h2>
            </div>
            <p>
              Conform dispozițiilor Legii nr. 196/2018 privind asociațiile de proprietari, orice intervenție asupra proprietății comune indivize (subsol tehnic, rețele de distribuție) se realizează exclusiv în baza:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Hotărârii Adunării Generale a Asociației de Proprietari sau a deciziei Comitetului Executiv;</li>
              <li>Avizării reprezentantului legal (Președinte de Asociație / Administrator atestat);</li>
              <li>Acordului asociației pentru programarea intervalului de sistare temporară a agentului termic sau a apei pe durata montajului.</li>
            </ul>
          </section>

          {/* Articolul 6: Limitarea Răspunderii */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>6. Răspundere și Limitări</h2>
            </div>
            <p>
              Asociația Viziune Urbană Ploiești acționează ca facilitator comunitar, susținător material și promotor al standardelor tehnice de calitate. Asociația civică nu este antreprenor general de construcții și nu răspunde pentru eventuale neînțelegeri interne între proprietarii din cadrul asociației sau întârzieri generate de neasigurarea accesului în subsol de către asociația beneficiară.
            </p>
          </section>

          {/* Articolul 7: Contact & Litigii */}
          <section className="pt-4 border-t border-amber-900/15 space-y-2">
            <h3 className="font-serif font-bold text-[#071330] text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              7. Legea Aplicabilă și Soluționarea Litigiilor
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Prezenții termeni sunt guvernați de legislația română în vigoare. Orice eventual diferend decurgând din colaborare va fi soluționat pe cale amiabilă prin mediere civică directă. Pentru orice sesizări sau clarificări procedurale, ne puteți contacta la{" "}
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

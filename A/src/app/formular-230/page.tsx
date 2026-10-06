"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Formular230Wizard } from "@/components/form230/Formular230Wizard";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";
import { FileText, ShieldCheck, Heart, Award, ArrowLeft } from "lucide-react";

export default function Formular230Page() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <>
      <Navbar
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
      />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Înapoi la pagina principală</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-amber-800" />
            Formularul 230 ANAF • 0 Costuri
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight mb-4">
            Redirecționează 3,5% din impozit{" "}
            <span className="italic font-normal text-[#B5853F]">
              pentru blocurile din Ploiești.
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Dacă ai obținut venituri din salarii sau pensii în România, poți direcționa 3,5% din impozitul pe venit datorat statului către Asociația Viziune Urbană Ploiești. Formularul se completează și semnează online în sub 60 de secunde.
          </p>
        </div>

        {/* Main Wizard Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-900/20 shadow-xl mb-12">
          <Formular230Wizard />
        </div>

        {/* Informative Civic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-900/15 shadow-sm space-y-2">
            <div className="font-serif font-bold text-[#071330] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              100% Gratuit pentru Tine
            </div>
            <p className="leading-relaxed">
              Această sumă nu reprezintă o donație din buzunarul tău, ci o cotă din impozitul deja reținut lunar de stat din salariu, pe care decizi tu unde să ajungă.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-900/15 shadow-sm space-y-2">
            <div className="font-serif font-bold text-[#071330] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Depunere Centralizată
            </div>
            <p className="leading-relaxed">
              Asociația depune formularele semnate direct la Administrația Județeană a Finanțelor Publice Prahova (ANAF Ploiești) pe bază de borderou oficial.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-900/15 shadow-sm space-y-2">
            <div className="font-serif font-bold text-[#071330] text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Impact Direct în Comunitate
            </div>
            <p className="leading-relaxed">
              Fiecare formular strâns asigură fonduri pentru manopera și materialele necesare înlocuirii subsolurilor insalubre și a țevilor ruginite din blocurile ploieștene.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
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

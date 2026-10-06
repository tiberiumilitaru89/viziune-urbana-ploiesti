"use client";

import React from "react";
import Image from "next/image";
import { Printer, Download, CheckCircle2, Shield } from "lucide-react";
import { OngConfig } from "@/lib/types";

type Formular230OfficialDocProps = {
  readonly formData: {
    lastName: string;
    firstName: string;
    initialaTata?: string;
    cnp: string;
    address: string;
    city: string;
    county: string;
    phone: string;
    email: string;
    signatureDataUrl: string;
    distributeFor2Years: boolean;
  };
  readonly ongConfig: OngConfig;
  readonly onPrint?: () => void;
};

export function Formular230OfficialDoc({
  formData,
  ongConfig,
  onPrint,
}: Formular230OfficialDocProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const cnpDigits = formData.cnp.padEnd(13, " ").split("");

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-600/30 print:hidden">
        <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Formularul este <strong>precompletat și semnat</strong> conform normelor ANAF.
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Tipărește / Salvează PDF Oficial</span>
        </button>
      </div>

      {/* The Official ANAF Printable Form Container */}
      <div
        id="official-anaf-230"
        className="bg-white border-2 border-slate-900 p-6 sm:p-10 rounded-xl shadow-lg max-w-4xl mx-auto text-slate-950 font-sans print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ minHeight: "1000px" }}
      >
        {/* ANAF Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs font-serif uppercase tracking-wider space-y-0.5">
            <div className="font-bold">MINISTERUL FINANȚELOR</div>
            <div className="font-semibold text-slate-700">AGENȚIA NAȚIONALĂ DE ADMINISTRARE FISCALĂ</div>
          </div>

          <div className="text-center sm:text-right">
            <div className="inline-block border-2 border-slate-900 px-4 py-1 font-mono font-black text-lg tracking-wider bg-slate-50">
              FORMULARUL 230
            </div>
            <div className="text-[10px] text-slate-600 uppercase font-semibold mt-1">
              OPANAF nr. 147/2020 / Anul fiscal curent
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wide">
            CERERE
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
            privind destinația sumei reprezentând până la 3,5% din impozitul anual datorat
          </h2>
        </div>

        {/* SECȚIUNEA I: DATE IDENTIFICARE CONTRIBUABIL */}
        <div className="border border-slate-900 mb-6">
          <div className="bg-slate-100 border-b border-slate-900 px-3 py-1.5 font-bold text-xs uppercase tracking-wider">
            I. DATE DE IDENTIFICARE ALE CONTRIBUABILULUI
          </div>

          <div className="p-4 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <span className="font-bold text-[11px] block text-slate-700">Nume:</span>
                <div className="border-b border-slate-900 font-bold uppercase py-1 tracking-wider text-sm">
                  {formData.lastName || "—"}
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-[11px] block text-slate-700">Inițiala tatălui:</span>
                <div className="border-b border-slate-900 font-bold uppercase py-1 text-center text-sm">
                  {formData.initialaTata || "—"}
                </div>
              </div>

              <div className="sm:col-span-5">
                <span className="font-bold text-[11px] block text-slate-700">Prenume:</span>
                <div className="border-b border-slate-900 font-bold uppercase py-1 tracking-wider text-sm">
                  {formData.firstName || "—"}
                </div>
              </div>
            </div>

            {/* CNP BOXES */}
            <div>
              <span className="font-bold text-[11px] block text-slate-700 mb-1">
                Cod Numeric Personal (CNP):
              </span>
              <div className="flex gap-1 sm:gap-1.5 overflow-x-auto py-1">
                {cnpDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-7 sm:w-7 sm:h-8 border border-slate-900 flex items-center justify-center font-mono font-bold text-sm bg-slate-50 shrink-0"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            {/* ADRESA */}
            <div>
              <span className="font-bold text-[11px] block text-slate-700">Adresă de domiciliu:</span>
              <div className="border-b border-slate-900 py-1 font-medium">
                {formData.address}, {formData.city}, jud. {formData.county}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-[11px] block text-slate-700">Telefon:</span>
                <div className="border-b border-slate-900 py-1 font-mono">
                  {formData.phone || "—"}
                </div>
              </div>
              <div>
                <span className="font-bold text-[11px] block text-slate-700">E-mail:</span>
                <div className="border-b border-slate-900 py-1 font-mono">
                  {formData.email || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECȚIUNEA II: DESTINAȚIA SUMEI REPREZENTÂND PÂNĂ LA 3,5% */}
        <div className="border border-slate-900 mb-6">
          <div className="bg-slate-100 border-b border-slate-900 px-3 py-1.5 font-bold text-xs uppercase tracking-wider">
            II. DESTINAȚIA SUMEI REPREZENTÂND PÂNĂ LA 3,5% DIN IMPOZITUL DATORAT
          </div>

          <div className="p-4 space-y-3.5 text-xs">
            <div>
              <div className="font-bold text-slate-800 mb-1">
                1. Susținerea unei entități nonprofit / unități de cult
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 border-2 border-slate-900 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span className="font-semibold text-slate-900">
                  Cota procentuală din impozit: <strong className="font-bold">{ongConfig.percentage || "3,5%"}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-2.5 bg-amber-50/50 p-3.5 rounded border border-amber-900/20">
              <div>
                <span className="font-bold text-[11px] block text-slate-700">
                  Denumire entitate nonprofit:
                </span>
                <div className="border-b border-slate-900 font-bold py-1 text-[#071330] tracking-wide text-sm">
                  {ongConfig.name}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <span className="font-bold text-[11px] block text-slate-700">
                    Cod de identificare fiscală (CIF):
                  </span>
                  <div className="border-b border-slate-900 font-mono font-bold py-1 text-sm tracking-wider">
                    {ongConfig.cif || "În curs de atribuire"}
                  </div>
                </div>

                <div className="sm:col-span-8">
                  <span className="font-bold text-[11px] block text-slate-700">
                    Cont bancar (IBAN):
                  </span>
                  <div className="border-b border-slate-900 font-mono font-bold py-1 text-xs tracking-wider">
                    {ongConfig.iban} ({ongConfig.bank})
                  </div>
                </div>
              </div>
            </div>

            {/* OPȚIUNE 2 ANI */}
            <div className="flex items-center gap-2.5 pt-2">
              <div className="w-5 h-5 border-2 border-slate-900 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <span className="font-medium text-slate-900">
                Opțiune privind distribuirea sumei pentru o perioadă de 2 ani (art. 79 alin. (3) din Legea nr. 227/2015)
              </span>
            </div>
          </div>
        </div>

        {/* SECȚIUNEA SEMNĂTURĂ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-900">
          <div>
            <span className="font-bold text-[11px] block text-slate-700">Data completării:</span>
            <div className="font-mono text-sm py-1 font-semibold">
              {new Date().toLocaleDateString("ro-RO")}
            </div>
            <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              Prin semnarea prezentului formular, împuternicesc Asociația Viziune Urbană Ploiești să depună formularul la organul fiscal competent pe bază de borderou.
            </div>
          </div>

          <div className="text-right">
            <span className="font-bold text-[11px] block text-slate-700 mb-1">
              Semnătură contribuabil:
            </span>
            <div className="w-48 sm:w-56 h-20 border-2 border-slate-900 bg-slate-50 ml-auto flex items-center justify-center p-1 overflow-hidden relative">
              {formData.signatureDataUrl ? (
                <img
                  src={formData.signatureDataUrl}
                  alt="Semnătură olografă digitală"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-600 italic">Lipsă semnătură</span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-1 uppercase">
              {formData.firstName} {formData.lastName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

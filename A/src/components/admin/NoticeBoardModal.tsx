"use client";

import React, { useRef } from "react";
import { X, Printer, CheckCircle2, ShieldCheck, QrCode, Phone, Building2, Calendar, FileText } from "lucide-react";
import { AuditRequest } from "@/lib/types";

type NoticeBoardModalProps = {
  readonly association: AuditRequest | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function NoticeBoardModal({ association, isOpen, onClose }: NoticeBoardModalProps) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !association) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const progressPercent = Math.min(
    100,
    Math.round((association.formsCollected / (association.formsTarget || 1)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Principal */}
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden print:max-h-none print:max-w-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Bara Superioară de Acțiuni (Ascunsă la Print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Previzualizare Fișă Oficială de Avizier (Format A4)
              </h3>
              <p className="text-[11px] text-slate-400">
                Gata de afișat la avizierul scării de bloc pentru mobilizarea locatarilor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Tipărește / Salvează PDF (Ctrl + P)</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Închide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zona Scrollabilă de Previzualizare A4 */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Foaia A4 Efectivă */}
          <div
            ref={printContentRef}
            className="notice-board-sheet max-w-[210mm] mx-auto bg-white p-8 sm:p-10 shadow-lg border border-slate-300 rounded-lg text-slate-900 font-sans print:shadow-none print:border-none print:p-6 print:m-0 print:max-w-none print:rounded-none"
            style={{ minHeight: "270mm" }}
          >
            {/* 1. ANTET OFICIAL CU DUBLU BRAND */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-5">
              <div className="max-w-[60%]">
                <div className="text-[11px] font-bold text-amber-800 tracking-wider uppercase font-serif">
                  Inițiativă Comunitară Prahoveană
                </div>
                <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-slate-950 uppercase leading-snug">
                  ASOCIAȚIA VIZIUNE URBANĂ PLOIEȘTI
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  C.I.F. 48923410 &bull; Ploiești, Jud. Prahova &bull; viziuneurbanaploiesti.ro
                </p>
              </div>

              <div className="text-right border-l border-slate-300 pl-4 max-w-[40%]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Partener Tehnic Autorizat
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  INSTAL SERV BECHEANU SRL
                </div>
                <div className="text-[11px] text-slate-700">
                  Coordonator Tehnic: George Becheanu
                </div>
                <div className="text-[11px] font-bold text-amber-900">
                  Tel: 0720 015 592
                </div>
              </div>
            </div>

            {/* 2. TITLU MARE PENTRU AVIZIER */}
            <div className="text-center my-4 py-3 px-4 bg-amber-50 border-2 border-amber-500/40 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-900 font-serif mb-1">
                În atenția tuturor proprietarilor și locatarilor din:
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-950 uppercase tracking-tight">
                {association.building}
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {association.address}
              </p>
            </div>

            {/* 3. PROBLEMA IDENTIFICATĂ & DECIZIA DE MODERNIZARE */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>1. Situația Tehnică a Subsolului</span>
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
                „{association.problem}”
              </div>
            </div>

            {/* 4. SOLUȚIA TEHNICĂ ȘI BENEFICIILE ASOCIAȚIEI */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>2. Lucrările Incluse în Program</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <strong className="block text-slate-950 font-bold mb-0.5">&bull; Trasee Noi PPR Fibră Compozită</strong>
                  <span className="text-[11px] text-slate-600">
                    Înlocuire integrală conducte corodate cu tubulatură modernă PN20 garantată 50 ani.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <strong className="block text-slate-950 font-bold mb-0.5">&bull; Izolație Termică Armaflex 19mm</strong>
                  <span className="text-[11px] text-slate-600">
                    Eliminare condens, stop mucegai și reducerea pierderilor de căldură / apă caldă.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <strong className="block text-slate-950 font-bold mb-0.5">&bull; Robineți de Secționare Industriali</strong>
                  <span className="text-[11px] text-slate-600">
                    Posibilitate de oprire selectivă pe fiecare coloană fără a sista apa întregului bloc.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <strong className="block text-slate-950 font-bold mb-0.5">&bull; Garanție Extinsă 5 Ani</strong>
                  <span className="text-[11px] text-slate-600">
                    Oferită contractual prin proces-verbal de recepție de către Instal Serv Becheanu.
                  </span>
                </div>
              </div>
            </div>

            {/* 5. FINANȚARE — ZERO LEI COSTURI DE MATERIALE PENTRU LOCATARI */}
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-serif font-black uppercase tracking-wider text-emerald-950">
                    Cum se plătesc lucrările? Zero lei cost materiale!
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                  Sponsorizare 100%
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed mb-3">
                Materialele sunt acoperite <strong>100% din fondurile Asociației Viziune Urbană Ploiești</strong>.
                Manopera de montaj este susținută de locatari <strong>fără niciun ban din buzunar</strong>, exclusiv prin redirecționarea a <strong>3,5% din impozitul pe venit deja reținut de stat</strong> (Formularul ANAF 230).
              </p>

              {/* Bară de Progres Mobilizare Bloc */}
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                  <span className="text-slate-800">
                    Mobilizare Semnături Formular 230:
                  </span>
                  <span className="text-emerald-800 font-serif">
                    {association.formsCollected} din {association.formsTarget} formulare necesare ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 6. APEL LA ACȚIUNE — CUM SEMNEAZĂ LOCATARII (QR + ONLINE + HÂRTIE) */}
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center border-t border-b border-slate-300 py-3.5">
              
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <div className="w-24 h-24 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shadow-xs">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fviziuneurbanaploiesti.ro%2Fformular-230"
                    alt="Cod QR Formular 230"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1 uppercase tracking-tight">
                  Scanează cu telefonul
                </span>
              </div>

              {/* Explicații Online & Hârtie */}
              <div className="sm:col-span-2 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </span>
                  <div>
                    <strong className="text-slate-950 font-bold block">
                      Opțiunea 1: Semnează Online pe Telefon (2 minute)
                    </strong>
                    <span className="text-slate-600 text-[11px]">
                      Scanează codul QR din stânga sau intră direct pe{" "}
                      <span className="font-mono font-bold text-amber-900 underline">
                        viziuneurbanaploiesti.ro/formular-230
                      </span>
                      . Semnătura se face direct cu degetul pe ecran.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    B
                  </span>
                  <div>
                    <strong className="text-slate-950 font-bold block">
                      Opțiunea 2: Semnează pe Suport de Hârtie
                    </strong>
                    <span className="text-slate-600 text-[11px]">
                      Solicitați formularul fizic de la administratorul sau președintele blocului.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 7. CONTACTE & SEMNĂTURI OFICIALE */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reprezentant Asociație Bloc:
                </div>
                <div className="font-bold text-slate-950">{association.name}</div>
                <div className="flex items-center gap-1 text-slate-700 mt-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-mono">{association.phone}</span>
                </div>
                <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 text-center">
                  Semnătură / Ștampilă Asociație
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Asistență Tehnică & Coordonare:
                </div>
                <div className="font-bold text-slate-950">George Becheanu (Instal Serv)</div>
                <div className="flex items-center gap-1 text-slate-700 mt-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-mono">0720 015 592</span>
                </div>
                <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 text-center">
                  VUP &bull; Viziune Urbană Ploiești
                </div>
              </div>
            </div>

            {/* Data Emiterii */}
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <span>Document emis la data de: {todayFormatted}</span>
              <span>Afișat la Avizierul Scării</span>
            </div>

          </div>

        </div>

      </div>

      {/* Stiluri de Print dedicate pentru format A4 */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .civic-site-bg,
          nav,
          footer,
          header,
          aside,
          .print\\:hidden {
            display: none !important;
          }
          .notice-board-sheet {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}

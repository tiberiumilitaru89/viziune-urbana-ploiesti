import React from "react";
import { Building2, Heart, Download, FileSpreadsheet, ArrowRight, ShieldCheck, Copy } from "lucide-react";

type DonorsSectionProps = {
  readonly onOpenDonationModal: () => void;
};

export function DonorsSection({ onOpenDonationModal }: DonorsSectionProps) {
  return (
    <section id="donatori" className="py-14 sm:py-20 lg:py-24 bg-[#060911]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Heart className="w-3.5 h-3.5" />
            Susține Inițiativa
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cum Poți Contribui la Schimbare.
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Fiecare metru liniar de țeavă sponsorizat înseamnă un subsol salvat de la degradare și zeci de familii scutite de inundații.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
          {/* Box 1: Pentru Companii (Materiale / Deducere Impozit) */}
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Pentru Companii & Distribuitori
              </h3>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">
                Sponsorizare Materiale sau Fonduri (Deductibil Fiscal)
              </p>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Puteți sponsoriza direct stocuri de țevi PPR, fitinguri, robineți sferici industriali, vopsea lavabilă de subsol sau izolații elastomerice. Conform Codului Fiscal, cheltuiala este <strong>100% deductibilă</strong> în limita a 20% din impozitul pe profit.
              </p>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-6">
                <div>✓ Contract de sponsorizare conform Legii 32/1994</div>
                <div>✓ Vizibilitate în rapoartele noastre și pe paginile asociațiilor</div>
                <div>✓ Livrare directă în șantier cu proces-verbal de custodie</div>
              </div>
            </div>

            <button
              onClick={onOpenDonationModal}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
            >
              Încheie un Contract de Sponsorizare <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Box 2: Pentru Persoane Fizice (Formular 230 ANAF) */}
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Pentru Persoane Fizice
              </h3>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                Redirecționează 3.5% din Impozitul pe Salariu (Formular 230)
              </p>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Nu vă costă absolut nimic! Statul român vă permite să direcționați o cotă de 3.5% din impozitul pe venitul din salarii deja reținut de stat către Asociația Viziune Urbană Ploiești.
              </p>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-6">
                <div>✓ Fără costuri suplimentare din buzunarul propriu</div>
                <div>✓ Fondurile merg exclusiv către achiziția de materiale pentru blocuri</div>
                <div>✓ Puteți depune direct online pe platforma oficială ANAF</div>
              </div>
            </div>

            <a
              href="https://www.anaf.ro/declaratii/d230/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-center"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Descarcă / Completează Formularul 230 ANAF
            </a>
          </div>
        </div>

        {/* Bank details bar */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-center sm:text-left">
            <span className="font-bold text-slate-200 block mb-0.5">Donații directe prin transfer bancar:</span>
            <span className="text-slate-400">Beneficiar: Asociația Viziune Urbană Ploiești | Banca: BCR Ploiești</span>
          </div>
          <div className="font-mono text-[11px] sm:text-xs font-bold text-emerald-400 bg-slate-950 px-3 sm:px-4 py-2 rounded-lg border border-slate-800 select-all break-all sm:break-normal text-center">
            RO49 AAAA 1B31 0075 9384 0000
          </div>
        </div>
      </div>
    </section>
  );
}

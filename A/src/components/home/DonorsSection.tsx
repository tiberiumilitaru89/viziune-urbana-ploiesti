import React from "react";
import { Building2, Heart, ArrowRight } from "lucide-react";

type DonorsSectionProps = {
  readonly onOpenDonationModal: () => void;
};

export function DonorsSection({ onOpenDonationModal }: DonorsSectionProps) {
  return (
    <section id="donatori" className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Susține Inițiativa
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight">
            Cum Poți Contribui la Schimbare.
          </h2>
          <p className="mt-4 text-slate-700 text-base leading-relaxed">
            Fiecare metru liniar de țeavă sponsorizat înseamnă un subsol salvat de la degradare și zeci de familii scutite de inundații.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
          {/* Box 1: Pentru Companii */}
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-amber-900/15 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-600/30 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-amber-800" />
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071330] mb-2">
                Pentru Companii & Distribuitori
              </h3>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
                Sponsorizare Materiale sau Fonduri (Deductibil Fiscal)
              </p>

              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                Puteți sponsoriza direct stocuri de țevi PPR, fitinguri, robineți sferici industriali, vopsea lavabilă de subsol sau izolații elastomerice. Conform Codului Fiscal, cheltuiala este <strong className="text-[#071330] font-bold">100% deductibilă</strong> în limita a 20% din impozitul pe profit.
              </p>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-amber-900/10 text-xs text-slate-700 space-y-1.5 mb-6">
                <div>✓ Contract de sponsorizare conform Legii 32/1994</div>
                <div>✓ Vizibilitate în rapoartele noastre și pe paginile asociațiilor</div>
                <div>✓ Livrare directă în șantier cu proces-verbal de custodie</div>
              </div>
            </div>

            <button
              onClick={onOpenDonationModal}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 shadow-md transition-all active:scale-95"
            >
              <span>Încheie un Contract de Sponsorizare</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Box 2: Pentru Persoane Fizice (3.5% ANAF) */}
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-amber-900/15 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-600/30 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071330] mb-2">
                Pentru Locatari & Cetățeni
              </h3>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-4">
                Redirecționează 3.5% din Impozitul pe Venit (Gratuit)
              </p>

              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                Nu vă costă absolut nimic! Banii reprezintă o cotă din impozitul deja plătit statului, care altfel rămâne în bugetul central. Prin Formularul 230, direcționați acești bani direct către reabilitarea blocului dumneavoastră.
              </p>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-amber-900/10 text-xs text-slate-700 space-y-1.5 mb-6">
                <div>✓ Fără costuri din buzunarul propriu</div>
                <div>✓ Formular completat online în mai puțin de 2 minute</div>
                <div>✓ Impact direct în asociația de proprietari unde locuiești</div>
              </div>
            </div>

            <button
              onClick={onOpenDonationModal}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95"
            >
              <span>Completează Formularul 230 Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

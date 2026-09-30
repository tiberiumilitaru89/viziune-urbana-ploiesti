import React from "react";
import { Building2, Heart, Download, FileSpreadsheet, ArrowRight, ShieldCheck, Scale } from "lucide-react";

type DonorsSectionProps = {
  readonly onOpenDonationModal: () => void;
};

export function DonorsSection({ onOpenDonationModal }: DonorsSectionProps) {
  return (
    <section id="donatori" className="py-28 bg-[#070d1e] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Mecenat & Donații Civice
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Cum Poți Contribui la Schimbare
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Fiecare metru de țeavă sponsorizat înseamnă un subsol salvat de la degradare și zeci de familii scutite de inundații.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
          {/* Card Companii */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0a142f] border-2 border-amber-900/40 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Pentru Companii & Distribuitori
              </h3>
              <p className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider mb-4">
                Sponsorizare Materiale sau Fonduri (100% Deductibil Fiscal)
              </p>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 font-serif">
                Puteți sponsoriza direct stocuri de țevi PPR, fitinguri, robineți sferici industriali, vopsea lavabilă de subsol sau izolații elastomerice. Conform Codului Fiscal, cheltuiala este <strong>100% deductibilă</strong> în limita a 20% din impozitul pe profit.
              </p>

              <div className="p-4 rounded-xl bg-[#050914] border border-amber-900/30 text-xs text-slate-400 space-y-2 mb-6">
                <div>✓ Contract de sponsorizare conform Legii 32/1994</div>
                <div>✓ Vizibilitate în rapoartele noastre și pe paginile asociațiilor</div>
                <div>✓ Livrare directă în șantier cu proces-verbal de custodie</div>
              </div>
            </div>

            <button
              onClick={onOpenDonationModal}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-950/60 transition-all"
            >
              Încheie un Contract de Sponsorizare <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card Formular 230 */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0a142f] border-2 border-amber-900/40 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Pentru Persoane Fizice
              </h3>
              <p className="text-xs font-serif font-bold text-emerald-400 uppercase tracking-wider mb-4">
                Redirecționează 3.5% din Impozitul pe Salariu (Formular 230)
              </p>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 font-serif">
                Nu vă costă absolut nimic! Statul român vă permite să direcționați o cotă de 3.5% din impozitul pe venitul din salarii deja reținut către Asociația Viziune Urbană Ploiești.
              </p>

              <div className="p-4 rounded-xl bg-[#050914] border border-emerald-900/30 text-xs text-slate-400 space-y-2 mb-6">
                <div>✓ Fără costuri suplimentare din buzunarul propriu</div>
                <div>✓ Fondurile merg exclusiv către achiziția de materiale pentru blocuri</div>
                <div>✓ Depunere rapidă online pe portalul ANAF</div>
              </div>
            </div>

            <a
              href="https://www.anaf.ro/declaratii/d230/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-serif font-bold text-slate-200 bg-[#050914] hover:bg-[#080f24] border border-amber-900/40 transition-all text-center"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Descarcă / Completează Formularul 230 ANAF
            </a>
          </div>
        </div>

        {/* Bank Seal */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#0a142f] border border-amber-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-xs text-center sm:text-left">
            <span className="font-serif font-bold text-slate-200 block mb-0.5">Donații directe prin transfer bancar:</span>
            <span className="text-slate-400 font-sans">Beneficiar: Asociația Viziune Urbană Ploiești | Banca: BCR Ploiești</span>
          </div>
          <div className="font-mono text-xs font-bold text-amber-300 bg-[#050914] px-4 py-2.5 rounded-lg border border-amber-900/40 select-all">
            RO49 AAAA 1B31 0075 9384 0000
          </div>
        </div>
      </div>
    </section>
  );
}

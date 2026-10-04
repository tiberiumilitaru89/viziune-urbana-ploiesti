"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Heart, MapPin, Award, CheckCircle2, Landmark } from "lucide-react";

type HeroSectionProps = {
  readonly onOpenAuditModal: () => void;
  readonly onOpenDonationModal: () => void;
};

export function HeroSection({ onOpenAuditModal, onOpenDonationModal }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-32 pb-24 overflow-hidden">
      {/* Editorial Royal Navy Gradient Overlays for optimal readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070d1e]/85 via-[#070d1e]/65 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e]/90 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_10%,rgba(217,119,6,0.12),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Institutional Accreditation Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a142f] border border-amber-500/40 backdrop-blur-md mb-8 shadow-md">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-serif font-bold tracking-[0.2em] uppercase text-amber-300">
              Inițiativă civică în municipiul Ploiești
            </span>
          </div>

          {/* Majestic Editorial Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-white tracking-normal leading-[1.14] sm:leading-[1.12] mb-4 sm:mb-6">
            Fundația unui bloc sănătos{" "}
            <span className="italic font-normal text-amber-300 underline decoration-amber-500/50 decoration-wavy">
              începe de jos.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg lg:text-xl text-slate-300 font-light leading-relaxed mb-8 sm:mb-10 max-w-2xl">
            Sponsorizări țevi și fitinguri pentru rețeaua principală a blocului tău — fără costuri de materiale pentru asociația de proprietari.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-14">
            <button
              onClick={onOpenAuditModal}
              className="group flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/60 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5 text-slate-950 shrink-0" />
              <span>Suntem o Asociație</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={onOpenDonationModal}
              className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm font-semibold text-slate-200 bg-[#0e1838] hover:bg-[#142352] border border-amber-500/30 transition-all shadow-md active:scale-[0.98]"
            >
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Susține proiect</span>
            </button>
          </div>

          {/* Official Seals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-amber-900/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a142f]/80 border border-amber-900/30">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">Evaluare Gratuită</span>
                <span className="text-slate-400 text-[11px]">Deplasare & deviz 0 costuri</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a142f]/80 border border-amber-900/30">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">Materiale Sponsorizate</span>
                <span className="text-slate-400 text-[11px]">Țevi, robineți, izolații</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a142f]/80 border border-amber-900/30">
              <Landmark className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">Garanție 5 Ani</span>
                <span className="text-slate-400 text-[11px]">oferită de către partenerii de execuție</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

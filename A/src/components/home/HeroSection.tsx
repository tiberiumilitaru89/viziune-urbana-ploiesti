"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Heart, Award, CheckCircle2, Landmark } from "lucide-react";

type HeroSectionProps = {
  readonly onOpenAuditModal: () => void;
  readonly onOpenDonationModal: () => void;
};

export function HeroSection({ onOpenAuditModal, onOpenDonationModal }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[calc(100vh-var(--navbar-height,88px))] flex items-center justify-center pt-28 sm:pt-32 pb-20 sm:pb-24 overflow-hidden bg-transparent text-slate-900"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Institutional Civic Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F5EDE1] border border-amber-700/30 backdrop-blur-md mb-8 shadow-sm">
            <Award className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-serif font-bold tracking-[0.2em] uppercase text-amber-900">
              Inițiativă civică în municipiul Ploiești
            </span>
          </div>

          {/* Majestic Editorial Title with maximum contrast */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-[#071330] tracking-tight leading-[1.14] sm:leading-[1.12] mb-4 sm:mb-6">
            Fundația unui bloc sănătos{" "}
            <span className="italic font-normal text-[#B5853F] underline decoration-amber-600/40 decoration-wavy">
              începe de jos.
            </span>
          </h1>

          {/* Clear Subtitle */}
          <p className="text-sm sm:text-lg lg:text-xl text-slate-700 font-normal leading-relaxed mb-8 sm:mb-10 max-w-2xl">
            Sponsorizări țevi și fitinguri pentru rețeaua principală a blocului tău — fără costuri de materiale pentru asociația de proprietari.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-14">
            <button
              onClick={onOpenAuditModal}
              className="group flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-950/20 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5 text-white shrink-0" />
              <span>Suntem o Asociație</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={onOpenDonationModal}
              className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-amber-900/20 transition-all shadow-md active:scale-[0.98]"
            >
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Susține proiect</span>
            </button>
          </div>

          {/* Official Seals in crisp white cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-amber-900/20">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-md">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#071330] block">Evaluare Gratuită</span>
                <span className="text-slate-600 text-[11px]">Deplasare & deviz 0 costuri</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-md">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#071330] block">Materiale Sponsorizate</span>
                <span className="text-slate-600 text-[11px]">Țevi, robineți, izolații</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-md">
              <Landmark className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#071330] block">Garanție 5 Ani</span>
                <span className="text-slate-600 text-[11px]">oferită de către partenerii de execuție</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

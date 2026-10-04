"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Heart, MapPin, CheckCircle2, Flame, Wrench } from "lucide-react";

type HeroSectionProps = {
  readonly onOpenAuditModal: () => void;
  readonly onOpenDonationModal: () => void;
};

export function HeroSection({ onOpenAuditModal, onOpenDonationModal }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* Layered civic dark gradient overlays for maximum legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060911]/85 via-[#060911]/65 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060911]/90 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Civic Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-md mb-6 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
              Inițiativă civică în Ploiești
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-6">
            Fundația unui bloc sănătos{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              începe de jos.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed mb-8 sm:mb-10 max-w-2xl">
            Sponsorizări țevi și fitinguri pentru rețeaua principală a blocului tău — fără costuri de materiale pentru asociația de proprietari.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <button
              onClick={onOpenAuditModal}
              className="group flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5 text-blue-200 shrink-0" />
              <span>Suntem o Asociație</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={onOpenDonationModal}
              className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all active:scale-[0.98]"
            >
              <Heart className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Susține proiect</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Evaluare tehnică 100% gratuită</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Zero costuri la materiale</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 col-span-2 sm:col-span-1">
              <Wrench className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Garanție 5 ani oferită de către partenerii de execuție</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

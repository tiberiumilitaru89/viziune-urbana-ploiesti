"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShieldCheck, Heart } from "lucide-react";

type NavbarProps = {
  readonly onOpenAuditModal: () => void;
  readonly onOpenDonationModal: () => void;
};

export function Navbar({ onOpenAuditModal, onOpenDonationModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#misiune", label: "Misiune & Manifest" },
    { href: "#cum-functioneaza", label: "Protocol de Lucru" },
    { href: "#proiecte", label: "Arhivă Lucrări" },
    { href: "#asociatii", label: "Registru Asociații" },
    { href: "#caiet-sarcini", label: "Etape Execuție" },
    { href: "#partener", label: "Instal Serv Becheanu" },
    { href: "#faq", label: "Clarificări" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-900/20 shadow-md py-3.5"
          : "bg-[#FAF7F2]/90 backdrop-blur-md border-b border-amber-900/15 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Heraldic Official Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-600/40 shadow-sm group-hover:border-amber-600 group-hover:scale-105 transition-all bg-[#0A142F] shrink-0">
            <Image
              src="/official-logo.jpg"
              alt="Sigla Oficială Asociația Viziune Urbană Ploiești"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="font-serif font-black text-[#071330] text-lg tracking-wide leading-none">
              VIZIUNE URBANĂ
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] mt-1 flex items-center gap-1.5">
              <span className="text-amber-800 font-extrabold">PLOIEȘTI</span>
              <span className="w-1 h-1 rounded-full bg-amber-700" />
              <span className="font-sans font-medium text-[9px] text-slate-600">ASOCIAȚIE CIVICĂ</span>
            </div>
          </div>
        </Link>

        {/* Desktop Links with high-contrast slate text */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-slate-700 hover:text-amber-800 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3.5">
          <button
            onClick={onOpenDonationModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-amber-50/60 border border-amber-900/20 transition-all shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Susține proiect
          </button>
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-950/20 transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            Înscrie Asociația
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-800 hover:text-slate-950 hover:bg-amber-100/50 transition-colors"
          aria-label="Navigație mobilă"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-amber-900/20 px-5 pt-4 pb-6 space-y-3 shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 hover:bg-amber-100/40 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-amber-900/15 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuditModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              Înscrie Asociația (Evaluare Gratuită)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDonationModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-white border border-amber-900/20 shadow-sm"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Susține proiect
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

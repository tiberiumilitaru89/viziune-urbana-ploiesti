"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, ShieldCheck, Heart, Award } from "lucide-react";

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
    { href: "#cum-functioneaza", label: "Protocolul de Lucru" },
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
          ? "bg-[#070d1e]/95 backdrop-blur-md border-b border-amber-900/40 shadow-2xl py-3.5"
          : "bg-gradient-to-b from-[#070d1e] to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Heraldic Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-950/40 group-hover:border-amber-400 group-hover:scale-105 transition-all bg-[#0a142f] shrink-0">
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
            <div className="font-serif font-black text-white text-lg tracking-wide leading-none">
              VIZIUNE URBANĂ
            </div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.25em] mt-1 flex items-center gap-1.5">
              <span>PLOIEȘTI</span>
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-sans font-medium text-[9px]">ASOCIAȚIE CIVICĂ</span>
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-300 hover:text-amber-300 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3.5">
          <button
            onClick={onOpenDonationModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-[#0e1838] hover:bg-[#142352] border border-amber-500/30 transition-all shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Susține proiect
          </button>
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-950/60 transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            Înscrie Asociația
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Navigație mobilă"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a142f] border-b border-amber-900/30 px-5 pt-4 pb-6 space-y-3 shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuditModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
            >
              <ShieldCheck className="w-4 h-4" />
              Înscrie Asociația (Evaluare Gratuită)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDonationModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-[#0e1838] border border-amber-500/30"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              Susține proiect
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

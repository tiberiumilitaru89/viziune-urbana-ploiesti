"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Menu, X, ArrowRight, ShieldCheck, Heart } from "lucide-react";

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
    { href: "#misiune", label: "Misiune" },
    { href: "#cum-functioneaza", label: "Cum Funcționează" },
    { href: "#proiecte", label: "Lucrări" },
    { href: "#calculator", label: "Calculator Pierderi" },
    { href: "#asociatii", label: "Asociații Înscrise" },
    { href: "#caiet-sarcini", label: "Specificații Tehnice" },
    { href: "#partener", label: "Partener Tehnic" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#060911]/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3.5"
          : "bg-gradient-to-b from-[#060911]/90 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-blue-400 transition-colors">
              VIZIUNE URBANĂ
            </div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
              PLOIEȘTI
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenDonationModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Donează Materiale
          </button>
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Sunt Asociație
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f1d] border-b border-slate-800 px-4 pt-4 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuditModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500"
            >
              <ShieldCheck className="w-4 h-4" />
              Sunt Asociație (Evaluare Gratuită)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDonationModal();
              }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Donează Materiale sau Fonduri
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

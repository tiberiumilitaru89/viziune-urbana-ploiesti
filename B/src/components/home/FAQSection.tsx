"use client";

import React, { useState } from "react";
import { FAQS } from "@/lib/data";
import { HelpCircle, ChevronDown, Scale } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 lg:py-28 bg-[#050914]/80 backdrop-blur-sm border-t border-amber-900/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4">
            <Scale className="w-3.5 h-3.5" />
            Clarificări & Răspunsuri
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Întrebări Frecvente (FAQ)
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Răspunsuri oficiale la cele mai frecvente întrebări din partea comitetelor de bloc și a locatarilor.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-[#0a142f] border border-amber-900/40 rounded-xl sm:rounded-2xl overflow-hidden transition-all shadow-xl"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left text-white hover:text-amber-300 transition-colors"
                >
                  <span className="font-serif text-sm sm:text-base font-bold pr-4 leading-snug">{faq.q}</span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-amber-400 text-slate-950 rotate-180"
                        : "bg-[#050914] text-slate-400 border border-amber-900/40"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-300 border-t border-amber-900/30 leading-relaxed font-sans animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
